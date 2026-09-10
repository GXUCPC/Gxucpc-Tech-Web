type Point = readonly [number, number]
type Polygon = readonly Point[]
export type AssemblySegment = {
  id: string
  branch: string
  letter: string
  root: boolean
  order: number
  axis: Point
  from: Polygon
  folded: Polygon
  to: Polygon
}
export type AssemblyConfig = {
  duration: number
  easing: readonly number[]
  groups: Record<string, readonly string[]>
  strokeStagger: number
  bladeStagger: number
  characterStagger: number
  dualXLead: number
  stockLength: number
  unlockStart: number
  seedEnd: number
  layoutEnd: number
  extractionEnd: number
  constructionStart: number
  constructionEnd: number
  finalLockStart: number
  finalLockPeak: number
  socketGap: number
  unlockOffset: number
  finalLockOffset: number
}
export function structuralEase(value: number, easing?: readonly number[]): number
export function createStructuralAssembly<T extends AssemblySegment>(
  segments: T[],
  config: AssemblyConfig,
): {
  segments: Array<
    T & {
      stock: Polygon
      startProgress: number
      extractionEnd: number
      constructionStart: number
      endProgress: number
      seedStart: number
    }
  >
  sample(expansionProgress: number): { polygons: [number, number][][]; strokeProgress: number[] }
}
