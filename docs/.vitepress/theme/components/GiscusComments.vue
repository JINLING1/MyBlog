<script setup lang="ts">
import { computed } from 'vue'
import Giscus from '@giscus/vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter, isDark } = useData()
const route = useRoute()

const config = {
  repo: import.meta.env.VITE_GISCUS_REPO,
  repoId: import.meta.env.VITE_GISCUS_REPO_ID,
  category: import.meta.env.VITE_GISCUS_CATEGORY,
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID
}

const hasConfig = Object.values(config).every(Boolean)
const showComments = computed(() => hasConfig && frontmatter.value.comments !== false)
</script>

<template>
  <section v-if="showComments" class="giscus-section" aria-labelledby="comments-heading">
    <div class="comments-heading">
      <span aria-hidden="true">&lt;/&gt;</span>
      <h2 id="comments-heading">讨论与补充</h2>
    </div>
    <p>发现问题或有新的思路？欢迎留下你的观点。</p>
    <Giscus
      :key="`${route.path}-${isDark}`"
      :repo="config.repo"
      :repo-id="config.repoId"
      :category="config.category"
      :category-id="config.categoryId"
      mapping="pathname"
      term=""
      strict="0"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      :theme="isDark ? 'dark_dimmed' : 'light'"
      lang="zh-CN"
      loading="lazy"
    />
  </section>
</template>
