<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

interface HeadingItem {
  id: string
  text: string
  level: number
}

const route = useRoute()
const headings = ref<HeadingItem[]>([])
let refreshTimer: ReturnType<typeof setTimeout> | undefined
let stopRouteWatch: (() => void) | undefined

function collectHeadings() {
  if (typeof document === 'undefined') return

  const content = document.querySelector('.vp-doc')
  if (!content) {
    headings.value = []
    return
  }

  headings.value = Array.from(content.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'))
    .map((heading) => ({
      id: heading.id,
      text: heading.textContent?.replace(/\u200b/g, '').trim() || '',
      level: Number(heading.tagName.slice(1))
    }))
    .filter((heading) => heading.text)
}

function refresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    void nextTick(collectHeadings)
  }, 0)
}

onMounted(() => {
  refresh()
  stopRouteWatch = watch(() => route.path, refresh)
})

onBeforeUnmount(() => {
  stopRouteWatch?.()
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <nav v-if="headings.length" class="article-sidebar-outline" aria-label="本文目录">
    <details open>
      <summary>本文目录</summary>
      <ul>
        <li
          v-for="heading in headings"
          :key="heading.id"
          :class="`level-${heading.level}`"
        >
          <a :href="`#${heading.id}`">{{ heading.text }}</a>
        </li>
      </ul>
    </details>
  </nav>
</template>
