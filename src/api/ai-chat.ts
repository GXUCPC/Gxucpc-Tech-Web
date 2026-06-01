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
