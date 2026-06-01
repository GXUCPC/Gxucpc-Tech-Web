<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
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

const latestDoc = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].role === 'assistant') {
      return messages.value[i].content
    }
  }
  return ''
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
    <div class="split-layout">
      <div class="panel chat-panel-wrapper">
        <ChatPanel
          :messages="messages"
          :loading="loading"
          @send="handleSend"
        />
      </div>
      <div class="panel doc-panel-wrapper">
        <DocPreview :content="latestDoc" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-request-page {
  min-height: calc(100vh - 4em);
  padding: 20px;
  box-sizing: border-box;
}

.split-layout {
  display: flex;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 4em - 40px);
  min-height: 500px;
}

.panel {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 1024px) {
  .split-layout {
    flex-direction: column;
    height: auto;
  }

  .panel {
    min-height: 400px;
  }

  .doc-panel-wrapper {
    display: none;
  }
}
</style>
