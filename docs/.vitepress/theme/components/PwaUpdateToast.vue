<script setup lang="ts">
import { watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) {
      window.setInterval(() => registration.update(), 60 * 60 * 1000)
    }
  }
})

watch(needRefresh, (available) => {
  if (available) {
    window.setTimeout(() => updateServiceWorker(true), 1800)
  }
})
</script>

<template>
  <Transition name="toast">
    <div v-if="needRefresh" class="pwa-update-toast" role="status" aria-live="polite">
      <span class="update-dot" aria-hidden="true"></span>
      发现新版本，正在更新…
    </div>
  </Transition>
</template>
