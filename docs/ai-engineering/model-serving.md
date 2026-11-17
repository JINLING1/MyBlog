---
title: 大模型服务部署与性能优化
description: 大模型推理的性能指标、流式输出、推理加速、缓存，以及高并发下的服务稳定性。
date: 2026-11-17
order: 4
tags:
  - AI
  - LLM
  - 部署
comments: true
---

# 大模型服务部署与性能优化

岗位描述里的“将 AI 模型高效部署至生产环境，保障模型服务的稳定性与响应速度”说的就是这部分。大模型服务和普通 Web 服务最大的不同：**单个请求很重（秒级、占用大量显存），GPU 资源昂贵且有限**，所以优化思路也不一样。

## 一、先认识性能指标

| 指标 | 含义 | 影响 |
| --- | --- | --- |
| TTFT（首 token 延迟） | 从发出请求到收到第一个字 | 用户感知的“卡不卡” |
| TPOT（每 token 耗时） | 生成阶段每个 token 的平均间隔 | 文字“蹦出来”的速度 |
| 吞吐量 | 每秒生成的 token 数（tokens/s）、每秒处理的请求数 | 一台机器能服务多少人 |
| P99 延迟 | 99% 的请求在多长时间内完成 | 长尾体验 |
| GPU 利用率 / 显存占用 | 资源使用情况 | 成本 |

**总耗时 ≈ TTFT + TPOT × 输出 token 数。** 所以控制输出长度也是有效的优化。

推理分两个阶段：

- **Prefill（预填充）**：一次性处理整个输入，计算密集，决定 TTFT
- **Decode（解码）**：逐个生成 token，受显存带宽限制，决定 TPOT

## 二、流式输出

### 1. 为什么必须做

生成 500 字可能要 10 秒以上，等全部生成完再返回，用户会以为系统卡死了。流式输出让第一个字在几百毫秒内出现，**总耗时不变，但体验完全不同**。

### 2. 后端：SSE

最常用 SSE（Server-Sent Events），基于普通 HTTP，服务端持续推送：

```python
# FastAPI 示例
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/chat")
async def chat(req: ChatRequest):
    async def event_stream():
        async for chunk in llm.stream(req.messages):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

注意 Nginx 等反向代理要关闭缓冲（`proxy_buffering off`），否则数据会被攒起来一起发。

### 3. 前端：接收流

浏览器自带的 `EventSource` 只支持 GET，聊天接口通常要 POST 消息体，所以一般用 `fetch` 读流：

```js
const controller = new AbortController()

const res = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages }),
  signal: controller.signal // 用户点“停止生成”时调用 controller.abort()
})

const reader = res.body.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const events = buffer.split('\n\n')
  buffer = events.pop() // 最后一段可能不完整，留到下次
  for (const event of events) {
    const data = event.replace(/^data: /, '')
    if (data === '[DONE]') return
    appendToMessage(JSON.parse(data).content)
  }
}
```

前端还要处理：停止生成、断线重试、Markdown 增量渲染、自动滚动。

### 4. SSE 和 WebSocket 怎么选

| | SSE | WebSocket |
| --- | --- | --- |
| 方向 | 服务端 → 客户端单向 | 双向 |
| 协议 | 普通 HTTP，易穿透代理和网关 | 需要协议升级 |
| 重连 | 原生支持 | 需要自己实现 |
| 适合 | 大模型逐字输出 | 实时语音、协同编辑 |

## 三、推理加速

### 1. 推理框架

自己用 Transformers 库直接推理，并发一上来吞吐很差。生产环境一般用专门的推理框架：

| 框架 | 特点 |
| --- | --- |
| vLLM | 最常用，PagedAttention + 连续批处理，提供兼容 OpenAI 的接口 |
| SGLang | 前缀缓存（RadixAttention）做得好，结构化输出快 |
| TensorRT-LLM | NVIDIA 官方，性能极致，部署相对复杂 |
| Ollama / llama.cpp | 本地、CPU 或低配环境，开发测试用 |

国内信创场景还会用到昇腾等国产算力及配套的推理框架。

### 2. 关键技术

- **KV Cache**：缓存已生成 token 的 K、V，避免重复计算。代价是显存占用随序列长度增长
- **PagedAttention**（vLLM 的核心）：像操作系统分页管理内存一样管理 KV Cache，按块分配，减少显存碎片，同样显存能同时服务更多请求
- **连续批处理（Continuous Batching）**：传统批处理要等一批请求都生成完才处理下一批；连续批处理在每一步都可以让完成的请求退出、新请求加入，GPU 不空转，吞吐提升数倍
- **前缀缓存（Prefix Caching）**：多个请求有相同的前缀（同一个系统提示词、同一份 RAG 资料）时复用计算结果，降低 TTFT
- **量化**：把 FP16 权重压缩成 INT8 / INT4（GPTQ、AWQ 等方法），显存减半甚至更多、速度更快，精度略有损失
- **投机解码（Speculative Decoding）**：小模型先快速“猜”几个 token，大模型一次性验证，猜对就省下多步解码

### 3. 选择合适的模型

最直接的优化往往不是技术手段，而是**选对模型**：简单任务（分类、抽取、改写）用小模型，复杂推理才用大模型。可以做一个**模型路由**，按任务难度分发到不同模型。

## 四、缓存

| 层次 | 做法 | 适合 |
| --- | --- | --- |
| 精确缓存 | 相同输入直接返回结果，用 Redis 存 | 固定问题、重复调用 |
| 语义缓存 | 问题 Embedding 相似度超过阈值就返回历史答案 | FAQ、客服高频问题 |
| 前缀缓存 | 推理框架层面复用相同前缀的计算 | 固定系统提示词、多轮对话 |
| 中间结果缓存 | 缓存 Embedding、检索结果 | RAG 链路 |

语义缓存要注意：阈值设太低会答非所问；和用户个人数据相关的问题（“我的话费”）不能缓存。

## 五、高并发下的稳定性

GPU 资源有限，**模型服务的并发能力远低于普通 Web 服务**，所以重点不是“扛住”，而是“有序”。

### 1. 入口控制

- **限流**：按用户、按应用限制 QPS 和 token 用量（令牌桶算法），超出直接返回提示
- **排队**：请求先进队列，按推理服务的处理能力消费，前端显示排队状态
- **优先级**：付费用户、核心业务优先

### 2. 失败处理

- **超时**：设置合理的总超时和首 token 超时
- **重试**：只对网络错误、服务暂时不可用重试，配合指数退避；不要对超时盲目重试，会放大压力
- **降级**：主模型不可用时切换备用模型或返回预设回复
- **熔断**：某个模型服务错误率过高时暂时停止调用，避免雪崩

### 3. 架构

```
客户端
  → API 网关（鉴权、限流、计量）
  → 应用服务（Prompt、RAG、Agent）
  → 模型网关（路由、负载均衡、降级）
  → 推理集群（vLLM × N）
```

- **模型网关统一对外提供 OpenAI 兼容接口**，业务方不用关心后面是哪个模型、部署在哪
- 推理实例无状态，可以水平扩展；按 GPU 利用率和排队长度自动扩缩容
- 长耗时任务（批量文档处理、报告生成）走**异步任务队列**，完成后通知，不占用同步连接

### 4. 监控

需要监控的指标：TTFT、TPOT、P99 延迟、错误率、排队长度、GPU 利用率和显存、token 用量和成本。每次请求记录模型、版本、输入输出 token 数，便于排查问题和核算成本。

更通用的高并发手段见 [高并发系统设计](/backend/high-concurrency)。

## 六、高频面试题

1. **大模型服务的延迟怎么优化？** 流式输出降低感知延迟；推理框架（vLLM）+ 量化 + 前缀缓存降低实际延迟；控制输入输出长度；简单任务用小模型；高频问题做缓存。
2. **vLLM 为什么快？** PagedAttention 减少显存浪费，能同时处理更多请求；连续批处理让 GPU 不空转。
3. **并发上来了怎么办？** 限流和排队保护推理服务；水平扩展推理实例；缓存减少调用；降级到小模型。
4. **为什么用 SSE 不用 WebSocket？** 大模型输出是服务端单向推送，SSE 基于 HTTP 更简单，网关和代理兼容性好，原生支持重连。
5. **量化会带来什么问题？** 精度损失，INT8 影响通常很小，INT4 在复杂推理任务上可能明显下降，需要用评估集验证。
6. **KV Cache 是什么？** 缓存已经计算过的注意力 K、V，生成新 token 时不用重算前面的部分，用显存换速度。
