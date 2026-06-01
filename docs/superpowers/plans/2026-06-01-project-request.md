# 项目需求接单模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `/project-request` 页面，提供左右分栏的 AI Agent 对话与需求文档实时预览功能。

**Architecture:** 前端新增类型定义、API 模块、两个子组件和一个页面；后端以 serverless 函数 `api/ai-chat.ts` 代理 Claude API。对话历史由页面状态管理，右侧始终渲染最新 Assistant 消息。

**Tech Stack:** Vue 3, TypeScript, Element Plus, markdown-it, Axios (via `src/api/http.js`)

---

## File Structure

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/ai-chat.ts` | 创建 | `ChatMessage` 类型定义 |
| `src/api/ai-chat.ts` | 创建 | 前端调用后端的封装 |
| `api/ai-chat.ts` | 创建 | Serverless 函数：代理 Claude API |
| `src/components/project-request/ChatPanel.vue` | 创建 | 左侧聊天面板 |
| `src/components/project-request/DocPreview.vue` | 创建 | 右侧 Markdown 预览 |
| `src/pages/project-request/ProjectRequest.vue` | 创建 | 页面主容器 |
| `src/router/index.ts` | 修改 | 注册新路由 |
| `src/components/HeaderBar.vue` | 修改 | 添加导航入口 |

---

### Task 1: ChatMessage 类型定义

**Files:**
- Create: `src/types/ai-chat.ts`

- [ ] **Step 1: 创建类型文件**

```ts
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/ai-chat.ts
git commit -m "feat: 添加 ChatMessage 类型定义"
```

---

### Task 2: 前端 AI Chat API 模块

**Files:**
- Create: `src/api/ai-chat.ts`

- [ ] **Step 1: 创建 API 模块**

```ts
import http from './http'
import type { ChatMessage } from '@/types/ai-chat'

export interface ChatResponse {
  role: 'assistant'
  content: string
}

export const AIChatAPI = {
  async sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
    const res = await http.post('/ai-chat', { messages })
    if (res.code === 200 && res.data) {
      return {
        role: 'assistant',
        content: res.data.content || '',
      }
    }
    throw new Error(res.message || 'AI 服务响应异常')
  },
}
```

注意：这里调用的是 `/ai-chat`，因为 `http.js` 的 `baseURL` 是 `/api`，实际发出的请求是 `POST /api/ai-chat`。

- [ ] **Step 2: Commit**

```bash
git add src/api/ai-chat.ts
git commit -m "feat: 添加 AI Chat API 模块"
```

---

### Task 3: 后端 Serverless 代理（Claude API）

**Files:**
- Create: `api/ai-chat.ts`

- [ ] **Step 1: 创建 serverless 函数**

```ts
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface ApiRequest {
  method?: string
  body: ChatRequest
}

interface ApiResponse {
  status: (code: number) => {
    json: (body: any) => void
  }
}

const SYSTEM_PROMPT = `你是一位资深的项目需求分析师，专门帮助客户梳理软件开发需求。

你的任务是通过友好、专业的对话，引导客户明确以下信息：
1. 项目目标与背景
2. 核心功能需求
3. 技术偏好或限制（如语言、框架、平台）
4. 预算范围（粗略即可）
5. 期望交付时间

对话策略：
- 如果信息不足，继续追问，一次只问 1-2 个问题。
- 不要一次性输出完整文档，先通过对话收集足够信息。
- 当你认为已经收集到足够信息时，输出一份结构化的需求文档。

需求文档格式（Markdown）：
# 项目需求文档

## 1. 项目概述
...

## 2. 功能需求
...

## 3. 技术建议
...

## 4. 交付物
...

## 5. 时间线与里程碑
...

## 6. 预算估算
...`

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: 405, message: 'Method Not Allowed' })
    return
  }

  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ code: 400, message: 'messages 不能为空数组' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured.')
    res.status(500).json({ code: 500, message: '服务器配置不完整' })
    return
  }

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Claude API Error:', data)
      res.status(502).json({
        code: 502,
        message: data.error?.message || 'AI 服务返回错误',
      })
      return
    }

    const content = data.content?.[0]?.text || ''

    res.status(200).json({
      code: 200,
      data: {
        role: 'assistant',
        content,
      },
    })
  } catch (error) {
    console.error('AI Chat proxy error:', error)
    res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/ai-chat.ts
git commit -m "feat: 添加 AI Chat serverless 代理"
```

---

### Task 4: ChatPanel 聊天组件

**Files:**
- Create: `src/components/project-request/ChatPanel.vue`

- [ ] **Step 1: 创建组件文件**

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/types/ai-chat'

const props = defineProps<{
  messages: ChatMessage[]
  loading: boolean
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
      <span class="chat-title">🤖 需求分析师 Agent</span>
    </div>

    <div class="chat-messages" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-row', msg.role === 'user' ? 'user' : 'assistant']"
      >
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <div v-if="loading" class="message-row assistant">
        <div class="message-bubble loading-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="inputText"
        class="chat-input"
        placeholder="描述你的项目需求..."
        rows="2"
        @keydown="handleKeydown"
      />
      <button
        class="send-btn"
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

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
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
```

- [ ] **Step 2: 检查 TypeScript 编译**

```bash
pnpm type-check
```

Expected: 无与 `ChatPanel.vue` 相关的错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/project-request/ChatPanel.vue
git commit -m "feat: 添加 ChatPanel 聊天组件"
```

---

### Task 5: DocPreview 文档预览组件

**Files:**
- Create: `src/components/project-request/DocPreview.vue`

- [ ] **Step 1: 创建组件文件**

```vue
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
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
        <button class="action-btn" :disabled="!content" @click="handleCopy">
          复制
        </button>
        <button class="action-btn primary" :disabled="!content" @click="handleDownload">
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
  height: 100%;
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
```

- [ ] **Step 2: 检查 TypeScript 编译**

```bash
pnpm type-check
```

Expected: 无与 `DocPreview.vue` 相关的错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/project-request/DocPreview.vue
git commit -m "feat: 添加 DocPreview 文档预览组件"
```

---

### Task 6: ProjectRequest 页面主容器

**Files:**
- Create: `src/pages/project-request/ProjectRequest.vue`

- [ ] **Step 1: 创建页面文件**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ChatPanel from '@/components/project-request/ChatPanel.vue'
import DocPreview from '@/components/project-request/DocPreview.vue'
import { AIChatAPI } from '@/api/ai-chat'
import type { ChatMessage } from '@/types/ai-chat'

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content:
      '你好！我是你的项目需求分析师。请告诉我，你想做一个什么样的项目？',
    timestamp: Date.now(),
  },
])

const loading = ref(false)

const latestDoc = computed(() => {
  const lastAssistant = [...messages.value]
    .reverse()
    .find((m) => m.role === 'assistant')
  return lastAssistant?.content || ''
})

async function handleSend(content: string) {
  const userMessage: ChatMessage = {
    role: 'user',
    content,
    timestamp: Date.now(),
  }
  messages.value.push(userMessage)
  loading.value = true

  try {
    const response = await AIChatAPI.sendChat(messages.value)
    messages.value.push({
      role: response.role,
      content: response.content,
      timestamp: Date.now(),
    })
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
```

- [ ] **Step 2: 检查 TypeScript 编译**

```bash
pnpm type-check
```

Expected: 无与 `ProjectRequest.vue` 相关的错误。

- [ ] **Step 3: Commit**

```bash
git add src/pages/project-request/ProjectRequest.vue
git commit -m "feat: 添加 ProjectRequest 页面"
```

---

### Task 7: 注册路由

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: 在 `MainLayout` children 中添加路由**

找到 `src/router/index.ts` 中 `MainLayout` 的 `children` 数组，在最后一个路由对象之后添加：

```ts
        {
          name: 'projectRequest',
          path: 'project-request',
          component: defineAsyncComponent(() => import('@/pages/project-request/ProjectRequest.vue')),
        },
```

具体位置在 `tech` 路由的闭合 `]` 之后，`MainLayout` 路由的闭合 `]` 之前。

- [ ] **Step 2: 检查 TypeScript 编译**

```bash
pnpm type-check
```

Expected: 无路由相关类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: 注册 /project-request 路由"
```

---

### Task 8: 添加导航入口

**Files:**
- Modify: `src/components/HeaderBar.vue`

- [ ] **Step 1: 在菜单中添加"项目合作"入口**

找到 `HeaderBar.vue` 中的导航菜单（通常是 `<el-menu>` 或一组 `<router-link>`），在适当位置添加：

```html
<router-link to="/project-request">项目合作</router-link>
```

或如果是 Element Plus `el-menu-item`：

```html
<el-menu-item index="/project-request">项目合作</el-menu-item>
```

具体插入位置建议放在"文章"或"技术组"菜单项附近，与现有菜单风格保持一致。

- [ ] **Step 2: 检查 TypeScript 编译**

```bash
pnpm type-check
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/HeaderBar.vue
git commit -m "feat: 在导航栏添加项目合作入口"
```

---

### Task 9: 本地联调验证

**Files:**
- 无新增/修改文件，仅验证。

- [ ] **Step 1: 启动开发服务器**

```bash
pnpm dev
```

- [ ] **Step 2: 验证路由可访问**

打开浏览器访问 `http://localhost:5173/project-request`（或实际 dev server 端口）。

Expected:
- 页面显示左右分栏布局。
- 左侧显示 Agent 欢迎语。
- 可以输入消息并发送（如果 backend/serverless 未就绪，会触发网络错误提示，属预期行为）。

- [ ] **Step 3: 验证导航入口**

点击顶部导航栏的"项目合作"，确认能正确跳转到 `/project-request`。

- [ ] **Step 4: 运行 lint**

```bash
pnpm lint
```

Expected: 无新增错误。

- [ ] **Step 5: 最终提交**

如果上述验证全部通过，确认当前分支状态：

```bash
git log --oneline -10
```

Expected 提交历史包含以上 8 个任务的 commit。

---

## Self-Review

### 1. Spec Coverage

| 需求 | 对应 Task |
|------|-----------|
| 新增 `/project-request` 路由 | Task 7 |
| 左右分栏布局 | Task 6 |
| 左侧聊天面板 | Task 4 |
| 右侧 Markdown 预览 | Task 5 |
| 后端代理 Claude API | Task 3 |
| 前端 API 封装 | Task 2 |
| 导航入口 | Task 8 |
| 复制/下载 .md | Task 5 |
| 异常处理（空消息、网络错误） | Task 4, Task 6 |

无遗漏。

### 2. Placeholder Scan

- 无 `TBD`、`TODO`、`implement later`。
- 所有组件均提供完整代码。
- HeaderBar 的修改描述为"找到菜单并添加"，因为具体菜单结构取决于该文件当时的实现（Element Plus `el-menu` 或自定义），但操作明确：添加一个指向 `/project-request` 的链接/菜单项。

### 3. Type 一致性

- `ChatMessage` 定义在 `src/types/ai-chat.ts`，被 `src/api/ai-chat.ts`、`ChatPanel.vue`、`ProjectRequest.vue` 一致引用。
- `AIChatAPI.sendChat` 接收 `ChatMessage[]`，返回 `{ role: 'assistant'; content: string }`，与后端 `api/ai-chat.ts` 的响应结构一致。
- `ChatPanel` 的 `messages` prop 类型为 `ChatMessage[]`，与 `ProjectRequest.vue` 传入的数组类型一致。
