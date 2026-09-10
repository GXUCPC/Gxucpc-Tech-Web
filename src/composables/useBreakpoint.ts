import { readonly, ref, type Ref } from 'vue'

/**
 * 全局断点/媒体特性响应式状态（模块级单例，所有组件共享同一组 matchMedia 监听）
 *
 * - isMobile：≤768 手机
 * - isTouch：≤1024 手机 + 平板（与 styles/_tokens.scss 的 $bp-md 对应）
 * - isWide：>1920 大屏（与 $bp-xl 对应）
 * - reduceMotion：系统「减少动态效果」开启
 */
const QUERIES = {
  isMobile: '(max-width: 768px)',
  isTouch: '(max-width: 1024px)',
  isWide: '(min-width: 1921px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const

type BreakpointKey = keyof typeof QUERIES
type BreakpointState = Readonly<Record<BreakpointKey, Ref<boolean>>>

const state: Record<BreakpointKey, Ref<boolean>> = {} as Record<BreakpointKey, Ref<boolean>>

for (const key of Object.keys(QUERIES) as BreakpointKey[]) {
  const mql = window.matchMedia(QUERIES[key])
  const value = ref(mql.matches)
  mql.addEventListener('change', (e) => {
    value.value = e.matches
  })
  state[key] = readonly(value)
}

export function useBreakpoint(): BreakpointState {
  return state
}
