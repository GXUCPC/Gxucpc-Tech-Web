# 项目需求接单模块设计文档

## 背景与目标

为 GXUCPC Tech Web 新增一个"项目需求沟通"页面，让有开发需求的外部用户可以通过与 AI Agent 对话的方式，逐步梳理并生成一份结构化的需求文档。MVP 阶段仅做前端生成与展示，不接入自动发送/存储流程。

## 需求概述

- 用户进入页面后，与 AI Agent（需求分析师角色）进行多轮对话。
- Agent 通过提问收集项目目标、核心功能、技术偏好、预算范围、交付时间等信息。
- 当信息足够时，Agent 输出一份 Markdown 格式的结构化需求文档。
- 文档实时渲染在页面右侧，用户可复制或下载为 `.md` 文件。

## 架构设计

### 新增文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/pages/project-request/ProjectRequest.vue` | 页面 | 左右分栏主容器 |
| `src/components/project-request/ChatPanel.vue` | 组件 | 左侧聊天面板 |
| `src/components/project-request/DocPreview.vue` | 组件 | 右侧 Markdown 预览 |
| `src/api/ai-chat.ts` | API 模块 | 封装 `POST /api/ai/chat` 请求 |
| `src/types/ai-chat.ts` | 类型 | `ChatMessage` 等类型定义 |

### 路由

在 `src/router/index.ts` 的 `MainLayout` children 中新增：

```ts
{
  name: 'projectRequest',
  path: 'project-request',
  component: defineAsyncComponent(() => import('@/pages/project-request/ProjectRequest.vue')),
}
```

导航入口加在 `HeaderBar.vue` 的菜单中，文案暂定为"项目合作"（可在实施时调整）。

### 数据流

1. 用户访问 `/project-request`。
2. `ProjectRequest.vue` 初始化 `messages` 数组，预置一条欢迎语（Assistant 角色，纯前端展示，不调后端）。
3. 用户在 `ChatPanel.vue` 输入消息并发送。
4. `ProjectRequest.vue` 先把用户消息追加到 `messages`，调用 `ai-chat.ts` 的 `sendChat(messages)`。
5. 后端 `POST /api/ai/chat` 接收完整对话历史 + System Prompt，转发给 Claude API（或其他可切换的模型）。
6. 后端返回 Assistant 回复，前端追加到 `messages`。
7. `DocPreview.vue` 接收 `latestDoc`（即最新一条 Assistant 消息的 `content`），用 `markdown-it` 渲染为 HTML。
8. 用户点击"复制"或"下载 .md"时，操作 `latestDoc` 的原始 Markdown 文本。

## 页面布局

### 整体结构

左右分栏，各占约 50% 宽度，中间以细线分隔：

- **左栏（聊天）**：顶部标题栏（"需求分析师 Agent"），中部消息气泡列表，底部输入框 + 发送按钮。
- **右栏（文档）**：顶部标题栏（"需求文档预览"）+ 操作按钮（复制 / 下载 .md），中部 Markdown 渲染区。

### 默认状态

右侧初始显示提示文案："继续对话，Agent 生成需求文档后将在此显示..."

### 响应式

- 桌面端（>= 1024px）：左右分栏。
- 平板/移动端（< 1024px）：左栏全宽，右栏隐藏，提供"查看文档"悬浮按钮，点击后以抽屉/全屏方式展示右侧内容。

## 组件设计

### ChatPanel.vue

**Props**
- `messages: ChatMessage[]` — 对话历史
- `loading: boolean` — Agent 是否正在回复

**Emits**
- `send: (content: string) => void` — 用户点击发送

**行为**
- 发送前本地校验：空内容不允许发送，输入框置灰/抖动提示。
- 消息列表自动滚动到底部。
- Agent 回复中显示 loading 动画（Element Plus `el-skeleton` 或打字机效果）。
- 支持 Enter 发送，Shift+Enter 换行。

### DocPreview.vue

**Props**
- `content: string` — 原始 Markdown 文本

**行为**
- 使用 `markdown-it`（项目已有依赖）渲染为 HTML，样式和 `ArticleDetail.vue` 的 `.article-body` 保持一致（暗色主题、代码块、表格等）。
- "复制"按钮：调用 `navigator.clipboard.writeText(content)`，成功提示 `ElMessage.success`。
- "下载 .md"按钮：生成 Blob 并触发下载，文件名如 `project-request-{timestamp}.md`。

## API 设计

### 前端 → 后端

```
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "我想做一个社团报名系统" },
    { "role": "assistant", "content": "好的！需要支持多少人同时报名？" },
    { "role": "user", "content": "大概 200 人" }
  ]
}
```

### 后端 → Claude API

后端拼接以下 System Prompt 后转发：

```
你是一位资深的项目需求分析师，专门帮助客户梳理软件开发需求。

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
...
```

### 后端 → 前端

```json
{
  "role": "assistant",
  "content": "..."
}
```

MVP 阶段先返回完整文本，不做 SSE 流式。后续如需要可升级为 `text/event-stream`。

## 状态设计（ProjectRequest.vue）

```ts
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好！我是你的项目需求分析师。请告诉我，你想做一个什么样的项目？',
    timestamp: Date.now()
  }
])

const loading = ref(false)

const latestDoc = computed(() => {
  const lastAssistant = [...messages.value].reverse().find(m => m.role === 'assistant')
  return lastAssistant?.content || ''
})
```

## 异常处理

| 场景 | 处理方案 |
|------|----------|
| 用户发送空消息 | 本地拦截，`ElMessage.warning('请输入内容')`，不触发请求 |
| 后端无响应/网络错误 | `catch` 中 `ElMessage.error('服务暂时不可用，请稍后重试')` |
| 后端返回非 200（Claude API 故障/限流） | 提示"AI 服务繁忙，请稍后再试"，保留已有聊天记录 |
| Agent 回复超长 | Markdown 区域支持滚动，不做截断 |

## 技术约束

- 使用项目已有技术栈：Vue 3 Composition API、TypeScript、Element Plus、`markdown-it`。
- 后端代理接口需由现有后端（`localhost:9091`）实现，前端通过 `src/api/http.js` 调用。
- 预留模型切换能力：后端 `/api/ai/chat` 的实现应封装模型调用逻辑，不直接把 Claude 特有的参数暴露给前端。

## 非目标（明确排除在 MVP 外）

- 不接入自动发送邮件/通知功能。
- 不新建 Admin 后台管理模块。
- 不做 SSE 流式响应（后续迭代可加）。
- 不做对话历史持久化（刷新页面重置）。

## 验收标准

- [ ] `/project-request` 路由可访问，左右分栏正常显示。
- [ ] 用户可与 Agent 进行多轮对话，消息正常展示。
- [ ] Agent 能根据对话内容输出 Markdown 格式的需求文档。
- [ ] 右侧正确渲染 Markdown，包含标题、列表、代码块等样式。
- [ ] "复制"和"下载 .md"功能可用。
- [ ] 空消息、网络错误等边界情况有合理提示。
