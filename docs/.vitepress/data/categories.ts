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
    articles: [{ text: 'HTML 高频考点', link: '/html-css/html' }]
  },
  {
    slug: 'javascript',
    label: 'JavaScript',
    shortLabel: 'JavaScript',
    description: '梳理语言核心、运行机制与常见工程实践。',
    icon: 'JS',
    accent: '#facc15',
    articles: [{ text: '闭包：从词法作用域开始理解', link: '/javascript/closure' }]
  },
  {
    slug: 'typescript',
    label: 'TypeScript',
    shortLabel: 'TypeScript',
    description: '记录类型系统、工程实践与更可靠的 JavaScript 开发经验。',
    icon: 'TS',
    accent: '#3178c6',
    articles: [{ text: 'TypeScript 核心知识点', link: '/typescript/ts' }]
  },
  {
    slug: 'vue',
    label: 'Vue',
    shortLabel: 'Vue',
    description: '记录 Vue 生态、响应式原理与组件设计经验。',
    icon: 'V',
    accent: '#34d399',
    articles: [{ text: '响应式系统的最小心智模型', link: '/vue/reactivity' }]
  },
  {
    slug: 'react',
    label: 'React',
    shortLabel: 'React',
    description: '理解组件、Hooks、状态管理与渲染模型。',
    icon: 'R',
    accent: '#22d3ee',
    articles: [{ text: 'Hooks 的职责与使用边界', link: '/react/hooks' }]
  },
  {
    slug: 'ai-productivity',
    label: 'AI 提效',
    shortLabel: 'AI 提效',
    description: '把 AI 融入开发、研究与知识整理的工作流。',
    icon: 'AI',
    accent: '#a78bfa',
    articles: [{ text: '可复用的 AI 协作工作流', link: '/ai-productivity/workflow' }]
  },
  {
    slug: 'it-basics',
    label: 'IT 基础',
    shortLabel: 'IT 基础',
    description: '补齐网络、系统、Git 与计算机基础知识。',
    icon: '01',
    accent: '#fb7185',
    articles: [{ text: '一次网页访问背后的网络链路', link: '/it-basics/web-request' }]
  },
  {
    slug: 'essays',
    label: '随笔',
    shortLabel: '随笔',
    description: '记录学习、创作和长期成长过程中的思考。',
    icon: '✦',
    accent: '#fb923c',
    articles: [{ text: '为什么建立自己的知识花园', link: '/essays/knowledge-garden' }]
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
        items: [
          { text: '栏目概览', link: `/${category.slug}/` },
          ...category.articles
        ]
      }
    ]
  ])
)
