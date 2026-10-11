---
title: Skills 的最佳实践
description: Skills 的核心原则、官方结构、渐进式披露机制与编写规范。
date: 2026-10-08
tags:
  - AI
  - Skills
comments: true
---

# Skills 的最佳实践

## 一、核心原则

一个 Skill = 一个可复用的工程动作。

好的 Skill 通常包含三个维度：

1. SOP 流程指令：定义“先做什么、再做什么”，而不是零散的建议
2. Reference 示例：附上“好的输出长什么样”，给 AI 看例子比说十条规则更有效
3. CLI / 脚本集成：直接调用 `npm run test`、`npm run lint`，而不是祈祷 AI 记得跑

## 二、三个最值得学的 Skill 模式

### 模式一：/grill-me（需求拷问）

核心只有三句话，但效果极好：

> 针对我的计划一个问题一个问题地追问，直到达成共识。每次只问一个，等我回答完再问下一个。能通过查看环境找到的事实直接去查，但决策要等我拍板。

本质：在让 AI 写代码之前，先用它来逼自己想清楚。

### 模式二：红绿 TDD

四个字的提示词：先写测试（红），确认失败，写实现（绿）。

为什么对 AI 特别有效？因为 AI 最大的风险是写出“能跑但不对”的代码。测试先强制它定义什么叫正确，再实现。

### 模式三：安灯绳（Lint + Test 自动拦截）

AI 生成代码后，自动跑 `npm run lint` 和 `npm run test`。失败就停下来，让 AI 自己定位问题、修复，而不是继续生产次品。

核心闭环：generate → verify → fix / log。

## 三、写 Skill 的实操建议

- 控制在 **500 行以内**，超了就拆
- 用**决策流程图**代替长段文字，AI 读图比读文字更准
- **一个 Skill 只干一件事**，复杂流程拆成主 Skill + 子 Skill

## 四、官方结构

Claude Skills 的官方结构是一个包含 `SKILL.md` 文件的目录。核心设计原则是“渐进式披露”，让 Claude 按需加载信息。

### 标准目录结构

```
your-skill-name/
├── SKILL.md              # 必需：主指令文件
├── scripts/              # 可选：可执行脚本 (如 .py, .sh)
├── references/           # 可选：详细参考资料
├── assets/               # 可选：模板、图片等静态资源
└── examples/             # 可选：使用示例
```

### SKILL.md 文件规范

这是技能的入口，必须命名为 `SKILL.md`（大小写敏感），由 YAML frontmatter 和 Markdown 正文组成。

1. Frontmatter（必需字段）

```yaml
---
name: your-skill-name          # 必需，kebab-case，与目录名一致
description: 做什么 + 何时用    # 必需，Claude 靠它决定是否触发
---
```

核心规则：`description` 必须包含“功能描述”和“触发条件”（用户可能说的话），控制在 1024 字符以内，不能包含 XML 标签（`<` `>`）。

2. Markdown 正文

用清晰的步骤编写指令，并引用其他文件，例如：`参考 [reference.md](reference.md) 获取完整 API 细节`。

## 五、渐进式披露：三级加载机制

这是 Skills 省 token 的关键：

| 层级 | 内容 | 加载时机 | 成本 |
|------|------|---------|------|
| Level 1 | `name` + `description` | 会话启动时预加载 | ~100 tokens |
| Level 2 | `SKILL.md` 完整内容 | Claude 判断相关时加载 | 按需 |
| Level 3 | `scripts/`、`references/` 等 | 正文明确引用且真正需要时 | 按需 |

所以你可以放心把详细文档、大脚本放在子目录里，只有 `SKILL.md` 的元数据会一直占用上下文。

## 六、技能命名与存放位置

- 命名：使用 `kebab-case`（如 `notion-project-setup`），不要用空格、下划线或大写。
- 存放：项目级技能放 `.claude/skills/`（仅当前项目可用）；个人技能放 `~/.claude/skills/`（所有项目可用）。

## 七、编写指令的推荐结构

在 `SKILL.md` 的正文中，建议按以下结构写：

```markdown
## Purpose（目的）
一句话说明技能目标。

## Trigger Conditions（触发条件）
何时激活（可作为 description 的补充）。

## Constraints（约束）
必须遵守的规则（如“用英文引号”“必须包含边界测试”）。

## Output Format（输出格式）
期望的输出结构。

## Step-by-step（步骤）
1. 第一步……
2. 第二步……
```
```