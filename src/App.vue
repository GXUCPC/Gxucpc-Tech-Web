<script setup lang="ts">
// import PageBg from '@/components/pageBg.vue' // 上升旋转灰色正方形背景，已禁用
// 全屏 loading 遮罩已移除：改为页面内容渐显 + 导航栏划入
</script>

<template>
  <!-- 上升旋转灰色正方形背景，跟随鼠标移动，易分散注意力，已禁用
  <page-bg />
  -->
  <router-view />
</template>

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
