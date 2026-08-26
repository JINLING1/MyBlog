<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <div class="brand-wordmark" aria-label="JINLING">
    <picture>
      <img
        :src="isDark ? '/logo-mark-dark.png' : '/logo-mark-light.png'"
        alt=""
        width="512"
        height="512"
      />
    </picture>
    <span>JINLING</span>
  </div>
</template>
