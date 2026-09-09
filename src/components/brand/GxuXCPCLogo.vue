<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { VIEWBOX } from '../../../public/previews/gxuxcpc/geometry.js'
import { GXU_XCPC_MOTION, createTimeline, sample } from '../../../public/previews/gxuxcpc/motion.js'
import { SEGMENTS } from '../../../public/previews/gxuxcpc/segments.js'

type LogoState = 'expanded' | 'intermediate' | 'compact'
type LogoAlignment = 'start' | 'center'
type Trigger = 'hover' | 'scroll' | 'controlled'

const LOGO_PROGRESS: Record<LogoState, number> = {
  expanded: 0,
  intermediate: GXU_XCPC_MOTION.stages.fold,
  compact: 1,
}
const props = withDefaults(
  defineProps<{
    state?: LogoState
    interactive?: boolean
    trigger?: Trigger
    align?: LogoAlignment
    theme?: 'auto' | 'light' | 'dark' | 'inherit'
    responsive?: boolean
    mobileExpanded?: boolean
    scrollTarget?: HTMLElement | null
    progress?: number
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
const canInteract = computed(() => props.interactive && ['hover', 'scroll'].includes(props.trigger))
const expanded = computed(() => !transitioning.value && currentState.value === 'expanded')
const compact = computed(() => !transitioning.value && currentState.value === 'compact')
const initialProgress = props.progress ?? LOGO_PROGRESS[props.state]
const initialFrame = sample(initialProgress, props.align)
let timeline: ReturnType<typeof createTimeline> | undefined
let pathElements: SVGPathElement[] = []
let lastPaths: string[] = []
let lastOffset = Number.NaN
let hoverTimer: ReturnType<typeof setTimeout> | undefined
let touchTimer: ReturnType<typeof setTimeout> | undefined
let stopScroll: (() => void) | undefined
const cleanups: (() => void)[] = []

function stateAt(progress: number): LogoState | 'paused' {
  if (progress === LOGO_PROGRESS.expanded) return 'expanded'
  if (progress === LOGO_PROGRESS.intermediate) return 'intermediate'
  if (progress === LOGO_PROGRESS.compact) return 'compact'
  return 'paused'
}

function render(progress: number) {
  const frame = sample(progress, props.align)
  for (let i = 0; i < pathElements.length; i++) {
    if (lastPaths[i] !== frame.paths[i]) pathElements[i]!.setAttribute('d', frame.paths[i]!)
  }
  lastPaths = frame.paths
  if (frame.offset !== lastOffset)
    group.value?.setAttribute('transform', `translate(${frame.offset} 0)`)
  lastOffset = frame.offset
  if (root.value) root.value.dataset.progress = progress.toFixed(4)
  currentState.value = stateAt(progress)
}

function desiredState(): LogoState {
  if (canInteract.value && activated.value) return activated.value
  if (canInteract.value && (hovered.value || focused.value)) return 'expanded'
  const base = props.trigger === 'scroll' ? (scrolled.value ? 'compact' : 'expanded') : props.state
  // Header uses the same scroll direction on every viewport: readable at the top,
  // encoded after scrolling. The open mobile menu keeps its full wordmark.
  if (props.responsive && isMobile.value) return props.mobileExpanded ? 'expanded' : base
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
  }, GXU_XCPC_MOTION.hoverIntent)
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    hovered.value = false
    sync()
  }, GXU_XCPC_MOTION.hoverIntent)
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
  }, 2400)
}

function dismiss() {
  clearTimeout(hoverTimer)
  clearTimeout(touchTimer)
  hovered.value = false
  focused.value = false
  activated.value = null
  sync()
}

function attachScroll() {
  stopScroll?.()
  if (props.trigger !== 'scroll') return
  const source = props.scrollTarget ?? window
  const update = () => {
    const y = source instanceof Window ? source.scrollY : source.scrollTop
    const next = scrolled.value
      ? y >= GXU_XCPC_MOTION.scrollExpand
      : y > GXU_XCPC_MOTION.scrollCollapse
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

onMounted(() => {
  const media: [string, typeof isMobile][] = [
    ['(max-width: 640px)', isMobile],
    ['(min-width: 641px) and (max-width: 1000px)', isTablet],
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
  timeline = createTimeline(render, {
    initial: initialProgress,
    reduced: () => reducedMotion.value,
    onState: (state: string) => {
      transitioning.value = state === 'compressing' || state === 'expanding'
      emit('state-change', transitioning.value ? 'transitioning' : currentState.value)
    },
  })
  timeline.speed = props.playbackRate
  attachScroll()
  sync(true)

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
  pause: () => timeline?.pause(),
  getProgress: () => timeline?.progress ?? initialProgress,
})
</script>

<template>
  <component
    :is="canInteract ? 'button' : 'span'"
    ref="root"
    class="gxuxcpc-logo"
    :class="[`gxuxcpc-logo--${theme}`, { 'gxuxcpc-logo--interactive': canInteract }]"
    :type="canInteract ? 'button' : undefined"
    :aria-label="
      canInteract ? `GxuXCPC，${targetState === 'expanded' ? '收起' : '展开'}品牌标志` : undefined
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
      :viewBox="`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`"
      xmlns="http://www.w3.org/2000/svg"
      :role="canInteract ? undefined : 'img'"
      :aria-label="canInteract ? undefined : 'GxuXCPC'"
      :aria-hidden="canInteract ? true : undefined"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
      stroke-linejoin="bevel">
      <g ref="group" :transform="`translate(${initialFrame.offset} 0)`">
        <path
          v-for="(path, index) in SEGMENTS"
          :key="path.id"
          :data-part="path.id"
          data-kind="segment"
          :data-letter="path.family"
          :d="initialFrame.paths[index]" />
      </g>
    </svg>
  </component>
</template>

<style scoped lang="scss">
.gxuxcpc-logo {
  display: inline-flex;
  position: relative;
  flex: 0 0 auto;
  width: var(--logo-width, 228px);
  max-width: 100%;
  aspect-ratio: 1024 / 240;
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
  .gxuxcpc-logo--auto {
    color: #f2f2f0;
  }
}

:global(.dark) .gxuxcpc-logo--auto,
:global([data-theme='dark']) .gxuxcpc-logo--auto {
  color: #f2f2f0;
}
</style>
