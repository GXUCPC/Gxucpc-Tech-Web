<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import { ArticleAPI } from '@/api/article'
import type { ArticleDetail } from '@/types/article'
import { Icon } from '@iconify/vue'

const route = useRoute()
const article = ref<ArticleDetail | null>(null)
const loading = ref(true)
const activeId = ref<string>('')
let tocObserver: IntersectionObserver | null = null

interface TocItem {
  id: string
  text: string
  level: number
}

const tocList = ref<TocItem[]>([])

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(/\//g, '-')
}

// async function loadArticle(id: number) {
//   loading.value = true
//   article.value = null
//   tocList.value = []
//   try {
//     const result = await ArticleAPI.getArticleDetail(id)
//     article.value = result
//   } catch (e) {
//     console.error('Failed to load article:', e)
//     article.value = null
//   } finally {
//     loading.value = false
//   }
// }
// 
function buildToc() {
  const headings = document.querySelectorAll('.article-body h2, .article-body h3')
  tocList.value = []
  headings.forEach((h, i) => {
    const id = `heading-${i}`
    h.id = id
    tocList.value.push({
      id,
      text: h.textContent || '',
      level: parseInt(h.tagName.charAt(1)),
    })
  })

  if (tocObserver) tocObserver.disconnect()

  const h2s = document.querySelectorAll('.article-body h2[id]')
  tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-10% 0px -80% 0px' },
  )
  h2s.forEach((h) => tocObserver!.observe(h))
}

function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// watch(
//   () => route.params.id,
//   async (id) => {
//     if (id) await loadArticle(Number(id))
//   },
// )
// 
// onMounted(async () => {
//   if (route.params.id) await loadArticle(Number(route.params.id))
// })
// 
// onMounted(() => {
//   loading.value = false // 纯前端模式：无后端数据，直接结束加载态
// })

onUnmounted(() => {
  if (tocObserver) tocObserver.disconnect()
})

watch(article, () => {
  if (article.value) requestAnimationFrame(buildToc)
})
</script>

<template>
  <div class="articleDetailPage" v-loading="loading">
    <template v-if="article">
      <div class="page-layout">
        <main class="article-container">
          <h1 class="articleTitle">{{ article.title }}</h1>

          <div class="articleMetaTop">
            <span class="articleMetaItem" v-if="article.author">
              <Icon icon="mdi:account-outline" :inline="true" />
              {{ article.author }}
            </span>
            <span class="articleMetaItem">
              <Icon icon="mdi:calendar-outline" :inline="true" />
              {{ formatDate(article.date) }}
            </span>
          </div>

          <div class="articleTags" v-if="article.tags && article.tags.length">
            <span v-for="tag in article.tags" :key="tag" class="articleTag">{{ tag }}</span>
          </div>

          <div class="divider"></div>

          <div class="article-body" v-html="article.html"></div>
        </main>

        <aside class="sidebar-container" v-if="tocList.length">
          <ul class="toc-list">
            <li
              v-for="item in tocList"
              :key="item.id"
              class="toc-item"
              :class="{
                active: activeId === item.id,
                'toc-sub': item.level === 3,
              }"
              @click="scrollToSection(item.id)">
              {{ item.text }}
            </li>
          </ul>
        </aside>
      </div>
    </template>

    <div class="articleNotFound" v-if="!loading && !article">
      <p>文章不存在</p>
      <router-link to="/articles">返回文章列表</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.articleDetailPage {
  padding: 2em 3em 4em;
  min-height: 60vh;
}

.page-layout {
  display: flex;
  gap: 4em;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.article-container {
  flex: 1;
  min-width: 0;
}

.articleTitle {
  font-size: 2.2em;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.articleMetaTop {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95em;
  margin-bottom: 12px;
}

.articleMetaItem {
  display: flex;
  align-items: center;
  gap: 4px;
}

.articleTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.articleTag {
  font-size: 0.85em;
  font-family: monospace;
  color: rgba(96, 165, 250, 0.95);
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.25);
  padding: 4px 12px;
  border-radius: 6px;
}

.article-body {
  font-size: 1.05em;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);

  :deep(h2) {
    font-size: 1.5em;
    font-weight: 600;
    color: #fff;
    margin: 2em 0 0.8em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    scroll-margin-top: 80px;
  }

  :deep(h3) {
    font-size: 1.2em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 1.5em 0 0.6em;
    scroll-margin-top: 80px;
  }

  :deep(p) { margin-bottom: 1em; }
  :deep(strong) { color: #fff; }

  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  :deep(ul), :deep(ol) {
    padding-left: 1.5em;
    margin-bottom: 1em;
    li {
      list-style: disc;
      font-weight: normal;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 0.3em;
    }
  }
  :deep(ol li) { list-style: decimal; }

  :deep(pre) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px 20px;
    overflow-x: auto;
    margin-bottom: 1em;
    font-size: 0.9em;
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

  :deep(pre code) {
    background: none;
    padding: 0;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--el-color-primary);
    padding: 8px 16px;
    margin: 1em 0;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 8px 8px 0;
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 2em 0;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
    th, td {
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px 12px;
      text-align: left;
    }
    th { background: rgba(255, 255, 255, 0.06); font-weight: 600; }
  }
}

.divider { border: none; border-top: 1px solid #374151; margin: 20px 0; }

.sidebar-container {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  padding: 10px 0;
  align-self: flex-start;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.toc-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 0 8px 16px;
  margin-left: -1px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1.5;

  &:hover { color: rgba(255, 255, 255, 0.85); }

  &.active {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    border-left: 1px solid rgba(255, 255, 255, 0.8);
  }

  &.toc-sub { padding-left: 28px; font-size: 13px; }
}

.articleNotFound {
  text-align: center;
  padding: 6em 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2em;
  a { color: var(--el-color-primary); }
}

@media (max-width: 1100px) {
  .sidebar-container { display: none; }
  .page-layout { gap: 0; }
}

@media (max-width: 768px) {
  .articleDetailPage { padding: 1.5em 15px 3em; }
  .articleTitle { font-size: 1.6em; }
  .article-body { font-size: 0.95em; }
}
</style>
