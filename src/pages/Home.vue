<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import PeopleList, { type PeopleData } from '@/components/home/PeopleList.vue'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { h, onMounted, useTemplateRef, type VNode } from 'vue'

function getEleNth(child: HTMLElement) {
  let i = 0
  while ((child = child.previousSibling) != null) i++
  return i
}

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
      duration: 2.5,
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
  tl.from(
    ele.querySelector('.text1'),
    {
      duration: 1,
      autoAlpha: 0,
      stagger: 0.05,
    },
    '<',
  )
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
  gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother)
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
  document.querySelectorAll('.title').forEach((ele) => {
    const tl = gsap.timeline()
    tl.from(ele, {
      autoAlpha: 0,
      duration: 1,
    })
    ScrollTrigger.create({
      trigger: ele,
      animation: tl,
      onEnter: (self) => ele.classList.add('show'),
    })
  })
  document.querySelectorAll('.subtitle').forEach((ele) => {
    const tl = gsap.timeline()
    tl.from(ele, {
      autoAlpha: 0,
      duration: 1,
    })
    ScrollTrigger.create({
      trigger: ele,
      animation: tl,
      onEnter: (self) => ele.classList.add('show'),
    })
  })
})

const mainTeamList: {
  teammates: string[]
  teamName: string
  grade: string
  mainMedal: (string | VNode)[]
}[] = [
  {
    grade: '22级',
    teamName: '流星一条',
    mainMedal: [
      h('span', { style: 'color: silver' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'silver' }),
        '第48届ICPC国际大学生程序设计竞赛亚洲区域赛（西安）银奖',
      ]),
      h('span', { style: 'color: chocolate' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'chocolate' }),
        '第九届中国⼤学⽣程序设计竞赛（深圳）铜奖',
      ]),
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:prize' }),
        'ICPC西部大学生程序设计竞赛三等奖',
      ]),
      h('span', { style: 'font-style: italic; opacity: .5' }, ['写不下力……']),
    ],
    teammates: ['付家锐', '石新阳', '韦祖豪'],
  },
  {
    grade: '23级',
    teamName: '远航者的幻想乡',
    mainMedal: [
      h('span', { style: 'color: gold' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'gold' }),
        '第 50 届 ICPC 国际大学生程序设计竞赛邀请赛（西安）金奖',
      ]),
      h('span', { style: 'color: chocolate' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'chocolate' }),
        '第 50 届 ICPC 国际大学生程序设计竞赛（西安）铜奖',
      ]),
      h('span', { style: 'color: chocolate' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'chocolate' }),
        '第 11 届 CCPC 中国大学生程序设计竞赛（郑州）铜奖',
      ]),
      h('span', { style: 'font-style: italic; opacity: .5' }, ['真的只打最后一把……']),
    ],
    teammates: ['张健明', '陶康', '孙怿翔'],
  },
  {
    grade: '24级',
    teamName: '队名WA2了',
    mainMedal: [
      h('span', { style: 'color: silver' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'silver' }),
        '第 50 届 ICPC 国际大学生程序设计竞赛区域赛（沈阳）银奖',
      ]),
      h('span', { style: 'font-style: italic; opacity: .5' }, ['在蒸了，在蒸了……']),
    ],
    teammates: ['郑毅', '陈君屹', '杜永坤'],
  },
]

// 命名抛弃大脑
const studentList: PeopleData[] = [
  {
    avatar: '/public/img/avatar/lzx.jpg',
    comment: '大爱详哥',
    info: '保研天津大学',
    name: '李周详',
  },
  { avatar: '/public/img/avatar/sxy.jpg', info: '保研东南大学', name: '石新阳' },
  { info: '考研浙江大学', name: '陈松盛' },
  { info: '前往中国工程物理研究院', name: '武成志' },
  { info: '保研至中国科学院大学', name: '李韵锋' },
  { info: '保研电子科技大学', name: '龙泽宇' },
]
const workerList: PeopleData[] = [
  {
    avatar: '/public/img/avatar/jmr.jpg',
    comment: 'B推搜熟人',
    info: '哔哩哔哩Offer',
    name: '金珉瑞',
  },
  { avatar: '/public/img/avatar/sct.jpg', info: '小马智行Offer', name: '孙城涛' },
  { avatar: '/public/img/avatar/wzh.jpg', info: '腾讯实习优秀个人、腾讯质量效应部门Offer', comment: '韦老师', name: '韦祖豪' },
  { avatar: '/public/img/avatar/wlm.jpg', info: '字节运维Offer', comment: '「电话告警」', name: '王利明' },
  { avatar: '/public/img/avatar/cjl.jpg', info: 'Offer', name: '陈佳林' },
]
</script>
<!-- 请注意，该组件为了便于动画绑定和布局设定，使用了较多不规范写法，可读性较差 -->
<!-- 可以用于学习实现原理，但请不要学习该文件代码样式 -->
<template>
  <section class="headText" ref="headText">
    <div
      class="item1"
      style="display: inline-flex; align-items: center; gap: 1em; margin-bottom: 1em">
      <div class="keyword" style="position: relative">
        <Icon
          icon="material-symbols:trophy-rounded"
          style="
            color: rgba(227, 47, 47, 0.5);
            position: absolute;
            transform: scale(2) rotate(-30deg);
            left: -30%;
            bottom: -10%;
            z-index: -1;
          " />
        算竞
      </div>
      <div>还是</div>
      <div class="keyword" style="position: relative">
        开发
        <Icon
          icon="material-symbols:code-blocks-rounded"
          style="
            color: rgba(47, 174, 227, 0.5);
            position: absolute;
            transform: scale(1.5) rotate(35deg);
            right: 0;
            top: -30%;
            z-index: -1;
          " />
      </div>
    </div>
    <div class="item2">总有一个适合你的</div>
    <button
      class="learnMoreBtn item3"
      @click="
        () => {
          const smoother = ScrollSmoother.create({ effects: false, smooth: false })
          gsap.to(smoother, {
            scrollTop: smoother.offset('#learnMoreTarget', 'top 100px'),
            ease: 'power2.out',
            duration: 1,
          })
        }
      ">
      了解更多
      <Icon icon="material-symbols:arrow-right-alt-rounded" :inline="true" style="color: inherit" />
    </button>
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
            <Icon
              icon="material-symbols:trophy-rounded"
              style="color: rgba(227, 47, 47)"
              :inline="true" />广西大学ICPC集训队
          </div>
          <div class="text2">ICPC Training Team of China, Guangxi University</div>
        </div>
      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
        <p>
          广西大学ICPC集训队（ICPC Training Team of China, Guangxi
          University）于2016年建立，2018-2019年开始逐渐正式运转，是一个为了代表广西大学参加以国际大学生程序设计竞赛（ICPC）、中国大学生程序设计竞赛（CCPC）等高水平赛事、希望与国内绝大部分院校接轨从而进行严格集中训练的队伍。集训队并非社团，仅为学生兴趣同好组织。集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。集训队分为正式队伍和技术组：正式队员参加各地举行的算法竞赛，技术组为竞赛队员提供后勤服务，保障竞赛队员的训练正常开展，同时学习项目开发的前沿知识，参与队内开发活动。
        </p>
        <p>集训队并非社团，仅为学生兴趣同好组织。</p>

        <p>
          集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。
        </p>
      </div>
    </div>
  </section>
  <h1 class="title" id="learnMoreTarget">集训队概要</h1>
  <ani-ele
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        const charStagger = 0.025
        tl.from(SplitText.create(ele, { type: 'chars' }).chars, {
          autoAlpha: 0,
          y: 20,
          duration: 0.25,
          stagger: charStagger,
        })
        const spans = ele.querySelectorAll('span')
        if (spans[1])
          tl.to(
            spans[1],
            {
              duration: 1,
              ease: 'power3.out',
              onUpdate: function () {
                spans[1]!.innerText = Math.round(this.progress() * 6) + ''
              },
            },
            `${getEleNth(spans[1]) * charStagger}`,
          )
        if (spans[3])
          tl.to(
            spans[3],
            {
              duration: 1,
              ease: 'power3.out',
              onUpdate: function () {
                spans[3]!.innerText = Math.round(this.progress() * 50) + ''
              },
              onComplete: () => (spans[3]!.innerText = 'N'),
            },
            `${getEleNth(spans[3]) * charStagger}`,
          )

        return tl
      }
    "
    class="textCenter">
    过去三年中，集训队在<b style="font-size: 1.2em">ICPC/CCPC各个赛站</b>至少获得了
    <span style="font-size: 1.5em; font-weight: bold; color: silver">0</span>
    个银奖和
    <span style="font-size: 1.5em; font-weight: bold; color: chocolate">0</span>
    个铜奖<br />
    与此同时，集训队还在
    <br />
    <b style="font-size: 1.2em">
      团体程序设计天梯赛、蓝桥杯全国软件、信息技术专业人才大赛、A类赛事、B类赛事
    </b>
    <br />等赛事中获得
    <span style="font-size: 1.2em; font-weight: bold; color: var(--el-color-primary)">
      若干一等奖
    </span>
    奖项
  </ani-ele>
  <h2 class="subtitle">加入集训队会获得什么？</h2>
  <ani-ele
    class="chatPanel"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        tl.from(ele.children, {
          duration: 1,
          ease: 'power2.out',
          y: 500,
          autoAlpha: 0,
          stagger: 0.4,
        })
        return tl
      }
    ">
    <div><b style="font-size: 1.3em">各类奖项</b>拿到手软，柜子已经被牌子塞满啦！</div>
    <div><b style="font-size: 1.3em">学分综测</b>评定都不知道选哪个奖项啦！</div>
    <div><b style="font-size: 1.3em">保研</b>狠狠加分，让你的简历更加耀眼！</div>
    <div>已经保上<b style="font-size: 1.3em">双一流院校</b>啦！</div>
    <div>本科就业更不用说，<b style="font-size: 1.3em">大厂岗位</b>任你投！</div>
    <div>集训队退役老登人均月入<b style="font-size: 1.3em">20k+</b>噢！</div>
    <div>
      大一大二有温柔和蔼的学长学姐亲切<b style="font-size: 1.3em">答疑解惑</b
      >，算法竞赛以外的问题也可以自由询问噢！
    </div>
    <div>
      大三退役更是有技术组进行<b style="font-size: 1.3em">实习就职培训</b>，再也不怕没有工作啦！
    </div>
  </ani-ele>
  <h2 class="subtitle">代表队伍</h2>
  <ani-ele
    class="teamCardContainer"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        ele.childNodes.forEach((cardEle, index) => {
          tl.from(
            cardEle,
            {
              scale: 0,
              autoAlpha: 0,
              duration: 1,
              stagger: 0.3,
            },
            index * 0.5,
          ).from(
            SplitText.create(cardEle.childNodes, { type: 'lines', mask: 'lines' }).lines,
            {
              y: 24,
              autoAlpha: 0,
              duration: 0.5,
              ease: 'sine.out',
              delay: 0.4,
              stagger: 0.1,
            },
            index * 0.5,
          )
        })
        return tl
      }
    ">
    <div class="teamCard" v-for="(team, i) in mainTeamList" :key="i">
      <div class="gradeText">{{ team.grade }}</div>
      <div style="font-weight: bold; font-size: 2em; line-height: 2em">{{ team.teamName }}</div>
      <div>
        <b><Icon icon="mdi:account" :inline="true" />队员：</b>{{ team.teammates.join('、') }}
      </div>
      <div>
        <b><Icon icon="mdi:achievement" :inline="true" />主要奖项：</b>
      </div>
      <div v-for="(medal, i) in team.mainMedal" :key="i" style="text-indent: 2em">
        <component :is="medal" />
      </div>
    </div>
  </ani-ele>
  <h2 class="subtitle">优秀成员</h2>
  <ani-ele
    class="textCenter"
    :scroll-in-ani="
      (ele) =>
        gsap.from(
          SplitText.create(ele, {
            type: 'chars',
            mask: 'chars',
          }).chars,
          {
            duration: 0.05,
            stagger: 0.05,
            width: 0,
          },
        )
    ">
    不论出身如何，经过三年历练后，集训队大部分成员都取得了相当不错的成果
  </ani-ele>
  <h2 class="subtitle">研究生方向代表</h2>
  <people-list :list="studentList" />
  <h2 class="subtitle">就业方向代表</h2>
  <people-list :list="workerList" />

  <section
    class="icpc-tech infoContainer"
    style="text-align: right; margin-top: 20vh; margin-left: auto; margin-right: 5em"
    ref="icpcTechInfo">
    <div class="info">
      <div class="infoBrief" style="flex-direction: row-reverse">
        <el-image class="item1" style="width: 60px; height: 60px" />
        <div style="display: flex; flex-direction: column; gap: 5px">
          <div class="text1">
            <Icon
              icon="material-symbols:code-blocks-rounded"
              style="color: rgba(47, 174, 227)"
              :inline="true" />广西大学ICPC集训队技术组
          </div>
          <div class="text2">ICPC Training Team of China, Guangxi University</div>
        </div>
      </div>
      <div class="text3" style="margin-top: 2em; display: flex; flex-direction: column; gap: 0.5em">
        <p>
          广西大学ICPC集训队（ICPC Training Team of China, Guangxi
          University）于2016年建立，2018-2019年开始逐渐正式运转，是一个为了代表广西大学参加以国际大学生程序设计竞赛（ICPC）、中国大学生程序设计竞赛（CCPC）等高水平赛事、希望与国内绝大部分院校接轨从而进行严格集中训练的队伍。集训队并非社团，仅为学生兴趣同好组织。集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。集训队分为正式队伍和技术组：正式队员参加各地举行的算法竞赛，技术组为竞赛队员提供后勤服务，保障竞赛队员的训练正常开展，同时学习项目开发的前沿知识，参与队内开发活动。
        </p>
        <p>集训队并非社团，仅为学生兴趣同好组织。</p>

        <p>
          集训队目前名义上属于计算机与电子信息学院计算机协会。集训队由计算机与电子信息学院以学院的名义提供经费和场地支持，而集训队为学院以及学校提供程序设计竞赛（算法竞赛）和相关课程的支持、管理与维护。
        </p>
      </div>
    </div>
    <div class="line">
      <div></div>
    </div>
  </section>
  <h1 class="title">技术组概要</h1>
</template>

<style scoped lang="scss">
// 了解更多按钮
.learnMoreBtn {
  appearance: none;
  background-color: transparent;
  font-size: 0.8em;
  border: none;
  cursor: pointer;
  color: #ffffff;
  border-bottom: 1px solid var(--el-color-primary);
  padding: 0.5em 1em;
  display: inline-flex;
  position: relative;
  align-items: center;
  gap: 5px;
  transition: 0.25s ease-in-out;

  &:hover {
    gap: 10px;
    font-weight: bold;
    color: var(--el-color-primary);
  }

  &::before {
    border-radius: 5px;
    transition: 0.25s ease-in-out;
    content: '';
    position: absolute;
    width: 0;
    height: 5px;
    background-color: var(--el-color-primary);
    bottom: -2.5px;
    right: 0;
  }

  &:hover::before {
    left: 0;
    width: 100%;
  }
}

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
    background-color: var(--el-color-primary);
  }
  .infoBrief {
    display: flex;
    gap: 20px;

    .text2 * {
      color: gray;
    }
  }
}

// 标题样式
.title {
  margin: 3em auto;
  padding: 0.5em 1em;
  font-size: 2.5em;
  width: fit-content;
  position: relative;

  &::before,
  &::after {
    content: '';
    height: 5px;
    width: 0%;
    background-color: var(--el-color-primary);
    position: absolute;
    border-radius: 5px;
    transition: 1s ease-in-out;
  }
  &.show::before,
  &.show::after {
    width: 100%;
  }

  &::before {
    top: 0;
    left: 0;
  }

  &::after {
    bottom: 0;
    right: 0;
  }
}

// 副标题样式
.subtitle {
  margin: 3em auto;
  padding: 0.5em 1em;
  font-size: 2em;
  width: fit-content;
  position: relative;

  &::after {
    content: '';
    height: 20px;
    width: 0;
    opacity: 0.3;
    background-color: var(--el-color-primary);
    position: absolute;
    border-radius: 5px;
    z-index: -1;
    transition: 1s ease-in-out;
  }
  &.show::after {
    width: 100%;
  }

  &::after {
    bottom: 20%;
    left: 0;
  }
}

.textCenter {
  text-align: center;
  font-size: 2em;
  line-height: 1.5em;
  margin: 1em 0;
}

// 模拟聊天窗
.chatPanel {
  width: 45em;
  font-size: 1.3em;
  margin: 0 auto;
  overflow: hidden;

  & > div {
    margin-bottom: 1.5em;
    padding: 0.4em 1em 0.7em 1em;
    border-radius: 4px;
    max-width: 90%;
    width: fit-content;
    position: relative;

    // 角标
    &::after {
      $size: 4px;
      content: '';
      position: absolute;
      bottom: -$size * 2;
      border: solid $size;
      border-radius: 0 0 8px 8px;
    }

    // 左右交替
    &:nth-child(odd) {
      $color: rgba(120, 120, 120, 0.7);
      background-color: $color;
      border-bottom-left-radius: 0;
      &::after {
        border-color: $color transparent transparent $color;
        left: 0;
      }
    }

    &:nth-child(even) {
      $color: rgba(62, 181, 117, 0.7);
      margin-left: auto;
      border-bottom-right-radius: 0;
      background-color: $color;
      &::after {
        border-color: $color $color transparent transparent;
        right: 0;
      }
    }
  }
}

.teamCardContainer {
  display: grid;
  justify-content: center;
  grid-auto-flow: column;
  column-gap: 2em;
  grid-template-columns: repeat(3, 35em);
  grid-row: 1;
}

// 小队卡片
.teamCard {
  background-color: rgba(255, 255, 255, 0.1);
  transform-origin: left top;
  padding: 1em 1.5em;
  position: relative;
  border-radius: 5px;

  .gradeText {
    position: absolute;
    right: 0.2em;
    top: -0.7em;
    font-style: italic;
    font-size: 5em;
    font-weight: 900;
    color: var(--el-color-primary);
    opacity: 0.3;
  }

  &::before,
  &::after {
    transform: scale(1);
    $size: 25px;
    position: absolute;
    content: '';
    width: $size;
    height: $size;
    border: var(--el-color-primary) solid;
  }

  $offset: -5px;
  &::before {
    top: $offset;
    left: $offset;
    border-width: 1px 0 0 1px;
  }
  &::after {
    bottom: $offset;
    right: $offset;
    border-width: 0 1px 1px 0;
  }
}
</style>
