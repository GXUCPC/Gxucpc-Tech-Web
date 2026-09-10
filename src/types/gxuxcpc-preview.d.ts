/**
 * Types for the brand-preview modules kept under public/ for the standalone
 * logo demo. They are imported by Vue components but are not compiled from
 * TypeScript source.
 */
declare module '*geometry.js' {
  export const VIEWBOX: { width: number; height: number }
}

declare module '*segments.js' {
  export const SEGMENTS: Array<{ id: string; family: string }>
}

declare module '*motion.js' {
  type MotionState = 'paused' | 'idle' | 'compressing' | 'expanding'

  interface MotionTimeline {
    readonly progress: number
    readonly target: number
    readonly running: boolean
    speed: number
    pause(): void
    seek(value: number): void
    to(value: number, immediate?: boolean): void
  }

  export const GXU_XCPC_MOTION: {
    stages: { fold: number }
    hoverIntent: number
    scrollCollapse: number
    scrollExpand: number
    headerDuration: number
    headerDelay: number
    easing: number[]
  }

  export function sample(
    progress: number,
    alignment?: 'start' | 'center',
    micro?: number,
  ): { paths: string[]; offset: number }

  export function createTimeline(
    render: (progress: number) => void,
    options?: {
      initial?: number
      onState?: (state: MotionState) => void
      reduced?: () => boolean
    },
  ): MotionTimeline
}
