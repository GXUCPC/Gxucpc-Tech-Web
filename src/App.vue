<script setup lang="ts">
import Loading from '@/components/Loading.vue'
import PageBg from '@/components/pageBg.vue'
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { iconLoaded } from '@iconify/vue'
import { gsap } from 'gsap'
import { onMounted, watchEffect } from 'vue'

const globalLoading = useGlobalLoading()

const obj = { p: 0 }
gsap.timeline().to(obj, {
  p: 99,
  duration: 3,
  ease: 'power1.inOut',
  onUpdate: () => {
    globalLoading.progress = obj.p.toFixed()
  },
  onComplete: () => {
    globalLoading.loading = false
  },
})

onMounted(() => {})
</script>

<template>
  <loading id="globalLoading" v-bind="globalLoading.$state" />
  <page-bg />
  <router-view />
</template>

<style scoped>
#globalLoading {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}
</style>

<style>
@font-face {
  font-family: 'JetBrains Mono';
  src:
    local('JetBrains Mono'),
    url('/font/JetBrains Mono/JetBrainsMono[wght].ttf') format('truetype');
}

@font-face {
  font-family: 'JetBrains Mono';
  src:
    local('JetBrains Mono'),
    url('/font/JetBrains Mono/JetBrainsMono-Italic[wght].ttf') format('truetype');
  font-style: italic;
}

*:not(svg *) {
  box-sizing: border-box;
  font-family: 'JetBrains Mono', 微软雅黑, serif;
  padding: 0;
  margin: 0;
  color: white;
  color-scheme: light;
}
</style>
