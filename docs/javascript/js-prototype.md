---
title: JavaScript原型
description: js的原型，原型链的理解，如何获取原型，prototype和__proto__区别
date: 2026-10-08
tags:
  - JavaScript
  - prototype
comments: true



---

# 原型与原型链

## 1. 对原型、原型链的理解

> js中任何函数都可以通过new关键词调用作为构造函数(除箭头函数)

在JavaScript中是使用构造函数来新建一个对象的，每一个构造函数的内部都有一个 **prototype** 属性，它的属性值是一个对象，这个对象包含了可以由该构造函数的所有实例共享的属性和方法。

每一个对象都有一个**内部属性（引擎的实现细节，不暴露给开发者） `[[Prototype]]`**，指向它的原型。

- 可以通过**`Object.getPrototypeOf(obj)`**来访问原型

- 浏览器实现了 `__proto__` 来访问原型， `__proto__` 是从 `Object.prototype` 继承来的访问器，不是所有对象都有( Object.create(null) 创建的对象没有原型 )。   `__proto__` 指向该对象的**原型对象**。

  > 在 JS 里，对象的属性分两种：
  >
  > |        | 数据属性          | 访问器属性              |
  > | :----- | :---------------- | :---------------------- |
  > | 是什么 | 直接存一个值      | 存 getter / setter 函数 |
  > | 写法   | `{ name: 'Bob' }` | `{ get name() {...} }`  |
  > | 读取时 | 直接返回值        | 调用 getter             |
  > | 写入时 | 直接改值          | 调用 setter             |

```js
var Parent = function(){
}

Parent.prototype.name = "hi"
Object.prototype.say = "hello"
let p1 = new Parent();
p1.name // "hi"
p1.say //"hello"
p1.__proto__ === Parent.prototype  // true(注意__proto__两边各两个下划线)
```



当访问一个对象的属性时，如果这个对象内部不存在这个属性，那么它就会去它的原型对象里找这个属性，这个原型对象又会有自己的原型，于是就这样一直找下去，也就是**原型链**的概念。原型链的最后一环一般来说都是 Object.prototype ,再往上就是null,所以这就是新建的对象为什么能够使用 toString() 等方法的原因。

**特点：**JavaScript 对象是通过引用来传递的，创建的每个新对象实体中并没有一份属于自己的原型副本。当修改原型的属性时，与之相关的对象也会继承这一改变。



## 2. 原型修改、重写

```javascript
function Person(name) {
    this.name = name
}
// 修改原型对象的某个属性
Person.prototype.getName = function() {}
var p = new Person('hello')
console.log(p.__proto__ === Person.prototype) // true
console.log(p.__proto__ === p.constructor.prototype) // true
// 重写原型（把Person.prototype 指向了新对象
Person.prototype = {
    getName: function() {}
}
var p = new Person('hello')
console.log(p.__proto__ === Person.prototype)  // true
console.log(p.__proto__ === p.constructor.prototype) // false
```

引擎在创建函数时，会给 **`prototype` 对象**加一个 **`constructor`** 属性，指回函数本身。也就是说，**`constructor` 是继承自原型的，不是实例自己有的**。

重写原型后，p 的构造函数不是指向 Person 了：因为直接把Person.prototype 赋值为一个对象字面量时，这个新对象**自己没有 `constructor` 属性**，它（指刚刚的对象字面量）的原型是 `Object.prototype`。而 `constructor` 是**继承自原型的**——它会沿着原型链往上找。所以访问 `p.constructor` 时，会沿着原型链找到 `Object.prototype.constructor`，也就是 `Object`。

> JS 引擎初始化时，会先创建一批**内置对象和内置构造函数**,这时候就为其添加了constructor

要想让 `p.constructor` 重新指向 `Person`，需要把**原型上的** `constructor` 指回来：

```javascript
Person.prototype = {
    getName: function() {}
}
var p = new Person('hello')
p.constructor = Person //修复原型上的 constructor
console.log(p.__proto__ === Person.prototype)// true
console.log(p.__proto__ === p.constructor.prototype) // true

```

## 3. 原型链指向

```javascript
p.__proto__  // Person.prototype
Person.prototype.__proto__  // Object.prototype 
p.__proto__.__proto__ //Object.prototype
p.__proto__.constructor.prototype.__proto__ // Object.prototype
Person.prototype.constructor.prototype.__proto__ // Object.prototype
p1.__proto__.constructor // Person
Person.prototype.constructor  // Person
```

## 4. 原型链的终点是什么？如何打印出原型链的终点？

原型链终点是`Object.prototype.__proto__`，而`Object.prototype.__proto__` 的值为 `null`，所以，原型链的终点是`null`。

![1605247722640-5bcb9156-a8b4-4d7c-83d7-9ff80930e1de.jpeg](../public/images/js/1605247722640-5bcb9156-a8b4-4d7c-83d7-9ff80930e1de-209429.jpeg)

示例
```js
// 第 1 层：顶层构造函数
function A() {}
A.prototype.a = 'a'

// 第 2 层：B 继承 A
function B() {}
B.prototype = Object.create(A.prototype)  // B.prototype 的原型是 A.prototype
//B.prototype = A.prototype 错误写法，这样 B.prototype 和 A.prototype 指向同一个对象
B.prototype.constructor = B
B.prototype.b = 'b'

// 第 3 层：C 继承 B
function C() {}
C.prototype = Object.create(B.prototype)
C.prototype.constructor = C
C.prototype.c = 'c'

// 创建实例
const obj = new C()
obj.own = 'own'

原型链结构
obj
  ↓ __proto__
C.prototype          （有 c、constructor: C）
  ↓ __proto__
B.prototype          （有 b、constructor: B）
  ↓ __proto__
A.prototype          （有 a）
  ↓ __proto__
Object.prototype     （有 constructor: Object、toString 等）
  ↓ __proto__
null                 （终点）

```



## 5. 如何获得对象非原型链上的属性？

1. 使用后`hasOwnProperty()`方法来判断属性是否是对象自己的属性：

```javascript
function iterate(obj){
   var res=[];
   for(var key in obj){
        if(obj.hasOwnProperty(key))
           res.push(key+': '+obj[key]);
   }
   return res;
} 
```

2. 用 `Object.keys()`拿对象自己的可枚举属性

   ```javascript
   const obj = { a: 1, b: 2 }
   Object.keys(obj)  // ['a', 'b']，只包含自己的可枚举属性
   ```

   
