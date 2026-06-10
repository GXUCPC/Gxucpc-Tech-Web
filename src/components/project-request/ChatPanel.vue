<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ChatMessage } from '@/types/ai-chat'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

const props = defineProps<{
  messages: ChatMessage[]
  loading: boolean
  title?: string
  hasDoc?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  'view-doc': []
}>()

const inputText = ref('')
const messageListRef = ref<HTMLDivElement | null>(null)

// 记录每条消息中各选项组的选中状态：messageId -> { groupIndex -> selectedValue }
const selectedOptions = ref<Record<string, Record<number, string>>>({})

interface OptionItem {
  label: string
  value: string
}

interface MessageSegment {
  type: 'text' | 'options'
  content?: string
  options?: OptionItem[]
}

function looksLikeQuestion(text: string): boolean {
  // 问题标题通常包含问号，或被加粗包裹；真正的选项不应出现这种情况
  return /[?？]/.test(text) || /^\*\*.+\*\*$/.test(text)
}

function isDocMessage(content: string): boolean {
  // 包含需求文档标题的消息视为文档消息，不提取选项
  return content.includes('# 项目需求文档')
}

function parseMessage(content: string): MessageSegment[] | null {
  if (isDocMessage(content)) return null

  const lines = content.split('\n')
  const optionRegex = /^\s*([A-Z])[\.\．\)\）]\s+(.+)$/

  const segments: MessageSegment[] = []
  let currentTextLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(optionRegex)

    if (match && !looksLikeQuestion(match[2]!.trim())) {
      //  flush 当前文本段
      if (currentTextLines.length > 0) {
        const text = currentTextLines.join('\n').trim()
        if (text) segments.push({ type: 'text', content: text })
        currentTextLines = []
      }

      // 收集连续的选项行，形成一个选项组
      const groupOptions: OptionItem[] = []
      groupOptions.push({ label: match[2]!.trim(), value: match[2]!.trim() })

      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1]!
        const nextMatch = nextLine.match(optionRegex)
        if (nextMatch && !looksLikeQuestion(nextMatch[2]!.trim())) {
          i++
          groupOptions.push({ label: nextMatch[2]!.trim(), value: nextMatch[2]!.trim() })
        } else {
          break
        }
      }

      if (groupOptions.length >= 2) {
        segments.push({ type: 'options', options: groupOptions })
      } else {
        // 不足 2 个，回退为文本
        const text = groupOptions.map((o) => o.value).join('\n')
        segments.push({ type: 'text', content: text })
      }
    } else {
      currentTextLines.push(line)
    }
  }

  if (currentTextLines.length > 0) {
    const text = currentTextLines.join('\n').trim()
    if (text) segments.push({ type: 'text', content: text })
  }

  // 只有包含至少一个选项组时才返回分段结果
  const hasOptions = segments.some((s) => s.type === 'options')
  return hasOptions ? segments : null
}

function optionGroupCount(segments: MessageSegment[]): number {
  return segments.filter((s) => s.type === 'options').length
}

/** 根据 segment 索引计算对应的选项组序号（仅统计 options 类型的 segment） */
function getGroupIndex(segments: MessageSegment[], segIdx: number): number {
  let count = 0
  for (let i = 0; i < segIdx; i++) {
    if (segments[i]!.type === 'options') count++
  }
  return count
}

function isSelected(msgId: string, groupIndex: number, value: string): boolean {
  return selectedOptions.value[msgId]?.[groupIndex] === value
}

function hasAnySelection(msgId: string): boolean {
  const selections = selectedOptions.value[msgId]
  if (!selections) return false
  return Object.keys(selections).length > 0
}

function handleOptionSelect(msgId: string, groupIndex: number, value: string) {
  if (!selectedOptions.value[msgId]) {
    selectedOptions.value[msgId] = {}
  }
  selectedOptions.value[msgId][groupIndex] = value
}

function handleConfirm(msgId: string, segments: MessageSegment[]) {
  const selections = selectedOptions.value[msgId]
  if (!selections) return

  const answers: string[] = []
  let optionGroupIdx = 0

  for (const seg of segments) {
    if (seg.type === 'options') {
      const selectedValue = selections[optionGroupIdx]
      if (selectedValue) {
        answers.push(selectedValue)
      }
      optionGroupIdx++
    }
  }

  if (answers.length > 0) {
    emit('send', answers.join('\n'))
    delete selectedOptions.value[msgId]
  }
}

function handleSingleOptionClick(value: string) {
  emit('send', value)
}

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
      <button
        type="button"
        class="view-doc-btn"
        :disabled="!hasDoc"
        @click="emit('view-doc')"
      >
        📄 查看文档
      </button>
    </div>

    <div class="chat-messages" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        :class="['message-row', msg.role === 'user' ? 'user' : 'assistant']"
      >
        <div class="message-bubble">
          <template v-if="msg.role === 'assistant'">
            <template v-if="parseMessage(msg.content)">
              <template
                v-for="(seg, segIdx) in parseMessage(msg.content)"
                :key="segIdx"
              >
                <div
                  v-if="seg.type === 'text'"
                  class="message-content markdown-body"
                  v-html="md.render(seg.content!)"
                />
                <div v-else class="option-buttons">
                  <button
                    v-for="opt in seg.options"
                    :key="opt.value"
                    type="button"
                    class="option-btn"
                    :class="{
                      selected: isSelected(
                        msg.id || String(index),
                        getGroupIndex(parseMessage(msg.content)!, segIdx),
                        opt.value
                      ),
                    }"
                    @click="
                      optionGroupCount(parseMessage(msg.content)!) === 1
                        ? handleSingleOptionClick(opt.value)
                        : handleOptionSelect(
                            msg.id || String(index),
                            getGroupIndex(parseMessage(msg.content)!, segIdx),
                            opt.value
                          )
                    "
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </template>
              <!-- 多选项组时显示确认按钮 -->
              <div
                v-if="
                  optionGroupCount(parseMessage(msg.content)!) > 1 &&
                  hasAnySelection(msg.id || String(index))
                "
                class="confirm-row"
              >
                <button
                  type="button"
                  class="confirm-btn"
                  @click="
                    handleConfirm(
                      msg.id || String(index),
                      parseMessage(msg.content)!
                    )
                  "
                >
                  ✓ 确认发送
                </button>
              </div>
            </template>
            <div
              v-else
              class="message-content markdown-body"
              v-html="md.render(msg.content)"
            />
          </template>
          <div v-else class="message-content">{{ msg.content }}</div>
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
        @click="handleSend()"
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-doc-btn {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
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

.markdown-body {
  white-space: normal;

  :deep(p) {
    margin: 0 0 8px 0;
    &:last-child { margin-bottom: 0; }
  }

  :deep(ul, ol) {
    margin: 0;
    padding-left: 18px;
  }

  :deep(li) {
    margin-bottom: 4px;
  }

  :deep(strong) {
    color: #f2c94c;
    font-weight: 600;
  }

  :deep(code) {
    background: rgba(255, 255, 255, 0.1);
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 13px;
  }
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

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.option-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(242, 201, 76, 0.15);
    border-color: #f2c94c;
    color: #f2c94c;
  }

  &.selected {
    background: rgba(242, 201, 76, 0.25);
    border-color: #f2c94c;
    color: #f2c94c;
  }
}

.confirm-row {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 8px 20px;
  background: #f2c94c;
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: color.adjust(#f2c94c, $lightness: 10%);
  }
}
</style>
