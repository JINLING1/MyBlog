<script setup lang="ts">
import { categories } from '../../data/categories'

const noteCount = categories.reduce((total, category) => total + category.articles.length, 0)
</script>

<template>
  <div class="jl-home">
    <header class="jl-hero">
      <h1 class="jl-hero-title"><span class="jl-mark">Code. Log. Share.</span></h1>
      <p class="jl-hero-lede">
        记录代码背后的逻辑，整理实践中的上下文，分享能够复用的知识。
      </p>
      <p class="jl-hero-actions">
        <a class="jl-button" href="/html-css/">从 HTML &amp; CSS 读起</a>
        <a class="jl-textlink" href="#categories">看全部栏目</a>
      </p>
    </header>

    <section id="categories" class="jl-index" aria-labelledby="categories-title">
      <div class="jl-index-head">
        <h2 id="categories-title">全部栏目</h2>
        <p>{{ categories.length }} 个栏目，{{ noteCount }} 篇笔记</p>
      </div>

      <ul class="jl-index-list">
        <li v-for="category in categories" :key="category.slug" class="jl-row">
          <div class="jl-row-main">
            <h3>
              <a :href="`/${category.slug}/`"><span class="jl-mark">{{ category.label }}</span></a>
            </h3>
            <p>{{ category.description }}</p>
          </div>

          <ul v-if="category.articles.length" class="jl-row-notes">
            <li v-for="article in category.articles" :key="article.link">
              <a :href="article.link">{{ article.text }}</a>
            </li>
          </ul>
          <p v-else class="jl-row-empty">笔记整理中</p>

          <p class="jl-row-count">
            <template v-if="category.articles.length">{{ category.articles.length }} 篇</template>
          </p>
        </li>
      </ul>
    </section>

    <figure class="jl-quote">
      <blockquote>最好的知识库，不是收藏最多，而是每一次回看都能继续生长。</blockquote>
      <figcaption>Code with clarity. Log with context. Share with purpose.</figcaption>
    </figure>
  </div>
</template>
