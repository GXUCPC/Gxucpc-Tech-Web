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
    <div class="headerBar">
      <div class="headerLeft">
        <h2>广西大学icpc集训队技术组</h2>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="centerMenu"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
        router
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-sub-menu index="1">
          <template #title>集训队</template>
          <el-menu-item index="1-1">item one</el-menu-item>
          <el-menu-item index="1-2">item two</el-menu-item>
          <el-menu-item index="1-3">item three</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>技术组</template>
          <el-menu-item index="/tch_team2-1">技术组简介</el-menu-item>
          <el-menu-item index="/tch_team2-2">技术组主要开发经历</el-menu-item>
          <el-menu-item index="/tch_team2-3">联系我们</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="3">定制软件需求</el-menu-item>
      </el-menu>
      <div class="headerRight"></div>
    </div>
  </div>
</template>

<style scoped>
.headerBarContainer {
  position: sticky;
  top: 0;
  width: 100%;
  border-bottom: 1px solid #424242;
  backdrop-filter: blur(5px);
  transition: .25s ease-in-out;
  z-index: 99;

  &:hover {
    backdrop-filter: blur(25px);
  }
}
.headerBar {
  padding: 0 3em;
  width: min(100%, 1920px);
  height: 60px;
  position: relative;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.centerMenu{
  border-bottom: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

</style>
