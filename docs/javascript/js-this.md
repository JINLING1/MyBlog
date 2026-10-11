---
title: JavaScript的this
description: 待补充
date: 2026-10-11
tags:
  - JavaScript
  - this
  - call,apply,bind
comments: true




---

# this/call/apply/bind

## 1. 对this对象的理解

this 是执行上下文中的一个属性，它的指向在函数被调用时确定。
在实际开发中，this 的指向可以通过四种调用模式来判断。

* 第一种是**函数调用模式**，当一个函数不是一个对象的属性时，直接作为函数来调用时，非严格模式下，this 指向全局对象；严格模式下，this指向undefined。

* 第二种是**方法调用模式**，如果一个函数作为一个对象的方法来调用时，this 指向这个对象。

* 第三种是**构造器调用模式**，如果一个函数用 new 调用时，函数执行前会新创建一个对象，this 指向这个新创建的对象。

* 第四种是 **apply 、 call 和 bind 调用模式**，这三个方法都可以显式指定函数的 this 指向。

  > 函数方法 apply call bind 
  >
  > call,apply 是指定 `this` 只对这一次调用有效。bind是永久的this绑定
  >
  > | 方法      | 作用                       | 参数                                       |
  > | :-------- | :------------------------- | :----------------------------------------- |
  > | **call**  | 立刻调用函数，指定 `this`  | `thisArg, arg1, arg2, ...`（参数逐个列）   |
  > | **apply** | 立刻调用函数，指定 `this`  | `thisArg, [arg1, arg2, ...]`（参数放数组） |
  > | **bind**  | **不调用**，返回一个新函数 | `thisArg, arg1, arg2, ...`（参数逐个列）   |

当多种规则同时具备生效条件时，使用构造器调用模式的优先级最高，然后是 apply、call 和 bind 调用模式，然后是方法调用模式，然后是函数调用模式。

> 箭头函数的this是继承自外层

## 2. call() 和 apply() 的区别？

它们的作用一模一样，区别仅在于传入参数的形式的不同。

* apply 接受两个参数，第一个参数指定了了函数执行时 `this` 的指向，第二个参数为一个带下标的集合，这个集合可以为数组，也可以为类数组，apply 方法把这个集合中的元素作为参数传递给被调用的函数。
* call 传入的参数数量不固定，跟 apply 相同的是，第一个参数也是代表函数执行时 `this` 的指向，从第二个参数开始往后，每个参数被依次传入函数。

## 3. 实现call、apply 及 bind 函数

**（1）call 函数的实现步骤：**

* 判断调用对象是否为函数

  > 即使是 myCall 是定义在函数的原型上的，但是也可能出现借由myCall 使用 call ,apply,bind等方式 使非函数也能调用 myCall 的情况。
  > ```js
  > Function.prototype.myCall.call(123, context)
  > // myCall 里的 this 是 123，不是函数
  > // 触发判断，报错
  > ```
* 判断传入的对象是否存在，如果不存在，则设置为 window 。
* 处理传入的参数，截取第一个参数后的所有参数。
* 将调用myCall的函数作为传入的对象的一个属性。
* 使用传入的对象来调用这个方法，并保存返回结果。
* 删除刚才新增的属性。
* 返回结果。

```javascript
Function.prototype.myCall = function(context) {//因为要传的参数数量不确定。没法在定义时写死参数列表，所以用 arguments 来动态获取所有实参
  // 判断调用对象
  if (typeof this !== "function") {
    console.error("type error");
  }
  // 获取参数
  let args = [...arguments].slice(1),
    result = null;
  // 判断 context 是否传入，如果未传入则设置为 window
  context = context || window;
  // 将调用函数设为对象的方法
  context.fn = this;//myCall 里的 this 不是指向原型对象，而是指向“调用 myCall 的那个函数”。
  // 调用函数
  result = context.fn(...args);
  // 将属性删除
  delete context.fn;
  return result;
};
```

举例：
```js
function greet(greeting) {
  console.log(greeting + ', ' + this.name)
}

const person = { name: 'Bob' }

greet.myCall(person, 'Hello')
```

执行过程：
```js
// this = greet
// context = person
// args = ['Hello']

context.fn = this        // person.fn = greet（临时加属性）
result = context.fn('Hello')  // person.fn('Hello')，也就是 greet('Hello')
                              // 但这次是 person 调用的，所以 greet 里 this = person
                              // 输出 'Hello, Bob'

delete context.fn        // 删掉 person.fn
return result //原函数的返回值
```



**（2）apply 函数的实现步骤：**

* 判断调用对象是否为函数，即使是定义在函数的原型上的，但是可能出现使用 call 等方式调用的情况。
* 判断传入的对象是否存在，如果不存在，则设置为 window 。
* 将调用myApply的函数作为传入的对象的一个属性。
* 判断参数值是否传入
* 使用传入的对象来调用这个方法，并保存返回结果。
* 删除刚才新增的属性
* 返回结果

```javascript
Function.prototype.myApply = function(context) {
  // 判断调用对象是否为函数
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  let result = null;
  // 判断 context 是否存在，如果未传入则为 window
  context = context || window;
  // 将函数设为对象的方法
  context.fn = this;
  // 调用方法
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  // 将属性删除
  delete context.fn;
  return result;
};
```

**（3）bind 函数的实现步骤：**

* 判断调用对象是否为函数，即使是定义在函数的原型上的，但是可能出现使用 call 等方式调用的情况。
* 保存当前函数的引用，获取其余传入参数值。
* 创建一个函数返回。这个新函数内部做两件事：

  - 使用 apply 调用原函数，把参数传进去
  -  绑定 原函数的`this`：如果新函数是作为构造函数（用 `new` 调用），`this` 指向新创建的对象（new出来的实例）；否则指向 `bind` 指定的对象
- 处理原型：把新函数的 `prototype` 指向原函数的 `prototype`，这样 `new` 出来的实例能继承原函数的原型
- 返回这个新函数

```javascript
Function.prototype.myBind = function(context) {
  // 判断调用对象是否为函数
  if (typeof this !== "function") {//this指向调用myBind的那个对象
    throw new TypeError("Error");
  }
  // 获取参数
  var args = [...arguments].slice(1),
    fn = this;//fn赋值为调用myBind的函数
    //myBind返回新函数Fn
  return function Fn() {
    // 根据调用方式，传入不同绑定值
    return fn.apply(
      this instanceof Fn ? this : context,//this：调用Fn的对象
      args.concat(...arguments)
    );
  };
};
```



### 总结：

**“手写 `call`”：**

> 核心是三步：把函数挂到 `context` 上，用 `context` 调用它，调用完删掉。这样 `this` 就变成了 `context`。注意要判断 `this` 是不是函数，还要处理 `context` 为空的情况。

**“手写 `bind`”：**

> 返回一个新函数，内部用 `apply` 调用原函数。关键是判断是不是 `new` 调用——用 `this instanceof bound` 判断，是的话 `this` 用新对象，不是才用 `context`。还要处理原型继承，让 `new` 出来的实例能访问原函数的原型。

## 4.call 、apply、bind常见用途

**1. `Object.prototype.toString.call()` 判断类型**

```js
Object.prototype.toString.call([])   // '[object Array]'
Object.prototype.toString.call(null) // '[object Null]'
```

**面试常问：“怎么区分数组和对象？”**

- `typeof []` → `'object'`，不行
- `Array.isArray([])` → `true`，可以
- `Object.prototype.toString.call([])` → `'[object Array]'`，最准

**2. `bind` 绑定回调 `this`**

```js
const obj = {
  name: 'Bob',
  greet() { console.log(this.name) }
}

setTimeout(obj.greet, 1000)          // undefined
setTimeout(obj.greet.bind(obj), 1000) // 'Bob'
```

**面试常问：“为什么 `setTimeout(obj.method)` 里 `this` 丢了？怎么解决？”**

- `obj.greet` 只是把函数“取出来”传给 `setTimeout`，没有带着 `obj`。

**3. `apply` 展开数组，求数组最值**

```js
Math.max.apply(null, [1, 5, 3])  // 5
```

**现在更常用扩展运算符：**

```js
Math.max(...[1, 5, 3])  // 5
```
