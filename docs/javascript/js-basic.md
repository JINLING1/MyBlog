---
title: JavaScript基础
description: 待补充
date: 2026-10-1
tags:
  - JavaScript
comments: true


---

# JavaScript基础

## 1. new操作符的实现原理

**new操作符的执行过程：**

（1）首先创建了一个新的空对象

（2）设置原型，将对象的原型设置为函数的 prototype 对象。

（3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）

（4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象。

具体实现：

```javascript
function objectFactory() {
  let newObject = null;
  let constructor = Array.prototype.shift.call(arguments);
  let result = null;
  // 判断参数是否是一个函数
  if (typeof constructor !== "function") {
    console.error("type error");
    return;
  }
  // 新建一个空对象，对象的原型为构造函数的 prototype 对象
  newObject = Object.create(constructor.prototype);
  // 将 this 指向新建对象，并执行函数
  result = constructor.apply(newObject, arguments);
  // 判断返回对象
  let flag = result && (typeof result === "object" || typeof result === "function");
  // 判断返回结果
  return flag ? result : newObject;
}
// 使用方法
objectFactory(构造函数, 初始化参数);
```

## 2. map和Object的区别

|          |                             Map                              |                            Object                            |
| -------- | :----------------------------------------------------------: | :----------------------------------------------------------: |
| 意外的键 |        Map默认情况不包含任何键，只包含显式插入的键。         | Object 有一个原型, 原型链上的键名有可能和自己在对象上的设置的键名产生冲突。 |
| 键的类型 |     Map的键可以是任意值，包括函数、对象或任意基本类型。      |            Object 的键必须是 String 或是Symbol。             |
| 键的顺序 | Map 中的 key 是有序的。因此，当迭代的时候， Map 对象以插入的顺序返回键值。 |                     Object 的键是无序的                      |
| Size     |         Map 的键值对个数可以轻易地通过size 属性获取          |               Object 的键值对个数只能手动计算                |
| 迭代     |           Map 是 iterable 的，所以可以直接被迭代。           |       迭代Object需要以某种方式获取它的键然后才能迭代。       |
| 性能     |              在频繁增删键值对的场景下表现更好。              |          在频繁添加和删除键值对的场景下未作出优化。          |



## 5. 正则表达式

正则表达式（Regular Expression）是一种**描述字符串匹配模式**的语法，核心由**字面量字符 + 元字符 + 量词 + 分组**组成

### 一、字符类

| 语法     | 含义                          | 示例                    |
| :------- | :---------------------------- | :---------------------- |
| `.`      | 任意字符（除换行）            | `a.c` 匹配 `abc`、`a1c` |
| `\d`     | 数字 `[0-9]`                  | `\d{3}` 匹配 3 位数字   |
| `\D`     | 非数字                        | `\D+` 匹配连续非数字    |
| `\w`     | 字母数字下划线 `[A-Za-z0-9_]` | `\w+` 匹配单词          |
| `\W`     | 非单词字符                    | `\W` 匹配空格、标点     |
| `\s`     | 空白字符（空格、制表、换行）  | `\s+` 匹配连续空白      |
| `\S`     | 非空白字符                    | `\S+` 匹配非空白串      |
| `[abc]`  | a、b、c 中任意一个            | `[aeiou]` 匹配元音      |
| `[^abc]` | 除 a、b、c 外任意字符         | `[^0-9]` 匹配非数字     |
| `[a-z]`  | a 到 z 范围                   | `[a-zA-Z]` 匹配字母     |

### 二、量词

| 语法           | 含义                   | 示例                        |
| :------------- | :--------------------- | :-------------------------- |
| `*`            | 0 次或多次             | `ab*` 匹配 `a`、`ab`、`abb` |
| `+`            | 1 次或多次             | `ab+` 匹配 `ab`、`abb`      |
| `?`            | 0 次或 1 次            | `ab?` 匹配 `a`、`ab`        |
| `{n}`          | 恰好 n 次              | `\d{6}` 匹配 6 位数字       |
| `{n,}`         | 至少 n 次              | `\d{6,}` 匹配 6 位以上      |
| `{n,m}`        | n 到 m 次              | `\d{6,10}` 匹配 6~10 位     |
| `*?` `+?` `??` | 非贪婪（尽可能少匹配） | `a+?` 只匹配 1 个 `a`       |

### 三、位置锚点

| 语法 | 含义          | 示例                       |
| :--- | :------------ | :------------------------- |
| `^`  | 字符串/行开头 | `^abc` 以 abc 开头         |
| `$`  | 字符串/行结尾 | `abc$` 以 abc 结尾         |
| `\b` | 单词边界      | `\bcat\b` 匹配独立单词 cat |
| `\B` | 非单词边界    | `\Bcat` 前面不能是边界     |

### 四、分组与引用

| 语法      | 含义                | 示例                      |
| :-------- | :------------------ | :------------------------ |
| `(...)`   | 捕获分组            | `(ab)+` 匹配 `ab` 重复    |
| `(?:...)` | 非捕获分组          | `(?:ab)+` 只匹配不保存    |
| `|`       | 或                  | `cat|dog` 匹配 cat 或 dog |
| `\1`      | 反向引用第 1 个分组 | `(\w)\1` 匹配 `aa`、`bb`  |

### 五、常用修饰符

| 修饰符 | 含义            |
| :----- | :-------------- |
| `g`    | 全局匹配        |
| `i`    | 忽略大小写      |
| `m`    | 多行模式        |
| `s`    | 让 `.` 匹配换行 |
| `u`    | Unicode 模式    |
| `y`    | 粘性匹配        |

```javascript
// （1）匹配 16 进制颜色值
var regex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g;

// （2）匹配日期，如 yyyy-mm-dd 格式
var regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

// （3）匹配 qq 号
var regex = /^[1-9][0-9]{4,10}$/g;

// （4）手机号码正则
var regex = /^1[3-9]\d{9}$/g;

// （5）用户名正则
var regex = /^[a-zA-Z\$][a-zA-Z0-9_\$]{4,16}$/;
```



## 9. 数组有哪些原生方法？

### 数组 ↔ 字符串转换

| 方法               | 作用                       | 是否影响原数组 | 备注                         |
| ------------------ | -------------------------- | -------------- | ---------------------------- |
| `toString()`       | 数组转字符串，默认逗号分隔 | 否             | `[1,2].toString()` → `"1,2"` |
| `toLocaleString()` | 按本地规则转字符串         | 否             | 日期/数字会按本地格式        |
| `join(sep)`        | 数组转字符串，可指定分隔符 | 否             | `[1,2].join('-')` → `"1-2"`  |

### 数组增删（改变原数组）

| 方法                         | 作用               | 位置     | 备注                             |
| ---------------------------- | ------------------ | -------- | -------------------------------- |
| `push(...items)`             | 尾部添加，可传多个 | 尾部     | 返回新长度                       |
| `pop()`                      | 删除最后一个       | 尾部     | 返回被删元素                     |
| `unshift(...items)`          | 头部添加，可传多个 | 头部     | 返回新长度                       |
| `shift()`                    | 删除第一个         | 头部     | 返回被删元素                     |
| `splice(start, n, ...items)` | 插入/删除/替换     | 任意位置 | 返回被删元素数组，**影响原数组** |

### 排序与反转（改变原数组）

| 方法        | 作用     | 备注                                  |
| ----------- | -------- | ------------------------------------- |
| `reverse()` | 反转数组 | 影响原数组                            |
| `sort(fn)`  | 排序     | 影响原数组；`fn(a, b)` 返回正数则交换 |

### 连接与截取（不改变原数组）

| 方法                | 作用       | 是否影响原数组 | 备注                   |
| ------------------- | ---------- | -------------- | ---------------------- |
| `concat(...arrs)`   | 拼接数组   | 否             | 返回新数组             |
| `slice(start, end)` | 截取一部分 | 否             | 返回新数组，不含 `end` |

### 查找

| 方法                      | 作用       | 返回值      |
| ------------------------- | ---------- | ----------- |
| `indexOf(item, from)`     | 从前往后找 | 索引或 `-1` |
| `lastIndexOf(item, from)` | 从后往前找 | 索引或 `-1` |
| `includes(item)`          | 是否包含   | 布尔        |

### 迭代方法

| 方法          | 作用                 | 返回值      |
| ------------- | -------------------- | ----------- |
| `forEach(fn)` | 遍历                 | `undefined` |
| `map(fn)`     | 映射，每项处理后返回 | 新数组      |
| `filter(fn)`  | 过滤                 | 新数组      |
| `some(fn)`    | 是否有任意一项满足   | 布尔        |
| `every(fn)`   | 是否所有项都满足     | 布尔        |

### 归并

| 方法                    | 作用         | 备注                     |
| ----------------------- | ------------ | ------------------------ |
| `reduce(fn, init)`      | 从左往右归并 | `fn(acc, cur, idx, arr)` |
| `reduceRight(fn, init)` | 从右往左归并 | 同上，方向相反           |

### 总结

- **改原数组**：`push`、`pop`、`shift`、`unshift`、`splice`、`reverse`、`sort`
- **不改原数组**：`concat`、`slice`、`map`、`filter`、`join`、`toString`
- **`splice` 会改，`slice` 不会改**，两个最容易混。



## 16. 对AJAX的理解，实现一个AJAX请求

AJAX是 Asynchronous JavaScript and XML 的缩写，指的是通过 JavaScript 的 异步通信，从服务器获取 XML 文档从中提取数据，再更新当前网页的对应部分，而不用刷新整个网页。

创建AJAX请求的步骤：

* **创建一个 XMLHttpRequest 对象。**
* 在这个对象上**使用 open 方法创建一个 HTTP 请求**，open 方法所需要的参数是请求的方法、请求的地址、是否异步和用户的认证信息。
* 在发起请求前，可以为这个对象**添加一些信息和监听函数**。比如说可以通过 setRequestHeader 方法来为请求添加头信息。还可以为这个对象添加一个状态监听函数。一个 XMLHttpRequest 对象一共有 5 个状态，当它的状态变化时会触发onreadystatechange 事件，可以通过设置监听函数，来处理请求成功后的结果。当对象的 readyState 变为 4 的时候，代表服务器返回的数据接收完成，这个时候可以通过判断请求的状态，如果状态是 2xx 或者 304 的话则代表返回正常。这个时候就可以通过 response 中的数据来对页面进行更新了。
* 当对象的属性和监听函数设置完成后，最后调**用 sent 方法来向服务器发起请求**，可以传入参数作为发送的数据体。

```javascript
const SERVER_URL = "/server";
let xhr = new XMLHttpRequest();
// 创建 Http 请求
xhr.open("GET", url, true);
// 设置状态监听函数
xhr.onreadystatechange = function() {
  if (this.readyState !== 4) return;
  // 当请求成功时
  if (this.status === 200) {
    handle(this.response);
  } else {
    console.error(this.statusText);
  }
};
// 设置请求失败时的监听函数
xhr.onerror = function() {
  console.error(this.statusText);
};
// 设置请求头信息
xhr.responseType = "json";
xhr.setRequestHeader("Accept", "application/json");
// 发送 Http 请求
xhr.send(null);
```

使用Promise封装AJAX：

```javascript
// promise 封装实现：
function getJSON(url) {
  // 创建一个 promise 对象
  let promise = new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    // 新建一个 http 请求
    xhr.open("GET", url, true);
    // 设置状态的监听函数
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) return;
      // 当请求成功或失败时，改变 promise 的状态
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    // 设置错误监听函数
    xhr.onerror = function() {
      reject(new Error(this.statusText));
    };
    // 设置响应的数据类型
    xhr.responseType = "json";
    // 设置请求头信息
    xhr.setRequestHeader("Accept", "application/json");
    // 发送 http 请求
    xhr.send(null);
  });
  return promise;
}
```

## 17. JavaScript为什么要进行变量提升，它导致了什么问题？

变量提升的表现是，无论在函数中何处位置声明的变量，好像都被提升到了函数的首部，可以在变量声明前访问到而不会报错。

造成变量声明提升的**本质原因**是 js 引擎在代码执行前有一个解析的过程，创建了执行上下文，初始化了一些代码执行时需要用到的对象。当访问一个变量时，会到当前执行上下文中的作用域链中去查找，而作用域链的首端指向的是当前执行上下文的变量对象，这个变量对象是执行上下文的一个属性，它包含了函数的形参、所有的函数和变量声明，这个对象的是在代码解析的时候创建的。

首先要知道，JS在拿到一个变量或者一个函数的时候，会有两步操作，即解析和执行。

* **在解析阶段**，JS会检查语法，并对函数进行预编译。解析的时候会先创建一个全局执行上下文环境，先把代码中即将执行的变量、函数声明都拿出来，变量先赋值为undefined，函数先声明好可使用。在一个函数执行之前，也会创建一个函数执行上下文环境，跟全局执行上下文类似，不过函数执行上下文会多出this、arguments和函数的参数。
  * 全局上下文：变量定义，函数声明
  * 函数上下文：变量定义，函数声明，this，arguments
* **在执行阶段**，就是按照代码的顺序依次执行。

那为什么会进行变量提升呢？主要有以下两个原因：

* 提高性能
* 容错性更好

**（1）提高性能**

在JS代码执行之前，会进行语法检查和预编译，并且这一操作只进行一次。这么做就是为了提高性能，如果没有这一步，那么每次执行代码前都必须重新解析一遍该变量（函数），而这是没有必要的，因为变量（函数）的代码并不会改变，解析一遍就够了。

在解析的过程中，还会为函数生成预编译代码。在预编译时，会统计声明了哪些变量、创建了哪些函数，并对函数的代码进行压缩，去除注释、不必要的空白等。这样做的好处就是每次执行函数时都可以直接为该函数分配栈空间（不需要再解析一遍去获取代码中声明了哪些变量，创建了哪些函数），并且因为代码压缩的原因，代码执行也更快了。

**（2）容错性更好**

变量提升可以在一定程度上提高JS的容错性，看下面的代码：

```javascript
a = 1;
var a;
console.log(a);
```

如果没有变量提升，这两行代码就会报错，但是因为有了变量提升，这段代码就可以正常执行。

虽然，在可以开发过程中，可以完全避免这样写，但是有时代码很复杂的时候。可能因为疏忽而先使用后定义了，这样也不会影响正常使用。由于变量提升的存在，而会正常运行。

**总结：**

* 解析和预编译过程中的声明提升可以提高性能，让函数可以在执行时预先为变量分配栈空间
* 声明提升还可以提高JS代码的容错性，使一些不规范的代码也可以正常执行

变量提升虽然有一些优点，但是他也会造成一定的问题，在ES6中提出了let、const来定义变量，它们就没有变量提升的机制。下面看一下变量提升可能会导致的问题：

```javascript
var tmp = new Date();

function fn(){
	console.log(tmp);
	if(false){
		var tmp = 'hello world';
	}
}

fn();  // undefined
```

在这个函数中，原本是要打印出外层的tmp变量，但是因为变量提升的问题，内层定义的tmp被提到函数内部的最顶部，相当于覆盖了外层的tmp，所以打印结果为undefined。

```javascript
var tmp = 'hello world';

for (var i = 0; i < tmp.length; i++) {
	console.log(tmp[i]);
}

console.log(i); // 11
```

由于遍历时定义的i会变量提升成为一个全局变量，在函数结束之后不会被销毁，所以打印出来11。



## 20. 常见的DOM操作有哪些

### 1）DOM 节点的获取

DOM 节点的获取的API及使用：

```javascript
getElementById // 按照 id 查询
getElementsByTagName // 按照标签名查询
getElementsByClassName // 按照类名查询
querySelectorAll // 按照 css 选择器查询

// 按照 id 查询
var imooc = document.getElementById('imooc') // 查询到 id 为 imooc 的元素
// 按照标签名查询
var pList = document.getElementsByTagName('p')  // 查询到标签为 p 的集合
console.log(divList.length)
console.log(divList[0])
// 按照类名查询
var moocList = document.getElementsByClassName('mooc') // 查询到类名为 mooc 的集合
// 按照 css 选择器查询
var pList = document.querySelectorAll('.mooc') // 查询到类名为 mooc 的集合
```

### 2）DOM 节点的创建

**创建一个新节点，并把它添加到指定节点的后面。**已知的 HTML 结构如下：

```html
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
    </div>   
  </body>
</html>
```

要求添加一个有内容的 span 节点到 id 为 title 的节点后面，做法就是：

```javascript
// 首先获取父节点
var container = document.getElementById('container')
// 创建新节点
var targetSpan = document.createElement('span')
// 设置 span 节点的内容
targetSpan.innerHTML = 'hello world'
// 把新创建的元素塞进父节点里去
container.appendChild(targetSpan)
```

### 3）DOM 节点的删除

**删除指定的 DOM 节点，**已知的 HTML 结构如下：

```javascript
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
    </div>   
  </body>
</html>
```

需要删除 id 为 title 的元素，做法是：

```javascript
// 获取目标元素的父元素
var container = document.getElementById('container')
// 获取目标元素
var targetNode = document.getElementById('title')
// 删除目标元素
container.removeChild(targetNode)
```

或者通过子节点数组来完成删除：

```javascript
// 获取目标元素的父元素
var container = document.getElementById('container')
// 获取目标元素
var targetNode = container.childNodes[1]
// 删除目标元素
container.removeChild(targetNode)
```

### 4）修改 DOM 元素

修改 DOM 元素这个动作可以分很多维度，比如说移动 DOM 元素的位置，修改 DOM 元素的属性等。

**将指定的两个 DOM 元素交换位置，**已知的 HTML 结构如下：

```javascript
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
      <p id="content">我是内容</p>
    </div>   
  </body>
</html>
```

现在需要调换 title 和 content 的位置，可以考虑 insertBefore 或者 appendChild：

```javascript
// 获取父元素
var container = document.getElementById('container')   
 
// 获取两个需要被交换的元素
var title = document.getElementById('title')
var content = document.getElementById('content')
// 交换两个元素，把 content 置于 title 前面
container.insertBefore(content, title)
```



## 27. ajax、axios、fetch的区别

**（1）AJAX**

Ajax 即“AsynchronousJavascriptAndXML”（异步 JavaScript 和 XML），是指一种创建交互式[网页](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E7%25BD%2591%25E9%25A1%25B5)应用的网页开发技术。它是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。通过在后台与服务器进行少量数据交换，Ajax 可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。传统的网页（不使用 Ajax）如果需要更新内容，必须重载整个网页页面。其缺点如下：

* 本身是针对MVC编程，不符合前端MVVM的浪潮
* 基于原生XHR开发，XHR本身的架构不清晰
* 不符合关注分离（Separation of Concerns）的原则
* 配置和调用方式非常混乱，而且基于事件的异步模型不友好。

**（2）Fetch**

fetch号称是AJAX的替代品，是在ES6出现的，使用了ES6中的promise对象。Fetch是基于promise设计的。Fetch的代码结构比起ajax简单多。**fetch不是ajax的进一步封装，而是原生js，没有使用XMLHttpRequest对象**。

fetch的优点：

* 语法简洁，更加语义化
* 基于标准 Promise 实现，支持 async/await
* 更加底层，提供的API丰富（request, response）
* 脱离了XHR，是ES规范里新的实现方式

fetch的缺点：

* fetch只对网络请求报错，对400，500都当做成功的请求，服务器返回 400，500 错误码时并不会 reject，只有网络错误这些导致请求不能完成时，fetch 才会被 reject。
* fetch默认不会带cookie，**同源请求默认带（`same-origin`），跨域默认不带，要带需 `credentials: 'include'`**。
* fetch没有办法原生监测请求的进度，而XHR可以

**（3）Axios**

Axios 是一种基于Promise封装的HTTP客户端，其特点如下：

* 浏览器端发起XMLHttpRequests请求
* node端发起http请求
* 支持Promise API
* 监听请求和返回
* 对请求和返回进行转化
* 取消请求
* 自动转换json数据
* 客户端支持抵御XSRF攻击

## 28. 数组的遍历方法有哪些

| **方法**                  | **是否改变  原数组** |                           **特点**                           |
| ------------------------- | :------------------: | :----------------------------------------------------------: |
| forEach()                 |          否          |              数组方法，不改变原数组，没有返回值              |
| map()                     |          否          |         数组方法，不改变原数组，有返回值，可链式调用         |
| filter()                  |          否          | 数组方法，过滤数组，返回包含符合条件的元素的数组，可链式调用 |
| for...of                  |          否          | for...of遍历具有Iterator迭代器的对象的属性，返回的是数组的元素、对象的属性值，不能遍历普通的obj对象，将异步循环变成同步循环 |
| every() 和 some()         |          否          | 数组方法，some()只要有一个是true，便返回true；而every()只要有一个是false，便返回false. |
| find() 和 findIndex()     |          否          | 数组方法，find()返回的是第一个符合条件的值；findIndex()返回的是第一个符合条件的值的索引值 |
| reduce() 和 reduceRight() |          否          | 数组方法，reduce()对数组正序操作；reduceRight()对数组逆序操作 |

遍历方法的详细解释：[《细数JavaScript中那些遍历和循环》](https://cuggz.blog.csdn.net/article/details/107649549)

