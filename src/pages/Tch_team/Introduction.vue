<!-- eslint-disable vue/no-parsing-error -->
<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
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
  <section class="headText" ref="headText" style="text-align: left;  min-height: 30vh;">
    <div class="item2" style="width: 1000px; height: 5px; font-size: 50px;">广西大学ICPC集训队技术组</div>

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
        <p>
          广西大学ICPC集训队技术组（ICPC technology Team of China, Guangxi University）于2024年建立，脱胎于西大顶尖的算法殿堂——ACM-ICPC集训队。主要负责为广西大学ICPC集训队和学院、学校的教务工作提供技术支持,同时承接横向项目为组内同学提供真实的项目开发经历，积累经验。
        </p>
        <p style="margin-bottom: 10px;">技术组欢迎所有对技术充满好奇心、具备自主学习能力、并渴望动手创造的同学，无论你是大一新生还是其他年级的同学,只要你 :</p>
        <li style="margin-left: 30px;">一颗热爱技术、乐于动手的心。</li>
        <li style="margin-left: 30px;">.广西大学在校学生，专业不限。</li>
        <li style="margin-left: 30px;">有（或愿意马上学习）以下技术基础：</li>
        <p style="font-size: 30px; margin-top: 20px; margin-left: 40px;">基础必备技能 :</p>
        <li style="margin-left: 70px; list-style: square;">Git & GitHub: 掌握代码的版本管理和协作开发。这是现代软件工程的基石。</li>
        <li style="margin-left: 70px; list-style: square;">一门主力编程语言：这里强烈推荐C/C++，与ACM集训队主线任务无缝衔接，同时也是大一C语言课程的完美预习/复习，学习性价比极高。当然，如果你对自己有其他的规划，java、python也是很好的选择</li>
        <li style="margin-left: 70px; list-style: square;">一款现代编辑器/IDE：全能轻量之选：VS Code，通过插件几乎能应对所有语言。</li>
        <li style="margin-left: 70px; list-style: square;">基础的网络概念：不需要很深，但最好能理解HTTP 请求（GET/POST）、API 接口是什么。</li>
        <li style="margin-left: 70px; list-style: square;">问题解决能力：这不是一个具体技术，而是一种习惯。可以鼓励新生在文档中提及，遇到报错时如何利用搜索引擎（Google/Bing）、技术社区（Stack Overflow, CSDN）、官方文档和AI工具来独立解决问题的思路。这正是工程师的核心能力之一。</li>
      </div>
    </div>
  </section>


  <section
    class="icpc-tech infoContainer"
    style="text-align: right; margin-top: 20vh; margin-left: auto"
    ref="icpcTechInfo"
  >
    <div class="info">
      <div class="infoBrief" style="flex-direction: row-reverse">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="text1" style="font-size: 35px;">广西大学ICPC集训队技术组主要人员</div>

        <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
          <p>11111111111111111111111111111111111111111111111111111111111111111111</p>
        </div>
        </div>
      </div>

    </div>
    <div class="line">
      <div></div>
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
