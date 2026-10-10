---
title: TypeScript
description: 待补充
date: 2026-10-01
tags:
  - TypeScript
comments: true





---

# TypeScript

## 一、`interface` 和 `type` 的区别

两者都能用来定义对象类型，但用途和限制不同。

| 对比项             | `interface`  | `type`                       |
| ------------------ | ------------ | ---------------------------- |
| 定义对象           | ✅            | ✅                            |
| 定义联合类型       | ❌            | ✅                            |
| 定义元组           | ❌            | ✅                            |
| 定义原始类型别名   | ❌            | ✅                            |
| 声明合并           | ✅ **可以**   | ❌ 不能                       |
| 继承/扩展          | `extends`    | `&`（交叉类型）              |
| 实现（implements） | ✅ 类可以实现 | ⚠️ 只能被类实现，但写法不推荐 |

**举例**：

```ts
// interface 可以声明合并
interface User { name: string }
interface User { age: number }
// 合并成 { name: string; age: number }

// type 不能
type User = { name: string }
type User = { age: number } // 报错：重复标识符
```

**什么时候用哪个**：

- **定义对象结构、需要继承、需要声明合并** → `interface`
- **定义联合类型、元组、函数类型、原始类型别名** → `type`

---

## 二、`any` / `unknown` / `never`

| 类型      | 含义                       | 能赋值给谁                 | 谁能赋值给它     |
| --------- | -------------------------- | -------------------------- | ---------------- |
| `any`     | 任意类型，**关闭类型检查** | 任何类型                   | 任何类型         |
| `unknown` | 未知类型，**安全版 any**   | 只能赋给 `any` / `unknown` | 任何类型         |
| `never`   | 永不存在的值               | 任何类型                   | **没有任何类型** |

### `any`

```ts
let a: any = 1
a = 'str'      // ✅
a.foo.bar      // ✅ 不报错，但运行时可能崩
```

**问题**：完全放弃类型检查，容易出 bug。

### `unknown`

```ts
let u: unknown = 1
u = 'str'          // ✅ 可以赋值
u.foo              // ❌ 报错，必须先收窄类型

if (typeof u === 'string') {
  u.toUpperCase()  // ✅ 收窄后可以用
}
```

**特点**：**能存任何值，但用之前必须先判断类型**。比 `any` 安全。

### `never`

```ts
function error(msg: string): never {
  throw new Error(msg)
}

function infiniteLoop(): never {
  while (true) {}
}
```

**特点**：表示**函数永远不会正常返回**（抛错或死循环）。它**没有任何值**，所以不能被赋值。

### 关系图

```
any      ← 最宽松，放弃检查
unknown  ← 中间，安全但需要收窄
never    ← 最严格，没有任何值
```

**优先级**：能用 `unknown` 别用 `any`；`never` 用于“不可能发生”的场景。

---

## 三、泛型是什么

**泛型 = 类型参数化**，让一个函数/类/接口能适配多种类型，同时保留类型检查。

### 不用泛型的问题

```ts
function identity(arg: any): any {
  return arg
}
const a = identity('hello') // a 是 any，丢失了类型
```

### 用泛型

```ts
function identity<T>(arg: T): T {
  return arg
}
const a = identity('hello') // a 是 string，类型保留
const b = identity(123)     // b 是 number
```

`<T>` 就是**类型参数**，调用时自动推断。

### 常见用法

```ts
// 接口
interface Box<T> {
  value: T
}

// 类
class Stack<T> {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
}

// 约束
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length
}
```

### 一句话

**泛型 = 类型的“变量”**，让代码在保持类型安全的同时能复用。

---

## 四、`extends` 做什么

`extends` 在 TypeScript 里有 **3 种用途**：

### 1. 接口继承

```ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  bark(): void
}
// Dog 有 name 和 bark
```

### 2. 类继承

```ts
class Animal {
  move() {}
}

class Dog extends Animal {
  bark() {}
}
// Dog 继承 Animal 的 move
```

### 3. 泛型约束

```ts
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length
}
```

**含义**：`T` 必须是**有 `length` 属性的类型**。这就是**给泛型加约束**。

```ts
getLength('abc')   // ✅ 字符串有 length
getLength([1, 2])  // ✅ 数组有 length
getLength(123)     // ❌ 数字没有 length，报错
```

### 条件类型里的 extends

```ts
type IsString<T> = T extends string ? 'yes' : 'no'

type A = IsString<string>  // 'yes'
type B = IsString<number>  // 'no'
```

这里的 `extends` 是**条件判断**：`T` 是不是 `string` 的子类型。

---

## 一句话总结

| 概念                        | 核心                                           |
| --------------------------- | ---------------------------------------------- |
| `interface` vs `type`       | interface 能声明合并，type 更灵活（联合/元组） |
| `any` / `unknown` / `never` | any 放弃检查，unknown 安全，never 无值         |
| 泛型                        | 类型参数化，复用 + 类型安全                    |
| `extends`                   | 继承（接口/类）、泛型约束、条件类型判断        |