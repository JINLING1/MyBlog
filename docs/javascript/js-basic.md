---
title: JavaScript基础
description: 待补充
date: 2026-10-01
tags:
  - JavaScript
comments: true


---

# JavaScript基础

## 1. new操作符的实现原理

**new操作符的执行过程：**

（1）创建了一个空对象

（2）设置原型，将对象的原型设置为函数的 prototype 对象

（3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）

（4）判断函数的返回值类型，如果是基本类型，返回新建的对象。如果是引用类型，就返回这个引用类型的对象，覆盖掉新建的对象。

> `new` 的目的是**创建并返回一个对象**。
>
> - 如果你显式 `return` 一个对象，说明你想用你自己造的那个，`new` 尊重你的选择。
>
> - 如果你 `return` 基本类型，基本类型不是对象，不能当构造结果，所以 `new` 忽略它，返回自己造的 `this`。
>
>   ```javascript
>   function A() {
>     this.x = 1
>     return 123        // 基本类型
>   }
>         
>   function B() {
>     this.x = 1
>     return { y: 2 }   // 引用类型
>   }
>         
>   new A()  // { x: 1 }，123 被忽略
>   new B()  // { y: 2 }，{ x: 1 } 被覆盖
>   ```
>
>   

具体实现：

```javascript
function myNew(Constructor, ...args) {
  // 1. 参数校验：Constructor 必须是函数，否则抛错
  if (typeof Constructor !== 'function') {
    throw new TypeError('not a function')
  }

  // 2. 创建新对象，并把它原型指向构造函数的 prototype
  //    等价于 obj.__proto__ = Constructor.prototype
  const obj = Object.create(Constructor.prototype)

  // 3. 执行构造函数，把 this 指向新建的 obj，并传入参数
  //  如果构造函数内部写了 this.xxx = ...，这些属性就挂到了 obj 上
  const result = Constructor.apply(obj, args)

  // 4. 判断构造函数的返回值
  //    如果返回的是对象（引用类型），就用它；否则忽略，返回新建的 obj
  const isObject =
    result !== null &&
    (typeof result === 'object' || typeof result === 'function')

  // 5. 返回结果
  return isObject ? result : obj
}
```

## 2. map和Object的区别

| 对比  项 | Map                                  | Object                                                       |
| :------- | :----------------------------------- | :----------------------------------------------------------- |
| 意外的键 | 默认不含任何键，只含显式插入的键     | 有原型链，键名可能与原型属性冲突                             |
| 键的类型 | 任意类型（对象、函数、基本类型均可） | 只能是 String 或 Symbol；其他类型会**转成字符串**            |
| 键的顺序 | 严格按插入顺序                       | 整数键（非负整数字符串）升序   字符串键按插入顺序 + Symbol 按插入顺序且排最后（ES2015+） |
| Size     | `map.size`                           | `Object.keys(obj).length`                                    |
| 迭代     | 可直接 `for...of` 迭代               | 要先 `Object.keys()` 再迭代                                  |
| 性能     | 频繁增删场景下更稳定                 | 频繁增删可能因结构变化降速，取决于引擎优化                   |

记住三点：

1. **键的类型**：Map 的键可以是任意类型，Object 的键只能是 String 或 Symbol。
2. **顺序**：Map 严格按插入顺序；Object 虽然现代引擎有顺序，但规则复杂，最好不要依赖。
3. **意外的键**：Object 有原型链，可能撞上 `toString` 这种默认键；Map 干干净净。

## 3. 正则表达式

正则表达式（Regular Expression）是一种**描述字符串匹配模式**的语法

写正则时，问自己四个问题：

| 问题                     | 对应语法                    |
| :----------------------- | :-------------------------- |
| **找什么内容？**         | 字符类 `\d`、`\w`、`[abc]`  |
| **找几个？**             | 量词 `*`、`+`、`?`、`{n,m}` |
| **从哪开始、到哪结束？** | 锚点 `^`、`$`、`\b`         |
| **要不要分组、替换？**   | 分组 `(...)`、引用 `\1`     |

### 一、字符类

| 语法     | 含义                            | 示例                    |
| :------- | :------------------------------ | :---------------------- |
| `.`      | 任意字符（除换行）              | `a.c` 匹配 `abc`、`a1c` |
| `\d`     | 数字 `[0-9]`                    | `\d{3}` 匹配 3 位数字   |
| `\D`     | 非数字                          | `\D+` 匹配连续非数字    |
| `\w`     | 字母/数字/下划线 `[A-Za-z0-9_]` | `\w+` 匹配`a`、`5`、`_` |
| `\s`     | 空白字符（空格、制表、换行）    | `\s+` 匹配连续空白      |
| `[abc]`  | a、b、c 中任意一个              | `[aeiou]` 匹配元音      |
| `[^abc]` | 除 a、b、c 外任意字符           | `[^0-9]` 匹配非数字     |
| `[a-z]`  | a 到 z 范围                     | `[a-zA-Z]` 匹配字母     |

digit数字 word单词字符 space空白

### 二、量词

| 语法    | 含义                 | 示例                        |
| :------ | :------------------- | :-------------------------- |
| `*`     | 0 次或多次(包含一次) | `ab*` 匹配 `a`、`ab`、`abb` |
| `+`     | 1 次或多次           | `ab+` 匹配 `ab`、`abb`      |
| `?`     | 0 次或 1 次          | `ab?` 匹配 `a`、`ab`        |
| `{n}`   | 恰好 n 次            | `\d{6}` 匹配 6 位数字       |
| `{n,}`  | 至少 n 次            | `\d{6,}` 匹配 6 位以上      |
| `{n,m}` | n 到 m 次            | `\d{6,10}` 匹配 6~10 位     |

### 三、位置锚点

| 语法 | 含义          | 示例                       |
| :--- | :------------ | :------------------------- |
| `^`  | 字符串/行开头 | `^abc` 以 abc 开头         |
| `$`  | 字符串/行结尾 | `abc$` 以 abc 结尾         |
| `\b` | 单词边界      | `\bcat\b` 匹配独立单词 cat |

### 四、分组与引用

| 语法      | 含义                     | 示例                      |
| :-------- | :----------------------- | :------------------------ |
| `(...)`   | 捕获分组                 | `(ab)+` 匹配 `ab` 重复    |
| `(?:...)` | 非捕获分组               | `(?:ab)+` 只匹配不保存    |
| `|`       | 或                       | `cat|dog` 匹配 cat 或 dog |
| `\1`      | 再匹配一次刚刚捕获的字符 | `(\w)\1` 匹配 `aa`、`bb`  |

### 五、常用修饰符

| 修饰符 | 含义            |
| :----- | :-------------- |
| `g`    | 全局匹配        |
| `i`    | 忽略大小写      |
| `m`    | 多行模式        |
| `s`    | 让 `.` 匹配换行 |

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



## 4. 对AJAX的理解，实现一个AJAX请求

>传统方式：
>
>- 整页刷新：点击链接/提交表单等->浏览器跳转/重新加载整个页面->服务器返回一整个HTML页面->页面白屏、闪烁
>- JS发请求但同步等待：用 `XMLHttpRequest` 的**同步模式**（特别设置`async = false`）->JS 发请求后**卡住整个页面**，等服务器返回->拿到数据再继续->虽然没跳转，但体验极差，页面卡死

**AJAX**是 Asynchronous JavaScript and XML 的缩写，最初指的是通过 JavaScript 的 异步通信，从服务器获取 XML 文档，从中提取数据，再更新当前网页的对应部分，而不用刷新整个网页。
现在指的就是**一种技术方案：不刷新整个页面，异步地和服务器交换数据并局部更新页面**

创建AJAX请求的步骤：

* **创建一个 XMLHttpRequest 对象。**

* 在这个对象上**使用 open 方法创建一个 HTTP 请求**，`xhr.open(method, url, async, user, password)` open 方法所需要的参数是请求方法、请求地址、(可选参数：是否异步、用户名、密码）

* 在发起请求前，可以为这个对象**添加一些信息和监听函数**：

  - 比如说可以通过 setRequestHeader 方法来为请求添加头信息。还可以为这个对象添加一个状态监听函数。
    一个 XMLHttpRequest 对象一共有 5 个状态

    > | readyState | 含义                           |
    > | :--------- | :----------------------------- |
    > | 0          | UNSENT，对象已创建，未调 open  |
    > | 1          | OPENED，已调 open              |
    > | 2          | HEADERS_RECEIVED，已收到响应头 |
    > | 3          | LOADING，正在接收响应体        |
    > | 4          | DONE，响应接收完成             |

    当它的状态变化时会触发**onreadystatechange** 事件，可以通过设置监听函数，来处理请求成功后的结果。当对象的 readyState 变为 4 的时候，代表服务器返回的数据接收完成，这个时候可以通过判断请求的状态，如果HTTP状态码`xhr.status`是 2xx 的话则代表返回正常。这个时候就可以通过 response 中的数据来对页面进行更新了。

* 当对象的属性和监听函数设置完成后，最后**调用 send 方法来向服务器发起请求**，可以传入参数作为发送的数据体。

  - `GET` 请求：`send()` 不传参，或传 `null`
  - `POST` 请求：`send(data)` 传数据体

```javascript
//传统XHR写法
//创建xhr对象1
let xhr = new XMLHttpRequest();
// 创建 Http 请求
xhr.open("GET", url, true);
// 设置状态监听函数
xhr.onreadystatechange = function() {
    if (this.readyState !== 4) return;
    // 当请求成功时
    if (this.status >= 200 && this.status < 300) {
        handle(this.response);
    }  else if (this.status !== 0)  {
        reject(new Error(this.statusText));
    }
};
// 设置错误监听函数
xhr.onerror = function() {
    reject(new Error('Network Error'));
};
// 设置期望收到的响应类型
xhr.responseType = "json";
//设置请求头
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
            if (this.status >= 200 && this.status < 300) {
                resolve(this.response);
            } else if (this.status !== 0)  {
                reject(new Error(this.statusText));
            }
        };
        // 设置错误监听函数
        xhr.onerror = function() {
            reject(new Error('Network Error'));
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

//使用Promise封装后，后续逻辑可以写在then/await后面，防止回调地狱
// 链式写法
getJSON('/api/user')
  .then(data => {
    console.log(data)
    renderUser(data)
  })
  .catch(err => {
    console.error(err)
  })
// async/await 写法
async function init() {
  try {
    const data = await getJSON('/api/user')
    renderUser(data)
  } catch (err) {
    console.error(err)
  }
}
```

| 名称        | 是什么                                                       | 定位 | 类型                       |
| :---------- | :----------------------------------------------------------- | :--- | :------------------------- |
| AJAX        | 一种技术方案<br />不刷新页面，异步和服务器交换数据，局部更新 DOM | 概念 | 方案                       |
| XHR         | 浏览器提供的 API 对象<br />用来发 HTTP 请求                  | 工具 | 构造函数，有属性和方法     |
| Promise     | ES6 提供的异步管理对象<br />“包装异步结果”的容器             | 工具 | 构造函数，有 `then` 等方法 |
| async/await | ES2017 提供的语法糖<br />把 Promise 的 `.then()` 包装成看起来像同步的写法 | 语法 | 关键字，不是对象           |

## 5. JavaScript为什么要进行变量提升，它导致了什么问题？

变量提升的表现是，无论在函数中何处位置声明的变量，好像都被提升到了函数的首部，**可以在变量声明前访问到**而不会报错。

造成变量声明提升的本质原因是 js 引擎在代码执行前有一个**编译**的过程，创建了**执行上下文**，**初始化**了一些代码执行时需要用到的对象。当访问一个变量时，会到当前执行上下文中的**作用域链**中去查找，而作用域链的首端指向的是当前执行上下文的**变量对象**，这个变量对象是执行上下文的一个属性，它包含了函数的形参、所有的函数和变量声明，这个对象的是在代码编译的时候创建的。

首先要知道，JS在拿到一个变量或者一个函数的时候，会有两步操作，即编译和执行。

* **在编译阶段**，JS会检查语法，并对函数进行预编译。编译的时候会先创建一个全局执行上下文环境，先把代码中即将执行的变量、函数声明都拿出来，**变量先赋值为undefined，函数先声明好可使用**。在一个函数执行之前，也会创建一个函数执行上下文环境，跟全局执行上下文类似，不过函数执行上下文会多出this、arguments和函数的参数。
  * 全局上下文：变量定义，函数声明
  * 函数上下文：变量定义，函数声明，this，arguments
* **在执行阶段**，就是按照代码的顺序依次执行。

那为什么会进行变量提升呢？主要有以下两个原因：

* 提高性能
* 容错性更好

**（1）提高性能**

JS 引擎在执行代码前有一个预编译过程。预编译会扫描所有 `var` 声明和函数声明，把它们提前登记到变量对象里。这个机制**本意是为了提高性能**——解析只做一次，后续执行不用重复解析。
变量提升就是预编译的附带结果。

**（2）容错性更好**

变量提升可以在一定程度上提高JS的容错性，看下面的代码：

```javascript
a = 1;
var a;
console.log(a);
```

如果没有变量提升，这两行代码就会报错，但是因为有了变量提升，这段代码就可以正常执行。



变量提升也会造成一定的问题：

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

于是在ES6中提出了let、const来定义变量：

- **`var`**：提升 + 初始化为 `undefined`，**声明前可访问**
- `let` / `const`：**也提升**，但**不初始化**，进入“暂时性死区（TDZ）”，**声明前访问会报错**



## 6. 常见的DOM操作有哪些

### 1）DOM 节点的获取

DOM 节点的获取的API及使用：

```javascript
getElementById // 按照 id 查询
getElementsByTagName // 按照标签名查询
getElementsByClassName // 按照类名查询
quertSelector//  按照 css 选择器查询
querySelectorAll // 按照 css 选择器查询 （p .aclass #bid div>p input[type="text"]）

// 按照 id 查询
var imooc = document.getElementById('imooc') // 查询到 id 为 imooc 的元素
// 按照标签名查询
var pList = document.getElementsByTagName('p')  // 查询到标签为 p 的集合
console.log(pList.length)
console.log(pList[0])
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
// 首先获取亲节点
var container = document.getElementById('container')
// 创建新节点
var targetSpan = document.createElement('span')
// 设置 span 节点的内容
targetSpan.innerHTML = 'hello world'
// 把新创建的元素塞进container里去,追加到末尾
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
// 获取目标元素的亲元素
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
var targetNode = container.children[0]
// 删除目标元素
container.removeChild(targetNode)
```

现代可以用 `element.remove()` 直接删自己。

### 4）修改 DOM 元素

修改 DOM 元素这个动作可以分很多维度，比如说移动 DOM 元素的位置，修改 DOM 元素的属性等。
改内容用 `innerHTML` 或 `textContent`，改属性用 `setAttribute`，改样式用 `classList` 或 `style`。

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
// 获取亲元素
var container = document.getElementById('container')   
 
// 获取两个需要被交换的元素
var title = document.getElementById('title')
var content = document.getElementById('content')
// 交换两个元素，把 content 置于 title 前面
container.insertBefore(content, title)
```



## 7. ajax、axios、fetch的区别

```
AJAX（思想：异步 + 局部更新）
   │
   ├── XHR（老工具，回调式）
   │      │
   │      └── 用 Promise 封装 → 可以链式调用
   │
   ├── fetch（新工具，原生 Promise）
   │      │
   │      └── 用 async/await 写 → 像同步
   │
   └── axios（第三方库，基于 Promise，工程化封装）
          │
          └── 拦截器、自动 JSON、统一错误处理
```



### （1）AJAX

AJAX 即 "Asynchronous JavaScript And XML"（异步 JavaScript 和 XML），是一种在无需重新加载整个网页的情况下，能够**更新部分网页**的技术思想。它通过在后台与服务器进行少量数据交换，使网页实现**异步更新**。

**需要注意：AJAX 是一种技术方案** 早期主要通过 **XHR**(**`XMLHttpRequest` ** 浏览器提供的对象)实现，现代可以用 **fetch** 或 **axios** 实现。

早期 AJAX 主要基于 XHR 实现，其缺点如下：

* 基于原生 XHR 开发，XHR 本身基于回调式 API，多个请求嵌套时容易产生**回调地狱**
* 配置和调用方式相对繁琐
* 基于事件的异步模型不够友好

### （2）Fetch

fetch 基于 Promise 设计，代码结构比 XHR 简洁很多。

**fetch 是原生 JS 提供的全新实现，没有使用 XMLHttpRequest 对象。**

**fetch 的优点：**

* 语法**简洁**，更加语义化
* 基于标准 **Promise** 实现，支持 **async/await**
* 更加底层，提供的 API 丰富（Request、Response）

**fetch 的缺点：**

* fetch **只对网络请求报错**。服务器返回 400、500 等错误码时并不会 reject，只有网络错误导致请求不能完成时，fetch 才会 reject。需要手动判断 `res.ok`
* **跨域请求默认不带 cookie**，需要显式设置 `credentials: 'include'`（同源请求默认带）
* fetch **取消请求需要配合 `AbortController`**，不如 XHR 的 `abort()` 直接
* fetch 没有原生方法**监测请求进度**，而 XHR 可以

### （3）Axios

Axios 是一个基于 Promise 封装的 HTTP 客户端(负责发 HTTP 请求、收 HTTP 响应”的工具)，也是 AJAX 思想的一种工程化实现。其特点如下：

* 浏览器端发起 XMLHttpRequests 请求

* Node 端发起 http 请求

* 支持 Promise API

* **支持请求和响应拦截器** 

  > 比如登陆后用请求拦截器统一在发请求前加上token，在响应到达时拦截处理错误，解包数据

* 对请求和响应进行转换

* 支持取消请求

* 自动转换 JSON 数据

* **自动携带 XSRF Token（配合服务端验证机制，并非直接抵御攻击）**

  > **XSRF Token 是一个用来防止 CSRF 攻击的随机字符串**
  > **CSRF（Cross-Site Request Forgery，跨站请求伪造）** 是一种攻击方式

## 8. 数组的遍历方法有哪些

| **方法**                                  | **是否改变  原数组** |                           **特点**                           |
| ----------------------------------------- | :------------------: | :----------------------------------------------------------: |
| forEach()                                 |          否          |                          没有返回值                          |
| map()                                     |          否          |                    返回新数组，可链式调用                    |
| filter()                                  |          否          |      过滤数组，返回包含符合条件的元素的数组，可链式调用      |
| for...of                                  |          否          | 遍历具有Iterator接口的对象，返回的是数组的元素、对象的属性值，不能遍历普通对象 |
| every() 和 some()                         |          否          | some()只要有一个是true，便返回true；every()只要有一个是false，便返回false. |
| find() 和 findIndex()                     |          否          | find()返回的是第一个符合条件的值；findIndex()返回的是第一个符合条件的值的索引值 |
| reduce(回调函数，初始值) 和 reduceRight() |          否          |     reduce()对数组正序操作；reduceRight()对数组逆序操作      |

> reduce 此处为“归约”之意，把一个数组“归约”成一个值
> ```js
> [1, 2, 3, 4].reduce((acc, cur) => {
>   console.log(`acc=${acc}, cur=${cur}`)
>   return acc + cur
> }, 10)
> //输出
> acc=10, cur=1
> acc=11, cur=2
> acc=13, cur=3
> acc=16, cur=4
> // 最终返回 20
> ```
>
> 

遍历方法的详细解释：[《细数JavaScript中那些遍历和循环》](https://cuggz.blog.csdn.net/article/details/107649549)

