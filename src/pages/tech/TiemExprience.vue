<!-- eslint-disable vue/no-parsing-error -->
<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { onMounted, useTemplateRef } from 'vue'

const globalLoading = useGlobalLoading()

function infoSectionAni(ele: HTMLDivElement | null) {
  const tl = gsap.timeline()
  if (!ele) return tl
  //竖线
  tl.fromTo(
    ele.querySelector('.line > div'),
    {
      height: '0%',
    },
    {
      height: '100%',
      ease: 'sine.out',
      duration: 2,
    },
  )
  tl.from(
    ele.querySelector('.el-image'),
    {
      autoAlpha: 0,
      duration: 1,
    },
    '<',
  )

  //简介文字动画
  SplitText.create(ele.querySelector('.text1'), {
    type: 'chars,words',
    autoSplit: true,
    mask: 'chars',
    onSplit: (self) => {
      tl.from(
        self.words,
        {
          duration: 1,
          autoAlpha: 0,
          stagger: 0.05,
        },
        '<',
      )
    },
  })
  SplitText.create(ele.querySelector('.text2'), {
    type: 'chars,words',
    autoSplit: true,
    mask: 'chars',
    onSplit: (self) => {
      tl.from(
        self.words,
        {
          duration: 1,
          autoAlpha: 0,
          stagger: 0.05,
        },
        '<0.5',
      )
    },
  })
  SplitText.create(ele.querySelector('.text3'), {
    type: 'lines',
    autoSplit: true,
    mask: 'chars',
    onSplit: (self) => {
      tl.from(
        self.lines,
        {
          y: '2em',
          duration: 1,
          autoAlpha: 0,
          stagger: 0.2,
        },
        '<0.5',
      )
    },
  })

  return tl
}

const headTextRef = useTemplateRef('headText')
const icpcInfoRef = useTemplateRef('icpcInfo')
const icpcTechInfoRef = useTemplateRef('icpcTechInfo')
onMounted(() => {
  gsap.registerPlugin(SplitText, ScrollTrigger)
  const headTextEle = headTextRef.value
  if (!headTextEle) return
  const tl = gsap.timeline()
  //初始动画
  tl.from(headTextEle.querySelector('.item1')?.children!, {
    delay: 3,
    duration: 0.5,
    yPercent: 100,
    autoAlpha: 0,
    stagger: 1,
  })
    .from(headTextEle.querySelector('.item2'), {
      duration: 0.5,
      yPercent: 100,
      autoAlpha: 0,
    })
    .fromTo(
      headTextEle.querySelector('.item3'),
      {
        autoAlpha: 0,
      },
      {
        duration: 0.5,
        autoAlpha: 1,
      },
    )
    // 默认显示第一个信息
    .add(infoSectionAni(icpcInfoRef.value))

  ScrollTrigger.create({
    trigger: icpcTechInfoRef.value,
    animation: infoSectionAni(icpcTechInfoRef.value),
  })
})
</script>

<template>
  <section class="headText" ref="headText" style="text-align: left;  min-height: 20vh; margin-left: 20px; padding: 8%;">

      <div class="item2" style="position: relative; width: 1000px; min-height: 60px; font-size: 50px;">
         <Icon
          icon="pajamas:api"
          style="
            color: rgba(227, 47, 47, 0.5);
            position: absolute;
            transform: scale(4);
            left: 0%;
            bottom: 60%;
            z-index: -1;
          "
        />
         <Icon
          icon="material-symbols:code-blocks-rounded"
          style="
            color: rgba(47, 174, 227, 0.5);
            position: absolute;
            transform: scale(3) rotate(35deg);
            left: 55%;
            top: 50%;
            z-index: -1;
          "
        />
        <p style="margin-bottom: 1px; ">广西大学ICPC集训队技术组</p>
      </div>

  </section>

  <section class="icpc infoContainer" ref="icpcInfo">
    <div class="line">
      <div></div>
    </div>
    <div class="info">
      <div class="infoBrief">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="text1" style="font-size: 35px;">广西大学ICPC集训队技术组简介</div>
        </div>

      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
        <p style="margin-bottom: 20px;">项目组致力于用技术解决实际问题，基于真实的需求，我们开发了：</p>
        <li style="margin-left: 30px;">QQ机器人：自动统计ICPC集训队内刷题情况，激发训练热情。</li>
        <li style="margin-left: 30px;">浏览器插件 & 教务工具箱：简化繁琐的教务流程。</li>
        <li style="margin-left: 30px;">候补抢课工具：（你懂的）为同学们的选课之路保驾护航，广受好评。</li>
        <li style="margin-left: 30px;">QQ机器人：自动统计集训队内刷题情况，激发训练热情。</li>
        <p style="margin-top: 20px;">目前，组内还有gxu课群bot，青鸾管理系统，谛听bot等项目正在同步开发。欢迎所有想要积累项目开发经验，学习技术的同学加入我们。</p>
      </div>
    </div>
  </section>

</template>

<style scoped lang="scss">
.headText {
  min-height: 50vh;
  font-size: 2em;
  text-align: right;
  word-spacing: 1em;
  padding: 10%;
  user-select: none;

  .item1 {
    height: 5em;
  }
  .item2 {
    height: 2em;
  }

  .keyword {
    font-size: 3em;
  }
}

.infoContainer {
  display: flex;
  gap: 20px;
  max-width: 60vw;
  font-size: 1.4em;

  .line > div {
    width: 5px;
    border-radius: 2.5px;
    background-color: white;
  }
  .infoBrief {
    display: flex;
    gap: 20px;
  }
}
</style>
