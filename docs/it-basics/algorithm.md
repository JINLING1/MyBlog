---
title: 数据结构与算法
description: 复杂度、常用数据结构、二分查找模板、排序，以及常见解题套路。
date: 2026-11-17
order: 4
tags:
  - 算法
  - 数据结构
comments: true
---

# 数据结构与算法

面试中的算法题以基础为主：二分查找、排序、链表、哈希、树的遍历、简单的动态规划。比起刷难题，更重要的是**基础题写得又快又对，并且能讲清楚复杂度**。代码用 JavaScript 书写，思路与语言无关。

## 一、复杂度

| 复杂度 | 典型操作 |
| --- | --- |
| O(1) | 数组按下标访问、哈希表查找 |
| O(log n) | 二分查找、平衡树查找、堆插入 |
| O(n) | 遍历数组、链表查找 |
| O(n log n) | 快速排序、归并排序、堆排序 |
| O(n²) | 双重循环、冒泡排序 |

估算方法：n 为 10⁵ 时 O(n²) 约 10¹⁰ 次运算会超时，需要 O(n log n) 以内的做法。

## 二、常用数据结构

| 结构 | 特点 | 典型用途 |
| --- | --- | --- |
| 数组 | 连续内存，随机访问 O(1)，中间插入删除 O(n) | 大多数场景的默认选择 |
| 链表 | 插入删除 O(1)，访问 O(n) | LRU 缓存、频繁插入删除 |
| 栈 | 后进先出 | 括号匹配、函数调用、撤销操作 |
| 队列 | 先进先出 | BFS、任务调度、消息队列 |
| 哈希表 | 查找、插入平均 O(1) | 去重、计数、两数之和 |
| 堆 | 快速取最大/最小值，插入 O(log n) | Top K、优先级队列、定时任务 |
| 二叉搜索树 | 中序遍历有序 | 有序数据的查找 |
| 图 | 节点和边 | 路径、依赖关系、社交网络 |

### 哈希冲突怎么解决

- **链地址法**：冲突的元素挂在同一个链表上。Java 的 HashMap 在链表过长（超过 8）时转为红黑树
- **开放寻址法**：冲突了就往后找空位

## 三、二分查找

面试明确被问到过。思路简单，难点在**边界**。

### 1. 前提

数组**有序**（或者具有“二段性”：一半满足条件，另一半不满足）。

### 2. 基础模板：查找某个值

```js
// 闭区间 [left, right]
function binarySearch(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {                            // 区间不为空
    const mid = left + Math.floor((right - left) / 2) // 防止 left + right 溢出
    if (nums[mid] === target) return mid
    if (nums[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}
```

三个要点：

1. 循环条件 `left <= right`，因为闭区间里 `left === right` 时还有一个元素
2. 更新时 `mid + 1`、`mid - 1`，因为 `mid` 已经判断过了
3. `left + (right - left) / 2` 防止整数溢出（Java、C++ 中会出问题，面试官可能会问）

### 3. 查找左边界：第一个大于等于 target 的位置

数组中有重复元素时常用，比如“第一次出现的位置”“插入位置”：

```js
function lowerBound(nums, target) {
  let left = 0
  let right = nums.length                 // 左闭右开 [left, right)
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] < target) left = mid + 1
    else right = mid                      // 不排除 mid，继续往左找
  }
  return left                             // 等于 nums.length 表示都比 target 小
}
```

最后一个等于 target 的位置 = `lowerBound(nums, target + 1) - 1`（整数数组时）。

### 4. 时间复杂度

每次排除一半，O(log n)。100 万个元素最多查找 20 次。

### 5. 实际应用

- 数据库 B+ 树索引的节点内查找
- Git 的 `git bisect` 二分定位引入 Bug 的提交
- 在“答案有单调性”的问题上二分答案：比如“最少需要多少台服务器才能在 T 秒内处理完所有请求”

## 四、排序

| 算法 | 平均 | 最坏 | 空间 | 稳定 |
| --- | --- | --- | --- | --- |
| 冒泡 | O(n²) | O(n²) | O(1) | 是 |
| 插入 | O(n²) | O(n²) | O(1) | 是 |
| 快速排序 | O(n log n) | O(n²) | O(log n) | 否 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 是 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 否 |

**稳定**：相等的元素排序后相对顺序不变。按多个字段排序时很重要（先按时间排，再按地市排，同地市内仍按时间有序）。

### 快速排序

```js
function quickSort(nums, left = 0, right = nums.length - 1) {
  if (left >= right) return nums
  const pivotIndex = partition(nums, left, right)
  quickSort(nums, left, pivotIndex - 1)
  quickSort(nums, pivotIndex + 1, right)
  return nums
}

function partition(nums, left, right) {
  // 随机选基准，避免有序数组退化到 O(n²)
  const random = left + Math.floor(Math.random() * (right - left + 1))
  ;[nums[random], nums[right]] = [nums[right], nums[random]]
  const pivot = nums[right]
  let i = left                                  // [left, i) 都小于 pivot
  for (let j = left; j < right; j++) {
    if (nums[j] < pivot) {
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
      i++
    }
  }
  ;[nums[i], nums[right]] = [nums[right], nums[i]]
  return i
}
```

## 五、常见解题套路

| 套路 | 识别信号 | 例题 |
| --- | --- | --- |
| 哈希表 | 查找、去重、计数 | 两数之和 |
| 双指针 | 有序数组、链表、原地修改 | 合并有序数组、链表是否有环 |
| 滑动窗口 | 连续子数组 / 子串 | 无重复字符的最长子串 |
| 栈 | 配对、最近的更大元素 | 有效的括号 |
| BFS | 最短路径、层序 | 二叉树层序遍历 |
| DFS / 回溯 | 枚举所有方案 | 全排列、子集 |
| 动态规划 | 求最值、计数，问题可拆成子问题 | 爬楼梯、最长递增子序列 |
| 堆 | 第 K 大、前 K 个 | 数组中的第 K 个最大元素 |

### 例：两数之和（哈希表）

```js
function twoSum(nums, target) {
  const seen = new Map() // 值 → 下标
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need), i]
    seen.set(nums[i], i)
  }
  return []
}
```

时间 O(n)，空间 O(n)。暴力双重循环是 O(n²)，这就是“用空间换时间”。

### 例：反转链表

```js
function reverseList(head) {
  let prev = null
  let cur = head
  while (cur) {
    const next = cur.next
    cur.next = prev
    prev = cur
    cur = next
  }
  return prev
}
```

### 例：LRU 缓存

`Map` 会保持插入顺序，可以直接实现（面试时也要能讲出“哈希表 + 双向链表”的原理）：

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()
  }

  get(key) {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)
    this.map.delete(key)       // 移到最新
    this.map.set(key, value)
    return value
  }

  put(key, value) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value) // 删除最久未使用的
    }
  }
}
```

## 六、答题习惯

1. 先确认题意和边界（空数组、重复元素、负数）
2. 先说暴力解法和复杂度，再说优化思路
3. 写完用一个小例子走一遍
4. 主动说出时间和空间复杂度
