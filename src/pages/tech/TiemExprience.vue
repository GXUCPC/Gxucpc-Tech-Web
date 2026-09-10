<!-- eslint-disable vue/no-parsing-error -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { onMounted, useTemplateRef } from 'vue'


function infoSectionAni(ele: HTMLElement | null) {
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

const headTextRef = useTemplateRef<HTMLElement>('headText')
const icpcInfoRef = useTemplateRef<HTMLElement>('icpcInfo')
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
    .from(headTextEle.querySelector('.introTitle'), {
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

})
</script>

<template>
  <section class="headText introHead" ref="headText">

      <div class="introTitle">
         <Icon
          icon="pajamas:api"
          class="introIcon introIconRed"
        />
         <Icon
          icon="material-symbols:code-blocks-rounded"
          class="introIcon introIconBlue"
        />
        <p>广西大学ICPC集训队技术组</p>
      </div>

  </section>

  <section class="icpc infoContainer" ref="icpcInfo" style="margin-bottom: 10%;">
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
      </div>
    </div>
  </section>

</template>

<style scoped lang="scss">
/* .headText / .infoContainer 基础样式与响应式由全局 styles/global.scss 提供，
   此处仅保留页面私有差异 */

/* 页面标题块（原为内联 width:1000px，手机端必然溢出，改流式 min()） */
.introHead {
  text-align: left;
  min-height: 20vh;
  margin-left: 20px;
  padding: 8%;
}

.introTitle {
  position: relative;
  width: min(1000px, 100%);
  min-height: 60px;
  font-size: 50px;

  p {
    margin-bottom: 1px;
  }
}

.introIcon {
  position: absolute;
  z-index: -1;
}
.introIconRed {
  color: rgba(227, 47, 47, 0.5);
  transform: scale(4);
  left: 0;
  bottom: 60%;
}
.introIconBlue {
  color: rgba(47, 174, 227, 0.5);
  transform: scale(3) rotate(35deg);
  left: 55%;
  top: 50%;
}

/* 页面私有差异：简介竖线为白色（全局为品牌黄） */
.infoContainer .line > div {
  background-color: white;
}

/* ===== 手机端适配 ===== */
@include mobile {
  .introHead {
    padding: 10% 5%;
    margin-left: 0;
  }

  .introTitle {
    font-size: 28px;
  }

  .introIconRed {
    transform: scale(2.5);
  }

  .introIconBlue {
    transform: scale(2) rotate(35deg);
    left: 70%;
  }
}
</style>
