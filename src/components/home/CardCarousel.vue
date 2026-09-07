<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

const props = withDefaults(
  defineProps<{
    /** 轮播轨道中实际卡片数量；卡片内容通过默认插槽传入 */
    itemCount: number
    /** 轮播区域的可访问名称 */
    ariaLabel?: string
    /** 是否启用定时翻页 */
    autoPlay?: boolean
    /** 自动翻页间隔（毫秒） */
    interval?: number
    /** 到达末页后是否回到第一页 */
    loop?: boolean
  }>(),
  {
    ariaLabel: '卡片轮播',
    autoPlay: true,
    interval: 5000,
    loop: true,
  },
)

const { isMobile, isTouch, reduceMotion } = useBreakpoint()
const viewport = useTemplateRef<HTMLDivElement>('viewport')
const track = useTemplateRef<HTMLDivElement>('track')
const currentPage = ref(0)

/** 桌面三张、平板两张、手机一张；手机优先判断，避免 isTouch 覆盖它。 */
const pageSize = computed(() => {
  if (isMobile.value) return 1
  if (isTouch.value) return 2
  return 3
})

/**
 * 页码表示「当前可视窗口的第一张卡片」：桌面始终展示连续三张，
 * 例如 4 张卡片时为 1-2-3、2-3-4，而不是末页只剩一张。
 */
const pageCount = computed(() => Math.max(1, props.itemCount - pageSize.value + 1))
const pauseReasons = new Set<string>()
let settleTimer: number | undefined
let autoPlayTimer: number | undefined
let resizeObserver: ResizeObserver | undefined

function getCards(): HTMLElement[] {
  return track.value ? Array.from(track.value.children) as HTMLElement[] : []
}

function getPageTarget(page: number): number {
  const el = viewport.value
  const cards = getCards()
  if (!el || !cards.length) return 0

  const lastPageStart = Math.max(0, cards.length - pageSize.value)
  const cardIndex = Math.min(Math.max(page, 0), lastPageStart)
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
  const target = cards[cardIndex]?.offsetLeft ?? 0
  return Math.min(Math.max(target, 0), maxScroll)
}

function getNearestPage(): number {
  const el = viewport.value
  if (!el || pageCount.value <= 1) return 0

  let nearest = 0
  let distance = Number.POSITIVE_INFINITY
  for (let page = 0; page < pageCount.value; page += 1) {
    const currentDistance = Math.abs(el.scrollLeft - getPageTarget(page))
    if (currentDistance < distance) {
      nearest = page
      distance = currentDistance
    }
  }
  return nearest
}

function clearSettleTimer() {
  if (settleTimer !== undefined) {
    window.clearTimeout(settleTimer)
    settleTimer = undefined
  }
}

function clearAutoPlayTimer() {
  if (autoPlayTimer !== undefined) {
    window.clearInterval(autoPlayTimer)
    autoPlayTimer = undefined
  }
}

function scrollToPage(page: number, behavior: ScrollBehavior = 'smooth') {
  const el = viewport.value
  if (!el) return

  clearSettleTimer()
  const target = getPageTarget(page)
  currentPage.value = page

  // 原生 scroll-snap 负责触摸滑动，程序化翻页负责把每次操作限制在一个完整页面。
  el.scrollTo({
    left: target,
    behavior: reduceMotion.value ? 'auto' : behavior,
  })
}

function normalizePage(page: number): number {
  if (pageCount.value <= 1) return 0
  if (props.loop) {
    return (page % pageCount.value + pageCount.value) % pageCount.value
  }
  return Math.min(Math.max(page, 0), pageCount.value - 1)
}

function goToPage(page: number, direction = 0) {
  const nextPage = normalizePage(page)
  const wraps = props.loop && pageCount.value > 1 &&
    ((direction > 0 && currentPage.value === pageCount.value - 1) ||
      (direction < 0 && currentPage.value === 0))

  // 循环切换不让用户看到跨越整条轨道的长距离动画，直接回到对应页首。
  scrollToPage(nextPage, wraps ? 'auto' : 'smooth')
  startAutoPlay()
}

function scrollPage(direction: number) {
  goToPage(currentPage.value + direction, direction)
}

function settleScroll() {
  settleTimer = undefined
  const page = getNearestPage()
  currentPage.value = page
  const target = getPageTarget(page)
  const el = viewport.value
  if (el && Math.abs(el.scrollLeft - target) > 1) {
    scrollToPage(page)
  }
  startAutoPlay()
}

function handleScroll() {
  currentPage.value = getNearestPage()
  clearSettleTimer()
  settleTimer = window.setTimeout(settleScroll, 120)
}

function pauseAutoPlay(reason: string) {
  pauseReasons.add(reason)
  clearAutoPlayTimer()
}

function resumeAutoPlay(reason: string) {
  pauseReasons.delete(reason)
  startAutoPlay()
}

function startAutoPlay() {
  clearAutoPlayTimer()
  if (
    !props.autoPlay ||
    !props.loop ||
    pageCount.value <= 1 ||
    reduceMotion.value ||
    pauseReasons.size > 0
  ) {
    return
  }

  autoPlayTimer = window.setInterval(() => {
    if (!document.hidden) scrollPage(1)
  }, Math.max(2500, props.interval))
}

function handleVisibilityChange() {
  if (document.hidden) pauseAutoPlay('visibility')
  else resumeAutoPlay('visibility')
}

async function syncAfterLayout() {
  await nextTick()
  if (!viewport.value || !track.value) return
  const page = Math.min(currentPage.value, pageCount.value - 1)
  currentPage.value = page
  scrollToPage(page, 'auto')
  startAutoPlay()
}

watch([pageSize, () => props.itemCount], syncAfterLayout)
watch(reduceMotion, () => {
  if (reduceMotion.value) clearAutoPlayTimer()
  else startAutoPlay()
})

onMounted(async () => {
  await syncAfterLayout()
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (viewport.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      void syncAfterLayout()
    })
    resizeObserver.observe(viewport.value)
  } else {
    // 旧浏览器没有 ResizeObserver 时，窗口尺寸变化仍需重新计算末页位置。
    window.addEventListener('resize', syncAfterLayout)
  }
})

onBeforeUnmount(() => {
  clearSettleTimer()
  clearAutoPlayTimer()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', syncAfterLayout)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section
    class="cardCarousel"
    role="region"
    aria-roledescription="carousel"
    :aria-label="props.ariaLabel">
    <div
      ref="viewport"
      class="cardCarouselViewport"
      tabindex="-1"
      @scroll.passive="handleScroll"
      @mouseenter="pauseAutoPlay('pointer')"
      @mouseleave="resumeAutoPlay('pointer')"
      @focusin="pauseAutoPlay('focus')"
      @focusout="resumeAutoPlay('focus')"
      @pointerdown="pauseAutoPlay('touch')"
      @pointerup="resumeAutoPlay('touch')"
      @pointercancel="resumeAutoPlay('touch')">
      <div
        ref="track"
        class="cardCarouselTrack">
        <slot />
      </div>
    </div>

    <div
      v-if="pageCount > 1"
      class="cardCarouselControls"
      :class="{ 'cardCarouselControls--indicatorOnly': isTouch }">
      <button
        v-if="!isTouch"
        type="button"
        class="cardCarouselButton"
        aria-label="上一页"
        @click="scrollPage(-1)">
        <Icon icon="mdi:arrow-left" aria-hidden="true" />
      </button>
      <div
        class="cardCarouselDots"
        :role="isTouch ? 'status' : 'tablist'"
        :aria-label="isTouch ? `第 ${currentPage + 1} / ${pageCount} 页` : `${props.ariaLabel}页码`">
        <template v-if="isTouch">
          <span
            v-for="page in pageCount"
            :key="page"
            class="cardCarouselDot"
            :class="{ active: currentPage === page - 1 }"
            aria-hidden="true"></span>
        </template>
        <button
          v-else
          v-for="page in pageCount"
          :key="page"
          type="button"
          class="cardCarouselDot"
          role="tab"
          :aria-label="`第 ${page} 页`"
          :aria-selected="currentPage === page - 1"
          :class="{ active: currentPage === page - 1 }"
          @click="goToPage(page - 1)"></button>
      </div>
      <button
        v-if="!isTouch"
        type="button"
        class="cardCarouselButton"
        aria-label="下一页"
        @click="scrollPage(1)">
        <Icon icon="mdi:arrow-right" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cardCarousel {
  width: 100%;
  min-width: 0;
}

.cardCarouselViewport {
  width: 100%;
  min-width: 0;
  /* 桌面端仅通过下方按钮或页标切换，禁用横向手势/滚轮滚动。 */
  overflow-x: hidden;
  overflow-y: hidden;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
  outline: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 4px;
  }
}

.cardCarouselTrack {
  display: flex;
  /* 单行 flex 自动以最高卡片确定交叉轴尺寸，并拉伸其余卡片到相同高度。 */
  align-items: stretch;
  gap: 1.5rem;
  width: 100%;
  min-width: 100%;
}

/* 插槽中的每个直接子节点就是一张卡片，滑动停止时从任一张卡片的左边缘吸附。 */
.cardCarouselTrack > :deep(*) {
  flex: 0 0 calc((100% - 3rem) / 3);
  min-width: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.cardCarouselControls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;
}

.cardCarouselButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background-color var(--duration-short) ease, border-color var(--duration-short) ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.45);
  }

  svg {
    font-size: 1.25rem;
  }
}

.cardCarouselDots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cardCarouselDot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: transform var(--duration-short) ease, background-color var(--duration-short) ease;

  &.active {
    transform: scale(1.25);
    background: var(--el-color-primary);
  }
}

.cardCarouselControls--indicatorOnly .cardCarouselDot {
  cursor: default;
}

/* 平板一页两张。 */
@include touch {
  .cardCarouselViewport {
    overflow-x: auto;
  }

  .cardCarouselTrack > :deep(*) {
    flex-basis: calc((100% - 1.5rem) / 2);
  }
}

/* 手机一页一张，卡片宽度与视口完全一致。 */
@include mobile {
  .cardCarouselTrack {
    gap: 1rem;
  }

  .cardCarouselTrack > :deep(*) {
    flex-basis: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  .cardCarouselControls {
    margin-top: 1.25rem;
  }
}
</style>
