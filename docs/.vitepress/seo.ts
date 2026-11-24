/**
 * Search-engine metadata for every page: canonical URL, Open Graph, article
 * dates, JSON-LD, noindex, robots.txt and the search-engine verification tags.
 *
 * Node only: imported by config.mts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { HeadConfig, PageData, SiteConfig } from 'vitepress'
import { categories } from './data/categories'

/**
 * The one public address of the site. Do not fall back to CF_PAGES_URL: on
 * Cloudflare Pages that is the address of a single deployment
 * (https://<hash>.<project>.pages.dev), which changes on every deploy and is
 * served with `x-robots-tag: noindex`.
 */
export const canonicalOrigin = (process.env.SITE_URL || 'https://jinling-blog.pages.dev').replace(
  /\/$/,
  ''
)

export const siteName = 'JinLingBlog'
export const siteDescription = 'Code. Log. Share. 记录、整理与分享技术知识。'
const author = 'JinLing'

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** `javascript/js-closure.md` → `/javascript/js-closure`, `vue/index.md` → `/vue/` */
export function pagePath(relativePath: string) {
  const normalized = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return normalized ? `/${normalized}` : '/'
}

function toIsoDate(value: unknown) {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** Tags for the search engines whose verification code is set in the environment. */
export function verificationHead(): HeadConfig[] {
  const codes: [string, string | undefined][] = [
    ['google-site-verification', process.env.GOOGLE_SITE_VERIFICATION],
    ['msvalidate.01', process.env.BING_SITE_VERIFICATION],
    ['baidu-site-verification', process.env.BAIDU_SITE_VERIFICATION]
  ]
  return codes
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, content]) => ['meta', { name, content }])
}

function jsonLd(data: Record<string, unknown>): HeadConfig {
  return ['script', { type: 'application/ld+json' }, JSON.stringify(data)]
}

interface HeadContext {
  pageData: PageData
  title: string
  description: string
}

export function seoHead({ pageData, title, description }: HeadContext): HeadConfig[] {
  const { frontmatter, relativePath } = pageData
  const url = `${canonicalOrigin}${pagePath(relativePath)}`
  const summary = description || siteDescription
  const published = toIsoDate(frontmatter.date)
  const modified = pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : undefined
  const isHome = relativePath === 'index.md'
  const isArticle = Boolean(published) && !isHome

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: isArticle ? 'article' : 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: summary }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: summary }]
  ]

  if (frontmatter.noindex) {
    head.push(['meta', { name: 'robots', content: 'noindex, follow' }])
    return head
  }

  if (isHome) {
    head.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: `${canonicalOrigin}/`,
        description: summary,
        inLanguage: 'zh-CN'
      })
    )
  }

  if (isArticle) {
    const tags: string[] = Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : []
    head.push(['meta', { property: 'article:published_time', content: published! }])
    if (modified) head.push(['meta', { property: 'article:modified_time', content: modified }])
    for (const tag of tags) head.push(['meta', { property: 'article:tag', content: tag.trim() }])

    head.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: pageData.title,
        description: summary,
        url,
        mainEntityOfPage: url,
        datePublished: published,
        dateModified: modified ?? published,
        inLanguage: 'zh-CN',
        keywords: tags.map((tag) => tag.trim()).join(', ') || undefined,
        image: `${canonicalOrigin}/og.png`,
        author: { '@type': 'Person', name: author },
        publisher: { '@type': 'Organization', name: siteName, url: `${canonicalOrigin}/` }
      })
    )

    const category = categories.find((item) => item.slug === relativePath.split('/')[0])
    const crumbs = [
      { name: siteName, url: `${canonicalOrigin}/` },
      ...(category ? [{ name: category.label, url: `${canonicalOrigin}/${category.slug}/` }] : []),
      { name: pageData.title, url }
    ]
    head.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url
        }))
      })
    )
  }

  return head
}

/** Whether a sitemap URL (`about`, `vue/`, `javascript/js-closure`) belongs to a noindex page. */
function isNoindexUrl(url: string) {
  const file = path.join(docsDir, url.replace(/(^|\/)$/, '$1index') + '.md')
  if (!fs.existsSync(file)) return false
  const frontmatter = fs.readFileSync(file, 'utf8').match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  return /^noindex:[ \t]*true[ \t]*$/m.test(frontmatter ?? '')
}

export function filterSitemap<T extends { url: string }>(items: T[]) {
  return items.filter((item) => !isNoindexUrl(item.url))
}

/**
 * Files written next to the built pages: robots.txt (so its Sitemap line always
 * matches canonicalOrigin) and, when INDEXNOW_KEY is set, the IndexNow key file
 * that proves the site owns the key used by `pnpm submit:urls`.
 */
export function writeCrawlerFiles(siteConfig: SiteConfig) {
  fs.writeFileSync(
    path.join(siteConfig.outDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`
  )

  const indexNowKey = process.env.INDEXNOW_KEY
  if (indexNowKey && /^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey)) {
    fs.writeFileSync(path.join(siteConfig.outDir, `${indexNowKey}.txt`), indexNowKey)
  }
}
