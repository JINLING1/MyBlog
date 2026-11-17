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
}

/**
 * The categories and their order. The articles inside each one are not listed
 * here: they are read from the files in docs/<slug>/ (see articles.ts).
 */
export const categories: BlogCategory[] = [
  {
    slug: 'html-css',
    label: 'HTML & CSS',
    shortLabel: 'HTML&CSS',
    description: '从语义化结构到现代布局，构建可靠、易维护的界面。',
    icon: '</>',
    accent: '#38bdf8'
  },
  {
    slug: 'javascript',
    label: 'JavaScript',
    shortLabel: 'JavaScript',
    description: '梳理语言核心、运行机制与常见工程实践。',
    icon: 'JS',
    accent: '#facc15'
  },
  {
    slug: 'typescript',
    label: 'TypeScript',
    shortLabel: 'TypeScript',
    description: '记录类型系统、工程实践与更可靠的 JavaScript 开发经验。',
    icon: 'TS',
    accent: '#3178c6'
  },
  {
    slug: 'vue',
    label: 'Vue',
    shortLabel: 'Vue',
    description: '记录 Vue 生态、响应式原理与组件设计经验。',
    icon: 'V',
    accent: '#34d399'
  },
  {
    slug: 'react',
    label: 'React',
    shortLabel: 'React',
    description: '理解组件、Hooks、状态管理与渲染模型。',
    icon: 'R',
    accent: '#22d3ee'
  },
  {
    slug: 'ai-engineering',
    label: 'AI 应用开发',
    shortLabel: 'AI 应用开发',
    description: '大模型基础、RAG、Agent 与模型服务的工程化落地。',
    icon: 'LLM',
    accent: '#818cf8'
  },
  {
    slug: 'ai-productivity',
    label: 'AI 提效',
    shortLabel: 'AI 提效',
    description: '把 AI 融入开发、研究与知识整理的工作流。',
    icon: 'AI',
    accent: '#a78bfa'
  },
  {
    slug: 'backend',
    label: 'Backend',
    shortLabel: 'Backend',
    description: '整理 Node.js、Java、Redis 与高并发后端开发中的基础知识。',
    icon: 'BE',
    accent: '#fb7185'
  },
  {
    slug: 'it-basics',
    label: 'IT 基础',
    shortLabel: 'IT 基础',
    description: '补齐计算机网络、操作系统、SQL、数据结构与设计模式基础知识。',
    icon: '01',
    accent: '#fb7185'
  },
  {
    slug: 'essays',
    label: '随笔',
    shortLabel: '随笔',
    description: '记录学习、创作和长期成长过程中的思考。',
    icon: '✦',
    accent: '#fb923c'
  }
]

export const directNavCategories = categories.slice(0, 5)
export const moreNavCategories = categories.slice(5)
