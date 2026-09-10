# 前端响应式重构方案与设计

> 适用项目：`Gxucpc-Tech-Web`（Vue 3.5 + Vite 7 + TypeScript + Element Plus 2.11 + Sass + GSAP）
> 编写日期：2026-09-06
> 状态：方案评审稿

---

## 1. 背景与目标

本站当前只对桌面端（1920 宽度级）做了完整打磨，移动端适配是"事后打补丁"式的：断点不统一、
适配规则与页面耦合、部分页面完全没有移动端规则。本次重构目标：

1. **统一响应式基础设施**：断点 token 化、mixin 统一、全局样式归位，杜绝各页自定断点。
2. **全端可用**：手机（≤768）、平板（769–1024）、桌面（≥1025）、大屏（>1920）四档均有明确设计。
3. **消除结构性隐患**：`!important` 对抗 JS 内联样式、mixin 按页 include 遗漏、`100vw` 溢出等。
4. **桌面零回归**：桌面形态是现有核心资产，所有改动以截图基线保护。
5. **可访问性加分项**：`prefers-reduced-motion`、44px 触控目标、语义化导航。

非目标：不引入 CSS 框架（Tailwind 等）、不重做视觉设计、不改路由结构。

---

## 2. 现状诊断

### 2.1 断点混乱（5 种断点并存，无 token）

| 断点 | 使用位置 |
| --- | --- |
| 768px | HeaderBar、Home、globalStyle、mixins、ArticleList、StoryCards、ArticleDetail |
| 992px | StoryCards |
| 1024px | ArticleList |
| 1100px | JoinUs、XCPCIntroduction、ArticleDetail |
| 1921px | MainLayout、HeaderBar（大屏缩放，这部分是对的） |

同一个语义（"窄屏"）在 768 / 1024 / 1100 三个值上飘，改一个断点要全局搜。

### 2.2 移动端规则与页面耦合（结构性缺陷）

- `src/store/mixins.scss` 的 `inject-mobile-styles` 是一份"全局类的移动端适配"，
  但它**只被 2 个页面 include**（`tech/Introduction.vue`、`xcpc/XCPCIndex.vue`）。
- `Home.vue:1183-1359` 又把几乎同一份内容**复制了一遍**（且 scoped 后只作用于 Home 自己的元素）。
- 结果：同样使用全局类 `.infoContainer`（`max-width: 60vw`，手机上仅约 225px 宽）的
  `tech/TiemExprience.vue` **没有任何移动端规则**，手机上严重挤压。
- `store/` 目录里放样式文件（`globalStyle.css` / `mixins.scss`），位置语义错误。

### 2.3 `!important` 对抗 JS 内联样式

- Hero 手风琴由 JS 绑定内联 `left/width`（`Home.vue` `:style="getHeroAccordionStyle(i)"`，
  hover 驱动），移动端 CSS 用 `left: 0 !important; width: 100% !important` 硬掰成纵向。
- 触屏没有 hover，`@mouseover` 只能依赖移动浏览器 tap 时的模拟事件，展开第二面板不可靠。
- 技术组手风琴（Introduction）同理，靠 mixin 里的 `!important` 顶掉 JS 计算的 `left`。

### 2.4 固定宽度 / 内联样式硬伤（逐文件清单）

| 文件:行 | 问题 | 严重度 |
| --- | --- | --- |
| `pages/tech/Introduction.vue:166` | 内联 `style="width: 1000px"`（标题块），手机端必然溢出，样式表无法覆盖内联样式 | **P0** |
| `pages/tech/Introduction.vue:224` | 内联 `margin-top: 20vh; margin-right: 5em` 等多处定值 | P1 |
| `pages/xcpc/competitionSignUp.vue:360` | `.side-nav { width: 250px; position: sticky }`，整页**无任何媒体查询**，表单+侧栏横排挤压 | **P0** |
| `pages/tech/Interview.vue:415-432` | `width: 500px`、`min-width: 140px`，无媒体查询 | **P0** |
| `pages/tech/TiemExprience.vue` | 全局类 `.infoContainer` 受 `max-width:60vw` 影响，无移动端规则 | **P0** |
| `pages/admin/AdminLayout.vue:88-101` | `100vw/100vh` fixed 全屏 + 侧栏 `240px` 定宽，无任何响应式；内容区未设 `min-width:0`，el-table 会把布局撑爆 | P1 |
| `components/LoginWindow.vue:260-361` | `450px / 340px` 定宽，部分有 `max-width:90vw` 兜底、部分没有 | P1 |
| `components/FeedbackModal.vue:163` | `450px` + `max-width:90%`，已有兜底（仅需归一写法） | P2 |
| `pages/tech/JoinUs.vue:330`、`xcpc/XCPCIntroduction.vue:319` | 侧栏 `250px`，有 1100 断点（断点需归一） | P2 |
| `pages/articles/ArticleDetail.vue:317` | 侧栏 `220px`，有 1100/768 断点 | P2 |
| `pages/Home.vue:719/761` | `width: 100vw` 全幅出血，有滚动条时横向溢出（被 `overflow-x:hidden` 掩盖） | P2 |
| `store/globalStyle.css:21-27` | `--page-padding-x: 10rem → 15px` 两级跳：769–1100 的平板区间保留 160px 留白，800px 屏幕只剩约 480px 内容区 | P1 |
| `components/HeaderBar.vue:491` | 手机端隐藏品牌名 `.brand`，顶栏只剩汉堡按钮，缺少站点标识 | P2 |

（`ArticleList.vue` 的 3 列→2 列→1 列网格、`StoryCards.vue` 的 992/768 处理是现状里做得好的范式，
重构后作为标准写法推广。）

### 2.5 JS 侧问题

- `Home.vue:409` 每次点击"了解更多"都 `ScrollSmoother.create()` 一次：滚动定位应改用
  共享实例或 `el.scrollIntoView({ behavior: 'smooth' })`，避免重复 wrap DOM。
- 无任何 `prefers-reduced-motion` 处理；SplitText 逐字动画在低端手机上开销不小。
- 全站没有 `useBreakpoint` 类响应式状态源，组件无法感知断点做 JS 分支。

---

## 3. 总体策略

**桌面优先（desktop-first）渐进降级**，而非移动优先重写：

- 现有 CSS 全部是 desktop-first 写法，移动端规则是 `max-width` 覆盖层；反向重写（min-width）
  意味着全量样式重排，风险与工作量翻倍，收益只在代码洁癖层面。
- 桌面形态（GSAP 动效、横向手风琴、大留白）是站点核心体验，保持为基线；
  移动端的目标是"**完整可读、可操作**"，允许合理简化（动效降级、布局堆叠）。

三条主线：

1. **基建先行**：token + mixin + 样式归位 + 构建注入，先立规矩再改页面。
2. **全局类集中适配、组件类就近适配**：`.title/.headText/.infoContainer` 等全局类的响应式
   只存在于全局样式一处；组件私有类的响应式写在组件 `<style scoped>` 内（如 ArticleList 现状）。
3. **JS 布局用 `gsap.matchMedia()` 分支**，而不是 CSS `!important` 打架。

---

## 4. 断点体系设计

五档语义断点，SCSS 变量 + 语义 mixin 双层：

```scss
// src/styles/_tokens.scss
$bp-xs:  480px;   // 小屏手机（特殊横排微调用）
$bp-sm:  768px;   // 手机上限 —— 与现有适配主断点兼容
$bp-md:  1024px;  // 平板 / 竖屏小笔记本
$bp-lg:  1280px;  // 标准桌面
$bp-xl:  1920px;  // 大屏缩放起点（沿用现状 1921 边界，边界值归到 md mixin）

// src/styles/_mixins.scss
@use './tokens' as *;

@mixin below($bp) { @media (max-width: $bp) { @content; } }
@mixin above($bp) { @media (min-width: $bp + 1px) { @content; } }
@mixin between($lo, $hi) { @media (min-width: $lo + 1px) and (max-width: $hi) { @content; } }

// 语义别名（业务代码只用这一层，不直接写像素）
@mixin mobile  { @include below($bp-sm) { @content; } }             // ≤768
@mixin tablet  { @include between($bp-sm, $bp-md) { @content; } }   // 769–1024
@mixin touch   { @include below($bp-md) { @content; } }             // ≤1024（手机+平板共用）
@mixin desktop { @include above($bp-md) { @content; } }             // ≥1025
@mixin wide    { @include above($bp-xl) { @content; } }             // >1920
```

迁移映射：旧 768 → `mobile`；旧 992/1024/1100 → 统一为 `touch`（≤1024）；
旧 1921 → `wide`。**新增的 769–1024 平板档**是本次补齐的主要空白。

---

## 5. 样式架构设计

### 5.1 目录结构

```
src/styles/
  _tokens.scss      # 断点 SCSS 变量、z-index 层级
  _mixins.scss      # 断点 mixin（@use tokens）
  global.scss       # 原 store/globalStyle.css 迁移：reset、全局类、:root 自定义属性 + 全局响应式基线
  admin.scss        # 后台专用覆盖（可选，Phase 4）
```

- `main.ts` 引入改为 `import '@/styles/global.scss'`；删除 `store/globalStyle.css`、`store/mixins.scss`。
- 各组件里现存的两处 `@use '@/store/mixins.scss' as *;` 同步删除。

### 5.2 构建期自动注入 mixin（免每页 @use）

```ts
// vite.config.ts
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/_mixins.scss" as *;`,
    },
  },
},
```

> 注意：注入后所有组件文件里**不得**再手动 `@use '@/styles/_mixins.scss'`（同名全局成员会报
> 重复加载错误），Phase 0 统一清理。`_tokens.scss` 只含 SCSS 变量、被 `_mixins.scss` @use，
> 其中的 CSS 自定义属性（`:root` 块）放在 `global.scss`，避免被重复输出。

### 5.3 流式 Design Token（CSS 自定义属性）

```css
/* global.scss :root */
:root {
  /* 页面左右留白：手机 15px（保持现状）→ 平板流式 → 大屏 160px（保持现状） */
  --page-padding-x: clamp(24px, 10vw, 160px);

  --content-max: 1920px;      /* 内容列上限（沿用 MainLayout） */
  --header-h: 64px;

  /* 流式字号：平板不再出现 2.5em 大标题 + 160px 留白的组合 */
  --fs-display: clamp(1.8rem, 1.2rem + 1.8vw, 2.5rem);  /* .title */
  --fs-head:    clamp(1.5rem, 1.1rem + 1.4vw, 2rem);    /* .headText */
  --fs-body:    clamp(1rem, 0.95rem + 0.25vw, 1.4em);   /* .infoContainer/.text3 */
}

@media (max-width: 768px) {
  :root { --page-padding-x: 15px; }   /* 手机端保持现状 15px */
}
```

### 5.4 全局响应式基线（替代 inject-mobile-styles）

把 `mixins.scss` 中那段移动端规则**原样迁入** `global.scss`（全局类只此一处），并补上
769–1024 平板档，例如：

```scss
/* 全局类平板档：现在完全缺失 */
@include touch {
  .infoContainer { max-width: 100%; padding: 0 var(--page-padding-x); font-size: 1.2em; }
  .title { font-size: var(--fs-display); }
}
@include mobile {
  .title { font-size: 1.8em; margin: 1.5em auto; text-align: center; }
  .infoContainer { flex-direction: column; font-size: 1.1em; /* …沿用现 mixin 内容… */ }
  /* …headText / subtitle / textCenter 等其余全局类，内容取自现 inject-mobile-styles… */
}
```

`Home.vue` 中复制的那份全局类移动端块删除，只保留 Home **私有类**（hero、benefits、project
等）的响应式规则。

### 5.5 写法约定

- 弹窗/浮层宽度统一：`width: min(450px, calc(100vw - 32px))`，禁止裸 `width: 450px`。
- 全幅出血统一：`margin-inline: calc(50% - 50vw)` 写法保留，但父级需 `overflow: clip`；
  高度优先 `100dvh/100svh`（手机地址栏）。
- 禁止新增内联布局样式（`style="width: …"`）；存量内联样式在 Phase 3 清理为 class。
- 网格自适应列默认写法：`repeat(auto-fit, minmax(260px, 1fr))`（Home 现状已是），移动端
  再降为 `1fr` 单列。

---

## 6. 关键区块三态设计（桌面 / 平板 / 手机）

### 6.1 顶部导航 HeaderBar

| 档 | 形态 |
| --- | --- |
| ≥1025 | 现状：文字导航 + hover 下拉（`@media (hover:hover)` 已正确处理触屏判定） |
| 769–1024 | 维持桌面导航（文字导航足够窄，可放入 769px） |
| ≤768 | 汉堡 + `el-menu` 竖向下拉（现状保留）；**品牌名改为缩小版显示**（`font-size:0.9em`），不再整块隐藏 |

### 6.2 首页 Hero 手风琴（重点）

```
桌面 ≥1025                     平板 769–1024 / 手机 ≤768
┌──────────┬────┐              ┌──────────────────┐
│ 算竞(70%) │开发│ hover 切换    │   算竞 (68%)      │ ← 点击切换
│          │30% │ 横向布局      │   标题+简介+按钮   │   纵向堆叠
└──────────┴────┘              ├──────────────────┤
                               │   开发 (32%)      │
                               └──────────────────┘
```

实现方式（`gsap.matchMedia()` 取代 CSS `!important` 硬掰内联样式）：

```ts
const mm = gsap.matchMedia()
mm.add(
  {
    isDesktop: '(min-width: 1025px)',
    isNarrow:  '(max-width: 1024px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (ctx) => {
    const { isDesktop, reduceMotion } = ctx.conditions
    // 桌面：保留现有横向 left/width 内联计算 + hover 驱动
    // 窄屏：不再输出内联 left/width，纵向堆叠完全交给 CSS（类名切换 + CSS 过渡）
    // reduceMotion：跳过 SplitText 逐字动画，直接置终态
  },
)
```

- 模板交互改为 `@mouseover`（桌面）+ `@click`（触屏/窄屏）双驱动。
- 窄屏下 `getHeroAccordionStyle` 返回空对象，现有 `@media (max-width:1024px)` 纵向 CSS
  从 `!important` 降级为普通规则（不再需要对抗内联样式）。
- 769–1024 与 ≤768 复用同一套纵向规则（`touch` mixin），手机档再微调字号。

### 6.3 侧栏型页面（competitionSignUp / Interview / JoinUs / XCPCIntroduction / ArticleDetail）

统一"内容 + 右侧锚点侧栏"模板：

```
≥1025                                ≤1024
┌──────────────────┬───────┐        ┌──────────────────────┐
│                  │ 侧栏   │        │ 锚点导航（横向可换行） │
│   正文内容        │ 250px │        ├──────────────────────┤
│                  │sticky │        │   正文内容（单列）     │
└──────────────────┴───────┘        └──────────────────────┘
```

```scss
@include touch {
  .pageShell { flex-direction: column; }
  .side-nav {
    position: static; width: auto; border-left: none;
    border-top: 2px solid var(--border-dark);
    padding: 12px 0; display: flex; flex-wrap: wrap; gap: 4px 16px;
    li { margin-bottom: 0; }
  }
}
```

落在各组件 scoped 内（类名各自已有），全局只提供 mixin 范式。competitionSignUp 与
Interview 目前**零媒体查询**，是本组重点。

### 6.4 卡片网格（benefits / project / articleList / StoryCards）

- 桌面：`repeat(auto-fit, minmax(260px, 1fr))`（现状）。
- 平板：自然降为 2–3 列（auto-fit 已处理，无需额外规则）。
- 手机：`1fr` 单列（现有规则保留，断点归一到 `mobile`）。
- StoryCards"一页三张"翻页：平板一页两张、手机一页一张（依据 `useBreakpoint` 调整 pageSize，
  而非 CSS 横向滚动）。

### 6.5 表单与弹窗（LoginWindow / FeedbackModal / competitionSignUp 弹窗）

- 统一 `width: min(<设计宽>, calc(100vw - 32px))`。
- 表单内部：手机端 `.form-row` 双列改单列；按钮组全宽。
- Element Plus 表单 `label-position`：窄屏改 `top`（`useBreakpoint` 或 el-form 响应式属性）。

### 6.6 后台 Admin（P2：达到"可用"即可）

- `AdminLayout`：≤768 侧栏改抽屉（汉堡触发，`useBreakpoint` 控制默认收起），
  `main` 区补 `min-width: 0`，`flex: 1`。
- el-table 外层容器允许横向滚动（el-table 自带 overflow 能力，关键是父容器别被撑开）。
- 弹窗（查看名单 500/800px）套统一弹窗宽度模式。
- 100vw/100vh → `inset: 0` + `100dvh`。

### 6.7 Footer

- 桌面三栏 → 平板两栏 → 手机单列堆叠（`flex-wrap` + `touch` 断点微调），
  现 `max-width: 2000px` 保留。

---

## 7. JS 侧配套设计

### 7.1 useBreakpoint 组合式函数

```ts
// src/composables/useBreakpoint.ts
const QUERIES = {
  isMobile: '(max-width: 768px)',
  isTouch: '(max-width: 1024px)',
  isWide: '(min-width: 1921px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const

export function useBreakpoint() {
  // matchMedia + 监听，模块级单例，避免 N 个组件各挂一份 listener
  // 返回 Readonly<Record<keyof typeof QUERIES, Ref<boolean>>>
}
```

消费方：HeaderBar（可选）、StoryCards pageSize、el-form label-position、AdminLayout 侧栏、
hero 交互模式。

### 7.2 GSAP 治理

- hero / 技术组手风琴的 JS 布局迁移到 `gsap.matchMedia()`（见 6.2）。
- 全局动效入口统一尊重 `reduceMotion`：跳过 SplitText 逐字动画、ScrollTrigger 改直显。
- `ScrollSmoother.create()` 每点击创建一次 → 改为共享单例或直接
  `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })`
  （当前 `smooth: false`，其实并未用到平滑滚动能力，scrollIntoView 完全等价且零成本）。

### 7.3 渲染层面

- `index.html` 的 viewport meta 已正确，无需改动。
- 手机端对 `backdrop-filter` 模糊半径做降档（HeaderBar blur(14px) → 8px），低端机滚动更顺。

---

## 8. 实施计划

| 阶段 | 内容 | 涉及文件 | 工作量 | 完成标志 |
| --- | --- | --- | --- | --- |
| **P0 基建** | styles/ 目录、tokens、mixins、vite additionalData、globalStyle.css/mixins.scss 迁移、清理 2 处旧 @use | vite.config.ts、styles/*、main.ts、Introduction/XCPCIndex 的 @use | 0.5d | `pnpm build` 通过，桌面截图无 diff |
| **P1 全局基线 + 骨架** | inject-mobile-styles 内容迁入 global.scss 并补平板档；Home.vue 移动块去重；弹窗宽度归一；Header 品牌/留白 token 化 | global.scss、Home.vue、LoginWindow、FeedbackModal、HeaderBar、FotterBar | 1d | 全站页面在 375/768/1024 无横向滚动 |
| **P2 首页深改** | hero `gsap.matchMedia` + click 交互 + 去 `!important`；StoryCards 分档 pageSize；ScrollSmoother→scrollIntoView；reduced-motion | Home.vue、StoryCards.vue、useBreakpoint.ts | 1.5d | 手机端 hero 可点击展开、动画降级生效 |
| **P3 子页面** | 侧栏页模板改造（competitionSignUp、Interview 为零适配重点）；Introduction 内联样式清理（width:1000px 等）；ArticleDetail/JoinUs/XCPCIntroduction 断点归一 | 6 个页面 | 1.5d | 各页三态截图走查通过 |
| **P4 Admin + 验收** | AdminLayout 抽屉侧栏、表格横滚、弹窗归一；按第 9 节矩阵全量回归 | admin/* | 1d | 验收矩阵全绿 |

合计约 **5–5.5 人天**。分支策略：`refactor/responsive` 长分支，每阶段一个 PR 独立合入，
桌面截图基线（1920×1080、2560×1440）作为每阶段回归门禁。

> P3 内联样式清理（Introduction.vue `width:1000px` 等处）会轻微改动桌面端该标题块的
> 视觉对齐，需要与设计确认基准截图后再动手。

---

## 9. 验收标准与测试矩阵

**硬性标准**

1. 视口 375 / 390 / 414 / 768 / 820 / 1024 / 1280 / 1440 / 1920 / 2560 十档下，
   `document.scrollingElement.scrollWidth <= window.innerWidth`（无横向滚动）。
2. 全部路由在手机/平板档：文字完整可读、按钮触控目标 ≥ 44×44、表单可提交、弹窗可关闭。
3. 桌面档（≥1280）与基线截图逐页比对无意外回归。
4. `prefers-reduced-motion: reduce` 下页面直接呈现终态，无逐字/滚动动画。
5. 触屏真机（或 DevTools touch 模拟）可通过点击完成：hero/技术组手风琴展开、
   汉堡导航、翻页卡片、全部表单。

**走查矩阵**（路由 × 断点，✓/✗ 记录）

| 路由 | 375 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| / | | | | | |
| /xcpc、/xcpc/introdution、/xcpc/join-us | | | | | |
| /xcpc/competitionSignUp（后端开启时） | | | | | |
| /tech/introduction、/tech/contuctUs、/tech/experience | | | | | |
| /articles、/articles/:id（后端开启时） | | | | | |
| /admin/* | | | | | |

工具：Chrome DevTools device toolbar + 真机（微信内置浏览器优先验证，目标用户多为手机扫码访问）；
可选脚本化 `scrollWidth` 巡检（Playwright 十档遍历）。

---

## 10. 风险与对策

| 风险 | 对策 |
| --- | --- |
| additionalData 注入与存量 `@use` 冲突报错 | P0 阶段一次性清理全部显式 @use，build 门禁验证 |
| hero 去 `!important` 后窄屏样式回到内联控制 | `getHeroAccordionStyle` 在窄屏返回空对象，与 matchMedia 断点严格一致（同一 1024 值） |
| SplitText 在窄屏换行变化导致 mask 错位 | 已有 `autoSplit: true`；reduceMotion 下整体跳过 |
| 桌面回归 | 每阶段截图 diff（1920/2560 两档），基线入库 |
| Element Plus 组件（el-table、el-form）撑破布局 | 容器层 `min-width: 0` + 统一弹窗宽度模式，见 6.5/6.6 |
| 微信内置浏览器 dvh 兼容 | `100svh` 已在使用并配 `100vh` 兜底前置，保持该写法顺序 |

---

## 附：本次摸底依据的关键代码位置

- 断点分布：`grep -rn "@media" src` → 768/992/1024/1100/1921 五种
- mixin 仅 2 页引用：`pages/tech/Introduction.vue:290,358`、`pages/xcpc/XCPCIndex.vue:268,335`
- Home 移动块复制：`pages/Home.vue:1183-1359`
- hero 内联布局与 hover 交互：`pages/Home.vue` 模板 `:style="getHeroAccordionStyle(i)"`、`@mouseover`
- 零媒体查询页面：`pages/xcpc/competitionSignUp.vue`、`pages/tech/Interview.vue`、`pages/tech/TiemExprience.vue`、`pages/admin/*`
- 内联固定宽：`pages/tech/Introduction.vue:166`（width:1000px）
- 每点击建一次 ScrollSmoother：`pages/Home.vue:409`
