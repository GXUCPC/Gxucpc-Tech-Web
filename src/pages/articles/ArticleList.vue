<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArticleAPI } from '@/api/article'
import ArticleCard from '@/components/ArticleCard.vue'
import type { ArticleMeta } from '@/types/article'

const articles = ref<ArticleMeta[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 12
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await ArticleAPI.getArticleList({ page: 1, size: pageSize })
    articles.value = result.items
    total.value = result.total
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loading.value = false
  }
})

async function onPageChange(page: number) {
  currentPage.value = page
  loading.value = true
  try {
    const result = await ArticleAPI.getArticleList({ page, size: pageSize })
    articles.value = result.items
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loading.value = false
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="articleListPage">
    <div class="articleListHeader">
      <h1 class="title show">文章</h1>
      <p class="articleListSubtitle">分享技术经验、赛事总结与团队动态</p>
    </div>

    <div class="articleListGrid" v-loading="loading">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <div class="articleListEmpty" v-if="!loading && articles.length === 0">
      <p>暂无文章</p>
    </div>

    <div class="articleListPagination" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.articleListPage {
  padding: 2em 3em 4em;
}

.articleListHeader {
  text-align: center;
  margin-bottom: 3em;

  .title {
    margin-bottom: 0.5em;
  }
}

.articleListSubtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1em;
}

.articleListGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.articleListEmpty {
  text-align: center;
  padding: 4em 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2em;
}

.articleListPagination {
  display: flex;
  justify-content: center;
  margin-top: 3em;
}

@media (max-width: 1024px) {
  .articleListGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .articleListPage {
    padding: 1.5em 15px 3em;
  }

  .articleListGrid {
    grid-template-columns: 1fr;
  }
}
</style>
