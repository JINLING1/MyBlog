<script setup lang="ts">
import { categories } from '../../data/categories'
</script>

<template>
  <section id="categories" class="home-categories" aria-labelledby="categories-title">
    <div class="section-heading">
      <span class="section-kicker">KNOWLEDGE MAP</span>
      <h2 id="categories-title">探索知识分类</h2>
      <p>从基础原理到工程实践，把零散经验连接成可以持续生长的知识网络。</p>
    </div>

    <div class="category-grid">
      <a
        v-for="category in categories"
        :key="category.slug"
        class="category-card"
        :href="`/${category.slug}/`"
        :style="{ '--category-accent': category.accent }"
      >
        <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
        <span class="category-copy">
          <strong>{{ category.label }}</strong>
          <span>{{ category.description }}</span>
        </span>
        <span class="category-arrow" aria-hidden="true">→</span>
      </a>
    </div>

    <div class="home-manifesto">
      <div class="manifesto-code" aria-hidden="true">
        <span>&lt;</span>build<span>/&gt;</span>
      </div>
      <blockquote>
        “最好的知识库，不是收藏最多，而是每一次回看都能继续生长。”
      </blockquote>
      <p>Code with clarity. Log with context. Share with purpose.</p>
    </div>
  </section>
</template>
