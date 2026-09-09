<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import CardCarousel from '@/components/home/CardCarousel.vue'
import { DURATION_LONG, STAGGER_SHORT } from '@/constants/animation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { gsap } from 'gsap'
import { Icon } from '@iconify/vue'
import { computed, defineProps, nextTick, ref, useTemplateRef, watch, withDefaults } from 'vue'

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
  /** 个人竞赛奖项；队员主视觉卡片中单独展示 */
  awards?: StoryQuoteItem[]
  /** 卡片底部备注（对应原版「阅读案例研究」的位置） */
  footer?: string
}

const props = withDefaults(
  defineProps<{
    items: StoryItem[]
    ariaLabel?: string
    /** 队员使用主视觉卡片，其余内容保留原有故事卡片形式 */
    variant?: 'stories' | 'member-showcase'
  }>(),
  {
    ariaLabel: '优秀队员',
    variant: 'stories',
  },
)

const isMemberShowcase = computed(() => props.variant === 'member-showcase')
const { reduceMotion } = useBreakpoint()
const activeMemberPage = ref(0)
const thumbnailNav = useTemplateRef<HTMLElement>('thumbnailNav')

function handlePageChange(page: number) {
  if (isMemberShowcase.value) activeMemberPage.value = page
}

watch(activeMemberPage, async (page) => {
  await nextTick()
  const nav = thumbnailNav.value
  const activeThumbnail = nav?.querySelectorAll<HTMLButtonElement>('.memberStoryThumbnail')[page]
  if (!nav || !activeThumbnail) return

  // 只滚动缩略图栏本身；scrollIntoView 会连同页面祖先一起滚动，自动轮播时会打断阅读位置。
  const targetLeft = activeThumbnail.offsetLeft - (nav.clientWidth - activeThumbnail.offsetWidth) / 2
  const maxScrollLeft = Math.max(0, nav.scrollWidth - nav.clientWidth)
  nav.scrollTo({
    left: Math.min(Math.max(targetLeft, 0), maxScrollLeft),
    behavior: reduceMotion.value ? 'auto' : 'smooth',
  })
})

function scrollInAni(ele: HTMLDivElement) {
  const tl = gsap.timeline()
  tl.from(ele.querySelectorAll('.storyCard, .memberStoryCard'), {
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
  <ani-ele
    class="storySection"
    :class="{ 'storySection--member': isMemberShowcase }"
    :scroll-in-ani="scrollInAni">
    <CardCarousel
      :item-count="props.items.length"
      :items-per-page="isMemberShowcase ? 1 : undefined"
      :aria-label="props.ariaLabel"
      @page-change="handlePageChange">
      <!-- 优秀队员：参考主视觉轮播，以头像缩略图作为页标。 -->
      <template v-if="isMemberShowcase">
        <article v-for="(item, i) in props.items" :key="i" class="memberStoryCard">
          <div
            v-if="item.avatar"
            class="memberStoryBackdrop"
            :style="{ backgroundImage: `url(&quot;${item.avatar}&quot;)` }"
            aria-hidden="true"></div>

          <div class="memberStoryContent">
            <div class="memberStoryMedia">
              <div v-if="item.avatar" class="memberStoryAvatarFrame">
                <img :src="item.avatar" :alt="item.name" />
              </div>
              <div v-else class="memberStoryPortraitFallback" aria-hidden="true">
                {{ item.name.slice(0, 1) }}
              </div>
            </div>

            <div class="memberStoryDetails">
              <div class="memberStoryIdentity">
                <h3 class="memberStoryName">{{ item.name }}</h3>
                <p v-if="item.quote" class="memberStoryQuote">&ldquo;{{ item.quote }}&rdquo;</p>
                <p v-else-if="item.footer" class="memberStoryQuote">{{ item.footer }}</p>
                <p v-else class="memberStoryQuote memberStoryQuote--empty" aria-hidden="true">&nbsp;</p>
              </div>

              <div class="memberStoryProfile">
                <section class="memberStoryProfileItem" :aria-label="item.info || item.infoSuffix ? '履历' : undefined">
                  <p v-if="item.info || item.infoSuffix" class="memberStoryInfo">
                    <span v-if="item.info" class="memberStoryInfoHighlight">{{ item.info }}</span>
                    <span v-if="item.infoSuffix" class="memberStoryInfoSuffix">{{ item.infoSuffix }}</span>
                  </p>
                  <p v-else class="memberStoryInfo memberStoryInfo--empty" aria-hidden="true">&nbsp;</p>
                </section>

                <section
                  class="memberStoryAwards"
                  :class="{ 'memberStoryAwards--empty': !item.awards?.length }"
                  :aria-label="item.awards?.length ? `${item.name}的竞赛奖项` : undefined">
                  <ul>
                    <li v-for="(award, awardIndex) in item.awards" :key="awardIndex">
                      <Icon
                        v-if="award.icon"
                        :icon="award.icon"
                        :style="award.color ? { color: award.color } : undefined"
                        aria-hidden="true" />
                      <span :style="award.color ? { color: award.color } : undefined">{{ award.text }}</span>
                    </li>
                    <li v-if="!item.awards?.length" class="memberStoryAwardPlaceholder" aria-hidden="true">&nbsp;</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </article>
      </template>

      <!-- 优秀队伍沿用既有故事卡片，避免此次视觉改造影响其他板块。 -->
      <template v-else>
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
      </template>

      <template v-if="isMemberShowcase" #controls="{ currentPage, goToPage }">
        <nav ref="thumbnailNav" class="memberStoryThumbnails" aria-label="选择优秀队员">
          <button
            v-for="(item, i) in props.items"
            :key="i"
            type="button"
            role="tab"
            class="memberStoryThumbnail"
            :class="{ active: currentPage === i }"
            :aria-label="`查看${item.name}`"
            :aria-selected="currentPage === i"
            :tabindex="currentPage === i ? 0 : -1"
            @click="goToPage(i)">
            <img v-if="item.avatar" :src="item.avatar" :alt="item.name" />
            <span v-else aria-hidden="true">{{ item.name.slice(0, 1) }}</span>
          </button>
        </nav>
      </template>

      <template v-if="isMemberShowcase" #overlay="{ scrollPage }">
        <button
          type="button"
          class="memberStoryArrow memberStoryArrow--previous"
          aria-label="上一位优秀队员"
          @click="scrollPage(-1)">
          <Icon icon="mdi:chevron-left" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="memberStoryArrow memberStoryArrow--next"
          aria-label="下一位优秀队员"
          @click="scrollPage(1)">
          <Icon icon="mdi:chevron-right" aria-hidden="true" />
        </button>
      </template>
    </CardCarousel>
  </ani-ele>
</template>

<style scoped lang="scss">
.storySection {
  margin: 2em 0 4em;
  padding: 0 var(--page-padding-x);
}

/* 移动端仅保留滑动和缩略图页标，不展示两侧翻页箭头。 */
.memberStoryArrow {
  display: none;
}

/* 队员主视觉在宽屏下收成更聚焦的阅读宽度；其他卡片保持原有全宽布局。 */
@include desktop {
  .storySection--member :deep(.cardCarouselViewport) {
    position: relative;
    z-index: 1;
    width: min(100%, 64rem);
    margin-inline: auto;
  }

  .storySection--member :deep(.cardCarouselControls) {
    position: relative;
    z-index: 1;
  }

  .memberStoryArrow {
    position: absolute;
    /* 与主卡片居中：不计入底部 1.5rem 间距和 4rem 缩略图导航。 */
    top: calc(50% - 2.75rem);
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(4rem, 9vw, 8rem);
    height: clamp(8rem, 22vw, 14rem);
    padding: 0;
    background: transparent;
    border: 0;
    color: rgba(255, 255, 255, 0.11);
    cursor: pointer;
    transform: translateY(-50%);
    transition: color var(--duration-short) ease, transform var(--duration-short) ease;

    svg {
      font-size: clamp(5rem, 13vw, 14rem);
      stroke-width: 0.75;
    }

    &:hover {
      color: rgba(255, 255, 255, 0.35);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 3px;
      color: rgba(255, 255, 255, 0.48);
    }
  }

  .memberStoryArrow--previous {
    left: max(1.5rem, calc(50% - 42rem));
  }

  .memberStoryArrow--next {
    right: max(1.5rem, calc(50% - 42rem));
  }
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

/* 优秀队员主视觉卡片：大头像承载视觉重心，文字与奖项在右侧保持可扫读。 */
.memberStoryCard {
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: min(23rem, 42vw);
  overflow: hidden;
  background:
    radial-gradient(circle at 89% 10%, rgba(64, 158, 255, 0.18), transparent 27%),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: border-color var(--duration-short) ease, background-color var(--duration-short) ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.065);
    border-color: rgba(64, 158, 255, 0.5);

    .memberStoryAvatarFrame img {
      transform: scale(1.04);
    }
  }
}

.memberStoryBackdrop {
  position: absolute;
  inset: -3rem;
  z-index: 0;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  filter: blur(2.5rem);
  opacity: 0.24;
  transform: scale(1.08);
  pointer-events: none;
}

.memberStoryContent {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(10rem, 0.65fr) minmax(0, 1.35fr);
  gap: clamp(1.25rem, 3vw, 3rem);
  align-items: center;
  min-width: 0;
  padding: clamp(1.5rem, 3vw, 2.75rem) clamp(1.25rem, 4vw, 4rem);
}

.memberStoryMedia {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.memberStoryAvatarFrame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 14rem);
  aspect-ratio: 1;
  overflow: hidden;
  padding: clamp(0.35rem, 0.8vw, 0.65rem);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 0.75rem;
  box-shadow: 0 1.25rem 3.25rem rgba(0, 0, 0, 0.35);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 0.4rem;
    transition: transform var(--duration-long) ease;
  }
}

.memberStoryPortraitFallback {
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 7rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
}

.memberStoryIndex {
  position: absolute;
  right: 0;
  bottom: -1.35rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.78);
}

.memberStoryDetails {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  align-self: stretch;
  min-width: 0;
}

.memberStoryName {
  margin: 0.45rem 0 0;
  font-size: clamp(2rem, 3.2vw, 3.5rem);
  line-height: 1.15;
  color: #fff;
}

.memberStoryIdentity,
.memberStoryProfile {
  width: 100%;
}

.memberStoryProfile {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2vw, 2rem);
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}

.memberStoryInfo {
  min-height: 1.7em;
  margin: 0.7rem 0 0;
  font-size: clamp(1rem, 1.45vw, 1.25rem);
  line-height: 1.7;
}

.memberStoryInfoHighlight {
  font-weight: 600;
  color: var(--el-color-primary);
}

.memberStoryInfoSuffix {
  color: rgba(255, 255, 255, 0.68);
}

.memberStoryAwards {
  width: 100%;
  margin: 0;

  ul {
    display: grid;
    align-content: start;
    gap: 0.75rem;
    margin: 0.9rem 0 0;
    min-height: calc(3.2em + 0.75rem);
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.55rem;
    align-items: start;
    font-size: 0.98rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.86);
  }

  svg {
    margin-top: 0.2rem;
    color: #e6a23c;
  }
}

.memberStoryQuote--empty,
.memberStoryInfo--empty,
.memberStoryAwardPlaceholder {
  visibility: hidden;
}

.memberStoryQuote {
  min-height: 1.6em;
  margin: 0.7rem 0 0;
  padding: 0;
  font-style: italic;
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
}

/* 缩略图同时是可访问的页签；宽度固定，窄屏可横向拖动而不压缩头像。 */
.memberStoryThumbnails {
  display: flex;
  justify-content: center;
  max-width: 100%;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.memberStoryThumbnail {
  flex: 0 0 3.5rem;
  width: 3.5rem;
  height: 3.5rem;
  overflow: hidden;
  padding: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid transparent;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  opacity: 0.62;
  transition: opacity var(--duration-short) ease, border-color var(--duration-short) ease,
    transform var(--duration-short) ease;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover,
  &:focus-visible,
  &.active {
    opacity: 1;
    border-color: var(--el-color-primary);
  }

  &:hover {
    transform: translateY(-0.2rem);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
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

  .memberStoryCard {
    min-height: 0;
  }

  .memberStoryContent {
    grid-template-areas:
      'media identity'
      'profile profile';
    grid-template-columns: 4.75rem minmax(0, 1fr);
    column-gap: 0.9rem;
    row-gap: 1rem;
    align-items: start;
    min-height: 0;
    padding: 1rem;
  }

  .memberStoryMedia {
    grid-area: media;
    justify-content: flex-start;
  }

  .memberStoryAvatarFrame {
    width: 4.75rem;
  }

  .memberStoryIndex {
    display: none;
  }

  .memberStoryDetails {
    display: contents;
  }

  .memberStoryIdentity {
    grid-area: identity;
    align-self: start;
    min-width: 0;
  }

  .memberStoryProfile {
    grid-area: profile;
    gap: 0.85rem;
    margin-top: 0;
    padding-top: 0;
  }

  .memberStoryInfo {
    margin: 0;
  }

  .memberStoryName {
    margin: 0;
    font-size: 1.6rem;
  }

  .memberStoryQuote {
    margin-top: 0.3rem;
    font-size: 0.9rem;
  }

  .memberStoryAwards {
    margin: 0;

    ul {
      margin-top: 0;
      gap: 0.45rem;
      min-height: calc(3.2em + 0.45rem);
    }
  }

  .memberStoryThumbnails {
    justify-content: flex-start;
    width: 100%;
    gap: 0.6rem;
    padding-inline: 0.2rem;
  }

  .memberStoryThumbnail {
    flex-basis: 3.125rem;
    width: 3.125rem;
    height: 3.125rem;
  }
}
</style>
