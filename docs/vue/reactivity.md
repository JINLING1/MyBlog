---
title: 响应式系统的最小心智模型
description: 使用 track、trigger 和 effect 理解 Vue 响应式更新。
date: 2026-08-25
tags:
  - Vue
  - Reactivity
comments: true
---

# 响应式系统的最小心智模型

Vue 响应式系统可以先压缩成三个动作：读取时收集依赖，写入时触发依赖，副作用函数重新执行。

## Track、Trigger、Effect

```ts
const state = reactive({ count: 0 })

watchEffect(() => {
  console.log(state.count)
})

state.count += 1
```

`watchEffect` 执行时读取了 `state.count`，系统会把当前副作用与这个属性建立关系。属性发生变化后，对应副作用会被调度执行。

## 为什么需要 computed

`computed` 表达从现有状态派生出来的值。它具备缓存能力，只有依赖变化后才会在下一次读取时重新计算。

```ts
const firstName = ref('Jin')
const lastName = ref('Ling')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

可以计算出来的数据通常不需要再存一份，否则容易出现两个状态不同步的问题。

## 状态设计原则

- 保持原始状态最小化。
- 使用 `computed` 表达派生关系。
- 使用 `watch` 处理需要与外部系统同步的副作用。
- 不要为了“响应式”把所有数据都放进全局 store。
