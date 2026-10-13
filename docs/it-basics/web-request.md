---
title: 基础知识
description: 待补充
date: 2026-08-25
tags:
  - Network
  - HTTP
comments: true
---

# 输入 URL 到页面展示发生了什么

整个过程分两大块：网络和渲染。

**网络部分**：URL 解析 → DNS 解析拿到 IP → TCP 三次握手 → （HTTPS 还要 TLS 握手）→ 发 HTTP 请求 → 服务器返回响应。

**渲染部分**：浏览器拿到 HTML 后，解析成 DOM 树；解析 CSS 成 CSSOM 树；两者合并成渲染树；然后布局（计算位置大小）、绘制（画到屏幕上）。如果遇到 `<script>`，会阻塞解析，等 JS 执行完再继续。

# 本地存储

