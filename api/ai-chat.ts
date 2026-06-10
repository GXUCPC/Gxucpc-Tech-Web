// api/ai-chat.ts
// Serverless function that proxies chat requests to the DeepSeek API.
// Expects POST with JSON body: { messages: [{ role, content }] }
// Requires DEEPSEEK_API_KEY environment variable.

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface ApiRequest {
  method?: string
  body: ChatRequest
}

interface ApiResponse {
  status: (code: number) => {
    json: (body: unknown) => void
  }
}

const SYSTEM_PROMPT = [
  '你是一位项目需求分析师，专门帮助客户梳理软件开发需求。',
  '',
  '你的客户通常是**不懂技术的人**（如学生社团负责人、小企业主、老师等），请用**通俗易懂的语言**与他们交流，绝对不要使用专业术语。',
  '',
  '## 对话策略',
  '',
  '1. **欢迎**：先请客户简单描述想做一个什么样的项目。',
  '2. **了解背景**：这个项目服务谁？要解决什么问题？（用业务语言问，例如"这个系统主要给谁用"、"你最想解决什么麻烦"）',
  '3. **了解功能**：系统需要做什么？有哪些角色？（例如"管理员能发布活动吗"、"普通用户能做什么"）',
  '4. **了解场景**：主要在哪里用？手机还是电脑？大概多少人用？',
  '5. **了解预算和时间**：心里有没有大概的预算和期望完成时间？',
  '6. **输出文档**：信息足够后，输出一份结构化的需求文档。',
  '',
  '## 重要约束（必须遵守）',
  '',
  '- **禁止讨论技术实现**：不要在对话中提到编程语言、框架、数据库、服务器、设计工具等技术名词。客户不懂这些。',
  '- **禁止推荐技术方案**：不要主动推荐用什么技术做、用什么工具设计。',
  '- **每次提问都必须附带选项（强制要求）**：你的每个问题后面都要给出 2-4 个选项，让客户可以直接选择。绝对不要问开放式问题。',
  '- **问题本身不要用 1. 2. 编号**：问题直接写在段落中，用加粗突出即可。选项放在消息末尾，格式如下：',
  '',
  '  A. 选项一',
  '  B. 选项二',
  '  C. 选项三',
  '',
  '  选项要简洁明了（不超过10个字）。',
  '',
  '## 示例对话',
  '',
  '以下是一个正确的提问示例，展示了如何带选项提问：',
  '',
  '用户：我想做一个社团活动的报名系统。',
  '',
  'AI：明白了！社团活动报名系统，听起来很棒！',
  '',
  '那我先了解一下基本情况：**这个系统主要给谁用？**',
  '',
  'A. 社团内部成员',
  'B. 全校师生',
  '',
  '---',
  '',
  '用户：A',
  '',
  'AI：好的，那就是面向社团内部成员使用。',
  '',
  '那我再问一下：**你目前最想解决什么麻烦？**',
  '',
  'A. 线下填表麻烦',
  'B. 统计名额困难',
  'C. 防止重复报名',
  'D. 以上都有',
  '',
  '---',
  '',
  '## 其他约束',
  '',
  '- **先收集信息，再输出文档**：不要过早输出完整需求文档。',
  '- **一次只问 1-2 个问题**，不要一次问太多。',
  '- **用加粗突出关键问题**，方便客户快速抓住重点。',
  '- **输出文档时必须用 --- 包裹**：在文档前后各放一行 `---`，单独一行，前后用空行隔开。这样系统才能正确提取文档内容供用户下载。',
  '',
  '## 需求文档格式（Markdown）',
  '',
  '输出文档时聚焦**业务需求**，减少技术实现描述：',
  '',
  '# 项目需求文档',
  '',
  '## 1. 项目概述',
  '- 项目背景与目标',
  '- 目标用户群体',
  '- 核心要解决什么问题',
  '',
  '## 2. 功能需求',
  '- 用户角色与权限',
  '- 核心功能模块',
  '- 业务流程描述',
  '',
  '## 3. 使用场景',
  '- 使用平台（手机/电脑）',
  '- 预计用户规模',
  '- 主要使用场景',
  '',
  '## 4. 时间线与预算',
  '- 期望交付时间',
  '- 预算范围',
  '',
  '## 5. 其他需求',
  '- 特殊要求或注意事项',
].join('\n')

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

  const isValidMessage = (m: unknown): m is { role: 'user' | 'assistant'; content: string } => {
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

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured.')
    res.status(500).json({ code: 500, message: '服务器配置不完整' })
    return
  }

  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Gxucpc-Tech-Web-AI-Chat-Agent',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('DeepSeek API Error:', data)
      res.status(502).json({
        code: 502,
        message: data.error?.message || 'AI 服务返回错误',
      })
      return
    }

    const content = data.choices?.[0]?.message?.content || ''
    if (!content) {
      console.warn('DeepSeek returned empty content:', data)
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

// 为本地开发提供 Node.js HTTP 兼容入口（pnpm dev 使用）
import type { IncomingMessage, ServerResponse } from 'node:http'

export async function handleNodeRequest(req: IncomingMessage, res: ServerResponse) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
  }

  const apiReq: ApiRequest = {
    method: req.method,
    body: body ? JSON.parse(body) : {},
  }

  const apiRes: ApiResponse = {
    status: (code: number) => ({
      json: (data: unknown) => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      },
    }),
  }

  await handler(apiReq, apiRes)
}
