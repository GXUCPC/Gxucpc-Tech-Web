<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElDialog } from 'element-plus'
import ChatPanel from '@/components/project-request/ChatPanel.vue'
import DocPreview from '@/components/project-request/DocPreview.vue'
import { AIChatAPI } from '@/api/ai-chat'
import type { ChatMessage } from '@/types/ai-chat'

const messages = ref<ChatMessage[]>([
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      '你好！我是你的项目需求分析师。请告诉我，你想做一个什么样的项目？',
    timestamp: Date.now(),
  },
])

const loading = ref(false)
const showDocDialog = ref(false)

// 手动控制页面滚动条：弹窗打开时隐藏，关闭时恢复
let originalHtmlOverflow = ''
let originalBodyOverflow = ''
watch(showDocDialog, (val) => {
  if (val) {
    originalHtmlOverflow = document.documentElement.style.overflow
    originalBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = originalHtmlOverflow
    document.body.style.overflow = originalBodyOverflow
  }
})

function extractDocContent(fullContent: string): string {
  // 提取 --- 分隔符之间的文档内容（去掉前后的寒暄语）
  const parts = fullContent.split('\n---\n')
  if (parts.length >= 3) {
    return parts.slice(1, -1).join('\n---\n').trim()
  }
  return fullContent.trim()
}

const latestDoc = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].role === 'assistant') {
      return extractDocContent(messages.value[i].content)
    }
  }
  return ''
})

const hasDoc = computed(() => {
  return latestDoc.value.includes('# 项目需求文档')
})

async function handleSend(content: string) {
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp: Date.now(),
  }
  messages.value.push(userMessage)
  loading.value = true

  try {
    const res = await AIChatAPI.sendChat(messages.value)

    if (res.code === 200 && res.data) {
      messages.value.push({
        id: crypto.randomUUID(),
        role: res.data.role,
        content: res.data.content,
        timestamp: Date.now(),
      })
    } else {
      ElMessage.error(res.message || '请求失败')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '请求失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="project-request-page">
    <div class="chat-container">
      <ChatPanel
        :messages="messages"
        :loading="loading"
        :has-doc="hasDoc"
        @send="handleSend"
        @view-doc="showDocDialog = true"
      />
    </div>

    <ElDialog
      v-model="showDocDialog"
      title="需求文档"
      width="800px"
      destroy-on-close
      :close-on-click-modal="true"
      modal-class="doc-preview-overlay"
    >
      <DocPreview :content="latestDoc" />
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.project-request-page {
  min-height: calc(100vh - 4em);
  padding: 20px;
  box-sizing: border-box;
}

.chat-container {
  max-width: 900px;
  margin: 0 auto;
  height: calc(100vh - 4em - 40px);
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 1024px) {
  .chat-container {
    height: calc(100vh - 4em - 40px);
  }
}

:deep(.el-overlay) {
  overflow: hidden;
}

:deep(.el-dialog) {
  border-radius: 12px;
  background: #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
  flex: 1;
  height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.6);
}
</style>

<!-- 覆盖层被 teleport 到 body，scoped 样式无法命中，需要单独写一段无 scope 样式 -->
<style lang="scss">
.doc-preview-overlay {
  overflow: hidden !important;
}
</style>
