<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { onMounted, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义跳转函数
const goToNextPage = () => {
  // 把 '/about' 换成你实际配置的路由路径，比如 '/join' 或者 '/detail'
  router.push('/tech/contuctUs')
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
const icpcTiemInfoRef = useTemplateRef('icpcTiemInfo') // 👈 补上这句
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

  ScrollTrigger.create({
    trigger: icpcTiemInfoRef.value,
    animation: infoSectionAni(icpcTiemInfoRef.value),
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
        <p style="margin-bottom: 1px; ">广西大学ICPC集训队技术组</p>
      </div>

  </section>



  <section class="icpc infoContainer" ref="icpcInfo" style="margin-left: 5%;">
    <div class="line">
      <div></div>
    </div>
    <div class="info">
      <div class="infoBrief">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">

          <div class="text1">广西大学ICPC集训队技术组</div>
          <div class="text2"> ICPC Technology Team of China, Guangxi University</div>
        </div>

      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em;">
        <p>
          广西大学ICPC集训队技术组（ICPC Technology Team of China, Guangxi University）于2024年建立，脱胎于西大顶尖的算法殿堂——ACM-ICPC集训队。主要负责为广西大学ICPC集训队和学院、学校的教务工作提供技术支持,同时承接横向项目为组内同学提供真实的项目开发经历，积累经验。
        </p>
        <p>技术组并非社团性质的团体，其为西大的一个高水平同好组织，有着较为严格的入队选拔。在这里，你将把算法思想融入工程项目，获得在象牙塔里极为珍贵的工业级开发经验，为你未来进入互联网大厂打下坚实根基。</p>
      </div>
    </div>
  </section>




  <h1 class="title">招新相关</h1>
  <section
    class="icpc-tech infoContainer"
    style="text-align: right; margin-top: 20vh; margin-left: auto; margin-right: 5em; margin-bottom: 20vh;"
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
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em; text-align: left; width: fit-content;">
        <li>Q: 技术组主要是干什么的，有什么用？</li>
        <p>技术组主要负责为广西大学ICPC集训队和学院、学校的教务工作提供技术支持,同时承接横向项目为组内同学提供真实的项目开发经历，积累经验。对于想要学习技术，积累开发经验的同学来说，技术组是一个很好的平台。</p>
        <li>Q: 大概需要多强的算法/项目基础才能加入技术组？</li>
        <p>技术组欢迎所有对技术充满好奇心、具备自主学习能力、并渴望动手创造的同学，无论你是大一新生还是其他年级的同学,无论你的专业背景是什么，只要你愿意学习，技术组都欢迎你。</p>
        <li>Q: 时间投入大概要多少？</li>
        <p>每周至少 20h 以上的时间用于学习，开发。在AI时代，直接上手真实的项目，在开发中学习是非常高效的方式。</p>
        <li>Q: 新人加入技术组后要做什么？</li>
        <p>新人刚加入技术组后一般先选择一个技术方向，如前/后端，运维，算法等等（当然后面看个人意愿可以自主更改）。组内每个实习生均由指定的组员指导,帮助实习生快速上手。</p>
      </div>
    </div>
    <div class="line">
      <div></div>
    </div>
  </section>


  <section class="icpc-techTiem infoContainer" ref="icpcTiemInfo" style="margin-left: 5%;">
    <div class="line">
      <div></div>
    </div>
    <div class="info">
      <div class="infoBrief">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">

          <div class="text1">广西大学ICPC集训队技术组</div>
          <div class="text2"> ICPC Technology Team of China, Guangxi University</div>
        </div>

      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
        <p style="margin-bottom: 20px;">项目组致力于用技术解决实际问题，基于真实的需求，我们开发了：</p>
        <li style="margin-left: 30px;">QQ机器人：自动统计ICPC集训队内刷题情况，激发训练热情。</li>
        <li style="margin-left: 30px;">浏览器插件 & 教务工具箱：简化繁琐的教务流程。</li>
        <li style="margin-left: 30px;">候补抢课工具：（你懂的）为同学们的选课之路保驾护航，广受好评。</li>
        <li style="margin-left: 30px;">QQ机器人：自动统计集训队内刷题情况，激发训练热情。</li>
        <p style="margin-top: 20px;">目前，组内还有gxu课群bot，青鸾管理系统，谛听bot等项目正在同步开发。欢迎所有想要积累项目开发经验，学习技术的同学加入我们。</p>

            <button
  class="learnMoreBtn"
  @click="goToNextPage"
  style="color: inherit; font-size: 1.2em;"
>
  加入我们
  <Icon icon="material-symbols:arrow-right-alt-rounded" :inline="true" style="color: inherit; font-size: 1.2em;" />
</button>


      </div>
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
// 加入我们按钮
.learnMoreBtn {
  /* 1. 字体调大 */
  font-size: 20px;         /* 调大字号 */
  letter-spacing: 2px;     /* 字间距稍微拉开一点 */

  /* 2. 靠右对齐与内部排版 */
  display: flex;
  align-items: center;     /* 保证“了解更多”和“箭头”在同一水平线上 */
  margin-left: 10%;       /* 核心魔法：把它用力推到父容器的最右侧 */
  margin-right: auto;        /* 右侧留一点空隙，不要死死贴着屏幕边缘 */
  margin-top: 5vh;
  margin-bottom: 5vh;

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
