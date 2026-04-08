<script setup lang="ts">
import Giscus from '@giscus/vue';

</script>

<template>
  <div class="footerContentContainer">
    <div class="footerContent">
      <el-text>This is Footer</el-text>
    </div>
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

/* --- 下面是新增的评论区样式 --- */

.comment-container {
  width: 90%;
  max-width: 2000px;
  margin: 40px auto; /* 上下留出 40px 的间距，左右设为 auto 实现居中 */
  padding: 0 20px; /* 在手机端防止内容紧贴屏幕边缘 */
  box-sizing: border-box;
}

.comment-title {
  text-align: center; /* 让“留言区”标题也居中对齐 */
  margin-bottom: 24px; /* 标题和评论组件之间留点空隙 */
  color: rgba(255, 255, 255, 0.9); /* 配合你的暗色主题，给标题一点颜色 */
  font-size: 1.5rem;
  letter-spacing: 2px; /* 字间距稍微拉开一点点，更有设计感 */
}
</style>
