---
title: 闭包：从词法作用域开始理解
description: 用词法作用域和函数生命周期解释 JavaScript 闭包。
date: 2026-08-25
tags:
  - JavaScript
  - Closure
comments: true
---

# 闭包：从词法作用域开始理解

当一个函数能够访问它定义时所在作用域中的变量，即使外层函数已经执行结束，我们就观察到了闭包。

## 一个最小例子

```js
function createCounter() {
  let count = 0

  return function increment() {
    count += 1
    return count
  }
}

const next = createCounter()
next() // 1
next() // 2
```

`increment` 定义在 `createCounter` 内部，因此它保存了对该次调用词法环境的引用。只要 `next` 仍然可达，`count` 就不会被回收。

## 闭包不是快照

闭包保存的是变量绑定，而不是创建函数时的值副本。这也是循环中异步回调经常产生误解的原因。

```js
for (let index = 0; index < 3; index += 1) {
  setTimeout(() => console.log(index))
}
// 依次输出 0、1、2
```

`let` 会为每轮循环创建新的绑定，因此三个回调访问的是三个不同的 `index`。

## 使用边界

闭包适合封装私有状态、创建函数工厂和保存回调上下文。与此同时，也要避免让长生命周期的闭包无意持有大型对象或已经不用的 DOM 节点。
