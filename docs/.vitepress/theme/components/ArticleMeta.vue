<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const hasMeta = computed(
  () => Boolean(frontmatter.value.date) || Boolean(frontmatter.value.tags?.length)
)

const formattedDate = computed(() => {
  const date = frontmatter.value.date
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(new Date(date))
})
</script>

<template>
  <div v-if="hasMeta" class="article-meta" aria-label="文章信息">
    <time v-if="formattedDate" :datetime="frontmatter.date">{{ formattedDate }}</time>
    <span v-if="formattedDate && frontmatter.tags?.length" aria-hidden="true">·</span>
    <ul v-if="frontmatter.tags?.length" aria-label="文章标签">
      <li v-for="tag in frontmatter.tags" :key="tag">{{ tag }}</li>
    </ul>
  </div>
</template>
