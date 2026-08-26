import { defineConfig, type HeadConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import {
  categories,
  categorySidebar,
  directNavCategories,
  moreNavCategories
} from './data/categories'

const canonicalOrigin = (
  process.env.SITE_URL ||
  process.env.CF_PAGES_URL ||
  'https://jinlingblog.pages.dev'
).replace(/\/$/, '')

const githubRepository = process.env.GITHUB_REPOSITORY

function pagePath(relativePath: string) {
  const normalized = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return normalized ? `/${normalized}` : '/'
}

export default withPwa(
  defineConfig({
    lang: 'zh-CN',
    title: 'JinLingBlog',
    titleTemplate: ':title · JinLingBlog',
    description: 'Code. Log. Share. 记录、整理与分享技术知识。',
    cleanUrls: true,
    lastUpdated: true,
    sitemap: {
      hostname: canonicalOrigin
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'alternate icon', href: '/favicon-32x32.png', type: 'image/png' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
      ['meta', { name: 'theme-color', content: '#0B1530' }],
      ['meta', { name: 'author', content: 'JinLing' }],
      ['meta', { name: 'robots', content: 'index, follow' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'JinLingBlog' }],
      ['meta', { property: 'og:image', content: `${canonicalOrigin}/og.svg` }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:image', content: `${canonicalOrigin}/og.svg` }]
    ],
    transformHead({ pageData }) {
      const title = pageData.title ? `${pageData.title} · JinLingBlog` : 'JinLingBlog'
      const description = pageData.description || 'Code. Log. Share. 记录、整理与分享技术知识。'
      const canonical = `${canonicalOrigin}${pagePath(pageData.relativePath)}`

      return [
        ['link', { rel: 'canonical', href: canonical }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: canonical }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }]
      ] as HeadConfig[]
    },
    themeConfig: {
      logo: {
        light: '/logo-mark.svg',
        dark: '/logo-mark.svg',
        alt: 'JINLING'
      },
      siteTitle: 'JinLingBlog',
      nav: [
        ...directNavCategories.map((category) => ({
          text: category.shortLabel,
          link: `/${category.slug}/`,
          activeMatch: `^/${category.slug}/`
        })),
        {
          text: '更多',
          items: [
            ...moreNavCategories.map((category) => ({
              text: category.label,
              link: `/${category.slug}/`
            })),
            { text: '关于', link: '/about' }
          ]
        }
      ],
      sidebar: categorySidebar,
      outline: {
        level: [2, 4],
        label: '本页目录'
      },
      search: {
        provider: 'local',
        options: {
          miniSearch: {
            searchOptions: {
              fuzzy: 0.2,
              prefix: true,
              boost: { title: 4, text: 2, titles: 1 }
            }
          },
          translations: {
            button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
            modal: {
              displayDetails: '显示详情',
              resetButtonTitle: '清除查询',
              backButtonTitle: '返回',
              noResultsText: '没有找到相关内容',
              footer: {
                selectText: '选择',
                selectKeyAriaLabel: '回车',
                navigateText: '切换',
                navigateUpKeyAriaLabel: '上箭头',
                navigateDownKeyAriaLabel: '下箭头',
                closeText: '关闭',
                closeKeyAriaLabel: 'Esc'
              }
            }
          }
        }
      },
      socialLinks: githubRepository
        ? [{ icon: 'github', link: `https://github.com/${githubRepository}` }]
        : [],
      editLink: githubRepository
        ? {
            pattern: `https://github.com/${githubRepository}/edit/main/docs/:path`,
            text: '在 GitHub 上编辑此页'
          }
        : undefined,
      lastUpdated: {
        text: '最后更新于',
        formatOptions: {
          dateStyle: 'medium',
          timeStyle: 'short'
        }
      },
      docFooter: {
        prev: '上一篇',
        next: '下一篇'
      },
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '目录',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
      footer: {
        message: 'Code. Log. Share.',
        copyright: `Copyright © ${new Date().getFullYear()} JinLingBlog`
      }
    },
    pwa: {
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'logo-mark.svg',
        'logo-horizontal.svg',
        'og.svg'
      ],
      manifest: {
        name: 'JinLingBlog',
        short_name: 'JinLing',
        description: 'Code. Log. Share. 记录、整理与分享技术知识。',
        lang: 'zh-CN',
        theme_color: '#0B1530',
        background_color: '#07101F',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'jinlingblog-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true
      }
    }
  })
)
