<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import { DURATION_LONG, STAGGER_SHORT } from '@/constants/animation'
import { gsap } from 'gsap'
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

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

const props = defineProps<{
  items: StoryItem[]
}>()

const viewport = useTemplateRef<HTMLDivElement>('viewport')
const canPrev = ref(false)
const canNext = ref(false)

function updateNav() {
  const el = viewport.value
  if (!el) return
  canPrev.value = el.scrollLeft > 1
  canNext.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
}

// 部分内嵌 Chromium 会取消 behavior:'smooth' 的程序化滚动（CSS scroll-snap 也会吸附掉逐帧赋值），
// 因此这里用 rAF 自行实现平滑滚动，并把目标定为卡片对齐位置，保证任意环境下行为一致
function animateScrollTo(el: HTMLElement, target: number) {
  const start = el.scrollLeft
  const delta = target - start
  if (Math.abs(delta) < 1) return
  const duration = 480
  const startTime = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    el.scrollLeft = start + delta * (1 - Math.pow(1 - progress, 3))
    updateNav()
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function scrollPage(direction: number) {
  const el = viewport.value
  if (!el) return
  const cards = Array.from(el.querySelectorAll<HTMLElement>('.storyCard'))
  if (!cards.length) return
  const viewportLeft = el.getBoundingClientRect().left
  const targets = cards.map(
    (card) => card.getBoundingClientRect().left - viewportLeft + el.scrollLeft,
  )
  const pitch = targets.length > 1 ? targets[1]! - targets[0]! : el.clientWidth
  const perView = Math.max(1, Math.round(el.clientWidth / pitch))
  const firstVisible = Math.round(el.scrollLeft / pitch)
  const maxScroll = el.scrollWidth - el.clientWidth
  const index = Math.min(Math.max(firstVisible + direction * perView, 0), cards.length - 1)
  animateScrollTo(el, Math.min(targets[index]!, maxScroll))
}

onMounted(() => {
  updateNav()
  window.addEventListener('resize', updateNav)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateNav)
})

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
    <div ref="viewport" class="storyViewport" @scroll.passive="updateNav">
      <div class="storyTrack">
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
      </div>
    </div>
    <!-- 翻页按钮常驻（严格对照设计稿）；内容不足一屏时按钮为禁用态，为后续扩容预留 -->
    <div class="storyNav">
      <button
        type="button"
        class="storyNavBtn"
        :disabled="!canPrev"
        aria-label="上一页"
        @click="scrollPage(-1)">
        <Icon icon="mdi:arrow-left" />
      </button>
      <button
        type="button"
        class="storyNavBtn"
        :disabled="!canNext"
        aria-label="下一页"
        @click="scrollPage(1)">
        <Icon icon="mdi:arrow-right" />
      </button>
    </div>
  </ani-ele>
</template>

<style scoped lang="scss">
.storySection {
  margin: 2em 0 4em;
  padding: 0 var(--page-padding-x);
}

/* 横向轮播：隐藏滚动条，翻页由下方圆形箭头驱动（平滑滚动在组件内用 rAF 实现） */
.storyViewport {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.storyTrack {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
}

.storyCard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25em;
  box-sizing: border-box;
  /* 一页三张，预留两页共六个位置 */
  flex: 0 0 calc((100% - 3rem) / 3);
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

/* 卡片下方居中圆形翻页箭头（禁用态置灰，与原版一致） */
.storyNav {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 2.5em;
}

.storyNavBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25em;
  height: 3.25em;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background-color var(--duration-short) ease,
    border-color var(--duration-short) ease,
    opacity var(--duration-short) ease;

  svg {
    font-size: 1.5em;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.45);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
}

/* 平板（≤1024）：一屏两卡 */
@include touch {
  .storyCard {
    flex-basis: calc((100% - 1.5rem) / 2);
  }
}

/* 手机（≤768）：一屏一卡 */
@include mobile {
  .storySection {
    padding: 0 var(--page-padding-x);
    margin: 1.5em 0 3em;
  }

  .storyCard {
    flex-basis: 100%;
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
