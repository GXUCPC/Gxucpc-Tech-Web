<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<template>
  <div class="headerBarContainer">
    <div>
      <div class="headerLeft">
      </div>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="headerBar"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="0">
        <h2>广西大学icpc集训队技术组</h2>
      </el-menu-item>
      <el-menu-item index="1">首页</el-menu-item>
      <el-sub-menu index="2">
        <template #title>Workspace</template>
        <el-menu-item index="2-1">item one</el-menu-item>
        <el-menu-item index="2-2">item two</el-menu-item>
        <el-menu-item index="2-3">item three</el-menu-item>
        <el-sub-menu index="2-4">
          <template #title>item four</template>
          <el-menu-item index="2-4-1">item one</el-menu-item>
          <el-menu-item index="2-4-2">item two</el-menu-item>
          <el-menu-item index="2-4-3">item three</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
.headerBarContainer {
  position: sticky;
  top: 0;
  width: 100%;
  border-bottom: 1px solid #424242;
  backdrop-filter: blur(5px);
}
.headerBar {
  border-bottom: 0;
  width: min(100%, 1920px);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
