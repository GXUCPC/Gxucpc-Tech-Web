<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
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
  Array.from(ele.children).forEach((card, index) => {
    // 主体
    tl.from(
      card,
      {
        duration: 1,
        ease: 'power2.out',
        autoAlpha: 0,
        scale: 0.5,
        x: 50,
        y: index % 2 === 1 ? -200 : 200,
      },
      index * 0.25,
    )

    // 头像
    tl.from(
      card.querySelector('.el-image'),
      {
        duration: 1,
        autoAlpha: 0,
        scale: 2,
        ease: 'power1.out',
      },
      index * 0.25,
    )

    // 文本
    tl.from(
      SplitText.create(card.querySelectorAll(':not(.avatar)'), { type: 'lines', mask: 'lines' })
        .lines,
      {
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        y: 50,
      },
      index * 0.25 + 0.25
    )
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
      <div style="text-align: center">
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
