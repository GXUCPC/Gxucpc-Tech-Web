<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { LOGO_VIEWBOX, type LogoAlignment, type LogoState } from './logoGeometry'
import { LOGO_SEGMENTS as LOGO_PATHS } from './logoSegments'
import { createLogoTimeline, LOGO_MOTION, LOGO_PROGRESS, sampleLogo } from './logoMotion'

const props = withDefaults(
  defineProps<{
    state?: LogoState
    interactive?: boolean
    trigger?: 'hover' | 'scroll' | 'controlled' | 'reveal'
    align?: LogoAlignment
    theme?: 'auto' | 'light' | 'dark' | 'inherit'
    responsive?: boolean
    mobileExpanded?: boolean
    scrollTarget?: HTMLElement | null
    /** Normalized contraction time, for inspection. Explicit seeking is allowed in reduced motion. */
    progress?: number
    revealOnce?: boolean
    playbackRate?: number
  }>(),
  {
    state: 'compact',
    interactive: true,
    trigger: 'hover',
    align: 'start',
    theme: 'auto',
    responsive: true,
    mobileExpanded: false,
    revealOnce: true,
    playbackRate: 1,
  },
)
const emit = defineEmits<{
  'state-change': [state: LogoState | 'transitioning' | 'paused']
  'scroll-change': [compact: boolean]
}>()

const root = ref<HTMLElement>()
const group = ref<SVGGElement>()
const transitioning = ref(false)
const currentState = ref<LogoState | 'paused'>(props.state)
const targetState = ref<LogoState>(props.state)
const isMobile = ref(false)
const isTablet = ref(false)
const reducedMotion = ref(false)
const scrolled = ref(false)
const hovered = ref(false)
const focused = ref(false)
const activated = ref<LogoState | null>(null)
const revealed = ref(false)
const canInteract = computed(() => props.interactive && ['hover', 'scroll'].includes(props.trigger))
const expanded = computed(() => !transitioning.value && currentState.value === 'expanded')
const compact = computed(() => !transitioning.value && currentState.value === 'compact')
const initialProgress =
  props.progress ?? LOGO_PROGRESS[props.trigger === 'reveal' ? 'compact' : props.state]
const initialFrame = sampleLogo(initialProgress, props.align)
let timeline: ReturnType<typeof createLogoTimeline> | undefined
let pathElements: SVGPathElement[] = []
let lastPaths: string[] = []
let lastOffset = NaN
let hoverTimer: ReturnType<typeof setTimeout> | undefined
let touchTimer: ReturnType<typeof setTimeout> | undefined
let revealTimer: ReturnType<typeof setTimeout> | undefined
let stopScroll: (() => void) | undefined
const cleanups: (() => void)[] = []

function render(progress: number) {
  const frame = sampleLogo(progress, props.align)
  for (let i = 0; i < pathElements.length; i++) {
    if (lastPaths[i] !== frame.paths[i]) pathElements[i]!.setAttribute('d', frame.paths[i]!)
  }
  lastPaths = frame.paths
  if (frame.offset !== lastOffset)
    group.value?.setAttribute('transform', `translate(${frame.offset} 0)`)
  lastOffset = frame.offset
  // This playhead is deliberately non-reactive: no Vue render or layout read per frame.
  if (root.value) root.value.dataset.progress = progress.toFixed(4)
  if (progress === 0 || progress === 1 || progress === LOGO_PROGRESS.intermediate) {
    currentState.value = progress === 0 ? 'expanded' : progress === 1 ? 'compact' : 'intermediate'
  } else currentState.value = 'paused'
}

function desiredState(): LogoState {
  if (canInteract.value && activated.value) return activated.value
  if (canInteract.value && (hovered.value || focused.value)) return 'expanded'
  const base =
    props.trigger === 'scroll'
      ? scrolled.value
        ? 'compact'
        : 'expanded'
      : props.trigger === 'reveal'
        ? revealed.value
          ? 'expanded'
          : 'compact'
        : props.state
  if (props.responsive && isMobile.value) {
    return props.mobileExpanded ? 'expanded' : props.trigger === 'scroll' ? base : 'compact'
  }
  return props.responsive && isTablet.value && base === 'expanded' ? 'intermediate' : base
}

function playTo(state: LogoState, immediate = false) {
  targetState.value = state
  timeline?.to(LOGO_PROGRESS[state], immediate || reducedMotion.value)
  if (immediate || reducedMotion.value || timeline?.progress === LOGO_PROGRESS[state]) {
    currentState.value = state
    emit('state-change', state)
  }
}

function sync(immediate = false) {
  if (props.progress !== undefined) {
    seek(props.progress)
    return
  }
  playTo(desiredState(), immediate)
}

function seek(progress: number) {
  timeline?.seek(progress)
}

function onPointerEnter(event: PointerEvent) {
  if (!canInteract.value || event.pointerType === 'touch') return
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    hovered.value = true
    sync()
  }, LOGO_MOTION.hoverDelay)
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    hovered.value = false
    sync()
  }, LOGO_MOTION.hoverDelay)
}

function onFocus() {
  if (root.value?.matches(':focus-visible')) {
    focused.value = true
    sync()
  }
}

function onBlur() {
  focused.value = false
  activated.value = null
  clearTimeout(touchTimer)
  sync()
}

function activate() {
  clearTimeout(hoverTimer)
  clearTimeout(touchTimer)
  activated.value = targetState.value === 'expanded' ? 'compact' : 'expanded'
  hovered.value = false
  focused.value = false
  sync()
  touchTimer = setTimeout(() => {
    activated.value = null
    sync()
  }, LOGO_MOTION.touchHold)
}

function dismiss() {
  clearTimeout(hoverTimer)
  clearTimeout(touchTimer)
  hovered.value = focused.value = false
  activated.value = null
  sync()
}

function attachScroll() {
  stopScroll?.()
  if (props.trigger !== 'scroll') return
  const source = props.scrollTarget ?? window
  const update = () => {
    const y = source instanceof Window ? source.scrollY : source.scrollTop
    const boundary =
      LOGO_MOTION.scrollThreshold - (scrolled.value ? LOGO_MOTION.scrollHysteresis : 0)
    const next = y > boundary
    if (next === scrolled.value) return
    scrolled.value = next
    emit('scroll-change', next)
    sync()
  }
  source.addEventListener('scroll', update, { passive: true })
  stopScroll = () => source.removeEventListener('scroll', update)
  update()
  emit('scroll-change', scrolled.value)
}

function reveal() {
  revealed.value = false
  playTo('compact', true)
  clearTimeout(revealTimer)
  revealTimer = setTimeout(
    () => {
      revealed.value = true
      sync()
    },
    reducedMotion.value ? 0 : LOGO_MOTION.revealDelay,
  )
}

onMounted(() => {
  const media: [string, typeof isMobile][] = [
    ['(max-width: 768px)', isMobile],
    ['(min-width: 769px) and (max-width: 1024px)', isTablet],
    ['(prefers-reduced-motion: reduce)', reducedMotion],
  ]
  for (const [query, state] of media) {
    const match = window.matchMedia(query)
    state.value = match.matches
    const update = () => {
      state.value = match.matches
      sync(true)
    }
    match.addEventListener('change', update)
    cleanups.push(() => match.removeEventListener('change', update))
  }
  pathElements = Array.from(group.value?.querySelectorAll('path') ?? [])
  timeline = createLogoTimeline(initialProgress, render, (running) => {
    transitioning.value = running
    emit('state-change', running ? 'transitioning' : currentState.value)
  })
  timeline.speed = props.playbackRate
  attachScroll()
  if (props.trigger === 'reveal') {
    let seen = false
    if (props.revealOnce) {
      try {
        seen = localStorage.getItem(LOGO_MOTION.revealStorageKey) === '1'
        localStorage.setItem(LOGO_MOTION.revealStorageKey, '1')
      } catch {
        /* Private storage must not prevent rendering. */
      }
    }
    if (seen || reducedMotion.value) {
      revealed.value = true
      sync(true)
    } else reveal()
  } else sync(true)

  const visibility = () => {
    if (document.hidden) timeline?.pause()
    else sync()
  }
  document.addEventListener('visibilitychange', visibility)
  cleanups.push(() => document.removeEventListener('visibilitychange', visibility))
})

watch(
  () => [props.state, props.mobileExpanded, props.responsive, props.progress],
  () => sync(),
)
watch(
  () => props.align,
  () => {
    if (timeline) render(timeline.progress)
  },
)
watch(
  () => props.playbackRate,
  (value) => {
    if (timeline) timeline.speed = value
  },
)
watch(
  () => [props.trigger, props.scrollTarget],
  () => {
    attachScroll()
    sync()
  },
)
watch(
  () => props.interactive,
  () => {
    if (!props.interactive) dismiss()
  },
)

onBeforeUnmount(() => {
  timeline?.pause()
  clearTimeout(hoverTimer)
  clearTimeout(touchTimer)
  clearTimeout(revealTimer)
  stopScroll?.()
  cleanups.forEach((cleanup) => cleanup())
})

defineExpose({
  expanded,
  compact,
  transitioning,
  currentState,
  playTo,
  seek,
  reveal,
  pause: () => timeline?.pause(),
  getProgress: () => timeline?.progress ?? initialProgress,
})
</script>

<template>
  <component
    :is="canInteract ? 'button' : 'span'"
    ref="root"
    class="gxutech-logo"
    :class="[`gxutech-logo--${theme}`, { 'gxutech-logo--interactive': canInteract }]"
    :type="canInteract ? 'button' : undefined"
    :aria-label="
      canInteract ? `GxuTech，${targetState === 'expanded' ? '收起' : '展开'}品牌标志` : undefined
    "
    :aria-expanded="canInteract ? targetState === 'expanded' : undefined"
    :data-state="transitioning ? 'transitioning' : currentState"
    :data-reduced-motion="reducedMotion"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointercancel="dismiss"
    @focus="onFocus"
    @blur="onBlur"
    @click="canInteract && activate()"
    @keydown.esc="dismiss">
    <svg
      :viewBox="`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`"
      xmlns="http://www.w3.org/2000/svg"
      :role="canInteract ? undefined : 'img'"
      :aria-label="canInteract ? undefined : 'GxuTech'"
      :aria-hidden="canInteract ? true : undefined"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
      stroke-linejoin="bevel">
      <g ref="group" :transform="`translate(${initialFrame.offset} 0)`">
        <path
          v-for="(path, index) in LOGO_PATHS"
          :key="path.id"
          :data-part="path.id"
          data-kind="segment"
          :data-letter="path.letter"
          :d="initialFrame.paths[index]" />
      </g>
    </svg>
  </component>
</template>

<style scoped lang="scss">
.gxutech-logo {
  display: inline-flex;
  position: relative;
  flex: 0 0 auto;
  width: var(--logo-width, 228px);
  max-width: 100%;
  aspect-ratio: 600 / 144;
  padding: 0;
  border: 0;
  border-radius: 2px;
  appearance: none;
  background: transparent;
  vertical-align: middle;
  line-height: 0;
  color: #171717;
  contain: layout style;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  &--interactive {
    cursor: pointer;
  }
  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 5px;
  }
  &--dark {
    color: #f2f2f0;
  }
  &--inherit {
    color: inherit;
  }
}
@media (prefers-color-scheme: dark) {
  .gxutech-logo--auto {
    color: #f2f2f0;
  }
}
:global(.dark) .gxutech-logo--auto,
:global([data-theme='dark']) .gxutech-logo--auto {
  color: #f2f2f0;
}
</style>
