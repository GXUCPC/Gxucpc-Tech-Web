/** Hand-drawn geometry; no fonts, raster tracing, crossfades or replacement paths. */
export type Point = readonly [number, number]
export type Polygon = readonly Point[]
export type LogoState = 'expanded' | 'intermediate' | 'compact'
export type LogoAlignment = 'start' | 'center' | 'end'

export const LOGO_VIEWBOX = { width: 600, height: 144, inset: 10 } as const

type Letter = 'g' | 'x' | 'u' | 't' | 'e' | 'c' | 'h'
type Primitive = {
  id: string
  letter: Letter
  expanded: Polygon
  compact?: Polygon
}

// Corresponding vertices have the same winding and role at both endpoints.
// The two branches unfold together: G -> Gxu and T -> Tech.
const primitives: Primitive[] = [
  {
    id: 'g-shell',
    letter: 'g',
    expanded: [
      [94, 28],
      [38, 28],
      [10, 56],
      [10, 86],
      [38, 114],
      [72, 114],
      [98, 88],
      [80, 88],
      [64, 96],
      [44, 96],
      [28, 80],
      [28, 62],
      [46, 44],
      [78, 44],
    ],
    compact: [
      [100, 12],
      [42, 12],
      [10, 44],
      [10, 90],
      [34, 114],
      [42, 114],
      [58, 98],
      [44, 98],
      [40, 98],
      [28, 86],
      [28, 60],
      [28, 52],
      [50, 30],
      [82, 30],
    ],
  },
  {
    id: 'g-crossbar',
    letter: 'g',
    expanded: [
      [60, 66],
      [98, 66],
      [98, 88],
      [80, 88],
      [80, 82],
      [64, 82],
      [54, 74],
      [54, 74],
    ],
    compact: [
      [84, 88],
      [102, 88],
      [102, 128],
      [84, 134],
      [84, 120],
      [84, 110],
      [84, 102],
      [84, 98],
    ],
  },
  {
    id: 'u-channel',
    letter: 'u',
    expanded: [
      [198, 52],
      [216, 52],
      [216, 90],
      [222, 96],
      [240, 96],
      [246, 90],
      [246, 52],
      [264, 52],
      [264, 98],
      [248, 114],
      [214, 114],
      [198, 98],
    ],
  },
  {
    id: 'e-crown',
    letter: 'e',
    expanded: [
      [380, 78],
      [380, 72],
      [400, 52],
      [424, 52],
      [444, 72],
      [444, 90],
      [428, 90],
      [428, 78],
      [420, 70],
      [408, 70],
      [398, 80],
      [398, 90],
    ],
  },
  {
    id: 'e-foot',
    letter: 'e',
    expanded: [
      [380, 78],
      [398, 78],
      [398, 88],
      [408, 98],
      [444, 98],
      [444, 114],
      [400, 114],
      [380, 94],
    ],
  },
  {
    id: 'e-bar',
    letter: 'e',
    expanded: [
      [396, 78],
      [435, 78],
      [435, 90],
      [396, 90],
    ],
  },
  {
    id: 'c-shell',
    letter: 'c',
    expanded: [
      [514, 52],
      [476, 52],
      [456, 72],
      [456, 94],
      [476, 114],
      [514, 114],
      [514, 96],
      [484, 96],
      [474, 86],
      [474, 78],
      [484, 68],
      [514, 68],
    ],
  },
  {
    id: 'h-stem',
    letter: 'h',
    expanded: [
      [526, 24],
      [544, 24],
      [544, 114],
      [526, 114],
    ],
  },
  {
    id: 'h-shoulder',
    letter: 'h',
    expanded: [
      [544, 56],
      [550, 52],
      [574, 52],
      [592, 70],
      [592, 114],
      [574, 114],
      [574, 78],
      [566, 70],
      [552, 70],
      [544, 78],
    ],
  },
  {
    id: 'x-diagonal',
    letter: 'x',
    expanded: [
      [110, 52],
      [134, 52],
      [190, 114],
      [166, 114],
    ],
    compact: [
      [44, 52],
      [68, 52],
      [102, 86],
      [84, 100],
    ],
  },
  {
    id: 'x-lower',
    letter: 'x',
    expanded: [
      [110, 114],
      [134, 114],
      [158, 88],
      [146, 74],
    ],
    compact: [
      [44, 118],
      [68, 118],
      [92, 94],
      [80, 80],
    ],
  },
  {
    id: 'x-upper',
    letter: 'x',
    expanded: [
      [166, 52],
      [190, 52],
      [166, 78],
      [166, 78],
      [154, 64],
      [154, 64],
    ],
    compact: [
      [128, 44],
      [154, 44],
      [122, 76],
      [154, 114],
      [130, 114],
      [98, 76],
    ],
  },
  {
    id: 't-blade',
    letter: 't',
    expanded: [
      [272, 28],
      [374, 28],
      [356, 46],
      [290, 46],
    ],
    compact: [
      [42, 12],
      [140, 12],
      [122, 30],
      [60, 30],
    ],
  },
  {
    id: 't-stem',
    letter: 't',
    expanded: [
      [314, 46],
      [332, 46],
      [332, 114],
      [314, 96],
      [314, 70],
    ],
    compact: [
      [84, 30],
      [102, 30],
      [102, 52],
      [92, 62],
      [84, 54],
    ],
  },
]

const tighten: Record<Letter, number> = { g: 0, x: -4, u: -8, t: -12, e: -18, c: -22, h: -26 }
const capHeight = (y: number) => 72 + (y - 72) * 1.12

export const LOGO_GEOMETRY = {
  techTuck: 28,
  echTuck: 34,
  foldedTShift: -126,
  xuBounds: { x: 110, y: capHeight(52), width: 154, height: capHeight(114) - capHeight(52) },
  echBounds: { x: 318, y: capHeight(24), width: 212, height: capHeight(114) - capHeight(24) },
} as const

const shift = (polygon: Polygon, dx: number): Polygon => polygon.map(([x, y]) => [x + dx, y])
const cap = (polygon: Polygon): Polygon => polygon.map(([x, y]) => [x, capHeight(y)])
const gCrown = cap([
  [44, 31],
  [78, 31],
  [68, 41],
  [46, 41],
])
const gCoreCrown: Polygon = [
  [50, 16],
  [86, 16],
  [74, 26],
  [50, 26],
]
const tCrown = cap([
  [270, 31],
  [320, 31],
  [310, 42],
  [272, 42],
])
const tCoreCrown: Polygon = [
  [65, 16],
  [115, 16],
  [105, 26],
  [70, 26],
]

function plate(polygon: Polygon, branch: 'g' | 't', surface: Polygon): Polygon {
  const bounds = branch === 'g' ? LOGO_GEOMETRY.xuBounds : LOGO_GEOMETRY.echBounds
  const [a, b, c, d] = surface as readonly [Point, Point, Point, Point]
  return polygon.map(([x, y]): Point => {
    const u = (x - bounds.x) / bounds.width
    const v = (y - bounds.y) / bounds.height
    const axis = (i: 0 | 1) =>
      (1 - v) * ((1 - u) * a[i] + u * b[i]) + v * ((1 - u) * d[i] + u * c[i])
    return [axis(0), axis(1)]
  })
}

const glyphs = primitives.map((primitive) => {
  const tech = ['t', 'e', 'c', 'h'].includes(primitive.letter)
  const tuck =
    (tech ? LOGO_GEOMETRY.techTuck : 0) +
    (['e', 'c', 'h'].includes(primitive.letter) ? LOGO_GEOMETRY.echTuck : 0)
  return {
    ...primitive,
    expanded: primitive.expanded.map(([x, y]): Point => [x - tuck, capHeight(y)]),
  }
})

// G's inner plates become the familiar diagonal core. In the readable state
// they are stowed within its crown, allowing the lowercase x to grow from G.
// All plates retain positive area; no opacity or zero-length substitute paths.
const gCorePlates = glyphs
  .filter((path) => path.letter === 'x')
  .map((path) => ({
    ...path,
    id: `g-core-${path.id}`,
    letter: 'g' as const,
    expanded: plate(path.expanded, 'g', gCrown),
  }))

export const LOGO_PATHS = [...glyphs, ...gCorePlates].map((primitive) => {
  const { expanded } = primitive
  const branch = ['g', 'x', 'u'].includes(primitive.letter) ? ('g' as const) : ('t' as const)
  const root = primitive.letter === 'g' || primitive.letter === 't'
  const compressed = expanded.map(([x, y]) => [x + tighten[primitive.letter], y] as const)
  const folded = root
    ? shift(expanded, branch === 'g' ? 0 : LOGO_GEOMETRY.foldedTShift)
    : plate(expanded, branch, branch === 'g' ? gCrown : shift(tCrown, LOGO_GEOMETRY.foldedTShift))
  const compact = root
    ? primitive.compact!
    : plate(expanded, branch, branch === 'g' ? gCoreCrown : tCoreCrown)
  return {
    id: primitive.id,
    letter: primitive.letter,
    branch,
    root,
    expanded,
    compressed,
    folded,
    compact,
  }
})

export function interpolatePolygon(from: Polygon, to: Polygon, amount: number): Polygon {
  return from.map(([x, y], index) => {
    const end = to[index]!
    return [x + (end[0] - x) * amount, y + (end[1] - y) * amount]
  })
}

export function polygonPath(points: Polygon): string {
  return (
    points.map(([x, y], i) => `${i ? 'L' : 'M'}${+x.toFixed(3)} ${+y.toFixed(3)}`).join('') + 'Z'
  )
}
