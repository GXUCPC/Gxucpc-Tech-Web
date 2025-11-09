<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'

interface Particle {
  x: number
  y: number
  deg: number
  size: number
  opacity: number
  startTime: number
  lastUpdateTime: number

  v: [number, number]
  dv: number
  opv: number
}
// 初始变量
const canvas = useTemplateRef('canvas')
const particleList: Particle[] = []
const data = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  scrollY: window.scrollY,
})
const mouseData = ref({
  x: data.value.width / 2,
  y: data.value.height / 2,
})
// 事件监听
window.addEventListener('resize', () => {
  data.value = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollY: window.scrollY,
  }
})
window.addEventListener('scroll', () => {
  data.value.scrollY = window.scrollY
})

window.addEventListener('mousemove', (e) => {
  mouseData.value = {
    x: e.screenX,
    y: e.screenY,
  }
})
// 主绘制函数
function draw(canvasEle: HTMLCanvasElement | null) {
  if (!canvasEle) return
  const ctx = canvasEle.getContext('2d')!
  ctx.clearRect(-100, -100, data.value.width * 2, data.value.height * 2)
  ctx.fillStyle = '#121212'
  ctx.fillRect(-100, -100, data.value.width * 2, data.value.height * 2)

  // 调用粒子绘制
  particleList.forEach((item, i) => {
    const offest = item.opacity * item.size * 10
    renderItem(ctx, item, offest)
    if (item.y < -200 - data.value.scrollY / 10) {
      // 删除旧粒子
      newParticle()
      return particleList.splice(i, 1)
    }
  })

  requestAnimationFrame(() => draw(canvasEle))
}

function renderItem(ctx: CanvasRenderingContext2D, item: Particle, offestN: number) {
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = item.opacity >= 0 ? item.opacity : 0

  const offest: [number, number] = [
    Math.log10(Math.abs((mouseData.value.x / data.value.width) * 2 - 1) + 1) *
      (mouseData.value.x < data.value.width / 2 ? -1 : 1),
    Math.log10(Math.abs((mouseData.value.y / data.value.height) * 2 - 1) + 1) *
      (mouseData.value.y < data.value.height / 2 ? -1 : 1),
  ]

  ctx.translate(
    item.x + offest[0] * offestN,
    item.y + offest[1] * offestN - ((data.value.scrollY / 10) * item.size) / 50,
  )
  ctx.rotate((item.deg * Math.PI) / 180)
  ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size)

  ctx.restore()
  // 速度计算
  if (item.lastUpdateTime < 0) {
    item.lastUpdateTime = new Date().getTime()
    return
  }
  const timeSpan = (new Date().getTime() - item.lastUpdateTime) * 0.001
  item.x += item.v[0] * timeSpan
  item.y += item.v[1] * timeSpan
  item.opacity += item.opv * timeSpan
  item.deg += item.dv * timeSpan
  item.lastUpdateTime = new Date().getTime()
}

function newParticle(y?: number) {
  particleList.push({
    deg: 360 * Math.random(),
    dv: -50 + 100 * Math.random(),
    opv: 0,
    opacity: 0.1 + 0.2 * Math.random(),
    size: 10 + 70 * Math.random(),
    v: [0, -20 + -80 * Math.random()],
    x: data.value.width * Math.random(),
    y: y ?? data.value.height + data.value.height * Math.random() + data.value.scrollY / 10,

    startTime: new Date().getTime(),
    lastUpdateTime: -1,
  })
}

onMounted(() => {
  for (let i = 0; i < (window.innerWidth * 3) / 100; i++) {
    newParticle(data.value.height * 2 * Math.random())
  }
  requestAnimationFrame(() => draw(canvas.value))
})
</script>

<template>
  <canvas ref="canvas" :width="data.width" :height="data.height" class="bg-canvas" />
</template>

<style scoped>
.bg-canvas {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -999;
}
</style>
