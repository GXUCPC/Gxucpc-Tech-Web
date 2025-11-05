<script setup lang="ts"></script>

<template>
  <div class="footerContentContainer">
    <div class="footerContent">
      <el-text>This is Footer</el-text>
    </div>
  </div>
</template>

<style scoped>
.footerContentContainer {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 50px;
}
.footerContent {
  width: min(100%, 1092px);
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
</style>
