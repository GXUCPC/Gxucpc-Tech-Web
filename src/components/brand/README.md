# GxuTech motion identity

开发预览：`http://localhost:5173/logo-demo.html`。这是独立的 Vite HTML 入口，生产构建也会输出 `dist/logo-demo.html`，不占用站点路由。

`GxuTechLogo` 保留独立演示与组件接口。HeaderBar 现使用 `GxuXCPCLogo`：顶部展开 GxuXCPC，滚动超过 64px 后收起为 Core Icon，回到 32px 以内展开。Header 使用 sticky 保持在视口顶部，并保留原有文档占位。全局横向裁剪使用 overflow-x: clip，避免 body 成为阻断 sticky 的额外滚动容器。收起后，桌面悬停/聚焦可临时展开；移动端沿用同一滚动规则，菜单打开时保持完整字标；平板默认 G + X。

## 使用

```vue
<script setup lang="ts">
import GxuTechLogo from '@/components/brand/GxuTechLogo.vue'
</script>

<template>
  <!-- 实际 Header：顶部展开，下滚收起 -->
  <GxuTechLogo state="expanded" trigger="scroll" theme="dark" />

  <!-- 默认 Core，100ms 悬停意图延迟；移开反向 -->
  <GxuTechLogo trigger="hover" />

  <!-- 首次访问等待 150ms 后展开；localStorage 记忆，不循环 -->
  <GxuTechLogo trigger="reveal" :responsive="false" />

  <!-- 父组件控制；关闭响应式自动状态可精确展示全部字标 -->
  <GxuTechLogo state="intermediate" trigger="controlled" :responsive="false" />
</template>
```

| 参数             | 含义                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `state`          | `expanded` / `intermediate`（G + T）/ `compact`                          |
| `trigger`        | `hover` / `scroll` / `controlled` / `reveal`                             |
| `interactive`    | 是否允许悬停、聚焦、点击（默认 true；controlled/reveal 为静态语义）      |
| `align`          | `start` / `center` / `end`，只移动 SVG 内部结构                          |
| `theme`          | `auto` / `light` / `dark` / `inherit`                                    |
| `responsive`     | 默认 true；≤768px 初始 Core，769–1024px 使用 G + T；显式交互展开完整字标 |
| `mobileExpanded` | 移动菜单打开时传 true                                                    |
| `scrollTarget`   | 可选滚动容器 HTMLElement；默认 window                                    |
| `progress`       | 显式暂停的收缩进度 0–1；手动检查不受 reduced motion 禁止自动动画的限制   |
| `revealOnce`     | 默认 true；首次访问记录不可用时仍能正常展示                              |
| `playbackRate`   | 默认 1；预览使用 0.25 可逐笔画慢放，改变速度不重置进度                   |

宽度通过 `--logo-width` 设置，默认 228px。所有形变共用 `0 0 600 144` 的 viewBox 和固定宽高比。容器尺寸只受布局/断点控制，不随形变变化。Header 的轻微收紧仅作用于背景表面与内容 transform，保留 64px 文档占位。

实例暴露 `expanded`、`compact`、`transitioning`、`currentState`、`playTo(state)`、`seek(progress)`、`pause()`、`getProgress()`、`reveal()`。`state-change` 通知开始/完成；`scroll-change` 的布尔值表示滚动目标是否紧凑。`getProgress()` 是实时 playhead，不触发 Vue 的逐帧重渲染。

## 几何与运动

- `logoGeometry.ts`：保留原来的终态坐标蓝图，不直接渲染完整字形。`LOGO_GEOMETRY.techTuck` 仍将 Tech 整组向左收紧 28 个单位，u/T 竖笔间距为 22。
- `logoSegments.ts`：将蓝图切为 **40 个独立笔画片段**，所有状态使用相同的顶点划分，完整字标与 Core 的几何覆盖保持一致。G 外壳分段伸展；x 两条 Blade 错相组装；u 两根竖笔先伸出，底部后连接；T 横梁与竖笔分离；e/c/h 由横线、竖线与切角拼接。不存在用于覆盖分段的完整字母图层。
- `public/brand/structural-assembly.js`：两个品牌共用的纯函数组装引擎。每个 segment 保留 `from`、`folded`、`to`、轴向、`startProgress`、`endProgress` 等数据。片段先从 Core 的母结构释放，形成保留笔画粗细的短结构，再沿自身轴向延展，闭合接缝。每段有独立进度，字符并行施工，没有整字缩放或 opacity reveal。
- `logoMotion.ts`：720ms 单一 playhead；字符错相 30ms、笔画错相 22ms、x Blade 错相 28ms。配置集中在 `LOGO_MOTION`。内部展开进度 `q = 1 - progress`：前约 32% 解锁并抽出 G/T，32–68% 分支定位与笔画延展并行，40–90% 逐步连接成字，84–100% 完成约 1 个 SVG 单位的锁定。收起严格沿同一路径反向，途中改变目标不会重置起点。
- `GxuTechLogo.vue`：逐帧仅更新 SVG `d` 和内部 transform；静止时停止 RAF，卸载时取消 RAF/定时器/监听。每条显示路径标记 `data-kind="segment"`。细同色描边覆盖相邻片段的抗锯齿接缝；没有整字替换图层或动画依赖包。
- `LogoDemo.vue`：任意进度拖动、20/40/60/80% 停帧、0.25× / 0.5× / 1× 播放、暂停与双向播放、悬停、首次 reveal、滚动容器和明暗主题。

GxuXCPC 的独立预览位于 `public/previews/gxuxcpc/index.html`，可通过 `/previews/gxuxcpc/index.html` 打开。`segments.js` 将原蓝图切为 **37 个片段**：两个 C 各由 top / upper cut / left / lower cut / bottom 五段组成；P 依次组装 stem、top、right、middle，并保留已加宽的 132 单位宽度。`motion.js` 的 `GXU_XCPC_MOTION` 设置 760ms 时长、30ms 字符错相、22ms 笔画错相、28ms Blade 错相及 25ms Dual-X 相位差。G→Gxu 与 X→XCPC 并行构建。预览控制台提供 `window.gxuxcpcPreview.assembly`，可检查每条笔画的来源和时间窗。

`GxuXCPCLogo.vue` 直接复用这套 37 段几何、时间轴及减少动态效果逻辑，使 Header 与独立预览拥有相同的展开、收起和反向组装路径。

`prefers-reduced-motion: reduce` 下，自动/交互形变直接切换终态；运行期间更改系统偏好也立即生效。键盘聚焦展开，Enter/Space 可临时切换，Escape 恢复自动状态。

## 导出与验证

```sh
pnpm logo:export   # 从同一套坐标导出三份独立 SVG
pnpm logo:test     # 两品牌几何覆盖、笔画时序、视口、可逆进度、慢放及 RAF 停止测试
pnpm build
```

产物：`public/brand/gxutech-wordmark.svg`、`gxutech-gt.svg`、`gxutech-core.svg`。旧 `gxutech-gxt.svg` 地址保留为 G + T 的兼容别名。站点 favicon 使用 Core SVG。静态文件按几何边界计算 viewBox，组件动画始终使用固定 viewBox。

检查时将速度设为 0.25×，从 Core 展开并暂停观察笔画；途中反向应原路拆回。进度控件沿用原约定：0 为完整字标，1 为 Core。所有字形由 segment 路径构成；禁用 CSS opacity/transition 或隐藏 `data-kind="glyph"` 不影响主要组装过程。纯函数测试覆盖两个品牌各 201 个进度采样、终态分段与原蓝图的覆盖一致性、C/P/u 的笔画连接顺序、慢放时长和反转不跳帧。
