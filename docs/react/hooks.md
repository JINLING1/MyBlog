---
title: Hooks 的职责与使用边界
description: 从状态、派生数据和外部同步三个层次组织 React Hooks。
date: 2026-08-25
tags:
  - React
  - Hooks
comments: true
---

# Hooks 的职责与使用边界

Hooks 让函数组件拥有状态和生命周期能力，但并不意味着所有逻辑都应该放进 `useEffect`。

## 先区分三类逻辑

1. 渲染所需的原始状态使用 `useState` 或 `useReducer`。
2. 可以从现有输入计算的值直接计算，必要时使用 `useMemo`。
3. 需要与组件外部系统同步时才使用 `useEffect`。

```tsx
function ProductList({ products, query }) {
  const visibleProducts = products.filter((product) =>
    product.name.includes(query)
  )

  return visibleProducts.map((product) => (
    <ProductItem key={product.id} product={product} />
  ))
}
```

这里的过滤结果是派生数据，不需要额外状态，也不需要 Effect。

## 自定义 Hook 的价值

自定义 Hook 用来复用有状态的逻辑，而不是复用渲染后的 UI。一个好的 Hook 会提供清晰的输入输出，并隐藏订阅、清理和异常处理等细节。

## 检查清单

- Effect 是否真的在同步外部系统？
- 依赖是否完整？
- 清理函数是否与建立订阅的过程对称？
- 这个状态能否由 props 或其他状态计算得到？
