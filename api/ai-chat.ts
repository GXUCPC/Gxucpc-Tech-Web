// api/ai-chat.ts
// Serverless function that proxies chat requests to the Anthropic Claude API.
// Expects POST with JSON body: { messages: [{ role, content }] }
// Requires ANTHROPIC_API_KEY environment variable.

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

  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ code: 400, message: '请求体必须为 JSON 对象' })
    return
  }

  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ code: 400, message: 'messages 不能为空数组' })
    return
  }

  const isValidMessage = (m: any): m is { role: 'user' | 'assistant'; content: string } => {
    return (
      typeof m === 'object' &&
      m !== null &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim() !== ''
    )
  }

  if (!messages.every(isValidMessage)) {
    res.status(400).json({ code: 400, message: 'messages 数组中包含无效消息格式' })
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
      signal: AbortSignal.timeout(30000),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'User-Agent': 'Gxucpc-Tech-Web-AI-Chat-Agent',
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
    if (!content) {
      console.warn('Claude returned empty content:', data)
    }

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
