import DefaultTheme from 'vitepress/theme-without-fonts'
import type { Theme } from 'vitepress'
import { defineClientComponent } from 'vitepress'
import { h } from 'vue'
import HomePage from './components/HomePage.vue'
import ArticleMeta from './components/ArticleMeta.vue'
import GiscusComments from './components/GiscusComments.vue'
import './styles.css'

const PwaUpdateToast = defineClientComponent(
  () => import('./components/PwaUpdateToast.vue')
)

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(ArticleMeta),
      'doc-after': () => h(GiscusComments),
      'layout-bottom': () => h(PwaUpdateToast)
    }),
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
  }
} satisfies Theme
