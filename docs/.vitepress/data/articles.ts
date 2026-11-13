/**
 * Article lists are read from the files in docs/, so a new note shows up in
 * the sidebar and the home page contents without editing any list by hand.
 *
 * For each category folder (docs/<slug>/), every .md file except index.md is
 * an article. Per article, in frontmatter:
 *   title   the text shown in the sidebar and the home page (required in practice;
 *           falls back to the first "# heading", then the file name)
 *   order   optional number; lower comes first. Articles without it follow,
 *           sorted by file name
 *   hidden  optional; `hidden: true` keeps the page reachable by URL but
 *           leaves it out of the lists
 *
 * Node only: imported by config.mts and by home.data.ts, never by client code.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { categories, type ArticleLink, type BlogCategory } from './categories'

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const configFile = path.join(docsDir, '.vitepress/config.mts')

interface ParsedArticle extends ArticleLink {
  order: number
  file: string
}

function frontmatterValue(frontmatter: string, key: string) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \t]*(.*?)[ \t]*$`, 'm'))
  if (!match) return undefined
  return match[1].replace(/^(['"])(.*)\1$/, '$2').trim() || undefined
}

function parseArticle(slug: string, fileName: string): ParsedArticle | null {
  const source = fs.readFileSync(path.join(docsDir, slug, fileName), 'utf8')
  const block = source.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  const frontmatter = block?.[1] ?? ''
  const body = block ? source.slice(block[0].length) : source

  if (frontmatterValue(frontmatter, 'hidden') === 'true') return null

  const name = fileName.replace(/\.md$/, '')
  const order = Number(frontmatterValue(frontmatter, 'order'))

  return {
    text:
      frontmatterValue(frontmatter, 'title') ?? body.match(/^#[ \t]+(.+?)[ \t]*$/m)?.[1] ?? name,
    link: `/${slug}/${name}`,
    order: Number.isFinite(order) ? order : Number.POSITIVE_INFINITY,
    file: fileName
  }
}

export function readArticles(slug: string): ArticleLink[] {
  const dir = path.join(docsDir, slug)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((fileName) => fileName.endsWith('.md') && fileName !== 'index.md')
    .map((fileName) => parseArticle(slug, fileName))
    .filter((article): article is ParsedArticle => article !== null)
    .sort((a, b) => a.order - b.order || a.file.localeCompare(b.file, 'en'))
    .map(({ text, link }) => ({ text, link }))
}

export interface CategoryWithArticles extends BlogCategory {
  articles: ArticleLink[]
}

export function readCategories(): CategoryWithArticles[] {
  return categories.map((category) => ({ ...category, articles: readArticles(category.slug) }))
}

export function buildSidebar() {
  return Object.fromEntries(
    readCategories().map((category) => [
      `/${category.slug}/`,
      [
        {
          text: category.label,
          collapsed: true,
          items: [{ text: '栏目概览', link: `/${category.slug}/` }, ...category.articles]
        }
      ]
    ])
  )
}

/**
 * The sidebar is part of the site config, which VitePress only reads at
 * startup. In dev, when a note is added, removed, retitled or reordered,
 * touch the config file so VitePress reloads it and the sidebar follows.
 */
export function reloadSidebarOnArticleChange(): Plugin {
  return {
    name: 'jl-reload-sidebar-on-article-change',
    apply: 'serve',
    configureServer(server) {
      let snapshot = JSON.stringify(readCategories())

      const check = (file: string) => {
        if (!file.endsWith('.md') || path.relative(docsDir, file).startsWith('..')) return
        const next = JSON.stringify(readCategories())
        if (next === snapshot) return
        snapshot = next
        const now = new Date()
        fs.utimesSync(configFile, now, now)
      }

      server.watcher.on('add', check).on('unlink', check).on('change', check)
    }
  }
}
