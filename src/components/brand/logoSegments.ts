import { LOGO_PATHS, type Point, type Polygon } from './logoGeometry.ts'

type Cut = { name: string; vertices?: number[]; order: number; axis: Point }
const cut = (name: string, vertices: number[] | undefined, order: number, axis: Point): Cut => ({
  name,
  vertices,
  order,
  axis,
})

// These cuts partition the existing contours. They do not redraw either endpoint.
// Only these semantic stroke pieces are mounted in the SVG; source glyphs are blueprints.
const CUTS: Record<string, Cut[]> = {
  'g-shell': [
    cut('top', [0, 1, 12, 13], 0, [1, 0]),
    cut('upper-cut', [1, 2, 11, 12], 1, [1, -1]),
    cut('left', [2, 3, 10, 11], 0, [0, 1]),
    cut('lower-cut', [3, 4, 9, 10], 2, [1, 1]),
    cut('bottom', [4, 5, 8, 9], 3, [1, 0]),
    cut('return', [5, 6, 7, 8], 3, [1, -1]),
  ],
  'g-crossbar': [cut('bar', [0, 1, 4, 5, 6, 7], 4, [1, 0]), cut('elbow', [1, 2, 3, 4], 3, [0, 1])],
  'u-channel': [
    cut('left', [0, 1, 2, 11], 0, [0, 1]),
    cut('right', [8, 5, 6, 7], 1, [0, 1]),
    cut('lower-left', [11, 2, 3, 10], 2, [1, 1]),
    cut('lower-right', [9, 4, 5, 8], 3, [-1, 1]),
    cut('bridge', [10, 3, 4, 9], 4, [1, 0]),
  ],
  'e-crown': [
    cut('left', [0, 1, 10, 11], 0, [0, 1]),
    cut('upper-cut', [1, 2, 9, 10], 1, [1, -1]),
    cut('top', [2, 3, 8, 9], 1, [1, 0]),
    cut('right-cut', [3, 4, 7, 8], 2, [1, 1]),
    cut('right', [4, 5, 6, 7], 3, [0, 1]),
  ],
  'e-foot': [
    cut('left', [0, 1, 2, 7], 0, [0, 1]),
    cut('lower-cut', [7, 2, 3, 6], 2, [1, 1]),
    cut('bottom', [6, 3, 4, 5], 3, [1, 0]),
  ],
  'e-bar': [cut('middle', undefined, 4, [1, 0])],
  'c-shell': [
    cut('top', [0, 1, 10, 11], 0, [1, 0]),
    cut('upper-cut', [1, 2, 9, 10], 1, [1, -1]),
    cut('left', [2, 3, 8, 9], 2, [0, 1]),
    cut('lower-cut', [3, 4, 7, 8], 3, [1, 1]),
    cut('bottom', [4, 5, 6, 7], 4, [1, 0]),
  ],
  'h-stem': [cut('left', undefined, 0, [0, 1])],
  'h-shoulder': [
    cut('left-cut', [0, 1, 8, 9], 1, [1, -1]),
    cut('top', [1, 2, 7, 8], 1, [1, 0]),
    cut('right-cut', [2, 3, 6, 7], 2, [1, 1]),
    cut('right', [3, 4, 5, 6], 3, [0, 1]),
  ],
  'x-diagonal': [cut('blade-a', undefined, 0, [1, 1])],
  'x-lower': [cut('blade-b-lower', undefined, 1, [1, -1])],
  'x-upper': [cut('blade-b-upper', undefined, 1, [1, -1])],
  't-blade': [cut('top', undefined, 0, [1, 0])],
  't-stem': [cut('stem', undefined, 1, [0, 1])],
}

export const LOGO_SEGMENTS = LOGO_PATHS.flatMap((source) => {
  const cuts = CUTS[source.id] ?? [cut('core-plate', undefined, 1, [1, 1])]
  return cuts.map((part) => {
    const select = (polygon: Polygon): Polygon =>
      part.vertices ? part.vertices.map((i) => polygon[i]!) : polygon
    const length = Math.hypot(...part.axis)
    return {
      ...source,
      id: `${source.id}--${part.name}`,
      sourceId: source.id,
      kind: 'segment' as const,
      role: part.name,
      order: part.order,
      axis: part.axis.map((n) => n / length) as unknown as Point,
      expanded: select(source.expanded),
      compressed: select(source.compressed),
      folded: select(source.folded),
      compact: select(source.compact),
    }
  })
})

export type LogoSegment = (typeof LOGO_SEGMENTS)[number]
