---
title: JavaScript数据类型
description: 介绍js的数据类型，以及如何判断数据类型，隐式类型转换等知识
date: 2026-10-01
tags:
  - JavaScript
  - datatype
comments: true

---

# 数据类型

## 1. JavaScript有哪些数据类型，它们的区别？

JavaScript共有八种数据类型，分别是 Undefined、Null、Boolean、Number、String、Object、Symbol、BigInt。

其中 Symbol 和 BigInt 分别是ES2015，ES2020新增的数据类型：

* Symbol 代表创建后**独一无二且不可变**的数据类型，它主要是为了解决可能出现的全局变量冲突的问题。
* BigInt 是一种数字类型的数据，它可以表示**任意精度格式的整数**，使用 BigInt 可以安全地存储和操作**大整数**，即使这个数已经超出了 Number 能够表示的安全整数范围。

这些数据可以分为**原始数据类型**和**引用数据类型**：

* 存储在栈：原始数据类型（Undefined、Null、Boolean、Number、String、Symbol、BigInt）
* 存储在堆：引用数据类型（Object(数组，对象，函数等等)）

两种类型的区别在于**存储位置的不同：**

* 原始数据类型直接存储在栈（stack）中的简单数据段，**占据空间小、大小固定**，属于被频繁使用数据，所以放入栈中存储；

* 引用数据类型存储在堆（heap）中的对象，**占据空间大、大小不固定**。如果存储在栈中，将会影响程序运行的性能；**引用数据类型在栈中存储了指针，该指针指向堆中该实体的起始地址**。当解释器寻找引用值时，会首先检索其在栈中的地址，取得地址后从堆中获得实体。

  

  >引用类型之所以叫引用类型，因为对象的地址是引用的
  >
  >当你创建一个 object1，就在堆内存中开辟一个内存。如果你赋值给 object2，其实就是把 object1 指向堆内存的地址复制给 object2，它们指向的是同一个地址。再在 object1 或者 object2 做修改的话，相当于在同一内存上做修改，无论 object1 修改还是 object2 修改都会改变

堆和栈的概念存在于数据结构和操作系统内存中

- 在数据结构中，栈中数据的存取方式为**先进后出**。
  堆是一个**优先队列**，是按优先级来进行排序的，优先级可以按照大小来规定。
- 在操作系统中，内存被分为栈区和堆区：
  **栈区内存由编译器自动分配释放**，存放函数的参数值，局部变量的值等。其操作方式类似于数据结构中的栈。
  **堆区内存一般由开发者分配释放**，若开发者不释放，程序结束时可能由垃圾回收机制回收。



## 2. 数据类型检测的方式有哪些

**（1）typeof**

```javascript
console.log(typeof 2);               // number
console.log(typeof true);            // boolean
console.log(typeof 'str');           // string
console.log(typeof []);              // object    
console.log(typeof function(){});    // function
console.log(typeof {});              // object
console.log(typeof undefined);       // undefined
console.log(typeof null);            // object
```

其中**数组、对象、null都会被判断为object**，**函数被判断为function**

(**null被判断为object为历史bug**，函数是typeof做了特殊处理，判断为function，而非object)

**（2）instanceof**

`instanceof`可以**正确判断对象的类型**，其内部运行机制是**判断在左边对象的原型链中能否找到右边构造函数的prototype属性**。

```javascript
//语法为： 对象 instanceof 构造函数
console.log(2 instanceof Number);// false
console.log(true instanceof Boolean);// false 
console.log('str' instanceof String);// false 
 
console.log([] instanceof Array); // true
console.log(function(){} instanceof Function);// true
console.log({} instanceof Object);// true
```

可以看到，`instanceof`**只能正确判断引用数据类型**，而不能判断基本数据类型。

**（3） constructor**

```javascript
console.log((2).constructor === Number); // true
console.log((true).constructor === Boolean); // true
console.log(('str').constructor === String); // true
console.log(([]).constructor === Array); // true
console.log((function() {}).constructor === Function); // true
console.log(({}).constructor === Object); // true
```

`constructor`：**对象实例通过从原型继承而来的`constrcutor`属性访问它的构造函数**。需要注意，如果创建一个对象来改变它的原型，`constructor`就不能用来判断数据类型了： 

```javascript
function Fn(){};
 
Fn.prototype = new Array();//通过prototype属性修改原型对象
 
var f = new Fn();
 
console.log(f.constructor===Fn);    // false
console.log(f.constructor===Array); // true
```

**（4）Object.prototype.toString.call()**

`Object.prototype.toString.call()` 
使用 Object 对象的原型方法 toString 来判断数据类型：

```javascript
var a = Object.prototype.toString;
//调用Object 上原型 toString 方法,让它的 this 指向 obj
console.log(a.call(2));            // "[object Number]"
console.log(a.call(true));         // "[object Boolean]"
console.log(a.call('str'));        // "[object String]"
console.log(a.call([]));           // "[object Array]"
console.log(a.call(function(){})); // "[object Function]"
console.log(a.call({}));           // "[object Object]"
console.log(a.call(undefined));    // "[object Undefined]"
console.log(a.call(null));         // "[object Null]"
```

对于检测对象obj 进行调用toString方法：
`obj.toString()` 的结果 和 `Object.prototype.toString.call(obj)` 的结果不一样，这是为什么？

这是因为 toString 是 Object 的原型方法，而 **Array、function 等类型重写了 toString方法**。

不同的对象类型调用 toString 方法时，根据原型链的知识，调用的是对应的重写之后的toString 方法（ function 类型返回内容为函数体的字符串，Array 类型返回元素组成的字符串…），而不会去调用 **Object 上原型 toString 方法（返回对象的具体类型）**，所以**采用obj.toString()不能得到其对象类型，只能将obj转换为字符串类型**；

## 3. null和undefined区别

首先 Undefined 和 Null 都是基本数据类型，这两个基本数据类型分别都只有一个值，就是 undefined 和 null。

undefined 代表的含义是**未定义**，变量声明了但未赋值、函数没有返回值、访问对象不存在的属性时，都会返回 `undefined`。

null 代表的含义是**空对象**。通常用于**人为赋值**给一个预期返回对象的变量，作为初始化的空值。

当对这两种类型使用 typeof 进行判断时，`typeof null`会返回 `object`，这是一个历史遗留的问题。
`null == undefined` 返回 `true`，`null === undefined` 返回 `false`。

> undefined 在 JavaScript 中不是保留字，也不是关键字，这意味着非严格模式下可以使用 undefined 来作为一个变量名，但是这样的做法是非常危险的，它会影响对 undefined 值的判断。我们可以通过一些方法获得安全的 undefined 值，比如说 void 0。（`void` 是一个**运算符**，**对任何表达式求值，然后返回 `undefined`。**）



## 4. instanceof 操作符的实现原理及实现

instanceof 运算符用于判断构造函数的 prototype 属性是否出现在对象的原型链中的任何位置。

```javascript
function myInstanceof(left, right) {
    // 基本类型直接返回 false
    if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
        return false
    }
    // 获取对象的原型
    let proto = Object.getPrototypeOf(left)
    // 获取构造函数的 prototype 对象
    let prototype = right.prototype; 

    // 判断构造函数的 prototype 对象是否在对象的原型链上
    while (true) {
        if (!proto) return false;
        if (proto === prototype) return true;
        // 如果没有找到，就继续从其原型上找，Object.getPrototypeOf方法用来获取指定对象的原型
        proto = Object.getPrototypeOf(proto);
    }
}
```

## 5. 为什么0.1+0.2 ! == 0.3，如何让其相等  

在开发过程中遇到类似这样的问题：

```javascript
let n1 = 0.1, n2 = 0.2
console.log(n1 + n2)  // 0.30000000000000004
```

原因：计算机用**二进制浮点数**存数字，0.1 和 0.2 都**无法用二进制精确表示**，只能存一个很近似的值。这两个近似值相加，误差累积，结果就成了 `0.30000000000000004`，不是 `0.3`。

要想等于0.3，就要把它进行转化：

```javascript
(n1 + n2).toFixed(2) //toFixed为四舍五入
```

`toFixed(num)` 方法可把 Number 四舍五入为指定小数位数的数字。

一个直接的解决方法就是**设置一个误差范围**，通常称为“机器精度”。对JavaScript来说，这个值通常为2<sup>-52</sup>，在ES6中，提供了**`Number.EPSILON`**属性，而它的值就是2<sup>-52</sup>，只要判断`0.1+0.2-0.3`是否小于`Number.EPSILON`，如果小于，就可以判断为0.1+0.2 ===0.3

```javascript
function numberepsilon(arg1,arg2){                   
  return Math.abs(arg1 - arg2) < Number.EPSILON;        
}        

console.log(numberepsilon(0.1 + 0.2, 0.3)); // true
```



## 6. || 和 && 操作符的返回值？

|| 和 && 首先会对 第一个操作数 执行 条件判断，如果其不是布尔值就先强制转换为布尔类型，然后再执行条件判断。

* 对于 || 来说，如果条件判断结果为 true 就返回第一个操作数的值，如果为 false 就返回第二个操作数的值。
* && 则相反，如果条件判断结果为 true 就返回第二个操作数的值，如果为 false 就返回第一个操作数的值。

**|| 和 && 在js中为短路求值，返回它们其中一个操作数的值，而非条件判断的结果**

## 7. Object.is() 与比较操作符 “ === ”、 “ ==” 的区别？

* 使用**双等号（==）**进行相等判断时，如果两边的类型不一致，则会进行**强制类型转化**后再进行比较。
* 使用**三等号（===）**进行相等判断时，如果两边的类型不一致时，**不会做强制类型转换**，直接返回 false。
* 使用 **Object.is** 来进行相等判断时，**一般情况下和三等号的判断相同**
  但它处理了一些特殊的情况
  * **`Object.is(+0, -0)` → `false`（`===` 是 `true`）**
  * **`Object.is(NaN, NaN)` → `true`（`===` 是 `false`）**。


## 8. JavaScript 中如何进行隐式类型转换？

**ECMAScript 规范里的一个抽象操作**：**`ToPrimitive`**：（Primitive：原始类型，原始值）
它是规范内部定义的一套转换步骤，用来**将值转换为基本类型值**。

- 如果值为基本类型，则直接返回值本身
- 如果值为对象，其看起来大概是这样：

```javascript
/**
* @obj 需要转换的对象
* @type 期望的结果类型
*/
ToPrimitive(obj,type)
```

`type`的值为`number`或者`string`。

**（1）当 `type` 为 `number` 时规则如下：**

* 调用`obj`的`valueOf`方法，如果为基本类型值，则返回该值（），否则下一步；

* 调用`obj`的`toString`方法，如果为原始值，则返回该值，否则下一步；

* 抛出`TypeError` 异常。

  > - 普通对象 `valueOf()` 返回自己（对象），不算成功
  > - 于是调 `toString()`，返回 `"[object Object]"`
  > - 再 `Number("[object Object]")` → `NaN`
  > - 所以普通对象转数字就是 `NaN`
  >
  > **只有内置对象（Number、String、Date 等）有基本类型值，才能转出有意义的数字**

**（2）当 `type` 为 `string` 时规则如下：**

* 调用`obj`的`toString`方法，如果为原始值，则返回该值，否则下一步；
* 调用`obj`的`valueOf`方法，如果为原始值，则返回该值，否则下一步；
* 抛出`TypeError` 异常。

| 方法       | 作用                     | 说明                                                         |
| :--------- | :----------------------- | :----------------------------------------------------------- |
| `valueOf`  | 返回对象的**基本类型值   | 普通对象没有基本类型值，返回自身，而某些内置对象**有**基本类型值，会返回基本类型值 |
| `toString` | 返回对象的**字符串表示** | 普通对象返回：`"[object Object]"` （例如 "[object Array]"）<br />数组返回字符串：例如"1,2"<br />Date返回日期字符串 |

可以看出两者的主要区别在于调用`toString`和`valueOf`的先后顺序。**默认情况下**：

* 如果对象为 **Date** 对象，则`type`默认为**`string`**；
* 其他情况下，`type`默认为**`number`**。



**JavaScript 中的隐式类型转换主要发生在`+、-、*、/`以及`==、>、<`这些运算符之间**。而这些运算符只能操作基本类型值，所以在进行这些运算前的第一步就是将两边的值用`ToPrimitive`转换成基本类型，再进行操作。

以下是**基本类型**的值在**不同操作符**的情况下**隐式转换**的规则 

1. **`+`**操作符:  `+`操作符的两边**有至少一个`string`类型变量**时，两边的变量**都会被隐式转换为字符串**；其他情况下两边的变量都会被转换为数字。

```javascript
1 + '23' // '123'
 1 + false // 1 
 1 + Symbol() // Uncaught TypeError: Cannot convert a Symbol value to a number （ Symbol 明确禁止转数字，所以抛 TypeError）
 '1' + false // '1false'
 false + true // 1
```

2. `-`**、**`*`**、**`/`**操作符** ：**两边转数字，再算**

```javascript
1 * '23' // 23
 1 * false // 0
 1 / 'aa' // NaN ，NaN也属于数字
```

3. 对于**`==`**操作符

操作符两边的值都尽量**转成`number`**：

```javascript
3 == true // false, 3 转为number为3，true转为number为1
'0' == false //true, '0'转为number为0，false转为number为0
'0' == 0 //true, '0'转为number为0
```

4. **对于**`<`**和**`>`**比较符**

**如果两边都是字符串，则比较字母表顺序**：

```javascript
'ca' < 'bd' // false
'a' < 'b' // true
```

**其他情况下，转换为数字**再比较：

```javascript
'12' < 13 // true
false > -1 // true
```



以上说的是基本类型的隐式转换，而**对象会被`ToPrimitive`转换为基本类型再进行转换**：

```javascript
var a = {}
a > 2 // false
```

其对比过程如下：

```javascript
a.valueOf() // {}, 上面提到过，ToPrimitive默认type为number，所以先valueOf，结果还是个对象，下一步
a.toString() // "[object Object]"，现在是一个字符串了
Number(a.toString()) // 结果为NaN，根据上面 < 和 > 操作符的规则，要转换成数字
NaN > 2 //false，得出比较结果
```

NaN 表示“不是一个有效数字”，它和任何数比都没有意义，所以规范规定**NaN的所有比较都返回 false**（除了：!=` 和 `!== ）

又比如：

```javascript
var a = {name:'Jack'}
var b = {age: 18}
a + b // "[object Object][object Object]"
```

运算过程如下：

```javascript
a.valueOf() // {}，上面提到过，ToPrimitive默认type为number，所以先valueOf，结果还是个对象，下一步
a.toString() // "[object Object]"
b.valueOf() // 同理
b.toString() // "[object Object]"
a + b // "[object Object][object Object]"
```



## 9 object.assign和扩展运算是深拷贝还是浅拷贝，两者区别

**二者都是浅拷贝，只拷贝第一层，嵌套的引用类型还是共享同一个地址**

扩展运算符：

```javascript
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = {...outObj}
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

Object.assign():

```javascript
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = Object.assign({}, outObj)
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

可以看到，两者都是浅拷贝。

* Object.assign()方法接收的第一个参数作为目标对象，后面的所有参数作为源对象。然后**把所有的源对象的属性合并到目标对象中**。它会修改了一个对象（目标对象），属于赋值操作，因此会触发 ES6 setter。
* 扩展操作符（…）使用它时，**数组或对象中的每一个值都会被拷贝到一个新的数组或对象中**。它不是“赋值到已有对象”，而是**创建新对象、定义新属性**。注意：它不复制 继承的属性 或 类的属性，但是它会复制ES6的 symbols 属性。

