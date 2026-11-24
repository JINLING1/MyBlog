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

侧边栏和首页目录里的文章列表根据 `docs/<栏目>/` 下的文件自动生成：把 `.md` 文件放进栏目文件夹即可，显示的文字取自 frontmatter 的 `title`。

- 默认按文件名排序；在 frontmatter 里加 `order: 1` 可以手动排在前面（数字小的在前）。
- 加 `hidden: true` 的文章不出现在列表里，但仍可通过链接访问。
- 每个栏目的 `index.md` 是栏目概览，不计入文章。

栏目本身（名称、描述、顺序、导航）仍维护在 `docs/.vitepress/data/categories.ts`。

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
SITE_URL=https://jinling-blog.pages.dev
GITHUB_REPOSITORY=<owner>/JinLingBlog
```

`SITE_URL` 是站点的正式地址，canonical、sitemap 和 robots.txt 都由它生成，不填时默认为 `https://jinling-blog.pages.dev`。换自定义域名时只需改这一个值。`GITHUB_REPOSITORY` 用于 GitHub 社交链接与“编辑此页”。

构建前会自动补全 git 历史（Cloudflare 是浅克隆），保证每篇文章的“最后更新于”和 sitemap 的更新时间准确。

## 搜索引擎收录

- 不想被收录的页面（占位页、404 等），在 frontmatter 加 `noindex: true`：页面会带上 noindex 标记，并从 sitemap 中排除
- 每篇文章的 `description` 就是搜索结果里显示的摘要，请写清楚这篇覆盖的知识点
- 文章页自动输出发布时间、修改时间、标签和结构化数据（JSON-LD）

验证站点所有权：在 Google Search Console、Bing Webmaster Tools、百度搜索资源平台选择“HTML 标签”验证，把 `content` 的值填到 Cloudflare Pages 的环境变量 `GOOGLE_SITE_VERIFICATION`、`BING_SITE_VERIFICATION`、`BAIDU_SITE_VERIFICATION`，重新部署后再点验证，然后提交 `https://jinling-blog.pages.dev/sitemap.xml`。

部署后主动提交新地址：

```bash
pnpm submit:urls --dry-run   # 先查看将提交的地址
pnpm submit:urls             # 提交到百度和 IndexNow（Bing 等）
```

需要在 `.env.local` 中设置 `BAIDU_PUSH_TOKEN`（百度普通收录 API 的 token）和/或 `INDEXNOW_KEY`；`INDEXNOW_KEY` 还要在 Cloudflare Pages 设置相同的值，构建时会生成对应的密钥文件。

## 品牌资源

- `docs/public/jlg-logo-master.png`：清晰化后的透明 JLG 主标志
- `docs/public/logo-mark-light.png`：亮色模式靛紫标志
- `docs/public/logo-mark-dark.png`：暗色模式淡紫标志
- `docs/public/og.png`：社交分享图
- `scripts/generate-icons.mjs`：生成 favicon 与 PWA PNG 图标

所有品牌资源均为仓库内的代码原生 SVG，不依赖外部字体或图片服务。
