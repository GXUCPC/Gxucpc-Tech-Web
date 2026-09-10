<script setup lang="ts">
import type { ArticleMeta } from '@/types/article'
import { Icon } from '@iconify/vue'

defineProps<{
  article: ArticleMeta
}>()
</script>

<template>
  <router-link :to="`/articles/${article.id}`" class="articleCard">
    <div class="articleCardCover">
      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
        class="articleCardCoverImg"
        @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
      />
      <div v-if="!article.cover" class="articleCardCoverPlaceholder">
        <Icon icon="mdi:file-document-outline" width="32" />
      </div>
    </div>
    <div class="articleCardBody">
      <div class="articleCardTags" v-if="article.tags && article.tags.length">
        <span v-for="tag in article.tags" :key="tag" class="articleCardTag">{{ tag }}</span>
      </div>
      <h3 class="articleCardTitle">{{ article.title }}</h3>
      <p class="articleCardSummary" v-if="article.summary">{{ article.summary }}</p>
      <div class="articleCardMeta">
        <span class="articleCardDate">{{ article.date }}</span>
        <span class="articleCardAuthor" v-if="article.author">{{ article.author }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped lang="scss">
.articleCard {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}

.articleCardCover {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}

.articleCardCoverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.articleCardCoverPlaceholder {
  color: rgba(255, 255, 255, 0.2);
}

.articleCardBody {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  flex: 1;
}

.articleCardTags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.articleCardTag {
  font-size: 0.8em;
  font-family: monospace;
  color: rgba(96, 165, 250, 0.95);
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.25);
  padding: 2px 10px;
  border-radius: 6px;
}

.articleCardTitle {
  font-size: 1.15em;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.articleCardSummary {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.articleCardMeta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.articleCardAuthor {
  &::before {
    content: '·';
    margin-right: 12px;
  }
}
</style>
