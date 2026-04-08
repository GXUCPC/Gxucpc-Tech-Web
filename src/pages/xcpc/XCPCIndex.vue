<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { onMounted, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义跳转函数
const goToNextPage = () => {
  // 把 '/about' 换成你实际配置的路由路径，比如 '/join' 或者 '/detail'
  router.push('xcpc/introdution')
}

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
          icon="solar:cup-star-bold"
          style="
            color: rgba(227, 47, 47, 0.5);
            position: absolute;
            transform: scale(4);
            left: -5%;
            bottom: 60%;
            z-index: -1;
          "
        />
         <Icon
          icon="mdi:head-cog-outline"
          style="
            color: rgba(47, 174, 227, 0.5);
            position: absolute;
            transform: scale(3) rotate(35deg);
            left: 45%;
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
          广西大学ICPC集训队（ICPC Training Team of China, Guangxi University）于2016年建立，2018-2019年开始逐渐正式运转，是一个为了代表广西大学参加以国际大学生程序设计竞赛（ICPC）、中国大学生程序设计竞赛（CCPC）等高水平赛事、希望与国内绝大部分院校接轨从而进行严格集中训练的队伍。集训队并非社团，仅为学生兴趣同好组织。集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。
        </p>
        <p>集训队并非社团，为学生兴趣同好组织。</p>

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
          <div class="text2">FAQ</div>
        </div>
      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em; text-align: left; width: fit-content; margin-bottom: 20vh;">
        <li>Q: 我的数学一般，也没有信息学竞赛（OI）基础，能进队吗？</li>
        <p>
            英雄不问出处。只要你热爱解题、抗压能力强，在大一这一年愿意投入时间，我们会为你提供专业的训练环境。西大集训队有很多零基础起步最终拿到亚洲区域赛奖牌的励志标杆。
        </p>

        <li>Q: 参加集训队，除了拿奖还能得到什么？</li>
            <p>1. 编程能力，写普通项目就像“满级号回新手村”。</p>
            <p>2. 互联网大厂绿卡，大厂笔试题基本就是集训队的日常练习。</p>
            <p>3. 升学资源，XCPC 经历是保研和申名校最硬核的敲门砖。</p>

        <li>Q: 训练会很辛苦吗？需要投入多少时间？</li>
        <p>
            老实说 acm 竞赛的强度是很高的。我们需要刷透 CF、洛谷等数千道题目，还有周末的模拟赛和寒暑假高强度集训。但请记住：“凡是不能杀死你的，最终都会让你更强大。”
        </p>

<button
  class="learnMoreBtn"
  @click="goToNextPage"
  style="color: inherit; font-size: 1.2em;"
>
  关于 XCPC
  <Icon icon="material-symbols:arrow-right-alt-rounded" :inline="true" style="color: inherit; font-size: 1.2em;" />
</button>

      </div>
    </div>
    <div class="line">
      <div></div>
    </div>
  </section>

</template>

<style scoped lang="scss">
@use '@/store/mixins.scss' as *;

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
// 了解更多按钮
.learnMoreBtn {
  /* 1. 字体调大 */
  font-size: 20px;         /* 调大字号 */
  letter-spacing: 2px;     /* 字间距稍微拉开一点 */

  /* 2. 靠右对齐与内部排版 */
  display: flex;
  align-items: center;     /* 保证“了解更多”和“箭头”在同一水平线上 */
  margin-left: auto;       /* 核心魔法：把它用力推到父容器的最右侧 */
  margin-right: 10%;        /* 右侧留一点空隙，不要死死贴着屏幕边缘 */
  margin-top: 5vh;

  cursor: pointer;
  transition: all 0.3s ease;

  /* 4. 悬浮动画：鼠标放上去时背景变亮，且向右微微移动 */
  &:hover {
    background-color: rgba(45, 68, 97, 0.1); /* 浅蓝色半透明背景 */
    //color: #93c5fd;
    //border-color: #93c5fd;
    transform: translateX(5px); /* 悬浮时向右小幅位移，暗示“前往下一页” */
  }
}

/* 2. 一键调用封装好的移动端代码！这行代码会自动把上面的所有适配规则注入进来 */
@include inject-mobile-styles;
</style>
