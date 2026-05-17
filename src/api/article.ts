import http from './http'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import type { ArticleMeta, ArticleDetail } from '@/types/article'

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

function parseFrontmatter(raw: string): { meta: { summary?: string; tags?: string[]; cover?: string }; body: string } {
  const normalized = raw.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match || !match[1]) return { meta: {}, body: raw }
  const parsed = (yaml.load(match[1]) as Record<string, unknown>) || {}
  return {
    meta: {
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : undefined,
      cover: typeof parsed.cover === 'string' ? parsed.cover : undefined,
    },
    body: match[2] || '',
  }
}

function mapNotice(n: {
  id: number
  title: string
  content: string
  username: string
  created_at: string
}): ArticleMeta {
  const { meta, body } = parseFrontmatter(n.content || '')
  return {
    id: n.id,
    title: n.title,
    date: n.created_at || '',
    author: n.username || '',
    tags: meta.tags || [],
    cover: meta.cover || '',
    summary: meta.summary || body.replace(/^#.*\n?/, '').slice(0, 120).replace(/\n/g, ' ').trim(),
  }
}

function mapNoticeDetail(n: {
  id: number
  title: string
  content: string
  username: string
  created_at: string
}): ArticleDetail {
  const { meta, body } = parseFrontmatter(n.content || '')
  const html = md.render(body)
  return {
    id: n.id,
    title: n.title,
    date: n.created_at || '',
    author: n.username || '',
    tags: meta.tags || [],
    cover: meta.cover || '',
    summary: meta.summary || body.replace(/^#.*\n?/, '').slice(0, 120).replace(/\n/g, ' ').trim(),
    content: body,
    html,
  }
}

export const ArticleAPI = {
  async getArticleList(params?: { page?: number; size?: number }): Promise<{ items: ArticleMeta[]; total: number }> {
    const res = await http.get('/notice/published', {
      params: { page: params?.page || 1, size: params?.size || 10 },
    })
    if (res.code === 200 && res.data) {
      return {
        items: (res.data.list || []).map(mapNotice),
        total: res.data.total || 0,
      }
    }
    return { items: [], total: 0 }
  },

  async getArticleDetail(id: number): Promise<ArticleDetail | null> {
    try {
      const res = await http.get('/notice/list', {
        params: { page: 1, size: 1000 },
      })
      if (res.code !== 200 || !res.data) return null

      const list: { id: number; title: string; content: string; username: string; created_at: string }[] = res.data.list || []
      const notice = list.find((n) => n.id === id)
      if (!notice) return null

      return mapNoticeDetail(notice)
    } catch {
      return null
    }
  },

  async getLatestArticles(count: number = 4): Promise<ArticleMeta[]> {
    const res = await http.get('/notice/published', {
      params: { page: 1, size: count },
    })
    if (res.code === 200 && res.data) {
      return (res.data.list || []).map(mapNotice)
    }
    return []
  },
}
