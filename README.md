# JinLingBlog

> Code. Log. Share.

JinLingBlog 是使用 VitePress 构建的中文技术知识库。源码保存在 GitHub，站点可以直接部署到 Cloudflare Pages。

## 本地开发

需要 Node.js 20 和 pnpm。

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm dev       # 启动开发服务器
pnpm build     # 生成生产站点和 PWA 资源
pnpm preview   # 预览生产产物
pnpm check     # 执行完整构建检查
```

生产产物位于 `docs/.vitepress/dist`。

## 内容结构

文章位于 `docs` 下，使用英文文件名和中文标题。普通文章 Frontmatter 示例：

```yaml
---
title: 文章标题
description: 文章摘要
date: 2026-08-25
tags:
  - JavaScript
comments: true
---
```

栏目、首页卡片、导航与侧边栏统一维护在 `docs/.vitepress/data/categories.ts`。

## 配置 Giscus

1. 将仓库设为公开并开启 GitHub Discussions。
2. 安装 [Giscus GitHub App](https://github.com/apps/giscus)。
3. 在 [giscus.app/zh-CN](https://giscus.app/zh-CN) 选择仓库和 Discussions 分类。
4. 复制 `.env.example` 为 `.env.local`，填写四个 `VITE_GISCUS_*` 变量。
5. 在 Cloudflare Pages 的变量设置中添加相同变量。

参数缺失时评论区会自动隐藏，不影响构建和阅读。

## 部署到 Cloudflare Pages

在 Cloudflare 控制台连接公开 GitHub 仓库并设置：

| 设置 | 值 |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm build` |
| Build output directory | `docs/.vitepress/dist` |
| Node.js version | `20` |

推荐添加以下环境变量：

```text
NODE_VERSION=20
SITE_URL=https://<project-name>.pages.dev
GITHUB_REPOSITORY=<owner>/JinLingBlog
```

`SITE_URL` 用于 canonical 和 sitemap，`GITHUB_REPOSITORY` 用于 GitHub 社交链接与“编辑此页”。如果最终域名不是 `https://jinlingblog.pages.dev`，还需要同步更新 `docs/public/robots.txt` 中的 Sitemap 地址。

## 品牌资源

- `docs/public/jlg-logo-master.png`：清晰化后的透明 JLG 主标志
- `docs/public/logo-mark-light.png`：亮色模式靛紫标志
- `docs/public/logo-mark-dark.png`：暗色模式淡紫标志
- `docs/public/og.png`：社交分享图
- `scripts/generate-icons.mjs`：生成 favicon 与 PWA PNG 图标

所有品牌资源均为仓库内的代码原生 SVG，不依赖外部字体或图片服务。
