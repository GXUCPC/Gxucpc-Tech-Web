import assert from 'node:assert/strict'
import test from 'node:test'
import { loadLogoSource } from './logo-source.mjs'
import {
  sample as sampleXcpc,
  ASSEMBLY,
  GXU_XCPC_MOTION,
} from '../public/previews/gxuxcpc/motion.js'
import { SEGMENTS } from '../public/previews/gxuxcpc/segments.js'
import { FRAGMENTS } from '../public/previews/gxuxcpc/geometry.js'

const { geometry, segments, motion } = await loadLogoSource()
const { sampleLogo, createLogoTimeline, logoEase, LOGO_MOTION } = motion
const brands = [
  {
    name: 'GxuTech',
    pieces: segments.LOGO_SEGMENTS,
    sources: geometry.LOGO_PATHS,
    states: ['expanded', 'compact'],
    sample: sampleLogo,
    assembly: motion.LOGO_ASSEMBLY,
    size: [600, 144],
    config: LOGO_MOTION,
  },
  {
    name: 'GxuXCPC',
    pieces: SEGMENTS,
    sources: FRAGMENTS,
    states: ['full', 'core'],
    sample: sampleXcpc,
    assembly: ASSEMBLY,
    size: [1024, 240],
    config: GXU_XCPC_MOTION,
  },
]
function inside([x, y], polygon) {
  let hit = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j]
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit
  }
  return hit
}
for (const brand of brands) {
  test(
    brand.name + ': segment partitions preserve the existing wordmark and core silhouettes',
    () => {
      for (const source of brand.sources)
        for (const state of brand.states) {
          const pieces = brand.pieces.filter((s) => s.sourceId === source.id)
          assert.ok(pieces.length)
          const polygon = source[state],
            xs = polygon.map(([x]) => x),
            ys = polygon.map(([, y]) => y)
          for (let x = Math.min(...xs) + 0.137; x < Math.max(...xs); x += 1.1)
            for (let y = Math.min(...ys) + 0.271; y < Math.max(...ys); y += 1.1)
              assert.equal(
                pieces.some((piece) => inside([x, y], piece[state])),
                inside([x, y], polygon),
                source.id + ' / ' + state,
              )
        }
    },
  )
  test(brand.name + ': every displayed letter is built from independent stroke segments', () => {
    for (const letter of new Set(brand.pieces.map((s) => s.letter ?? s.family))) {
      const pieces = brand.pieces.filter((s) => (s.letter ?? s.family) === letter)
      assert.ok(pieces.length >= 2, letter)
      assert.ok(pieces.every((s) => s.kind === 'segment' && s.id.includes('--')))
    }
    const plans = brand.assembly.segments
    for (const s of plans) {
      assert.equal(s.from.length, s.to.length)
      assert.ok(s.startProgress < s.extractionEnd && s.constructionStart < s.endProgress)
      assert.ok(s.endProgress <= 1)
    }
    const letterIds = ['u', brand.name === 'GxuTech' ? 'e' : 'P']
    const frame = brand.assembly.sample(0.6)
    for (const letter of letterIds) {
      const values = plans.flatMap((s, i) => (s.letter === letter ? [frame.strokeProgress[i]] : []))
      assert.ok(
        new Set(values.map((n) => n.toFixed(4))).size >= 2,
        letter + ' must not scale as one glyph',
      )
    }
    const u = plans.filter((s) => s.letter === 'u')
    assert.ok(
      u.find((s) => s.role === 'left').endProgress <
        u.find((s) => s.role === 'bridge' || s.role === 'bottom').endProgress,
    )
    const blades = plans.filter((s) => s.letter === 'x')
    const separation =
      (Math.max(...blades.map((s) => s.startProgress)) -
        Math.min(...blades.map((s) => s.startProgress))) *
      brand.config.duration
    assert.ok(separation >= 0.02 && separation <= 0.04)
    assert.ok(brand.config.characterStagger >= 0.02 && brand.config.characterStagger <= 0.05)
  })
  test(
    brand.name + ': all progress samples remain finite, reversible and inside a fixed viewport',
    () => {
      const commands = (d) => d.match(/[MQLZ]/g).join('')
      const initial = brand.sample(0)
      for (let i = 0; i <= 200; i++) {
        const frame = brand.sample(i / 200)
        assert.equal(frame.paths.length, brand.pieces.length)
        frame.polygons.forEach((polygon, k) => {
          assert.equal(commands(frame.paths[k]), commands(initial.paths[k]))
          for (const [x, y] of polygon) {
            assert.ok(Number.isFinite(x + y))
            assert.ok(x + frame.offset >= -0.001 && x + frame.offset <= brand.size[0] + 0.001)
            assert.ok(y >= -0.001 && y <= brand.size[1] + 0.001)
          }
        })
        assert.deepEqual(frame, brand.sample(i / 200))
      }
    },
  )
}
test('C frames have five parts and P assembles stem, crown, right side, then middle', () => {
  for (const letter of ['C1', 'C2'])
    assert.deepEqual(
      new Set(SEGMENTS.filter((s) => s.family === letter).map((s) => s.role)),
      new Set(['top', 'upper-cut', 'left', 'lower-cut', 'bottom']),
    )
  const parts = ASSEMBLY.segments.filter((s) => s.letter === 'P')
  const end = (role) => parts.find((s) => s.role === role).endProgress
  assert.ok(end('stem') < end('top') && end('top') < end('right') && end('right') < end('middle'))
})
test('u/T spacing and the wider P retain their approved proportions', () => {
  const u = geometry.LOGO_PATHS.find((s) => s.letter === 'u').expanded
  const t = geometry.LOGO_PATHS.find((s) => s.id === 't-stem').expanded
  assert.equal(Math.min(...t.map(([x]) => x)) - Math.max(...u.map(([x]) => x)), 22)
  const p = FRAGMENTS.filter((s) => s.family === 'P').flatMap((s) => s.full)
  assert.equal(Math.max(...p.map(([x]) => x)) - Math.min(...p.map(([x]) => x)), 132)
})

test('easing is monotonic, symmetric, and settles exactly at the endpoints', () => {
  assert.equal(logoEase(0), 0)
  assert.equal(logoEase(1), 1)
  for (let i = 1; i <= 100; i++) {
    assert.ok(logoEase(i / 100) >= logoEase((i - 1) / 100))
    assert.ok(Math.abs(logoEase(i / 100) + logoEase(1 - i / 100) - 1) < 0.0002)
  }
})

test('a reversal keeps the current playhead, duration is bounded, and settled logos schedule no frames', () => {
  const previousRequest = globalThis.requestAnimationFrame
  const previousCancel = globalThis.cancelAnimationFrame
  const queue = new Map()
  let id = 0
  let now = 100
  globalThis.requestAnimationFrame = (callback) => {
    queue.set(++id, callback)
    return id
  }
  globalThis.cancelAnimationFrame = (frame) => queue.delete(frame)
  const frame = () => {
    now += 10
    const callbacks = [...queue.values()]
    queue.clear()
    callbacks.forEach((callback) => callback(now))
  }
  const advance = (ms) => {
    for (let i = 0; i < ms; i += 10) frame()
  }
  const rendered = []
  const states = []
  try {
    const timeline = createLogoTimeline(
      0,
      (progress) => rendered.push(progress),
      (state) => states.push(state),
    )
    timeline.to(1)
    advance(300)
    const middle = timeline.progress
    assert.ok(middle > 0.35 && middle < 0.45)
    timeline.to(0)
    assert.equal(timeline.progress, middle, 'reversal must not reset the playhead')
    frame()
    assert.ok(timeline.progress < middle && timeline.progress > middle - 0.02)
    advance(400)
    assert.equal(timeline.progress, 0)
    assert.equal(queue.size, 0)
    assert.deepEqual(sampleLogo(rendered.at(-1)), sampleLogo(0))

    for (const pauseAt of [0.2, 0.4, 0.6, 0.8]) {
      timeline.seek(pauseAt)
      assert.equal(queue.size, 0)
      timeline.to(1)
      advance(50)
      const before = timeline.progress
      timeline.to(0)
      assert.equal(timeline.progress, before)
      assert.ok(queue.size <= 1, 'only one timeline may run')
      advance(800)
      assert.equal(timeline.progress, 0)
    }
    timeline.to(1)
    advance(LOGO_MOTION.duration * 1000 - 10)
    assert.ok(timeline.progress < 1)
    advance(30)
    assert.equal(timeline.progress, 1)
    assert.equal(queue.size, 0)
    timeline.seek(0)
    timeline.speed = 0.25
    timeline.to(1)
    advance(LOGO_MOTION.duration * 1000)
    assert.ok(timeline.progress > 0.24 && timeline.progress < 0.26)
    advance(LOGO_MOTION.duration * 3000 + 30)
    assert.equal(timeline.progress, 1)
    assert.equal(queue.size, 0, 'slow playback also stops at its endpoint')
    timeline.speed = 1
    timeline.to(0, true)
    assert.equal(timeline.progress, 0)
    assert.equal(queue.size, 0, 'reduced motion uses no animation frames')
    assert.equal(states.at(-1), false)
  } finally {
    globalThis.requestAnimationFrame = previousRequest
    globalThis.cancelAnimationFrame = previousCancel
  }
})
