// GxuXCPC: original, hand-constructed SVG geometry based on the concept sheet.
// Every fragment survives as a non-zero-area structural plate in the final icon.
export const VIEWBOX = { width: 1024, height: 240 }

const quad = (a, b, c, d) => [a, b, c, d]
const points = (coordinates) => coordinates.map(([x, y]) => [x, y])
const shift = (polygon, dx, dy = 0) => polygon.map(([x, y]) => [x + dx, y + dy])
const scaleAt = (polygon, sx, sy, ox, oy, dx = 0, dy = 0) =>
  polygon.map(([x, y]) => [ox + (x - ox) * sx + dx, oy + (y - oy) * sy + dy])

// Add vertices along existing edges. Vertex order/winding stays compatible;
// this does not swap SVG nodes or introduce a second image during a morph.
function compatible(polygon, count) {
  return Array.from({ length: count }, (_, i) => {
    const position = (i * polygon.length) / count
    const index = Math.floor(position)
    const fraction = position - index
    const a = polygon[index]
    const b = polygon[(index + 1) % polygon.length]
    return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction]
  })
}

const raw = [
  {
    id: 'G-shell',
    family: 'G',
    full: [
      [172, 54],
      [76, 54],
      [20, 110],
      [20, 144],
      [66, 190],
      [126, 190],
      [172, 144],
      [172, 112],
      [108, 112],
      [88, 132],
      [128, 132],
      [100, 160],
      [78, 160],
      [50, 132],
      [50, 122],
      [90, 82],
      [144, 82],
    ],
    core: [
      [168, 20],
      [88, 20],
      [24, 78],
      [24, 122],
      [70, 168],
      [90, 168],
      [142, 116],
      [118, 92],
      [90, 92],
      [108, 112],
      [118, 122],
      [90, 150],
      [82, 150],
      [52, 120],
      [52, 90],
      [100, 48],
      [140, 48],
    ],
  },
  {
    id: 'x-spine',
    family: 'x',
    full: quad([180, 98], [218, 98], [310, 190], [272, 190]),
  },
  {
    id: 'x-lower',
    family: 'x',
    full: quad([170, 190], [208, 190], [248, 150], [229, 131]),
  },
  {
    id: 'x-upper',
    family: 'x',
    full: quad([271, 98], [309, 98], [267, 140], [248, 121]),
  },
  {
    id: 'u-left',
    family: 'u',
    full: quad([316, 98], [342, 98], [342, 164], [316, 164]),
  },
  {
    id: 'u-bridge',
    family: 'u',
    full: [
      [316, 164],
      [342, 152],
      [354, 164],
      [376, 164],
      [388, 152],
      [414, 164],
      [390, 190],
      [340, 190],
    ],
  },
  {
    id: 'u-right',
    family: 'u',
    full: quad([388, 98], [414, 98], [414, 164], [388, 164]),
  },
  // Three contiguous plates constitute the long capital-X diagonal at full size.
  // The other two plates join into the descending diagonal of the compact X.
  {
    id: 'X-lower-blade',
    family: 'X',
    full: quad([424, 190], [470, 190], [524.4, 135.6], [478.4, 135.6]),
    core: quad([88, 214], [126, 214], [178, 150], [158, 128]),
  },
  {
    id: 'X-junction',
    family: 'X',
    full: quad([478.4, 135.6], [524.4, 135.6], [554, 106], [508, 106]),
    core: quad([168, 132], [182, 150], [196, 138], [180, 120]),
  },
  {
    id: 'X-upper-blade',
    family: 'X',
    full: quad([508, 106], [554, 106], [606, 54], [560, 54]),
    core: quad([188, 104], [208, 124], [256, 68], [218, 68]),
  },
  {
    id: 'X-upper-brace',
    family: 'X',
    full: quad([424, 54], [466, 54], [510, 98], [488, 120]),
    core: quad([116, 66], [154, 66], [204, 132], [166, 132]),
  },
  {
    id: 'X-lower-brace',
    family: 'X',
    full: quad([532, 134], [554, 112], [632, 190], [588, 190]),
    core: quad([166, 132], [204, 132], [254, 198], [216, 198]),
  },
  {
    id: 'C1-crown',
    family: 'C1',
    full: quad([646, 54], [754, 54], [726, 82], [674, 82]),
  },
  {
    id: 'C1-frame',
    family: 'C1',
    full: [
      [646, 54],
      [674, 82],
      [648, 108],
      [648, 136],
      [674, 162],
      [646, 190],
      [620, 164],
      [620, 80],
    ],
  },
  {
    id: 'C1-foot',
    family: 'C1',
    full: quad([674, 162], [726, 162], [754, 190], [646, 190]),
  },
  {
    id: 'P-crown',
    family: 'P',
    full: quad([762, 54], [842, 54], [826, 82], [734, 82]),
  },
  {
    id: 'P-bowl',
    family: 'P',
    full: [
      [842, 54],
      [866, 78],
      [866, 114],
      [844, 136],
      [816, 108],
      [834, 100],
      [834, 90],
      [826, 82],
    ],
  },
  {
    id: 'P-bar',
    family: 'P',
    full: quad([746, 108], [844, 108], [844, 136], [746, 136]),
  },
  {
    id: 'P-support',
    family: 'P',
    full: [
      [746, 108],
      [766, 108],
      [766, 190],
      [738, 162],
      [738, 116],
    ],
  },
  {
    id: 'C2-crown',
    family: 'C2',
    full: quad([906, 54], [1006, 54], [978, 82], [934, 82]),
  },
  {
    id: 'C2-frame',
    family: 'C2',
    full: [
      [906, 54],
      [934, 82],
      [908, 108],
      [908, 136],
      [934, 162],
      [906, 190],
      [880, 164],
      [880, 80],
    ],
  },
  {
    id: 'C2-foot',
    family: 'C2',
    full: quad([934, 162], [978, 162], [1006, 190], [906, 190]),
  },
]

function compression(fragment) {
  const { family, full } = fragment
  if (family === 'G') return shift(full, 10)
  if (family === 'x') return shift(full, 2)
  if (family === 'u') return scaleAt(full, 0.94, 1, 316, 144, -4)
  // The wider P keeps a visible counter/gap beside both Cs during compression.
  return shift(full, { X: -16, C1: -28, P: -34, C2: -40 }[family])
}

// Two persistent branches: xu folds into G's crown, CPC into X's upper arm.
// Each suffix uses one shared surface map, preserving its connected strokes.
// These are positive-area plates inside the parent, never hidden/faded paths.
const BRANCH_GEOMETRY = {
  gShift: 10,
  xShift: -224,
  xuBounds: { x: 170, y: 98, width: 244, height: 92 },
  cpcBounds: { x: 620, y: 54, width: 386, height: 136 },
  gCrown: quad([92, 58], [144, 58], [126, 76], [92, 76]),
  gCoreCrown: quad([104, 26], [148, 26], [132, 42], [104, 42]),
  xInset: { left: 0.22, right: 0.66, top: 0.16, bottom: 0.68 },
}

function onSurface([a, b, c, d], u, v) {
  return a.map(
    (_, axis) =>
      (1 - v) * ((1 - u) * a[axis] + u * b[axis]) + v * ((1 - u) * d[axis] + u * c[axis]),
  )
}

function suffixPlate(fragment, compact) {
  const left = fragment.family === 'x' || fragment.family === 'u'
  const config = BRANCH_GEOMETRY
  const bounds = left ? config.xuBounds : config.cpcBounds
  const arm = raw.find((part) => part.id === 'X-upper-brace')
  const surface = left
    ? compact
      ? config.gCoreCrown
      : shift(config.gCrown, config.gShift)
    : compact
      ? arm.core
      : shift(arm.full, config.xShift)
  return fragment.full.map(([x, y]) => {
    let u = (x - bounds.x) / bounds.width
    let v = (y - bounds.y) / bounds.height
    if (!left) {
      const inset = config.xInset
      u = inset.left + u * (inset.right - inset.left)
      v = inset.top + v * (inset.bottom - inset.top)
    }
    return onSurface(surface, u, v)
  })
}

export const FRAGMENTS = raw.map((fragment) => {
  const root = fragment.family === 'G' || fragment.family === 'X'
  const branch = ['G', 'x', 'u'].includes(fragment.family) ? 'G' : 'X'
  const folded = root
    ? shift(fragment.full, branch === 'G' ? BRANCH_GEOMETRY.gShift : BRANCH_GEOMETRY.xShift)
    : suffixPlate(fragment, false)
  const core = root ? fragment.core : suffixPlate(fragment, true)
  // Keep all original corners and compatible topology in every state.
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const count =
    fragment.family === 'G' ? 17 : (fragment.full.length * 4) / gcd(fragment.full.length, 4)
  return {
    id: fragment.id,
    family: fragment.family,
    branch,
    root,
    full: compatible(points(fragment.full), count),
    compressed: compatible(compression(fragment), count),
    folded: compatible(folded, count),
    core: compatible(core, count),
  }
})

export function interpolate(from, to, progress) {
  return from.map(([x, y], i) => [x + (to[i][0] - x) * progress, y + (to[i][1] - y) * progress])
}

/** Small machined corners; stable M/Q/L topology at every sample. */
export function svgPath(polygon, radius = 1.8) {
  const fmt = (point) => point.map((n) => +n.toFixed(3)).join(' ')
  const corners = polygon.map((vertex, i) => {
    const before = polygon[(i + polygon.length - 1) % polygon.length]
    const after = polygon[(i + 1) % polygon.length]
    const inLength = Math.hypot(before[0] - vertex[0], before[1] - vertex[1])
    const outLength = Math.hypot(after[0] - vertex[0], after[1] - vertex[1])
    const cut = Math.min(radius, inLength / 3, outLength / 3)
    const along = (end, length) =>
      vertex.map((n, axis) => n + ((end[axis] - n) * cut) / (length || 1))
    return [along(before, inLength), vertex, along(after, outLength)]
  })
  return (
    corners
      .map(
        ([incoming, vertex, outgoing], i) =>
          `${i ? 'L' : 'M'}${fmt(incoming)}Q${fmt(vertex)} ${fmt(outgoing)}`,
      )
      .join('') + 'Z'
  )
}
