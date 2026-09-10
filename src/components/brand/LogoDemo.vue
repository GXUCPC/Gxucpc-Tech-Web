<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import GxuTechLogo from './GxuTechLogo.vue'
import { LOGO_MOTION, LOGO_PROGRESS } from './logoMotion'
import type { LogoState } from './logoGeometry'

const dark = ref(false)
const theme = computed(() => (dark.value ? 'dark' : 'light'))
const inspector = ref<InstanceType<typeof GxuTechLogo>>()
const hero = ref<InstanceType<typeof GxuTechLogo>>()
const scrollArea = ref<HTMLElement>()
const scrollCompact = ref(false)
const readout = ref(0)
const running = ref(false)
const playbackRate = ref(1)
const presets = [0, 0.2, 0.4, 0.6, LOGO_PROGRESS.intermediate, 0.8, 1]
let monitor = 0

function observe(state: LogoState | 'transitioning' | 'paused') {
  running.value = state === 'transitioning'
  cancelAnimationFrame(monitor)
  const sample = () => {
    readout.value = inspector.value?.getProgress() ?? 0
    if (running.value) monitor = requestAnimationFrame(sample)
  }
  sample()
}
function seek(progress: number) {
  inspector.value?.seek(progress)
  readout.value = progress
}
function input(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}
function play(state: LogoState) {
  inspector.value?.playTo(state)
}
onBeforeUnmount(() => cancelAnimationFrame(monitor))
</script>

<template>
  <div class="identity" :data-theme="theme">
    <header class="masthead">
      <a href="/" class="back-link">GxuTech <span>↗</span></a>
      <span class="edition">MOTION IDENTITY / 01</span>
      <button class="theme-switch" :aria-pressed="dark" @click="dark = !dark">
        <span aria-hidden="true">◐</span> {{ dark ? '浅色' : '深色' }}
      </button>
    </header>

    <main>
      <section class="introduction">
        <p class="eyebrow">ONE STRUCTURE. TWO EXPRESSIONS.</p>
        <div class="intro-heading">
          <h1>展开名字，<br />折叠为核。</h1>
          <p>结构先行，字形随后。<br />两组并行解锁，笔画延展、拼接，<br />最终锁定为 GxuTech。</p>
        </div>
      </section>

      <section class="specimen" aria-label="品牌形变检查">
        <div class="section-label">
          <span>01 / THE TRANSFORMATION</span
          ><span
            >{{
              Math.round(readout * 100)
                .toString()
                .padStart(3, '0')
            }}%</span
          >
        </div>
        <div class="main-stage">
          <GxuTechLogo
            ref="inspector"
            state="expanded"
            trigger="controlled"
            :interactive="false"
            :responsive="false"
            :theme="theme"
            align="center"
            :playback-rate="playbackRate"
            @state-change="observe" />
        </div>
        <div class="transport">
          <div class="play-buttons">
            <button @click="play('expanded')">↖ 展开</button>
            <button
              @click="running ? inspector?.pause() : play(readout < 0.5 ? 'compact' : 'expanded')">
              {{ running ? 'Ⅱ 暂停' : '▷ 播放' }}
            </button>
            <button @click="play('compact')">↘ 收缩</button>
          </div>
          <label class="speed-control"
            >速度
            <select v-model="playbackRate" aria-label="动画播放速度">
              <option :value="1">1×</option>
              <option :value="0.5">0.5×</option>
              <option :value="0.25">0.25×</option>
            </select>
          </label>
          <span class="timing"
            >{{ LOGO_MOTION.duration * 1000 }} MS <span>·</span> PRECISION OVER SPECTACLE</span
          >
        </div>
        <label class="scrubber">
          <span class="sr-only">形变进度，0 为 GxuTech，约 68% 为 G + T，100% 为 Core Icon</span>
          <input type="range" min="0" max="1" step="0.001" :value="readout" @input="input" />
        </label>
        <div class="stops">
          <button
            v-for="stop in presets"
            :key="stop"
            :aria-pressed="Math.abs(readout - stop) < 0.005"
            @click="seek(stop)">
            {{
              stop === 0
                ? 'GxuTech'
                : stop === LOGO_PROGRESS.intermediate
                  ? 'G + T'
                  : stop === 1
                    ? 'Core Icon'
                    : `${stop * 100}%`
            }}
          </button>
        </div>
      </section>

      <section class="states" aria-label="三个几何状态">
        <article
          v-for="(state, index) in ['expanded', 'intermediate', 'compact'] as const"
          :key="state">
          <div class="state-stage">
            <GxuTechLogo
              :state="state"
              trigger="controlled"
              :interactive="false"
              :responsive="false"
              :theme="theme"
              align="center" />
          </div>
          <div class="state-caption">
            <span>0{{ index + 1 }}</span
            ><span>{{ ['Wordmark', 'G + T', 'Core Icon'][index] }}</span>
          </div>
        </article>
      </section>

      <section class="interaction-grid" aria-label="交互演示">
        <article class="interaction">
          <div class="section-label"><span>02 / HOVER</span><span>↔</span></div>
          <div class="interaction-stage">
            <GxuTechLogo :theme="theme" align="center" :responsive="false" />
          </div>
          <h2>停留，展开。</h2>
          <p>悬停或键盘聚焦。移开时，从当前位置反向折叠。触屏轻触，短暂展开。</p>
        </article>
        <article class="interaction">
          <div class="section-label">
            <span>03 / FIRST REVEAL</span
            ><button class="quiet-button" @click="hero?.reveal()">重播 ↗</button>
          </div>
          <div class="interaction-stage">
            <GxuTechLogo
              ref="hero"
              trigger="reveal"
              :theme="theme"
              :responsive="false"
              align="center" />
          </div>
          <h2>一次，解码。</h2>
          <p>首次访问稍作等待，再从核心生长为完整字标。展开后静止。</p>
        </article>
      </section>

      <section class="scroll-specimen">
        <div class="section-label">
          <span>04 / SCROLL HEADER</span><span>{{ scrollCompact ? 'COMPACT' : 'EXPANDED' }}</span>
        </div>
        <div
          ref="scrollArea"
          class="scroll-window"
          tabindex="0"
          aria-label="在此区域滚动，超过 60 像素时收起品牌，顶栏保持悬浮">
          <div
            class="demo-header"
            :class="{ 'is-compact': scrollCompact }"
            :style="{
              '--header-scale': LOGO_MOTION.headerScale,
              '--header-delay': `${LOGO_MOTION.mergeEnd}s`,
              '--header-duration': `${LOGO_MOTION.headerDuration}s`,
            }">
            <GxuTechLogo
              state="expanded"
              trigger="scroll"
              :theme="theme"
              :scroll-target="scrollArea"
              @scroll-change="scrollCompact = $event" />
            <span class="demo-nav">Build with clarity. <span>↗</span></span>
          </div>
          <div class="scroll-copy">
            <span class="eyebrow">SCROLL TO ENCODE ↓</span>
            <h2>信息收起。<br />专注留下。</h2>
            <p>顶部展开字标，下滚收起为核心。<br />顶栏保持悬浮，回到顶部再次展开。</p>
            <div class="scroll-end">THE CORE REMAINS.</div>
          </div>
        </div>
      </section>

      <footer class="colophon">
        <span>GxuTech / 几何构造 · 可逆形变</span><span>无循环 · 适配减少动态效果</span
        ><a href="/brand/gxutech-core.svg" download>下载 Core SVG ↗</a>
      </footer>
    </main>
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
input {
  font: inherit;
}
button,
a,
input {
  -webkit-tap-highlight-color: transparent;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 5px;
}
.identity {
  --paper: #f4f2ec;
  --ink: #171717;
  --muted: #706f68;
  --line: #d9d7ce;
  --wash: #eeece5;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: Inter, 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  &[data-theme='dark'] {
    --paper: #171717;
    --ink: #f2f2f0;
    --muted: #a4a49c;
    --line: #383833;
    --wash: #1e1e1c;
    color-scheme: dark;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  button:hover,
  a:hover {
    color: var(--muted);
  }
  p,
  h1,
  h2 {
    margin: 0;
  }
  main {
    max-width: 1240px;
    margin: auto;
    padding: 0 48px;
  }
}
.masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88px;
  margin: 0 48px;
  border-bottom: 1px solid var(--line);
}
.back-link {
  font-size: 19px;
  font-weight: 650;
  letter-spacing: -0.7px;
  span {
    margin-left: 12px;
    font-weight: 400;
  }
}
.edition,
.eyebrow,
.section-label,
.timing,
.state-caption,
.colophon {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 11px;
  letter-spacing: 1.3px;
}
.edition,
.eyebrow {
  color: var(--muted);
}
.theme-switch {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  span {
    font-size: 23px;
  }
}
.introduction {
  padding: 74px 0 52px;
}
.intro-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 26px;
  gap: 24px;
  h1 {
    font-weight: 500;
    font-size: clamp(34px, 4vw, 54px);
    letter-spacing: -2px;
    line-height: 1.24;
  }
  p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.9;
    padding-bottom: 4px;
  }
}
.specimen {
  border: 1px solid var(--line);
  padding: 26px 30px 24px;
}
.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted);
}
.main-stage {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  .gxutech-logo {
    --logo-width: 720px;
  }
}
.transport {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.speed-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--muted);
  select {
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--line);
    padding: 6px;
  }
}
.play-buttons {
  display: flex;
  gap: 8px;
  button {
    border: 1px solid var(--line);
    padding: 10px 15px;
    font-size: 12px;
  }
}
.timing {
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.6px;
  span {
    margin: 0 8px;
  }
}
.scrubber {
  display: block;
  margin-top: 30px;
  input {
    display: block;
    width: 100%;
    margin: 0;
    accent-color: var(--ink);
    cursor: ew-resize;
    height: 20px;
  }
}
.stops {
  display: flex;
  justify-content: space-between;
  margin: 10px -8px 0;
  button {
    padding: 6px 8px;
    font:
      11px Consolas,
      monospace;
    color: var(--muted);
    border-bottom: 1px solid transparent;
  }
  button[aria-pressed='true'] {
    color: var(--ink);
    border-bottom-color: currentColor;
  }
}
.states {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--line);
  padding: 24px 0;
  article {
    min-width: 0;
    padding: 0 24px;
    border-right: 1px solid var(--line);
  }
  article:last-child {
    border: 0;
  }
}
.state-stage {
  height: 138px;
  display: flex;
  align-items: center;
  justify-content: center;
  .gxutech-logo {
    --logo-width: 300px;
  }
}
.state-caption {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 10px;
}
.interaction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--line);
}
.interaction {
  min-width: 0;
  padding: 36px 28px 32px 0;
  &:last-child {
    padding-left: 28px;
    padding-right: 0;
    border-left: 1px solid var(--line);
  }
  h2 {
    font-size: 19px;
    font-weight: 500;
  }
  p {
    max-width: 370px;
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.9;
    color: var(--muted);
  }
}
.interaction-stage {
  height: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  .gxutech-logo {
    --logo-width: 380px;
  }
}
.quiet-button {
  padding: 0;
  font-size: 11px;
}
.scroll-specimen {
  padding: 36px 0;
}
.scroll-window {
  height: 360px;
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--line);
  margin-top: 24px;
  background: var(--wash);
  scrollbar-color: var(--line) transparent;
}
.demo-header {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 1;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    transform-origin: top;
    transition: transform var(--header-duration) ease;
  }
  &.is-compact::before {
    transform: scaleY(var(--header-scale));
    transition-delay: var(--header-delay);
  }
  .gxutech-logo {
    --logo-width: 208px;
  }
}
.demo-nav {
  font-size: 11px;
  span {
    margin-left: 28px;
  }
}
.scroll-copy {
  padding: 50px 36px;
  h2 {
    font-size: 38px;
    font-weight: 450;
    line-height: 1.35;
    margin: 24px 0 18px;
  }
  p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.9;
  }
}
.scroll-end {
  margin-top: 210px;
  padding-bottom: 30px;
  color: var(--muted);
  font:
    11px Consolas,
    monospace;
  letter-spacing: 2px;
}
.colophon {
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 0 0 40px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
@include mobile {
  .identity main {
    padding: 0 20px;
  }
  .masthead {
    margin: 0 20px;
    height: 70px;
  }
  .edition {
    display: none;
  }
  .introduction {
    padding: 46px 0 32px;
  }
  .intro-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }
  .specimen {
    padding: 18px 16px;
  }
  .section-label {
    font-size: 9px;
    letter-spacing: 1px;
  }
  .main-stage {
    height: 196px;
  }
  .transport {
    flex-wrap: wrap;
  }
  .play-buttons {
    width: 100%;
    button {
      flex: 1;
      padding: 10px 8px;
    }
  }
  .timing {
    font-size: 8px;
  }
  .stops {
    button {
      padding: 5px 3px;
      font-size: 9px;
    }
  }
  .states {
    padding: 18px 0;
    article {
      padding: 0 8px;
    }
  }
  .state-stage {
    height: 70px;
  }
  .state-caption {
    font-size: 8px;
    letter-spacing: 0;
  }
  .interaction-grid {
    grid-template-columns: 1fr;
  }
  .interaction {
    padding: 28px 0;
    &:last-child {
      border-left: 0;
      border-top: 1px solid var(--line);
      padding: 28px 0;
    }
  }
  .interaction-stage {
    height: 170px;
  }
  .demo-header {
    padding: 0 14px;
    .gxutech-logo {
      --logo-width: 190px;
    }
  }
  .demo-nav {
    display: none;
  }
  .scroll-copy {
    padding: 36px 20px;
    h2 {
      font-size: 30px;
    }
  }
  .colophon {
    flex-wrap: wrap;
    line-height: 1.8;
  }
}
@media (prefers-reduced-motion: reduce) {
  .identity *,
  .identity *::before {
    transition: none !important;
    animation: none !important;
  }
}
</style>
