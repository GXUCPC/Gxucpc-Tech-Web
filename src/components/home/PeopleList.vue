<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import {
  DURATION_LONG,
  DURATION_MEDIAN,
  DURATION_SHORT,
  STAGGER_CHAR,
  STAGGER_SHORT,
} from '@/constants/animation'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

export interface PeopleData {
  name: string
  comment?: string
  info: string
  avatar?: string
}

const props = defineProps<{
  list: PeopleData[]
}>()

function animation(ele: HTMLDivElement) {
  const tl = gsap.timeline()
  const cardStagger = STAGGER_SHORT // 与「加入技术组会获得什么？」同节奏
  Array.from(ele.children).forEach((card, index) => {
    const t = index * cardStagger
    const avatarElement = card.querySelector('.el-image')
    const textTargets = Array.from(card.querySelectorAll('.name, .comment, .info'))

    // 主体
    tl.from(
      card,
      {
        duration: DURATION_LONG,
        ease: 'power2.out',
        autoAlpha: 0,
        scale: 0.5,
        x: 50,
        y: index % 2 === 1 ? -200 : 200,
      },
      t
    )

    // 头像
    if (avatarElement) {
      tl.from(
        avatarElement,
        {
          duration: DURATION_MEDIAN,
          autoAlpha: 0,
          scale: 2,
          ease: 'power1.out',
        },
        t
      )
    }

    // 文本：紧随卡片出现，快速读完
    if (textTargets.length > 0) {
      tl.from(
        SplitText.create(textTargets, { type: 'lines', mask: 'lines' }).lines,
        {
          duration: DURATION_SHORT,
          ease: 'power2.out',
          stagger: STAGGER_CHAR,
          y: 50,
        },
        t
      )
    }
  })

  return tl
}
</script>

<template>
  <ani-ele class="peopleContainer" :scroll-in-ani="animation">
    <div v-for="(people, i) in props.list" :key="i" class="peopleCard">
      <div class="avatar">
        <el-image style="width: 100%; height: 100%" :src="people.avatar" v-if="people.avatar" />
      </div>
      <div class="name">
        <b>{{ people.name }}</b>
      </div>
      <div v-if="people.comment" class="comment">
        {{ people.comment }}
      </div>
      <div class="info" style="text-align: center">
        {{ people.info }}
      </div>
    </div>
  </ani-ele>
</template>

<style scoped lang="scss">
.peopleContainer {
  display: flex;
  gap: 1em;
  overflow-x: auto;
  padding-top: 4em;
  justify-content: center;

  &::-webkit-scrollbar {
    display: none;
  }
}

.peopleCard {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1em 1.5em;
  position: relative;
  border-radius: 5px;
  width: 15em;
  height: 10em;

  .avatar {
    $avatarSize: 5em;
    height: $avatarSize;
    width: $avatarSize;
    border-radius: 0.5em;
    overflow: hidden;
    position: absolute;
    top: $avatarSize * -0.75;
    left: 50%;
    transform: translateX(-50%);
  }

  .name {
    font-size: 1.5em;
    text-align: center;
    margin: 0.5em 0;
  }

  .comment {
    margin-bottom: 0.7em;
    color: var(--el-text-color-secondary);
    text-align: center;
    font-style: italic;
  }
}
</style>
