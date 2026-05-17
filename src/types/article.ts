export interface ArticleMeta {
  id: number
  title: string
  date: string
  author: string
  tags: string[]
  cover: string
  summary: string
}

export interface ArticleDetail extends ArticleMeta {
  content: string
  html: string
}
