import { FRAGMENTS } from './geometry.js'

const cut = (name, vertices, order, axis) => ({ name, vertices, order, axis })
const frameCuts = [
  cut('upper-cut', [0, 1, 2, 7], 1, [1, -1]),
  cut('left', [7, 2, 3, 6], 2, [0, 1]),
  cut('lower-cut', [6, 3, 4, 5], 3, [1, 1]),
]

// Partition the existing wordmark and core contours into real stroke pieces.
// There are no whole-letter display paths behind these pieces.
const CUTS = {
  'G-shell': [
    cut('top', [0, 1, 15, 16], 0, [1, 0]),
    cut('upper-cut', [1, 2, 14, 15], 1, [1, -1]),
    cut('left', [2, 3, 13, 14], 0, [0, 1]),
    cut('lower-cut', [3, 4, 12, 13], 2, [1, 1]),
    cut('bottom', [4, 5, 11, 12], 3, [1, 0]),
    cut('return', [5, 6, 10, 11], 3, [1, -1]),
    cut('inner-cut', [6, 7, 10], 4, [0, 1]),
    cut('crossbar', [7, 8, 9, 10], 4, [1, 0]),
  ],
  'x-spine': [cut('blade-a', undefined, 0, [1, 1])],
  'x-lower': [cut('blade-b-lower', undefined, 1, [1, -1])],
  'x-upper': [cut('blade-b-upper', undefined, 1, [1, -1])],
  'u-left': [cut('left', undefined, 0, [0, 1])],
  'u-right': [cut('right', undefined, 1, [0, 1])],
  'u-bridge': [
    cut('lower-left', [0, 1, 2, 7], 2, [1, 1]),
    cut('lower-right', [6, 3, 4, 5], 3, [-1, 1]),
    cut('bottom', [7, 2, 3, 6], 4, [1, 0]),
  ],
  'X-lower-blade': [cut('rising-lower', undefined, 0, [1, -1])],
  'X-junction': [cut('rising-junction', undefined, 1, [1, -1])],
  'X-upper-blade': [cut('rising-upper', undefined, 0, [1, -1])],
  'X-upper-brace': [cut('falling-upper', undefined, 1, [1, 1])],
  'X-lower-brace': [cut('falling-lower', undefined, 1, [1, 1])],
  'C1-crown': [cut('top', undefined, 0, [1, 0])],
  'C1-frame': frameCuts,
  'C1-foot': [cut('bottom', undefined, 4, [1, 0])],
  'C2-crown': [cut('top', undefined, 0, [1, 0])],
  'C2-frame': frameCuts,
  'C2-foot': [cut('bottom', undefined, 4, [1, 0])],
  'P-support': [cut('stem', undefined, 0, [0, 1])],
  'P-crown': [cut('top', undefined, 1, [1, 0])],
  'P-bowl': [
    cut('upper-cut', [0, 1, 6, 7], 2, [1, 1]),
    cut('right', [1, 2, 5, 6], 2, [0, 1]),
    cut('lower-cut', [2, 3, 4, 5], 3, [-1, 1]),
  ],
  'P-bar': [cut('middle', undefined, 4, [1, 0])],
}

export const SEGMENTS = FRAGMENTS.flatMap((source) =>
  CUTS[source.id].map((part) => {
    const select = (polygon) => (part.vertices ? part.vertices.map((i) => polygon[i]) : polygon)
    const length = Math.hypot(...part.axis)
    return {
      ...source,
      id: `${source.id}--${part.name}`,
      sourceId: source.id,
      kind: 'segment',
      role: part.name,
      order: part.order,
      axis: part.axis.map((n) => n / length),
      full: select(source.full),
      compressed: select(source.compressed),
      folded: select(source.folded),
      core: select(source.core),
    }
  }),
)
