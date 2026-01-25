<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
import { ref, onMounted } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
import  { VisitAPI }  from '@/api/visit.js'
import FeedbackModal from '@/components/FeedbackModal.vue' // 引入刚才写的文件

const { dialogVisible} = useDialog()

onMounted(() => {
  // 页面加载完成后，发送埋点请求
  recordVisit()
})

function recordVisit() {
  const visitData = {
    time: new Date().toISOString(),
  }
  VisitAPI.submitVisit(visitData)
    .then((response) => {
      console.log('埋点成功:', response)
    })
    .catch((error) => {
      console.error('埋点失败:', error)
    })
}




</script>

<template>

<FeedbackModal
    v-model="dialogVisible"
  />

  <header-nav />
  <div class="contentContainer">
    <div class="content">
      <router-view />
    </div>
  </div>
  <footer-content />
</template>

<style scoped>
.contentContainer {
  width: 100%;
}

.content {
  margin: 0 auto;
  width: min(100%, 1920px);
  min-height: calc(100vh - 4em);
}
/* 一些微调样式 */
.dialog-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-right: 20px; /* 防止标题碰到关闭按钮 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
  padding-top: 10px;
}
</style>
