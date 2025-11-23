<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { onMounted, onUpdated, useTemplateRef } from 'vue'

const ele = useTemplateRef('ele')
const props = defineProps<{
  scrollInAni?: (ele: HTMLDivElement) => gsap.core.Animation
}>()
const emit = defineEmits<{
  (e: 'mounted', ele: HTMLDivElement): void
  (e: 'updated', ele: HTMLDivElement): void
}>()

onUpdated(() => {
  emit('updated', ele.value!)
})

onMounted(() => {
  gsap.registerPlugin(SplitText, ScrollTrigger)
  emit('mounted', ele.value!)
  ScrollTrigger.create({
    trigger: ele.value,
    animation: props.scrollInAni?.(ele.value!),
  })
})
</script>

<template>
  <div ref="ele" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<style scoped></style>
