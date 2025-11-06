<script setup lang="ts">
import { gsap } from 'gsap'
import { nextTick, ref, useTemplateRef, watchEffect } from 'vue'

const props = defineProps<{
  loading?: boolean
  progress?: number
  text?: string
}>()
const iconRef = useTemplateRef('iconRef')
const containerRef = useTemplateRef('containerRef')
const show = ref(false)

watchEffect( () => {
  const openTl = gsap.timeline()
  const containerEle = containerRef.value
  openTl
    .fromTo(
      containerEle,
      {
        opacity: 0,
        backgroundColor: 'rgba(0,0,0,0)',
      },
      {
        opacity: 1,
        duration: 0.5,
        backgroundColor: '#1e1e1e',
        onUpdate: function () {
          if (!containerEle) return;
          const progress = this.progress();
          const blurValue = 50 * (1 - progress);
          containerEle.style.backdropFilter = `blur(${blurValue}px)`;
        },
      },
    )
    .pause()
  const tl = gsap.timeline()
  const iconEle = iconRef.value
  tl.fromTo(
    iconEle,
    {
      scale: 5,
      opacity: 0,
    },
    {
      ease: 'power1.out',
      duration: 0.5,
      scale: 1,
      opacity: 1,
      onUpdateParams: [],
      onComplete: startLoadingAni,
    },
  ).pause()
  if (props.loading) {
    show.value = true
    openTl.play()
    tl.play()
  } else {
    openTl.reverse(0)
    tl.reverse(0).eventCallback('onReverseComplete', () => {
      show.value = false
    })
  }
})

function startLoadingAni() {
  const tl = gsap.timeline({ repeat: -1 })
  tl.to(iconRef.value, {
    duration: 1,
    ease: 'power2.out',
    rotate: 360,
    borderRadius: '50%',
    yPercent: -100,
  })
    .to(iconRef.value, {
      duration: 1,
      ease: 'power2.in',
      rotate: 0,
      borderRadius: '50%',
      yPercent: 0,
    })
    .to(iconRef.value, {
      duration: 1,
      ease: 'power2.out',
      rotate: 360,
      borderRadius: 5,
      yPercent: -100,
    })
    .to(iconRef.value, {
      duration: 1,
      ease: 'power2.in',
      rotate: 720,
      borderRadius: 5,
      yPercent: 0,
    })
}
</script>

<template>
  <div class="loadingContainer" ref="containerRef" v-if="show" v-bind="$attrs">
    <div class="loadingContent">
      <div class="loadingIcon" ref="iconRef"></div>
      <el-progress
        striped
        striped-flow
        text-inside
        duration="6"
        :stroke-width="18"
        :percentage="props.progress ?? 50"
      />
      <el-text>{{ props.text }}</el-text>
    </div>
  </div>
</template>

<style scoped>
.loadingContainer {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e;
}

.loadingContent {
  width: 25%;
  display: flex;
  gap: 30px;
  flex-direction: column;
}

.loadingIcon {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  background-color: #fff;
}
</style>
