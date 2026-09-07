<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import CardCarousel from '@/components/home/CardCarousel.vue'
import { DURATION_LONG, STAGGER_SHORT } from '@/constants/animation'
import { gsap } from 'gsap'
import { Icon } from '@iconify/vue'
import { withDefaults, defineProps } from 'vue'

// 仿 JetBrains「Customer Stories」卡片：
// 头部（圆形头像 + 姓名 + 高亮简介）、引述正文、底部备注，卡片下方居中圆形翻页箭头
export interface StoryQuoteItem {
  /** 行首图标（iconify 名称） */
  icon?: string
  /** 图标与文本颜色（银/金/铜等） */
  color?: string
  /** 奖项文本：超出卡片宽度时单行省略，悬停显示全文 */
  text: string
}

export interface StoryItem {
  /** 头像图片（人员） */
  avatar?: string
  /** 姓名 / 队名 */
  name: string
  /** 年级水印（队伍用，沿用原版艺术字样式） */
  watermark?: string
  /** 简介（高亮部分，对应原版蓝色职务文字） */
  info?: string
  /** 简介后的灰色补充说明 */
  infoSuffix?: string
  /** 引述正文（纯文本，自动包裹引号） */
  quote?: string
  /** 引述正文（结构化行，如奖项列表） */
  quoteItems?: StoryQuoteItem[]
  /** 卡片底部备注（对应原版「阅读案例研究」的位置） */
  footer?: string
}

const props = withDefaults(
  defineProps<{
    items: StoryItem[]
    ariaLabel?: string
  }>(),
  {
    ariaLabel: '优秀队员',
  },
)

function scrollInAni(ele: HTMLDivElement) {
  const tl = gsap.timeline()
  tl.from(ele.querySelectorAll('.storyCard'), {
    duration: DURATION_LONG,
    ease: 'power2.out',
    y: 40,
    autoAlpha: 0,
    stagger: STAGGER_SHORT,
    clearProps: 'transform,opacity',
  })
  return tl
}
</script>

<template>
  <ani-ele class="storySection" :scroll-in-ani="scrollInAni">
    <CardCarousel :item-count="props.items.length" :aria-label="props.ariaLabel">
      <div v-for="(item, i) in props.items" :key="i" class="storyCard">
        <div v-if="item.watermark" class="storyWatermark">{{ item.watermark }}</div>
        <div class="storyHeader">
          <div v-if="item.avatar" class="storyAvatar">
            <img :src="item.avatar" :alt="item.name" />
          </div>
          <div class="storyHeading">
            <div class="storyName">{{ item.name }}</div>
            <div v-if="item.info || item.infoSuffix" class="storyInfo">
              <span v-if="item.info" class="storyInfoHighlight">{{ item.info }}</span>
              <span v-if="item.infoSuffix" class="storyInfoSuffix">{{ item.infoSuffix }}</span>
            </div>
          </div>
        </div>
        <div v-if="item.quote" class="storyQuote">&ldquo;{{ item.quote }}&rdquo;</div>
        <div v-else-if="item.quoteItems" class="storyQuote storyQuoteLines">
          <div v-for="(line, j) in item.quoteItems" :key="j" class="storyQuoteLine">
            <Icon
              v-if="line.icon"
              class="storyQuoteIcon"
              :icon="line.icon"
              :style="line.color ? { color: line.color } : undefined" />
            <span class="storyQuoteText" :style="line.color ? { color: line.color } : undefined">
              {{ line.text }}
            </span>
          </div>
        </div>
        <div v-if="item.footer" class="storyFooter">{{ item.footer }}</div>
      </div>
    </CardCarousel>
  </ani-ele>
</template>

<style scoped lang="scss">
.storySection {
  margin: 2em 0 4em;
  padding: 0 var(--page-padding-x);
}

.storyCard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25em;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  padding: 1.75em 1.5em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: border-color var(--duration-short) ease,
    background-color var(--duration-short) ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

/* 年级艺术字水印：沿用原版队伍卡片的斜体粗字样式 */
.storyWatermark {
  position: absolute;
  top: -0.15em;
  right: 0.15em;
  z-index: 0;
  font-style: italic;
  font-size: 4em;
  font-weight: 900;
  line-height: 1;
  color: var(--el-color-primary);
  opacity: 0.3;
  user-select: none;
  pointer-events: none;
}

.storyHeader {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1em;
}

.storyAvatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 4em;
  height: 4em;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.storyHeading {
  min-width: 0;
}

.storyName {
  font-size: 1.3em;
  font-weight: bold;
  line-height: 1.4;
  color: #fff;
}

.storyInfo {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.4em;
  margin-top: 0.35em;
  font-size: 0.95em;
  line-height: 1.55;
}

.storyInfoHighlight {
  color: var(--el-color-primary);
  font-weight: 600;
}

.storyInfoSuffix {
  color: rgba(255, 255, 255, 0.65);
}

.storyQuote {
  position: relative;
  z-index: 1;
  font-size: 1.05em;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.85);
}

.storyQuoteLines {
  display: flex;
  flex-direction: column;
  gap: 0.75em;

  /* 图标列 + 文本列：窄屏下文本在图标右侧自然换行，而不是整段掉到图标下方 */
  .storyQuoteLine {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 0.5em;
    align-items: start;
    line-height: 1.6;
    min-width: 0;
  }

  .storyQuoteIcon {
    font-size: 1.05em;
  }
}

.storyFooter {
  margin-top: auto;
  padding-top: 0.5em;
  font-style: italic;
  font-size: 0.95em;
  color: rgba(255, 255, 255, 0.5);
}

/* 手机端卡片内部微调；列数和吸附行为由 CardCarousel 统一处理。 */
@include mobile {
  .storySection {
    padding: 0 var(--page-padding-x);
    margin: 1.5em 0 3em;
  }

  .storyAvatar {
    width: 3.5em;
    height: 3.5em;
  }

  .storyName {
    font-size: 1.15em;
  }

  .storyWatermark {
    font-size: 2.8em;
  }
}
</style>
