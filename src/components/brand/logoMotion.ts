import { LOGO_VIEWBOX, polygonPath, type LogoAlignment, type LogoState } from './logoGeometry.ts'
import { LOGO_SEGMENTS } from './logoSegments.ts'
import {
  createStructuralAssembly,
  structuralEase,
} from '../../../public/brand/structural-assembly.js'

export const LOGO_MOTION = {
  duration: 0.72,
  easing: [0.65, 0, 0.35, 1],
  hoverDelay: 100,
  lockDuration: 0.12,
  compressEnd: 0.072,
  foldEnd: 0.49,
  mergeEnd: 0.6,
  characterStagger: 0.03,
  strokeStagger: 0.022,
  bladeStagger: 0.028,
  dualXLead: 0,
  groups: { g: ['x', 'u'], t: ['e', 'c', 'h'] },
  stockLength: 0.35,
  unlockStart: 0.06,
  seedEnd: 1 - 0.49 / 0.72,
  layoutEnd: 0.68,
  extractionEnd: 0.43,
  constructionStart: 0.4,
  constructionEnd: 0.7,
  finalLockStart: 0.84,
  finalLockPeak: 0.9,
  socketGap: 1.5,
  unlockOffset: 1,
  finalLockOffset: 1,
  revealDelay: 150,
  revealStorageKey: 'gxutech:brand-revealed:v1',
  touchHold: 2400,
  scrollThreshold: 60,
  scrollHysteresis: 8,
  headerScale: 0.94,
  headerDuration: 0.24,
  frameDeltaLimit: 50,
} as const

export const LOGO_PROGRESS: Record<LogoState, number> = {
  expanded: 0,
  intermediate: LOGO_MOTION.foldEnd / LOGO_MOTION.duration,
  compact: 1,
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))
export const logoEase = (value: number) => structuralEase(value, LOGO_MOTION.easing)
export const LOGO_ASSEMBLY = createStructuralAssembly(
  LOGO_SEGMENTS.map((s) => ({
    ...s,
    from: s.compact,
    to: s.expanded,
  })),
  LOGO_MOTION,
)

/** Compatibility readout: the average construction progress of a letter's strokes. */
export function sampleLogoCharacters(progress: number): Record<string, number> {
  const frame = LOGO_ASSEMBLY.sample(1 - clamp(progress))
  return Object.fromEntries(
    Object.values(LOGO_MOTION.groups)
      .flat()
      .map((letter) => {
        const indices = LOGO_SEGMENTS.flatMap((s, i) => (s.letter === letter ? [i] : []))
        return [
          letter,
          indices.reduce((sum, i) => sum + frame.strokeProgress[i]!, 0) / indices.length,
        ]
      }),
  )
}

/** Existing public progress stays 0=wordmark / 1=core; internal assembly is its exact reverse. */
export function sampleLogo(progress: number, alignment: LogoAlignment = 'start') {
  const frame = LOGO_ASSEMBLY.sample(1 - clamp(progress))
  const xs = frame.polygons.flatMap((polygon) => polygon.map(([x]) => x))
  const minX = Math.min(...xs),
    maxX = Math.max(...xs)
  const offset =
    alignment === 'center'
      ? (LOGO_VIEWBOX.width - minX - maxX) / 2
      : alignment === 'end'
        ? LOGO_VIEWBOX.width - LOGO_VIEWBOX.inset - maxX
        : 0
  return { ...frame, paths: frame.polygons.map(polygonPath), offset }
}

/** A single playhead: reversing never recreates a tween or resets its origin. */
export function createLogoTimeline(
  initial: number,
  render: (progress: number) => void,
  onRunning: (running: boolean) => void,
) {
  let progress = clamp(initial)
  let target = progress
  let frame = 0
  let previous = 0
  let running = false
  let speed = 1
  const status = (value: boolean) => {
    if (running !== value) {
      running = value
      onRunning(value)
    }
  }
  const pause = () => {
    cancelAnimationFrame(frame)
    frame = 0
    previous = 0
    status(false)
  }
  const tick = (now: number) => {
    frame = 0
    const elapsed = previous ? Math.min(now - previous, LOGO_MOTION.frameDeltaLimit) : 0
    previous = now
    const step = (elapsed * speed) / (LOGO_MOTION.duration * 1000)
    const distance = target - progress
    progress = Math.abs(distance) <= step ? target : progress + Math.sign(distance) * step
    render(progress)
    if (progress === target) pause()
    else frame = requestAnimationFrame(tick)
  }
  return {
    get speed() {
      return speed
    },
    set speed(value: number) {
      speed = Math.max(0.1, Math.min(2, value))
    },
    get progress() {
      return progress
    },
    get target() {
      return target
    },
    pause,
    to(next: number, immediate = false) {
      target = clamp(next)
      if (immediate) {
        progress = target
        render(progress)
        pause()
      } else if (target !== progress) {
        status(true)
        if (!frame) frame = requestAnimationFrame(tick)
      } else pause()
    },
    seek(next: number) {
      target = progress = clamp(next)
      render(progress)
      pause()
    },
  }
}
