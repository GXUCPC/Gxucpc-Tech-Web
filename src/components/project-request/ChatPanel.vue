<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/types/ai-chat'

const props = defineProps<{
  messages: ChatMessage[]
  loading: boolean
  title?: string
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const inputText = ref('')
const messageListRef = ref<HTMLDivElement | null>(null)

function handleSend() {
  const text = inputText.value.trim()
  if (!text) {
    return
  }
  emit('send', text)
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <span class="chat-title">{{ title || '🤖 需求分析师 Agent' }}</span>
    </div>

    <div class="chat-messages" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="msg.timestamp || index"
        :class="['message-row', msg.role === 'user' ? 'user' : 'assistant']"
      >
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <div v-if="loading" class="message-row assistant">
        <div class="message-bubble loading-bubble">
          <span class="sr-only">AI 正在输入...</span>
          <span class="dot" aria-hidden="true"></span>
          <span class="dot" aria-hidden="true"></span>
          <span class="dot" aria-hidden="true"></span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="inputText"
        class="chat-input"
        placeholder="描述你的项目需求..."
        rows="2"
        aria-label="输入消息"
        @keydown="handleKeydown"
      />
      <button
        type="button"
        class="send-btn"
        aria-label="发送消息"
        :disabled="loading || !inputText.trim()"
        @click="handleSend"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:color";

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 600;
  font-size: 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;

  &.user {
    justify-content: flex-end;
  }

  &.assistant {
    justify-content: flex-start;
  }
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.user .message-bubble {
  background: #3b82f6;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant .message-bubble {
  background: #2a2a2a;
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
}

.loading-bubble {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 60px;

  .dot {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) { animation-delay: -0.32s; }
    &:nth-of-type(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  outline: none;
  line-height: 1.5;

  &:focus {
    border-color: #f2c94c;
    background: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.send-btn {
  padding: 10px 20px;
  background: #f2c94c;
  border: none;
  border-radius: 10px;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: color.adjust(#f2c94c, $lightness: 10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
