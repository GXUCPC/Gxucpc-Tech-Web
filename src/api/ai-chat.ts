import http from './http'
import type { ChatMessage } from '@/types/ai-chat'

export interface ChatResponse {
  code: number
  message?: string
  data: {
    role: 'assistant'
    content: string
  } | null
}

export const AIChatAPI = {
  async sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const res = await http.post('/ai-chat', { messages })
      if (res.code === 200 && res.data) {
        return {
          code: 200,
          data: {
            role: 'assistant',
            content: res.data.content || '',
          },
        }
      }
      return {
        code: res.code,
        message: res.message || 'AI 服务响应异常',
        data: null,
      }
    } catch (error: unknown) {
      return {
        code: 500,
        message: error instanceof Error ? error.message : '未知错误',
        data: null,
      }
    }
  },
}
