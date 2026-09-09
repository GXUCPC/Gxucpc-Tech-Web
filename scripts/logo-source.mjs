import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Reuse the actual TypeScript sources on every supported Node version, without
// a second copy of the paths or requiring Node's experimental TypeScript loader.
export async function loadLogoSource() {
  const directory = new URL('../src/components/brand/', import.meta.url)
  const compile = async (name) => {
    const source = await readFile(new URL(name, directory), 'utf8')
    return ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText
  }
  const url = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  const geometryUrl = url(await compile('logoGeometry.ts'))
  const segmentsUrl = url(
    (await compile('logoSegments.ts')).replace('./logoGeometry.ts', geometryUrl),
  )
  const sharedUrl = new URL('../public/brand/structural-assembly.js', import.meta.url).href
  const motionUrl = url(
    (await compile('logoMotion.ts'))
      .replace('./logoGeometry.ts', geometryUrl)
      .replace('./logoSegments.ts', segmentsUrl)
      .replace('../../../public/brand/structural-assembly.js', sharedUrl),
  )
  return {
    geometry: await import(geometryUrl),
    segments: await import(segmentsUrl),
    motion: await import(motionUrl),
  }
}
