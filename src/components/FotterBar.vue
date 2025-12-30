<script setup lang="ts">
import Giscus from '@giscus/vue';

</script>

<template>
  <div class="footerContentContainer">
    <div class="footerContent">
      <el-text>This is Footer</el-text>
    </div>

    <div class="comment-container">
      <h3 class="comment-title"> 留言区</h3>

      <Giscus
        id="comments"
        repo="susitata/Gxu-Tch-Web-discussion"
        repoId="R_kgDOQuwzKA"
        category="General"
        categoryId="DIC_kwDOQuwzKM4C0O3T"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="transparent_dark" lang="zh-CN"
        loading="lazy"
      />
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
