/**
 * Hero 首屏背景图：自动读取，无需配置
 * - 算法竞赛：src/assets/hero-bg-algo/ 下的 jpg、png、webp，按文件名字典序
 * - 技术组：src/assets/hero-bg-dev/ 下的 jpg、png、webp，按文件名字典序
 */

function loadHeroBgUrls(glob: Record<string, { default: string } | string>): string[] {
  return Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, m]) => (typeof m === 'string' ? m : m.default))
}

export const HERO_BG_ALGO = loadHeroBgUrls(
  import.meta.glob('/src/assets/hero-bg-algo/*.{jpg,jpeg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, { default: string } | string>,
)

export const HERO_BG_DEV = loadHeroBgUrls(
  import.meta.glob('/src/assets/hero-bg-dev/*.{jpg,jpeg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, { default: string } | string>,
)
