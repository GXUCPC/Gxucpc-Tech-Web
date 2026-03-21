<script setup lang="ts">
import Loading from '@/components/Loading.vue'
// import PageBg from '@/components/pageBg.vue' // 上升旋转灰色正方形背景，已禁用
import { DURATION_EXTRA_LONG } from '@/constants/animation'
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { gsap } from 'gsap'

const globalLoading = useGlobalLoading()

const obj = { p: 0 }
gsap.timeline().to(obj, {
  p: 99,
  duration: DURATION_EXTRA_LONG,
  ease: 'power1.inOut',
  onUpdate: () => {
    globalLoading.progress = +obj.p.toFixed()
  },
  onComplete: () => {
    globalLoading.loading = false
  },
})

</script>

<template>
  <loading id="globalLoading" v-bind="globalLoading.$state" />
  <!-- 上升旋转灰色正方形背景，跟随鼠标移动，易分散注意力，已禁用
  <page-bg />
  -->
  <router-view />
</template>

<style scoped>
#globalLoading {
  position: fixed;
  color: #fff;
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
  color-scheme: light;
}
</style>
