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
*:not(svg *) {
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', 微软雅黑, sans-serif;
  padding: 0;
  margin: 0;
  color-scheme: light;
}
</style>
