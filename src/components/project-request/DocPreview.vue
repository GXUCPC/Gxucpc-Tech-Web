<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
})

const renderedHtml = computed(() => {
  return md.render(props.content || '')
})

function handleCopy() {
  if (!props.content) return
  navigator.clipboard
    .writeText(props.content)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

function handleDownload() {
  if (!props.content) return
  const blob = new Blob([props.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `project-request-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('下载已开始')
}
</script>

<template>
  <div class="doc-preview">
    <div class="doc-header">
      <span class="doc-title">📄 需求文档预览</span>
      <div class="doc-actions">
        <button
          type="button"
          class="action-btn"
          :disabled="!content"
          aria-label="复制需求文档"
          @click="handleCopy"
        >
          复制
        </button>
        <button
          type="button"
          class="action-btn primary"
          :disabled="!content"
          aria-label="下载需求文档"
          @click="handleDownload"
        >
          下载 .md
        </button>
      </div>
    </div>

    <div class="doc-body">
      <div v-if="!content" class="doc-empty">
        <p>继续对话，Agent 生成需求文档后将在此显示...</p>
      </div>
      <div v-else class="markdown-content" v-html="renderedHtml" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:color";

.doc-preview {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #111;
  color: #fff;
}

.doc-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.doc-title {
  font-weight: 600;
  font-size: 15px;
}

.doc-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #fff;
    color: #fff;
  }

  &.primary {
    background: #f2c94c;
    border-color: #f2c94c;
    color: #000;
    font-weight: 600;

    &:hover:not(:disabled) {
      background: color.adjust(#f2c94c, $lightness: 10%);
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.doc-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px;
}

.doc-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
  text-align: center;
}

.markdown-content {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);

  :deep(h1) {
    font-size: 1.6em;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.6em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(h2) {
    font-size: 1.3em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 1.5em 0 0.5em;
  }

  :deep(h3) {
    font-size: 1.1em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 1.2em 0 0.4em;
  }

  :deep(p) {
    margin-bottom: 0.8em;
  }

  :deep(strong) {
    color: #fff;
  }

  :deep(ul), :deep(ol) {
    padding-left: 1.5em;
    margin-bottom: 0.8em;
  }

  :deep(li) {
    margin-bottom: 0.3em;
  }

  :deep(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.9em;
  }

  :deep(p code) {
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
  }

  :deep(pre) {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px 18px;
    overflow-x: auto;
    margin-bottom: 0.8em;
  }

  :deep(pre code) {
    background: none;
    padding: 0;
  }

  :deep(blockquote) {
    border-left: 3px solid #f2c94c;
    padding: 8px 16px;
    margin: 0.8em 0;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 8px 8px 0;
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.8em;

    th, td {
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 600;
      color: #fff;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 1.5em 0;
  }

  :deep(a) {
    color: #60a5fa;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
