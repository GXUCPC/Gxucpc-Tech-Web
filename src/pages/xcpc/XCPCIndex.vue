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
    delay: 0.8,
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
  document.querySelectorAll('.title').forEach((ele) => {
    const tl = gsap.timeline()
    tl.from(
      ele,
      {
        autoAlpha: 0,
        duration: 1,
      },
    )
    ScrollTrigger.create({
      trigger: ele,
      animation: tl,
      onEnter: (self) => ele.classList.add('show'),
    })
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
        <p style="margin-bottom: 1px; ">广西大学ICPC集训队</p>
      </div>

  </section>



   <section class="icpc infoContainer" style="margin-left: 5em" ref="icpcInfo">
    <div class="line">
      <div></div>
    </div>
    <div class="info">
      <div class="infoBrief">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="text1">
            广西大学ICPC集训队
          </div>
          <div class="text2">ICPC Training Team of China, Guangxi University</div>
        </div>
      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
        <p>
          广西大学ICPC集训队（ICPC Training Team of China, Guangxi University）于2016年建立，2018-2019年开始逐渐正式运转，是一个为了代表广西大学参加以国际大学生程序设计竞赛（ICPC）、中国大学生程序设计竞赛（CCPC）等高水平赛事、希望与国内绝大部分院校接轨从而进行严格集中训练的队伍。集训队并非社团，仅为学生兴趣同好组织。集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。集训队分为正式队伍和技术组：正式队员参加各地举行的算法竞赛，技术组为竞赛队员提供后勤服务，保障竞赛队员的训练正常开展，同时学习项目开发的前沿知识，参与队内开发活动。
        </p>
        <p>集训队并非社团，仅为学生兴趣同好组织。</p>

        <p>
          集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。
        </p>
      </div>
    </div>
  </section>
  <h1 class="title">招新相关</h1>
  <section
    class="icpc-tech infoContainer"
    style="text-align: right; margin-top: 20vh; margin-left: auto; margin-right: 5em"
    ref="icpcTechInfo"
  >
    <div class="info">
      <div class="infoBrief" style="flex-direction: row-reverse">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="text1">
            常见问题
          </div>
          <div class="text2">Normal Question</div>
        </div>
      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em; text-align: left; width: fit-content;">
        <li>Q: 我的数学一般，也没有信息学竞赛（OI）基础，能进队吗？</li>
        <p>
            英雄不问出处。只要你热爱解题、抗压能力强，在大一这一年愿意投入时间，我们会为你提供专业的训练环境。西大集训队有很多零基础起步最终拿到亚洲区域赛奖牌的励志标杆。
        </p>

        <li>Q: 参加集训队，除了拿奖还能得到什么？</li>
        <p>
            1. 降维打击的编程能力，写普通项目就像“满级号回新手村”；2. 互联网大厂绿卡，大厂笔试题基本就是集训队的日常练习；3. 顶尖的升学资源，奖牌是保研和申名校最硬核的敲门砖；4. 纯粹的同好圈子，与全校逻辑最强的人并肩作战。
        </p>

        <li>Q: 训练会很辛苦吗？需要投入多少时间？</li>
        <p>
            老实说 acm 竞赛的强度是很高的。我们需要刷透 CF、洛谷等数千道题目，还有周末 5 小时的模拟赛和寒暑假高强度集训。但请记住：“凡是不能杀死你的，最终都会让你更强大。” 这种脑力极限边缘的快感，只有真正热爱的人才会懂。
        </p>
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
