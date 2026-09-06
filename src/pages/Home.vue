<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import type { ArticleMeta } from '@/types/article'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import { ArticleAPI } from '@/api/article'
import PeopleList, { type PeopleData } from '@/components/home/PeopleList.vue'
import {
  DELAY_INITIAL,
  DELAY_SHORT,
  DURATION_EXTRA_LONG,
  DURATION_INSTANT,
  DURATION_LONG,
  DURATION_MEDIAN,
  DURATION_SHORT,
  STAGGER_CHAR,
  STAGGER_LONG,
  STAGGER_MEDIAN,
  STAGGER_SHORT,
} from '@/constants/animation'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { HERO_BG_ALGO, HERO_BG_DEV } from '@/config/heroBg'
import { HERO_BG_BLUR, HERO_PANEL_BACKDROP_BLUR } from '@/constants/hero'
import { BACKEND_ENABLED } from '@/config/features'
import { h, onMounted, useTemplateRef, ref, type Ref, type VNode } from 'vue'

const heroBgBlur = `${HERO_BG_BLUR}px`
const heroPanelBackdropBlur = `${HERO_PANEL_BACKDROP_BLUR}px`

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
      duration: DURATION_EXTRA_LONG,
    },
  )
  tl.from(
    ele.querySelector('.el-image'),
    {
      autoAlpha: 0,
      duration: DURATION_LONG,
    },
    '<',
  )

  //简介文字动画
  tl.from(
    ele.querySelector('.text1'),
    {
      duration: DURATION_LONG,
      autoAlpha: 0,
      stagger: STAGGER_CHAR,
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
          duration: DURATION_LONG,
          autoAlpha: 0,
          stagger: 0.05,
        },
        '<',
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
          duration: DURATION_LONG,
          autoAlpha: 0,
          stagger: STAGGER_SHORT,
        },
        '<',
      )
    },
  })

  return tl
}

const headTextRef = useTemplateRef('headText')
const icpcTechInfoRef = useTemplateRef('icpcTechInfo')
onMounted(() => {
  gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother)
  const headTextEle = headTextRef.value
  if (!headTextEle) return
  const tl = gsap.timeline()
  // 初始动画：Hero 手风琴淡入
  const heroAccordion = headTextEle.querySelector('.heroAccordion')
  if (heroAccordion) {
    tl.from(heroAccordion.children, {
      delay: DELAY_INITIAL,
      duration: DURATION_MEDIAN,
      autoAlpha: 0,
      y: 30,
      stagger: STAGGER_MEDIAN,
      ease: 'power2.out',
    })
  }
  ScrollTrigger.create({
    trigger: icpcTechInfoRef.value,
    animation: infoSectionAni(icpcTechInfoRef.value),
  })
  document.querySelectorAll('.title').forEach((ele) => {
    const tl = gsap.timeline()
    tl.from(ele, {
      autoAlpha: 0,
      duration: DURATION_LONG,
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
      duration: DURATION_LONG,
    })
    ScrollTrigger.create({
      trigger: ele,
      animation: tl,
      onEnter: (self) => ele.classList.add('show'),
    })
  })
//   if (BACKEND_ENABLED) {
//     // 纯前端模式下不请求后端，「最新文章」区块一并隐藏
//     ArticleAPI.getLatestArticles(4).then((list) => {
//       latestArticles.value = list
//     })
//   }
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
      h('span', { style: 'color: chocolate' }, [
        h(Icon, { inline: true, icon: 'mdi:achievement-variant', color: 'chocolate' }),
        '第 11 届 CCPC 中国大学生程序设计竞赛（重庆）铜奖',
      ]),
      h('span', { style: 'font-style: italic; opacity: .5' }, ['在蒸了，在蒸了……']),
    ],
    teammates: ['郑毅', '陈君屹', '杜永坤'],
  },
]

// 命名抛弃大脑
const studentList: PeopleData[] = [
  { avatar: '/img/avatar/lzx.jpg', comment: '大爱详哥', info: '保研天津大学',  name: '李周详' },
  { avatar: '/img/avatar/sxy.jpg', info: '保研东南大学', name: '石新阳' },
  { avatar: '/img/avatar/lyf.jpg', info: '保研至中国科学院大学', name: '李韵锋' },
  { avatar: '/img/avatar/lzy.jpg', info: '保研电子科技大学', name: '龙泽宇' },
]
const workerList: PeopleData[] = [
  { avatar: '/img/avatar/jmr.jpg',comment: 'B推搜熟人',info: '哔哩哔哩推搜中台', name: '金珉瑞',},
  { avatar: '/img/avatar/sct.jpg', info: '小马智行Offer', name: '孙城涛' },
  { avatar: '/img/avatar/wzh.jpg', info: '', comment: '韦老师', name: '韦祖豪' },
  { avatar: '/img/avatar/wlm.jpg', info: '字节飞书中台Offer', comment: '「电话告警」', name: '王利明' },
  { avatar: '/img/avatar/cjl.jpg', info: '拼多多Offer', name: '陈佳林' },
]



// 技术组代表项目列表
const techProjectList = [
  {
    grade: 'Active',
    teamName: '青鸾管理系统',
    mainMedal: [
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:web' }),
        '集训队核心教务与人员管理中枢',
      ]),
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:server' }),
        '前后端分离架构，承载高频访问',
      ]),
    ],
    teammates: ['Vue 3', 'Spring Boot', 'TypeScript'], // 借用 teammates 字段展示技术栈
  },
  {
    grade: 'Core',
    teamName: 'GXU-OJ 评测平台',
    mainMedal: [
      h('span', { style: 'color: #b388ff' }, [ // 选用紫色系，代表硬核与极客
        h(Icon, { inline: true, icon: 'mdi:code-braces', color: '#b388ff' }),
        '毫秒级沙箱隔离评测，保障代码安全执行',
      ]),
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:chart-bar' }),
        '支持高并发提交，保障同学们的学习体验',
      ]),
    ],
    teammates: ['Go', 'Docker', 'Vue 3', 'Redis'], // OJ 常见的核心技术栈
  },
  {
    grade: 'v2.0',
    teamName: '谛听 Bot',
    mainMedal: [
      h('span', { style: 'color: #67c23a' }, [
        h(Icon, { inline: true, icon: 'mdi:robot', color: '#67c23a' }),
        '全天候统计集训队刷题与训练进度',
      ]),
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:flash' }),
        '课群智能答疑与学习热情激发',
      ]),
    ],
    teammates: ['Python', 'NoneBot', 'LLM API'],
  },
  {
    grade: 'Hot',
    teamName: '西大教务工具箱 & 插件',
    mainMedal: [
      h('span', { style: 'color: #e6a23c' }, [
        h(Icon, { inline: true, icon: 'mdi:tools', color: '#e6a23c' }),
        '极大简化繁琐的校园教务流程',
      ]),
      h('span', {}, [
        h(Icon, { inline: true, icon: 'mdi:fire' }),
        '候补抢课神器，广受同学们好评',
      ]),
    ],
    teammates: ['JavaScript', 'Browser Extension'],
  },
]

const latestArticles = ref<ArticleMeta[]>([])

// Hero 首屏：算竞/开发 双栏，默认展开左侧，填充全屏，展开 70% / 折叠 30%
const heroActiveIndex = ref<number>(0)
const HERO_EXPANDED_PERCENT = 70
const HERO_COLLAPSED_PERCENT = 30
const HERO_PANELS = [
  { id: 'algo', label: '算竞', icon: 'mdi:trophy-rounded', bgImages: HERO_BG_ALGO },
  { id: 'dev', label: '开发', icon: 'mdi:code-blocks-rounded', bgImages: HERO_BG_DEV },
]
const heroBgIndex = [ref(0), ref(0)] as [Ref<number>, Ref<number>]
function getHeroBgIndex(i: number) {
  return heroBgIndex[i]?.value ?? 0
}
const getHeroAccordionStyle = (index: number) => {
  const expanded = heroActiveIndex.value === index
  const width = expanded ? HERO_EXPANDED_PERCENT : HERO_COLLAPSED_PERCENT
  const left = index === 0 ? 0 : heroActiveIndex.value === 0 ? HERO_EXPANDED_PERCENT : HERO_COLLAPSED_PERCENT
  return { left: `${left}%`, width: `${width}%` }
}

// 加入集训队 / 技术组 收益卡片（仿 Microsoft 内容卡片布局）
const TRAINING_BENEFITS = [
  { icon: 'mdi:trophy-variant', title: '竞赛奖项', desc: 'ICPC/CCPC 等高水平赛事获奖经历，丰富简历、提升竞争力' },
  { icon: 'mdi:school', title: '保研升学', desc: '竞赛经历为保研加分，多名队员成功进入双一流院校深造' },
  { icon: 'mdi:briefcase', title: '就业优势', desc: '算法能力受到大厂青睐，往届队员就业情况优异' },
  { icon: 'mdi:account-group', title: '师长辅导', desc: '学长学姐一对一答疑，从算法到职业规划全面支持' },
  { icon: 'mdi:certificate', title: '学分综测', desc: '参赛获奖可纳入综合素质评定，助力评优评先' },
]
const TECH_BENEFITS = [
  { icon: 'mdi:code-tags', title: '项目实战', desc: '参与 OJ、教务系统等真实项目，告别玩具代码' },
  { icon: 'mdi:layers', title: '技术栈', desc: '前后端、DevOps 全栈开发，掌握工业级技术体系' },
  { icon: 'mdi:git', title: '工程规范', desc: '团队协作与代码规范，提前适应企业开发流程' },
  { icon: 'mdi:chart-line', title: '求职竞争力', desc: '算法 + 工程双修，互联网大厂 offer 敲门砖' },
  { icon: 'mdi:account-tie', title: '面试指导', desc: '大厂在职学长亲授技术与面试技巧，少走弯路' },
]

// 各组背景图轮播
HERO_PANELS.forEach((panel, i) => {
  if (panel.bgImages.length > 1) {
    const idxRef = heroBgIndex[i]
    if (idxRef) {
      setInterval(() => {
        idxRef.value = (idxRef.value + 1) % panel.bgImages.length
      }, 7500)
    }
  }
})

// 代表队伍：横向滚动 + 拖拽（使用 RAF 提升流畅度）
const teamScrollRef = useTemplateRef<HTMLDivElement>('teamScroll')
const teamDragState = ref({ isDragging: false, startX: 0, startScrollLeft: 0 })
let teamDragRafId = 0
let teamDragLastX = 0

function scrollTeams(direction: number) {
  const el = teamScrollRef.value
  if (!el) return
  el.scrollBy({ left: direction * 400, behavior: 'smooth' })
}
function startTeamDrag(e: MouseEvent) {
  if (e.button !== 0) return
  const el = teamScrollRef.value
  if (!el) return
  teamDragLastX = e.pageX
  teamDragState.value = { isDragging: true, startX: e.pageX, startScrollLeft: el.scrollLeft }
}
function onTeamDrag(e: MouseEvent) {
  if (!teamDragState.value.isDragging) return
  teamDragLastX = e.pageX
  if (teamDragRafId) return
  teamDragRafId = requestAnimationFrame(() => {
    teamDragRafId = 0
    const el = teamScrollRef.value
    if (!el) return
    const { startX, startScrollLeft } = teamDragState.value
    el.scrollLeft = startScrollLeft - (teamDragLastX - startX)
  })
}
function endTeamDrag() {
  if (teamDragRafId) cancelAnimationFrame(teamDragRafId)
  teamDragRafId = 0
  teamDragState.value.isDragging = false
}

</script>
<!-- 请注意，该组件为了便于动画绑定和布局设定，使用了较多不规范写法，可读性较差 -->
<!-- 可以用于学习实现原理，但请不要学习该文件代码样式 -->
<template>
  <!-- Hero 首屏：全屏 算竞/开发 双栏手风琴，展开 70% / 折叠 30% -->
  <section class="heroSection" ref="headText">
    <div class="heroAccordion">
      <div
        v-for="(panel, i) in HERO_PANELS"
        :key="panel.id"
        class="heroAccordionItem"
        :class="{ collapsed: heroActiveIndex !== i }"
        :style="getHeroAccordionStyle(i)"
        @mouseover="heroActiveIndex = i"
      >
        <!-- 固定尺寸容器 + 面板裁剪：图片不随面板缩放 -->
        <div class="heroPanelBgClip">
          <div class="heroPanelBgFixed" :class="{ isLeft: i === 0, isRight: i === 1 }">
            <div class="heroPanelBg" :class="{ noImages: !panel.bgImages.length }">
              <div
                v-for="(url, j) in panel.bgImages"
                :key="url"
                class="heroPanelBgLayer"
                :class="{ active: j === getHeroBgIndex(i) }"
                :style="{ backgroundImage: `url(${url})` }"
              />
              <div class="heroPanelBgOverlay" />
            </div>
          </div>
        </div>
        <div class="heroCollapsedCover">
          <Icon :icon="panel.icon" style="font-size: 2em; opacity: 0.6" />
          <span>{{ panel.label }}</span>
        </div>
        <div class="heroExpandedContent">
          <div class="heroWatermark">{{ panel.label }}</div>
          <div class="heroTitle">
            {{ panel.label === '算竞' ? '算法竞赛' : '技术开发' }}
          </div>
          <p class="heroDesc">
            {{ panel.label === '算竞'
              ? '参与ICPC、CCPC 等高水平赛事，与国内顶尖院校同台竞技，锤炼算法思维，冲击区域赛、世界总决赛。'
              : '前后端开发、OJ 评测、自动化工具、校企项目，参与真实项目，积累工业级经验，为面试求职做坚实基础。'
            }}
          </p>
          <button
            class="learnMoreBtn heroLearnBtn"
            @click="
              () => {
                const targetId = i === 0 ? 'learnMoreTarget' : 'techGroupTarget'
                const smoother = ScrollSmoother.create({ effects: false, smooth: false })
                gsap.to(smoother, {
                  scrollTop: smoother.offset(`#${targetId}`, 'top 100px'),
                  ease: 'power2.out',
                  duration: DURATION_LONG,
                })
              }
            ">
            了解更多
            <Icon icon="material-symbols:arrow-right-alt-rounded" :inline="true" style="color: inherit" />
          </button>
        </div>
      </div>
    </div>
  </section>


  <h1 class="title heroNextSection" id="learnMoreTarget">集训队概要</h1>
  <ani-ele
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        const charStagger = STAGGER_CHAR
        tl.from(SplitText.create(ele, { type: 'chars' }).chars, {
          autoAlpha: 0,
          y: 20,
          duration: DURATION_SHORT,
          stagger: charStagger,
        })
        const spans = ele.querySelectorAll('span')
        if (spans[1])
          tl.to(
            spans[1],
            {
              duration: DURATION_LONG,
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
              duration: DURATION_LONG,
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
    class="benefitsCardGrid"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        tl.from(ele.querySelectorAll('.benefitsCard'), {
          duration: DURATION_LONG,
          ease: 'power2.out',
          y: 40,
          autoAlpha: 0,
          stagger: STAGGER_SHORT,
          clearProps: 'transform,opacity',
        })
        return tl
      }
    ">
    <div
      v-for="(item, i) in TRAINING_BENEFITS"
      :key="i"
      class="benefitsCard">
      <div class="benefitsCardIcon">
        <Icon :icon="item.icon" />
      </div>
      <div class="benefitsCardTitle">{{ item.title }}</div>
      <div class="benefitsCardDesc">{{ item.desc }}</div>
    </div>
  </ani-ele>
  <h2 class="subtitle">优秀队员</h2>
  <div class="teamCardsSection">
    <button
      type="button"
      class="teamScrollBtn teamScrollBtnLeft"
      aria-label="向左滚动"
      @click="scrollTeams(-1)">
      <Icon icon="mdi:chevron-left" />
    </button>
    <div
      ref="teamScroll"
      class="teamCardsScrollWrapper"
      :class="{ grabbing: teamDragState.isDragging }"
      @mousedown="startTeamDrag"
      @mousemove="onTeamDrag"
      @mouseup="endTeamDrag"
      @mouseleave="endTeamDrag">
      <ani-ele
        class="teamCardContainer"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        const cardStagger = STAGGER_SHORT // 与「加入技术组会获得什么？」同节奏
        ele.childNodes.forEach((cardEle, index) => {
          const t = index * cardStagger
          tl.from(
            cardEle,
            {
              scale: 0,
              autoAlpha: 0,
              duration: DURATION_LONG,
              ease: 'power2.out',
            },
            t,
          ).from(
            SplitText.create(cardEle.childNodes, { type: 'lines', mask: 'lines' }).lines,
            {
              y: 24,
              autoAlpha: 0,
              duration: DURATION_SHORT,
              ease: 'sine.out',
              stagger: STAGGER_CHAR,
            },
            t,
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
    </div>
    <button
      type="button"
      class="teamScrollBtn teamScrollBtnRight"
      aria-label="向右滚动"
      @click="scrollTeams(1)">
      <Icon icon="mdi:chevron-right" />
    </button>
  </div>
  <people-list :list="studentList" />
  <people-list :list="workerList" />


  <h1 class="title" id="techGroupTarget">技术组概要</h1>

  <ani-ele
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        const charStagger = STAGGER_CHAR
        tl.from(SplitText.create(ele, { type: 'chars' }).chars, {
          autoAlpha: 0,
          y: 20,
          duration: DURATION_SHORT,
          stagger: charStagger,
        })
        const spans = ele.querySelectorAll('span')
        // 修改了目标数字，模拟技术组的成就
        if (spans[1])
          tl.to(
            spans[1],
            {
              duration: DURATION_LONG,
              ease: 'power3.out',
              onUpdate: function () {
                spans[1]!.innerText = Math.round(this.progress() * 10) + '+'
              },
            },
            `${getEleNth(spans[1]) * charStagger}`,
          )
        if (spans[3])
          tl.to(
            spans[3],
            {
              duration: DURATION_LONG,
              ease: 'power3.out',
              onUpdate: function () {
                spans[3]!.innerText = Math.round(this.progress() * 1000) + '+'
              },
            },
            `${getEleNth(spans[3]) * charStagger}`,
          )

        return tl
      }
    "
    class="textCenter">
    目前为止，技术组已自主研发并维护了
    <span style="font-size: 1.5em; font-weight: bold; color: var(--el-color-primary)">0</span>
    个实用级核心项目<br />
    日常服务覆盖了全校
    <br />
    <b style="font-size: 1.2em">
      选课、教务、OJ评测、算法训练统计
    </b>
    <br />等多个应用场景，累计服务人次
    <span style="font-size: 1.5em; font-weight: bold; color: chocolate">0</span>
  </ani-ele>

  <h2 class="subtitle">加入技术组会获得什么？</h2>
  <ani-ele
    class="benefitsCardGrid"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        tl.from(ele.querySelectorAll('.benefitsCard'), {
          duration: DURATION_LONG,
          ease: 'power2.out',
          y: 40,
          autoAlpha: 0,
          stagger: STAGGER_SHORT,
          clearProps: 'transform,opacity',
        })
        return tl
      }
    ">
    <div
      v-for="(item, i) in TECH_BENEFITS"
      :key="i"
      class="benefitsCard benefitsCardTech">
      <div class="benefitsCardIcon">
        <Icon :icon="item.icon" />
      </div>
      <div class="benefitsCardTitle">{{ item.title }}</div>
      <div class="benefitsCardDesc">{{ item.desc }}</div>
    </div>
  </ani-ele>

  <h2 class="subtitle">代表项目展示</h2>
  <ani-ele
    class="benefitsCardGrid projectCardGrid"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        tl.from(ele.querySelectorAll('.projectCard'), {
          duration: DURATION_LONG,
          ease: 'power2.out',
          y: 40,
          autoAlpha: 0,
          stagger: STAGGER_SHORT,
          clearProps: 'transform,opacity',
        })
        return tl
      }
    ">
    <div
      v-for="(project, i) in techProjectList"
      :key="i"
      class="projectCard">
      <div class="projectCardBadge">{{ project.grade }}</div>
      <div class="projectCardTitle">{{ project.teamName }}</div>
      <div class="projectCardTech">
        <span v-for="(tech, tIndex) in project.teammates" :key="tIndex" class="projectTechTag">{{ tech }}</span>
      </div>
      <div class="projectCardHighlights">
        <div v-for="(medal, index) in project.mainMedal" :key="index" class="projectHighlightItem">
          <component :is="medal" />
        </div>
      </div>
    </div>
  </ani-ele>

  <!-- 最新文章依赖后端接口，纯前端模式下隐藏 -->
  <h2 v-if="BACKEND_ENABLED" class="subtitle">最新文章</h2>
  <ani-ele
    v-if="BACKEND_ENABLED"
    class="articleListGridHome"
    :scroll-in-ani="
      (ele) => {
        const tl = gsap.timeline()
        tl.from(ele.querySelectorAll('.articleCard'), {
          duration: DURATION_LONG,
          ease: 'power2.out',
          y: 40,
          autoAlpha: 0,
          stagger: STAGGER_SHORT,
          clearProps: 'transform,opacity',
        })
        return tl
      }
    ">
    <ArticleCard
      v-for="article in latestArticles"
      :key="article.id"
      :article="article"
    />
  </ani-ele>

  <div class="articleMoreLink" v-if="BACKEND_ENABLED && latestArticles.length">
    <router-link to="/articles" class="learnMoreBtn">
      查看更多
      <Icon icon="material-symbols:arrow-right-alt-rounded" :inline="true" style="color: inherit" />
    </router-link>
  </div>
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
  transition: var(--duration-short) ease-in-out;

  &:hover {
    gap: 10px;
    font-weight: bold;
    color: var(--el-color-primary);
  }

  &::before {
    border-radius: 5px;
    transition: var(--duration-short) ease-in-out;
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

/* ====================================
   Hero 首屏：全屏 算竞/开发 双栏手风琴
   展开 70% / 折叠 30%，各面板独立背景图
   ==================================== */
.heroSection {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  isolation: isolate;
}

.heroAccordion {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.heroAccordionItem {
  position: absolute;
  top: 0;
  height: 100%;
  backdrop-filter: blur(v-bind(heroPanelBackdropBlur));
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: left var(--duration-median) cubic-bezier(0.25, 1, 0.5, 1),
    width var(--duration-median) cubic-bezier(0.25, 1, 0.5, 1);

  &:not(.collapsed) {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.4);
  }
}

/* 固定尺寸容器：不随面板宽度变化，面板 overflow 裁剪 */
.heroPanelBgClip {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.heroPanelBgFixed {
  position: absolute;
  top: 0;
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  transition: transform var(--duration-median) ease;
}

.heroPanelBgFixed.isLeft {
  left: 0;
}
.heroAccordionItem:nth-child(1).collapsed .heroPanelBgFixed.isLeft {
  transform: translateX(-4%);
}
.heroAccordionItem:nth-child(1):not(.collapsed) .heroPanelBgFixed.isLeft {
  transform: translateX(0);
}

.heroPanelBgFixed.isRight {
  right: 0;
  left: auto;
}
.heroAccordionItem:nth-child(2).collapsed .heroPanelBgFixed.isRight {
  transform: translateX(4%);
}
.heroAccordionItem:nth-child(2):not(.collapsed) .heroPanelBgFixed.isRight {
  transform: translateX(0);
}

.heroPanelBg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.heroPanelBgLayer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(v-bind(heroBgBlur));
  opacity: 0;
  transition: opacity 1s ease-in-out;

  &.active {
    opacity: 1;
  }
}

.heroPanelBgOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.heroPanelBg.noImages .heroPanelBgOverlay {
  background: linear-gradient(
    135deg,
    rgba(25, 30, 40, 0.95) 0%,
    rgba(18, 22, 30, 0.98) 100%
  );
}

.heroCollapsedCover {
  position: absolute;
  transition: all var(--duration-median) ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6em;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.25);

  span {
    display: block;
    transform: rotate(-90deg);
    font-size: clamp(1.2em, 4vw, 2em);
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 6px;
    white-space: nowrap;
  }

  .heroAccordionItem:not(.collapsed) & {
    opacity: 0;
    transform: translateX(20px);
    pointer-events: none;
  }
}

.heroExpandedContent {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 40px;
  opacity: 0;
  transform: translateX(15px);
  transition: all var(--duration-median) ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
  z-index: 1;

  /* 文字下方蒙版，提升可读性 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.4) 30%,
      rgba(0, 0, 0, 0.7) 100%
    );
    pointer-events: none;
    z-index: -1;
  }

  .heroAccordionItem:not(.collapsed) & {
    opacity: 1;
    transform: translateX(0);
    transition-delay: var(--duration-short);
    pointer-events: auto;
  }
}

.heroWatermark {
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 5em;
  font-weight: 900;
  font-style: italic;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.08);
  user-select: none;
}

.heroTitle {
  font-size: 2.5em;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1em;
}

.heroDesc {
  font-size: 1.2em;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1.5em;
  max-width: 90%;
}

.heroLearnBtn {
  align-self: flex-start;
}

/* Hero 下方首块内容：下移，避免被 hero 遮挡 */
.heroNextSection {
  margin-top: 4em;
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
    transition: var(--duration-long) ease-in-out;
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
    transition: var(--duration-long) ease-in-out;
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

/* 收益卡片网格：全宽铺平，仿 Microsoft 内容卡片布局 */
.benefitsCardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 2em 0 4em;
  padding: 0 2em;
  box-sizing: border-box;
}

.benefitsCard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: border-color var(--duration-short) ease,
    background-color var(--duration-short) ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

.benefitsCardIcon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--el-color-primary);
}

.benefitsCardTech .benefitsCardIcon {
  color: #4fc3f7;
}

.benefitsCardTitle {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
}

.benefitsCardDesc {
  font-size: 0.95em;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
}

/* 代表队伍：横向滚动容器，防止页面溢出 */
.teamCardsSection {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* 仅禁止横向溢出，纵向允许完整显示 */
  margin-bottom: 2em;
}

.teamCardsScrollWrapper {
  overflow-x: auto;
  overflow-y: visible; /* 允许年级、角标等溢出显示 */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  /* 为年级水印(5em)、角标预留上下空间，避免截断 */
  padding: 5em 0 2.5em;

  &.grabbing {
    cursor: grabbing;
    user-select: none;
  }

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
}

.teamScrollBtn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, opacity 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  &:active {
    background: rgba(255, 255, 255, 0.35);
  }

  &.teamScrollBtnLeft {
    left: 0;
  }
  &.teamScrollBtnRight {
    right: 0;
  }
}

.teamCardContainer {
  display: grid;
  justify-content: flex-start;
  grid-auto-flow: column;
  column-gap: 2em;
  grid-template-columns: repeat(3, 35em);
  grid-row: 1;
  width: max-content;
  padding: 0 50px; /* 为左右按钮留出空间 */
  align-items: start; /* 避免 grid 拉伸导致高度异常 */
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

.articleListGridHome {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 2em 0 2em;
  padding: 0 2em;
  box-sizing: border-box;
}

.articleMoreLink {
  display: flex;
  justify-content: center;
  margin-bottom: 4em;
}

/* ====================================
   代表项目展示：与「加入技术组会获得什么」同风格卡片网格
   ==================================== */
.projectCardGrid {
  margin-bottom: 6em;
  /* 自适应列：宽屏 4 列，平板 2~3 列，手机 1 列，自动降级 */
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.projectCard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding:16px 20px;
  /* 固定展示高度，避免随视口高度在 2K/4K 上膨胀 */
  min-height: clamp(340px, 24vw, 420px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  gap: 12px;
  transition: border-color var(--duration-short) ease,
    background-color var(--duration-short) ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

.projectCardBadge {
  font-size: 0.95em;
  font-family: 'Courier New', monospace;
  color: var(--el-color-primary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.projectCardTitle {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff;
}

.projectCardTech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.projectTechTag {
  font-size: 1em;
  font-family: monospace;
  color: rgba(96, 165, 250, 0.95);
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.25);
  padding: 4px 12px;
  border-radius: 6px;
}

/* 下半区：描述（自动撑到底部） */
.projectCardHighlights {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
  padding-top: 1.25rem;
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1;

  .projectHighlightItem :deep(span) {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex-wrap: wrap;
  }
}

/* ====================================
   全站移动端（手机直屏）终极适配方案
   ==================================== */
@media (max-width: 768px) {
  /* 1. 全局基础排版缩放 */
  body, html {
    overflow-x: hidden; /* 🔑 绝对禁止横向滚动条出现 */
  }

  .title {
    font-size: 1.8em; /* 缩小主标题 */
    margin: 1.5em auto;
    text-align: center;
  }

  .subtitle {
    font-size: 1.5em; /* 缩小副标题 */
    margin: 1.5em auto;
    padding: 0.5em;
  }

  .textCenter {
    font-size: 1.1em; /* 缩小中间的统计数据文字 */
    padding: 0 15px;
    line-height: 1.8em;
  }

  /* 2. 顶部首屏 (Hero Section) 抢救：
     手风琴由「左右 70/30」改为「上下 68/32」纵向堆叠，
     避免窄屏下展开面板文字被挤压截断（内容占满全宽） */
  .heroSection {
    height: 100vh;
    height: 100svh; /* 移动端地址栏收起时不留黑边 */
  }

  /* 覆盖内联的 left/width（横向手风琴布局），改为纵向排布 */
  .heroAccordionItem {
    left: 0 !important;
    width: 100% !important;
    transition: top var(--duration-median) cubic-bezier(0.25, 1, 0.5, 1),
      height var(--duration-median) cubic-bezier(0.25, 1, 0.5, 1);
  }

  .heroAccordionItem:not(.collapsed) {
    top: 0;
    height: 68%;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
  }

  .heroAccordionItem.collapsed {
    top: auto;
    bottom: 0;
    height: 32%;
  }

  /* 背景图层不再做水平位移补偿：展开面板锚顶、折叠面板锚底 */
  .heroPanelBgFixed {
    left: 0 !important;
    right: auto !important;
    transform: none !important;
    top: 0;
  }

  .heroAccordionItem.collapsed .heroPanelBgFixed {
    top: auto;
    bottom: 0;
  }

  /* 折叠条变为宽而矮：文字改为水平摆放 */
  .heroCollapsedCover {
    gap: 0.4em;

    span {
      transform: none;
      font-size: 1.1em;
      letter-spacing: 4px;
    }
  }

  .heroExpandedContent {
    padding: 20px;
  }

  .heroWatermark {
    font-size: 2.2em;
    top: 12px;
    right: 20px;
  }

  .heroTitle {
    font-size: 1.5em;
    margin-bottom: 0.6em;
  }

  .heroDesc {
    font-size: 0.9em;
    margin-bottom: 1em;
    max-width: 100%;
  }

  /* 3. 简介区域 (ICPC & 技术组 Info) 抢救 */
  .infoContainer {
    flex-direction: column; /* 🔑 横排改竖排 */
    max-width: 100%;
    margin-left: 15px !important;
    margin-right: 15px !important;
    font-size: 1.1em;

    // 技术组原本是右对齐，手机端强制全部左对齐
    &.icpc-tech { text-align: left !important; }
    &.icpc-tech .infoBrief { flex-direction: row !important; }

    .text3 {
      font-size: 0.9em;
      margin-left: 0 !important;
      text-align: justify !important; /* 两端对齐，阅读更舒适 */
    }
  }

  /* 4. 收益卡片网格 (加入集训队/技术组获得什么) 移动端 */
  .benefitsCardGrid {
    grid-template-columns: 1fr;
    padding: 0 15px;
    margin: 1.5em 0 3em;
  }

  .benefitsCard {
    padding: 1.25rem 1rem;
  }

  .benefitsCardTitle {
    font-size: 1em;
  }

  .benefitsCardDesc {
    font-size: 0.9em;
  }

  /* 5. 队伍卡片 (代表队伍) 抢救 */
  .teamCardsSection {
    padding: 0 15px;
  }

  .teamScrollBtn {
    display: none !important; /* 窄屏纵向排列时隐藏，用触摸滑动即可 */
  }

  .teamCardsScrollWrapper {
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    padding: 3em 0 1.5em; /* 移动端缩小预留空间 */
  }

  .teamCardContainer {
    grid-auto-flow: row; /* 🔑 从横向排布改为纵向瀑布流 */
    grid-template-columns: 1fr; /* 🔑 强行变成单列 */
    padding: 0;
    row-gap: 2em; /* 卡片上下间距 */
    width: 100%;
  }

  .teamCard {
    width: 100%; /* 卡片占满手机屏幕宽度 */
    box-sizing: border-box;
    padding: 1.5em;

    .gradeText {
      font-size: 3.5em; /* 缩小背后的年级水印 */
      top: -0.2em;
    }
  }

  /* 6. 代表项目展示 (卡片网格) 移动端 */
  .projectCardGrid {
    margin-bottom: 4em;
    grid-template-columns: 1fr; /* 窄屏单列 */
  }

  .projectCard {
    padding: 1.25rem 1rem;
    min-height: auto; /* 移动端取消固定高度 */
  }

  .projectCardBadge {
    font-size: 0.85em;
  }

  .projectCardTitle {
    font-size: 1.2em;
  }

  .projectTechTag {
    font-size: 0.9em;
  }

  .projectCardHighlights {
    font-size: 1em;
    margin-top: 0;
    padding-top: 1rem;
  }

  .articleListGridHome {
    grid-template-columns: 1fr;
    padding: 0 15px;
    margin: 1.5em 0 2em;
  }

  .articleMoreLink {
    margin-bottom: 3em;
  }
}
</style>
