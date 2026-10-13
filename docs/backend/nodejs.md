---
title: Node.js基础知识
description: 待补充
date: 2026-10-12
tags:
  - Node.js
comments: true

---

# Node.js基础

## 1.简要介绍

**Node.js 是让 JavaScript 能在浏览器之外运行的环境。**Node.js 让 JS 能跑在服务器上，能读写文件、操作数据库、处理网络请求。

浏览器里，`console.log` 输出到控制台。
Node 里，`console.log` 输出到终端。

## 2.HTTP服务器

服务器就是“一直运行、等着别人来请求、收到请求后返回内容”的程序。用 Node 起一个服务器，就是写一段代码，让它一直等着请求。

```js
// server.js
const http = require('http') //引入http模块

//创建服务器
const server = http.createServer((req, res) => {
  res.end('Hello from Node')//响应结束，返回该字符串
})

//监听3000端口
server.listen(3000, () => {
  console.log('服务器跑在 http://localhost:3000')
})
```



Question：用原生 `http` 模块写接口，太麻烦了。所以有了 Express。

## 3.Express

**Express 是 Node 的一个框架，用来简化写服务器。**

用原生 `http` 模块，你要自己判断路径、自己解析请求体、自己设响应头。用 Express，这些它帮你做了。

前置工作：

```js
mkdir my-server
cd my-server
npm init -y
npm install express
```



对比：

```js
//http
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.end('首页')
  } else if (req.url === '/about' && req.method === 'GET') {
    res.end('关于页')
  } else {
    res.end('404')
  }
})

server.listen(3000)
```

```js
//express
const express = require('express')//引入express
const app = express()//创建服务器应用（后续所有路由挂在上面

//app.get(路径, 处理函数) 表示“当有人用 GET 方法访问这个路径时，执行这个函数”。
app.get('/', (req, res) => {
  res.send('首页')
})

app.get('/about', (req, res) => {
  res.send('关于页')
})
//启动服务器
app.listen(3000, () => {
  console.log('服务器跑在 http://localhost:3000')
})
```



### Express 的四种请求方法

**HTTP 有四种常用方法，对应增删改查：**

| 方法     | 含义     | 例子         |
| :------- | :------- | :----------- |
| `GET`    | 获取数据 | 拿用户列表   |
| `POST`   | 创建数据 | 新建一个用户 |
| `PUT`    | 更新数据 | 修改用户信息 |
| `DELETE` | 删除数据 | 删除用户     |

**Express 对应四个方法：**

```js
app.get('/users', (req, res) => { /* 获取用户列表 */ })
app.post('/users', (req, res) => { /* 创建用户 */ })
app.put('/users/:id', (req, res) => { /* 更新用户 */ })
app.delete('/users/:id', (req, res) => { /* 删除用户 */ })
```

**`:id` 是路径参数**

## 接收请求参数

**三种参数：**

**1. 路径参数（`req.params`）**

```js
app.get('/users/:id', (req, res) => {
  console.log(req.params.id)   // 比如访问 /users/123，输出 123
  res.send('用户 ' + req.params.id)
})
```



**2. 查询参数（`req.query`）**

```js
app.get('/search', (req, res) => {
  console.log(req.query.keyword)   // 访问 /search?keyword=abc，输出 abc
  res.send('搜索 ' + req.query.keyword)
})
```



**3. 请求体（`req.body`）**

```js
app.post('/users', (req, res) => {
  console.log(req.body.name)   // 从 POST 请求体里拿 name
  res.send('创建用户 ' + req.body.name)
})
```

**注意：`req.body` 需要中间件才能解析，后面讲。**

### 中间件

**中间件就是一个函数，在请求到达路由之前，或者响应返回之前，执行一些操作。**

```
请求 → 中间件1 → 中间件2 → 路由处理 → 响应
```

**每个中间件可以：**

- 修改请求对象（`req`）
- 修改响应对象（`res`）
- 结束请求（`res.send`）
- 调用 `next()` 进入下一个中间件

```js
const express = require('express')
const app = express()

// 中间件：打印请求信息
app.use((req, res, next) => {
  console.log('收到请求：', req.method, req.url)
  next()   // 调用 next()，进入下一个中间件或路由
})

app.get('/', (req, res) => {
  res.send('首页')
})

app.listen(3000)
```

**每次请求，都会先执行中间件，打印信息，然后才进入路由。**

**如果中间件里不调用 `next()`，请求就卡住了，不会继续。**

|          | `app.use` | `app.get` / `app.post` |
| :------- | :-------- | ---------------------- |
| 匹配方法 | 所有方法  | 只匹配指定方法         |
| 匹配路径 | 前缀匹配  | 精确匹配               |
| 典型用途 | 中间件    | 路由处理               |

**`app.use` 一般用来注册中间件，`app.get` 等用来定义路由。**

---

### 用Express写CRUD

| 操作 | 英文   | HTTP 方法   |
| :--- | :----- | :---------- |
| 增   | Create | POST        |
| 删   | Delete | DELETE      |
| 改   | Update | PUT / PATCH |
| 查   | Read   | GET         |

```js
const express = require('express')
const app = express()

// 中间件
app.use(express.json())

// 模拟数据（真实项目用数据库）
let users = [
  { id: 1, name: 'Alice', age: 20 },
  { id: 2, name: 'Bob', age: 25 }
]

// 查：获取所有用户
app.get('/users', (req, res) => {
  res.json(users)
})

// 查：获取单个用户
app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  res.json(user)
})

// 增：创建用户
app.post('/users', (req, res) => {
  const { name, age } = req.body

  // 参数校验
  if (!name) {
    return res.status(400).json({ error: 'name 不能为空' })
  }

  const user = {
    id: Date.now(),   // 简单生成 id
    name,
    age
  }

  users.push(user)
  res.status(201).json(user)
})

// 改：更新用户
app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  const { name, age } = req.body
  if (name) user.name = name
  if (age) user.age = age

  res.json(user)
})

// 删：删除用户
app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = users.findIndex(u => u.id === id)

  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' })
  }

  users.splice(index, 1)
  res.status(204).send()   // 204 表示删除成功，无内容返回
})

app.listen(3000, () => {
  console.log('服务器跑在 http://localhost:3000')
})
```

## 状态码总结

| 状态码 | 含义         | 什么时候用    |
| :----- | :----------- | :------------ |
| 200    | 成功         | GET、PUT 成功 |
| 201    | 已创建       | POST 成功     |
| 204    | 成功但无内容 | DELETE 成功   |
| 400    | 参数错误     | 必填项没传    |
| 404    | 找不到       | 资源不存在    |
| 500    | 服务器错误   | 代码出异常    |

---



需要掌握：**会用 Express 写 CRUD、理解中间件执行顺序、知道状态码和 RESTful 规范**

```js
const express = require('express');
const app = express();

// 中间件：解析 JSON 请求体
app.use(express.json());

// 模拟数据
let users = [{ id: 1, name: 'Alice' }];

// GET 列表
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET 单个
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST 创建
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  const user = { id: Date.now(), name };
  users.push(user);
  res.status(201).json(user);
});

// PUT 更新
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.name = req.body.name || user.name;
  res.json(user);
});

// DELETE 删除
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  users.splice(index, 1);
  res.status(204).send();
});

// 错误处理中间件（必须放在最后）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(3000, () => console.log('Server on port 3000'));
```

