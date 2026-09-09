// Pure geometry engine shared by the two identities. No DOM, timers, opacity,
// glyph scaling or clipping: each input is an independently manufactured stroke.
const clamp = (n) => Math.max(0, Math.min(1, n))
const cubic = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3
export function structuralEase(value, easing = [0.65, 0, 0.35, 1]) {
  if (value <= 0 || value >= 1) return clamp(value)
  let lo = 0,
    hi = 1
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    if (cubic(mid, easing[0], easing[2]) < value) lo = mid
    else hi = mid
  }
  return cubic((lo + hi) / 2, easing[1], easing[3])
}
const mix = (from, to, p) =>
  from.map(([x, y], i) => [x + (to[i][0] - x) * p, y + (to[i][1] - y) * p])
const move = (polygon, dx, dy = 0) => polygon.map(([x, y]) => [x + dx, y + dy])

export function createStructuralAssembly(segments, config) {
  const phase = (q, start, end) => structuralEase(clamp((q - start) / (end - start)), config.easing)
  const travel = Object.fromEntries(
    Object.keys(config.groups).map((branch) => {
      const root = segments.find((s) => s.branch === branch && s.root)
      return [branch, root.to[0][0] - root.folded[0][0]]
    }),
  )
  const plans = segments.map((segment) => {
    const character = Math.max(0, config.groups[segment.branch].indexOf(segment.letter))
    const stagger =
      segment.letter.toLowerCase() === 'x' ? config.bladeStagger : config.strokeStagger
    const delay =
      (character * config.characterStagger +
        segment.order * stagger +
        (segment.letter === 'X' ? config.dualXLead : 0)) /
      config.duration
    const [ax, ay] = segment.axis
    const anchor = Math.min(...segment.to.map(([x, y]) => x * ax + y * ay))
    // Short stock keeps stroke thickness; only its longitudinal dimension grows.
    const stock = segment.to.map(([x, y]) => {
      const shorten = (anchor - x * ax - y * ay) * (1 - config.stockLength)
      return [x + ax * shorten, y + ay * shorten]
    })
    return {
      ...segment,
      stock,
      startProgress: config.seedEnd + delay,
      extractionEnd: config.extractionEnd + delay,
      constructionStart: config.constructionStart + delay,
      endProgress: config.constructionEnd + delay,
      seedStart:
        config.unlockStart +
        (segment.root ? (Math.min(segment.order, 3) * stagger) / config.duration : 0) +
        (segment.letter === 'X' ? config.dualXLead / config.duration : 0),
    }
  })
  return {
    segments: plans,
    sample(expansionProgress) {
      const q = clamp(expansionProgress)
      const layout = phase(q, config.seedEnd, config.layoutEnd)
      const finalLock =
        phase(q, config.finalLockStart, config.finalLockPeak) *
        (1 - phase(q, config.finalLockPeak, 1))
      const strokeProgress = []
      const polygons = plans.map((s) => {
        const seed = phase(q, s.seedStart, config.seedEnd)
        const extract = phase(q, s.startProgress, s.extractionEnd)
        const construct = phase(q, s.constructionStart, s.endProgress)
        strokeProgress.push(s.root ? seed : construct)
        const [ax, ay] = s.axis
        const direction = s.order % 2 ? -1 : 1
        let shape
        if (s.root) {
          shape = mix(mix(s.from, s.folded, seed), s.to, layout)
        } else {
          const carried = move(mix(s.from, s.folded, seed), travel[s.branch] * layout)
          const grown = mix(s.stock, s.to, construct)
          const joint =
            (1 - phase(q, s.constructionStart, s.endProgress)) * config.socketGap * extract
          const target = move(
            grown,
            -travel[s.branch] * (1 - layout) - ay * joint * direction,
            ax * joint * direction,
          )
          shape = mix(carried, target, extract)
        }
        const unlock =
          Math.sin(Math.PI * phase(q, 0, config.seedEnd)) * (1 - seed) * config.unlockOffset
        return move(
          shape,
          (ax * finalLock * config.finalLockOffset - ay * unlock) * direction,
          (ay * finalLock * config.finalLockOffset + ax * unlock) * direction,
        )
      })
      return { polygons, strokeProgress }
    },
  }
}
