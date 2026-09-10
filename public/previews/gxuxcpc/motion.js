import { VIEWBOX, svgPath } from './geometry.js'
import { SEGMENTS } from './segments.js'
import { createStructuralAssembly, structuralEase } from '../../brand/structural-assembly.js'

export const GXU_XCPC_MOTION = {
  duration: 0.76,
  lockDuration: 0.12,
  hoverIntent: 90,
  easing: [0.65, 0, 0.35, 1],
  revealDelay: 150,
  branchDelay: 0,
  characterStagger: 0.03,
  strokeStagger: 0.022,
  bladeStagger: 0.028,
  dualXLead: 0.025,
  groups: { G: ['x', 'u'], X: ['C1', 'P', 'C2'] },
  stockLength: 0.35,
  unlockStart: 0.06,
  seedEnd: 0.32,
  layoutEnd: 0.68,
  extractionEnd: 0.43,
  constructionStart: 0.4,
  constructionEnd: 0.7,
  finalLockStart: 0.84,
  finalLockPeak: 0.9,
  socketGap: 2.2,
  unlockOffset: 1.5,
  finalLockOffset: 1.5,
  microDuration: 0.38,
  microScale: 1.04,
  microRotation: 1.5,
  microShellOffset: 1.5,
  scrollCollapse: 64,
  scrollExpand: 32,
  headerDelay: 100,
  headerDuration: 240,
  headerExpandedHeight: 72,
  headerCoreHeight: 56,
  cornerRadius: 1.8,
  frameDeltaLimit: 50,
  stages: { compress: 0.1, fold: 0.68, merge: 0.84, lock: 1 },
}
const clamp = (p) => Math.max(0, Math.min(1, p))
export const ease = (p) => structuralEase(p, GXU_XCPC_MOTION.easing)
export const ASSEMBLY = createStructuralAssembly(
  SEGMENTS.map((s) => ({
    ...s,
    letter: s.family,
    from: s.core,
    to: s.full,
  })),
  GXU_XCPC_MOTION,
)

export function sampleCharacters(progress) {
  const frame = ASSEMBLY.sample(1 - clamp(progress))
  return Object.fromEntries(
    Object.values(GXU_XCPC_MOTION.groups)
      .flat()
      .map((letter) => {
        const indices = SEGMENTS.flatMap((s, i) => (s.family === letter ? [i] : []))
        return [
          letter,
          indices.reduce((sum, i) => sum + frame.strokeProgress[i], 0) / indices.length,
        ]
      }),
  )
}
export function sample(progress, alignment = 'center', micro = 0) {
  const frame = ASSEMBLY.sample(1 - clamp(progress))
  const config = GXU_XCPC_MOTION
  const angle = (config.microRotation * micro * Math.PI) / 180
  const scale = 1 + (config.microScale - 1) * micro
  const polygons = frame.polygons.map((shape, i) =>
    micro
      ? shape.map(([x, y]) => {
          if (SEGMENTS[i].branch === 'G') return [x - config.microShellOffset * micro, y]
          const dx = (x - 175) * scale,
            dy = (y - 132) * scale
          return [
            175 + dx * Math.cos(angle) - dy * Math.sin(angle),
            132 + dx * Math.sin(angle) + dy * Math.cos(angle),
          ]
        })
      : shape,
  )
  const xs = polygons.flatMap((shape) => shape.map(([x]) => x))
  const left = Math.min(...xs),
    right = Math.max(...xs)
  const offset = alignment === 'center' ? (VIEWBOX.width - left - right) / 2 : 20 - left
  return {
    polygons,
    offset,
    strokeProgress: frame.strokeProgress,
    paths: polygons.map((shape) => svgPath(shape, config.cornerRadius)),
  }
}
export function stageName(p) {
  const q = 1 - p
  return q === 1
    ? 'WORDMARK'
    : q < 0.15
      ? 'CORE UNLOCK'
      : q < 0.35
        ? 'PRIMARY EXTRACTION'
        : q < 0.65
          ? 'STROKE CONSTRUCTION'
          : q < 0.9
            ? 'GLYPH ASSEMBLY'
            : 'FINAL LOCK'
}

export function createTimeline(
  render,
  { initial = 0, onState = () => {}, reduced = () => false } = {},
) {
  let progress = clamp(initial),
    target = progress,
    frame = 0,
    previous = null,
    speed = 1
  const state = (value) => onState(value)
  const pause = () => {
    cancelAnimationFrame(frame)
    frame = 0
    previous = null
    state('paused')
  }
  const tick = (now) => {
    frame = 0
    const elapsed =
      previous === null ? 0 : Math.min(now - previous, GXU_XCPC_MOTION.frameDeltaLimit)
    previous = now
    const step = (elapsed * speed) / (GXU_XCPC_MOTION.duration * 1000)
    const delta = target - progress
    progress = Math.abs(delta) <= step ? target : progress + Math.sign(delta) * step
    render(progress)
    if (progress === target) {
      previous = null
      state('idle')
    } else frame = requestAnimationFrame(tick)
  }
  return {
    get progress() {
      return progress
    },
    get target() {
      return target
    },
    get running() {
      return !!frame
    },
    get speed() {
      return speed
    },
    set speed(value) {
      speed = Math.max(0.1, Math.min(2, value))
    },
    pause,
    seek(value) {
      pause()
      target = progress = clamp(value)
      render(progress)
    },
    to(value, immediate = false) {
      target = clamp(value)
      if (immediate || reduced()) {
        pause()
        progress = target
        render(progress)
        state('idle')
        return
      }
      if (progress === target) {
        pause()
        state('idle')
        return
      }
      state(target > progress ? 'compressing' : 'expanding')
      if (!frame) frame = requestAnimationFrame(tick)
    },
  }
}

export function svgSource(progress, { tight = false } = {}) {
  const frame = sample(progress, tight ? 'start' : 'center')
  const box = tight && progress === 1 ? '0 0 276 240' : `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="GxuXCPC"><g fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="bevel" transform="translate(${frame.offset} 0)">${SEGMENTS.map((part, i) => `<path data-kind="segment" id="${part.id}" d="${frame.paths[i]}"/>`).join('')}</g></svg>`
}
