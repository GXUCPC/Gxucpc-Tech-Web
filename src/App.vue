<script setup lang="ts">
import Loading from '@/components/Loading.vue'
import PageBg from '@/components/pageBg.vue'
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { gsap } from 'gsap'
import { onMounted } from 'vue'

const globalLoading = useGlobalLoading()

const obj = { p: 0 }
gsap.timeline().to(obj, {
  p: 99,
  duration: 5,
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
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  color: white;
  color-scheme: light;
}
</style>
