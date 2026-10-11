export interface ArticleLink {
  text: string
  link: string
}

export interface BlogCategory {
  slug: string
  label: string
  shortLabel: string
  description: string
  icon: string
  accent: string
  articles: ArticleLink[]
}

export const categories: BlogCategory[] = [
  {
    slug: 'html-css',
    label: 'HTML & CSS',
    shortLabel: 'HTML&CSS',
    description: '从语义化结构到现代布局，构建可靠、易维护的界面。',
    icon: '</>',
    accent: '#38bdf8',
    articles: [
      { text: 'CSS', link: '/html-css/css' },
      { text: 'HTML', link: '/html-css/html' }
    ]
  },
  {
    slug: 'javascript',
    label: 'JavaScript',
    shortLabel: 'JavaScript',
    description: '梳理语言核心、运行机制与常见工程实践。',
    icon: 'JS',
    accent: '#facc15',
    articles: [
      { text: 'JavaScript 异步编程', link: '/javascript/js-asynchronous-programming' },
      { text: 'JavaScript 基础', link: '/javascript/js-basic' },
      { text: 'JavaScript 闭包', link: '/javascript/js-closure' },
      { text: 'JavaScript 数据类型', link: '/javascript/js-datatype' },
      { text: 'JavaScript ES6', link: '/javascript/js-es6' },
      { text: 'JavaScript 原型', link: '/javascript/js-prototype' },
      { text: 'JavaScript 的 this', link: '/javascript/js-this' }
    ]
  },
  {
    slug: 'typescript',
    label: 'TypeScript',
    shortLabel: 'TypeScript',
    description: '记录类型系统、工程实践与更可靠的 JavaScript 开发经验。',
    icon: 'TS',
    accent: '#3178c6',
    articles: [{ text: 'TypeScript', link: '/typescript/ts' }]
  },
  {
    slug: 'vue',
    label: 'Vue',
    shortLabel: 'Vue',
    description: '记录 Vue 生态、响应式原理与组件设计经验。',
    icon: 'V',
    accent: '#34d399',
    articles: [{ text: 'Vue', link: '/vue/vue' }]
  },
  {
    slug: 'react',
    label: 'React',
    shortLabel: 'React',
    description: '理解组件、Hooks、状态管理与渲染模型。',
    icon: 'R',
    accent: '#22d3ee',
    articles: [{ text: 'React', link: '/react/react' }]
  },
  {
    slug: 'ai-productivity',
    label: 'AI 提效',
    shortLabel: 'AI 提效',
    description: '把 AI 融入开发、研究与知识整理的工作流。',
    icon: 'AI',
    accent: '#a78bfa',
    articles: [
      { text: 'skills 的最佳实践', link: '/ai-productivity/skills' },
      { text: '可复用的 AI 协作工作流', link: '/ai-productivity/workflow' }
    ]
  },
  {
    slug: 'it-basics',
    label: 'IT 基础',
    shortLabel: 'IT 基础',
    description: '补齐网络、系统、Git 与计算机基础知识。',
    icon: '01',
    accent: '#fb7185',
    articles: [{ text: '基础知识', link: '/it-basics/web-request' }]
  },
  {
    slug: 'essays',
    label: '随笔',
    shortLabel: '随笔',
    description: '记录学习、创作和长期成长过程中的思考。',
    icon: '✦',
    accent: '#fb923c',
    articles: [{ text: '为什么建立自己的知识库', link: '/essays/knowledge-garden' }]
  }
]

export const directNavCategories = categories.slice(0, 5)
export const moreNavCategories = categories.slice(5)

export const categorySidebar = Object.fromEntries(
  categories.map((category) => [
    `/${category.slug}/`,
    [
      {
        text: category.label,
        collapsed: true,
        items: [
          { text: '栏目概览', link: `/${category.slug}/` },
          ...category.articles
        ]
      }
    ]
  ])
)
