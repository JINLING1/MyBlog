import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import HomeCategories from './components/HomeCategories.vue'
import BrandWordmark from './components/BrandWordmark.vue'
import ArticleMeta from './components/ArticleMeta.vue'
import GiscusComments from './components/GiscusComments.vue'
import PwaUpdateToast from './components/PwaUpdateToast.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-info-before': () => h(BrandWordmark),
      'doc-before': () => h(ArticleMeta),
      'doc-after': () => h(GiscusComments),
      'layout-bottom': () => h(PwaUpdateToast)
    }),
  enhanceApp({ app }) {
    app.component('HomeCategories', HomeCategories)
  }
} satisfies Theme
