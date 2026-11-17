---
title: Agent 智能体开发
description: Agent 的组成、ReAct 与工具调用、记忆、多智能体，以及让 Agent 跑得稳的工程手段。
date: 2026-11-17
order: 3
tags:
  - AI
  - Agent
  - LLM
comments: true
---

# Agent 智能体开发

普通的大模型应用是“问一句答一句”；Agent 是**让大模型自己决定下一步做什么，调用工具去完成一个多步骤的任务**。比如“帮我查一下这个用户上个月的流量使用情况，如果超套了就推荐合适的套餐”，需要查数据、判断、再查套餐、再组织回答。

## 一、Agent 的组成

```
Agent = 大模型（大脑） + 规划 + 工具 + 记忆
```

| 组成 | 作用 | 例子 |
| --- | --- | --- |
| 大模型 | 理解任务、推理、决定下一步 | Qwen、DeepSeek、GPT |
| 规划 | 把大任务拆成步骤，根据结果调整 | ReAct、Plan-and-Execute |
| 工具 | 让模型能“动手” | 查数据库、调 API、搜索、执行代码、RAG 检索 |
| 记忆 | 记住上下文和历史 | 对话历史、用户偏好、任务中间结果 |

## 二、工具调用（Function Calling）

大模型本身不会执行任何操作，它只是**输出“我想调用哪个工具、参数是什么”**，由程序去真正执行，再把结果交还给模型。

### 1. 定义工具

用 JSON Schema 描述工具，描述写得越清楚，模型调用越准：

```json
{
  "name": "query_data_usage",
  "description": "查询用户指定月份的流量使用情况，返回已用流量和套餐内流量，单位 GB",
  "parameters": {
    "type": "object",
    "properties": {
      "phone": { "type": "string", "description": "11 位手机号" },
      "month": { "type": "string", "description": "月份，格式 YYYY-MM" }
    },
    "required": ["phone", "month"]
  }
}
```

### 2. 执行循环

```python
messages = [{"role": "user", "content": task}]

for step in range(MAX_STEPS):                       # 一定要有上限
    resp = llm.chat(messages, tools=TOOLS)
    if not resp.tool_calls:                          # 模型不再调用工具，任务完成
        return resp.content
    messages.append(resp.message)
    for call in resp.tool_calls:
        try:
            result = run_tool(call.name, call.arguments)   # 参数要校验
        except Exception as e:
            result = f"工具调用失败：{e}"                    # 错误也交还给模型，让它调整
        messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

return "任务步骤过多，已停止，请人工处理"
```

### 3. MCP

MCP（Model Context Protocol）是一个开放协议，把“工具”标准化成服务：工具方实现一次 MCP Server，所有支持 MCP 的 Agent 都能直接使用，不用为每个框架单独适配。可以类比成“AI 应用的 USB 接口”。

## 三、规划方式

### 1. ReAct（推理 + 行动）

最经典的模式，模型交替进行思考和行动：

```
Thought：需要先知道用户上月用了多少流量
Action：query_data_usage(phone="138xxxx", month="2026-10")
Observation：已用 45GB，套餐内 30GB
Thought：超出 15GB，需要查询流量更多的套餐
Action：search_plans(min_data_gb=50)
Observation：……
Thought：已有足够信息，可以回答
Final Answer：……
```

优点：每一步都根据真实结果调整，灵活。缺点：步骤多时容易绕圈、成本高。

### 2. Plan-and-Execute（先规划后执行）

先让模型一次性列出完整计划，再逐步执行，必要时重新规划。适合步骤较多、流程相对清晰的任务，执行阶段可以用更便宜的模型。

### 3. 工作流（Workflow）和 Agent 的区别

| | 工作流 | Agent |
| --- | --- | --- |
| 流程 | 开发者预先编排好 | 模型运行时自己决定 |
| 可控性 | 高，结果可预测 | 低，可能走出意料之外的路径 |
| 适合 | 流程固定的业务（审批、工单分类） | 开放式任务（数据分析、问题排查） |

> 面试加分点：**能用工作流解决的就不要用 Agent。** 生产环境里常见的做法是“工作流为主，个别节点用 Agent”，在灵活性和可控性之间取平衡。Dify、Coze 这类平台就是这个思路。

## 四、记忆

- **短期记忆**：当前对话的上下文。对话过长时要截断或摘要，否则超出上下文长度、成本也会上升
- **长期记忆**：跨会话保留的信息（用户偏好、历史结论），存进数据库或向量库，需要时检索出来
- **工作记忆**：任务执行中的中间结果，比如已经查到的数据

## 五、多智能体（Multi-Agent）

把复杂任务分给多个专职 Agent 协作，比如“规划 Agent + 检索 Agent + 编码 Agent + 审核 Agent”。

- 好处：每个 Agent 的 Prompt 和工具更聚焦，效果更好
- 代价：通信开销大、调试困难、成本成倍增加
- 常见框架：LangGraph（用图编排状态和流程）、AutoGen、CrewAI

## 六、让 Agent 跑得稳（工程重点）

这部分是面试拉开差距的地方，体现你做过真实落地而不是只跑过 Demo。

### 1. 防止失控

- **最大步数 / 超时限制**，避免死循环
- **重复调用检测**：同样的工具和参数连续调用多次就中断
- **成本上限**：单次任务的 token 预算

### 2. 工具调用的健壮性

- 参数用 Schema 校验，模型给错格式时返回清晰的错误信息让它重试
- 工具结果过长时截断或摘要，避免撑爆上下文
- 工具本身做好超时、重试和幂等

### 3. 安全

- **最小权限**：只开放任务需要的工具，查询类和修改类工具分开
- **高风险操作人工确认**（Human-in-the-loop）：删除数据、发送消息、涉及资费变更前要用户确认
- **防提示词注入**：工具返回的网页、文档内容可能藏着“忽略之前的指令”，要当作数据而不是指令处理
- 操作留日志，可审计

### 4. 可观测与评估

- 记录每一步的 Thought、工具调用、参数、结果、耗时、token 用量，出问题能回放
- 准备任务评估集，统计**任务完成率、平均步数、平均成本、平均耗时**，每次改 Prompt 或换模型都跑一遍

## 七、高频面试题

1. **Agent 和普通的大模型调用有什么区别？** 普通调用是单轮输入输出；Agent 能自主规划多步、调用工具、根据结果调整。
2. **Function Calling 的原理？** 模型只输出结构化的调用意图，真正的执行由程序完成，结果再交还给模型。
3. **ReAct 是什么？有什么问题？** 思考和行动交替；问题是可能绕圈、步骤多时成本高、错误会累积。
4. **怎么防止 Agent 死循环？** 最大步数、重复调用检测、超时、成本上限。
5. **Agent 的结果不稳定怎么办？** 收窄任务范围、能固定的流程用工作流、工具描述写清楚、temperature 调低、加评估集回归测试。
6. **做过的 Agent 项目里最难的问题是什么？** 准备一个具体的例子：问题现象 → 定位过程 → 解决方案 → 效果。
