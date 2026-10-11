---
title: JavaScript异步编程
description: 待补充
date: 2026-10-11
tags:
  - JavaScript
  - asynchronous-programming 
comments: true



---

# 防抖与节流

## 1.防抖
事件触发后，**等一段时间**，如果这段时间内**没有再触发**，才执行一次。如果期间又触发了，**重新计时**。

### 场景

- 搜索框输入：用户打字时不断触发，只在**停下来之后**才发请求
- 窗口 resize：拖动窗口大小时不断触发，只在**停下来之后**才重新布局
- 表单验证：用户输入时先不校验，**停止输入后**再检查

```js
//给fn加上防抖
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)  // 每次触发都清掉上一个定时器
    timer = setTimeout(() => {   // 重新计时
      fn.apply(this, args)
    }, delay)
  }
}
```



## 2.节流
在一段时间内，**最多只执行一次**。不管触发多少次，都按固定频率执行。

### 场景

- 滚动加载：滚动时按固定频率检查位置，不用每滚一像素就检查
- 鼠标移动：按固定频率更新位置
- 按钮点击：防止用户狂点，**规定时间内**只响应一次

```js
function throttle(fn, delay) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {   // 距离上次执行超过 delay 才执行
      last = now
      fn.apply(this, args)
    }
  }
}
```



## 3.两者的区别
| 对比项   | 防抖（Debounce）             | 节流（Throttle）             |
| :------- | :--------------------------- | :--------------------------- |
| 执行时机 | **停止触发后**执行一次       | **固定间隔**执行             |
| 执行次数 | 只执行最后一次               | 按频率执行多次               |
| 核心逻辑 | 重新计时                     | 控制频率                     |
| 类比     | 电梯等人，**没人再进才关门** | 红绿灯，**固定时间放行一次** |
| 适用场景 | 只关心**最终结果**           | 需要**持续响应**             |



