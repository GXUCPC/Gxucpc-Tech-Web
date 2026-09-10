import { mkdir, writeFile } from 'node:fs/promises'
import { svgSource as gxuxcpcSvgSource } from '../public/previews/gxuxcpc/motion.js'
import { loadLogoSource } from './logo-source.mjs'

const {
  geometry: { polygonPath },
  segments: { LOGO_SEGMENTS: LOGO_PATHS },
} = await loadLogoSource()

const directory = new URL('../public/brand/', import.meta.url)
await mkdir(directory, { recursive: true })
for (const [name, state] of [
  ['wordmark', 'expanded'],
  ['gt', 'folded'],
  ['gxt', 'folded'], // Keep the previous asset URL as an alias.
  ['core', 'compact'],
]) {
  const xs = LOGO_PATHS.flatMap((path) => path[state].map(([x]) => x))
  const left = Math.min(...xs) - 10
  const width = Math.max(...xs) - left + 10
  const viewBox = `${left} 0 ${width} 144`
  const paths = LOGO_PATHS.map(
    (path) => `    <path id="${path.id}" d="${polygonPath(path[state])}" />`,
  ).join('\n')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title">
  <title id="title">GxuTech${name === 'wordmark' ? '' : name === 'core' ? ' — Core Icon' : ' — G + T'}</title>
  <style>svg{color:#171717}@media(prefers-color-scheme:dark){svg{color:#f2f2f0}}</style>
  <g fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="bevel">
${paths}
  </g>
</svg>
`
  await writeFile(new URL(`gxutech-${name}.svg`, directory), svg)
}
const gxuxcpcCore = gxuxcpcSvgSource(1, { tight: true }).replace(
  '<g ',
  '<style>svg{color:#171717}@media(prefers-color-scheme:dark){svg{color:#f2f2f0}}</style><g ',
)
await writeFile(new URL('gxuxcpc-core.svg', directory), gxuxcpcCore)
console.log('Exported GxuTech assets and the GxuXCPC Core Icon to public/brand (gxt URL retained as alias).')
