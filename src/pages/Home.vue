<script setup lang="ts">
import AniEle from '@/components/AniEle.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import type { ArticleMeta } from '@/types/article'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import { ArticleAPI } from '@/api/article'
import StoryCards, { type StoryItem } from '@/components/home/StoryCards.vue'
import {
  DELAY_INITIAL,
  DURATION_EXTRA_LONG,
  DURATION_LONG,
  DURATION_MEDIAN,
  DURATION_SHORT,
  STAGGER_CHAR,
  STAGGER_MEDIAN,
  STAGGER_SHORT,
} from '@/constants/animation'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { HERO_BG_ALGO, HERO_BG_DEV } from '@/config/heroBg'
import { HERO_BG_BLUR, HERO_PANEL_BACKDROP_BLUR } from '@/constants/hero'
import { BACKEND_ENABLED } from '@/config/features'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { h, onMounted, useTemplateRef, ref, type Ref } from 'vue'

const { isTouch, reduceMotion } = useBreakpoint()

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
  gsap.registerPlugin(SplitText, ScrollTrigger)
  const headTextEle = headTextRef.value
  if (!headTextEle) return

  // 系统开启「减少动态效果」：跳过全部入场动画，直接呈现终态
  if (reduceMotion.value) {
    document.querySelectorAll('.title, .subtitle').forEach((ele) => ele.classList.add('show'))
    return
  }

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

// 优秀队伍：仿 JetBrains「Customer Stories」卡片布局，年级沿用原版艺术字水印
const teamStories: StoryItem[] = [
  {
    name: '流星一条',
    watermark: '22级',
    infoSuffix: '队员：付家锐、石新阳、韦祖豪',
    quoteItems: [
      {
        icon: 'mdi:achievement-variant',
        color: 'silver',
        text: '第48届ICPC亚洲区域赛（西安）银奖',
      },
      {
        icon: 'mdi:achievement-variant',
        color: 'chocolate',
        text: '第 9 届CCPC（深圳）铜奖',
      },
      {
        icon: 'mdi:prize',
        text: 'ICPC（西部）三等奖',
      },
    ],
    footer: '写不下力……',
  },
  {
    name: '远航者的幻想乡',
    watermark: '23级',
    infoSuffix: '队员：张健明、陶康、孙怿翔',
    quoteItems: [
      {
        icon: 'mdi:achievement-variant',
        color: 'gold',
        text: '第 50 届 ICPC 邀请赛（西安）金奖',
      },
      {
        icon: 'mdi:achievement-variant',
        color: 'chocolate',
        text: '第 50 届 ICPC（西安）铜奖',
      },
      {
        icon: 'mdi:achievement-variant',
        color: 'chocolate',
        text: '第 11 届 CCPC（郑州）铜奖',
      },
    ],
    footer: '真的只打最后一把……',
  },
  {
    name: '队名WA2了',
    watermark: '24级',
    infoSuffix: '队员：郑毅、陈君屹、杜永坤',
    quoteItems: [
      {
        icon: 'mdi:achievement-variant',
        color: 'silver',
        text: '第 50 届 ICPC 区域赛（沈阳）银奖',
      },
      {
        icon: 'mdi:achievement-variant',
        color: 'chocolate',
        text: '第 11 届 CCPC（重庆）铜奖',
      },
    ],
    footer: '在蒸了，在蒸了……',
  },
]

// 优秀队员（升学 & 就业）：一组翻页展示，一页三张
const memberStories: StoryItem[] = [
  { avatar: '/img/avatar/lzx.jpg', name: '李周详', info: '保研天津大学', quote: '大爱详哥' },
  { avatar: '/img/avatar/sxy.jpg', name: '石新阳', info: '保研东南大学' },
  { avatar: '/img/avatar/lyf.jpg', name: '李韵锋', info: '保研至中国科学院大学' },
  { avatar: '/img/avatar/lzy.jpg', name: '龙泽宇', info: '保研电子科技大学' },
  { avatar: '/img/avatar/jmr.jpg', name: '金珉瑞', info: '哔哩哔哩推搜中台', quote: 'B推搜熟人' },
  { avatar: '/img/avatar/sct.jpg', name: '孙城涛', info: '小马智行Offer' },
  { avatar: '/img/avatar/wzh.jpg', name: '韦祖豪', quote: '韦老师' },
  { avatar: '/img/avatar/wlm.jpg', name: '王利明', info: '字节飞书中台Offer', quote: '「电话告警」' },
  { avatar: '/img/avatar/cjl.jpg', name: '陈佳林', info: '拼多多Offer' },
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
        '一键教评神器，广受同学们好评',
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
  // 窄屏（≤1024）为上下堆叠布局，完全交给 CSS 控制，不输出内联 left/width，
  // 这样样式表也无需再用 !important 去对抗内联样式
  if (isTouch.value) return {}
  const expanded = heroActiveIndex.value === index
  const width = expanded ? HERO_EXPANDED_PERCENT : HERO_COLLAPSED_PERCENT
  const left = index === 0 ? 0 : heroActiveIndex.value === 0 ? HERO_EXPANDED_PERCENT : HERO_COLLAPSED_PERCENT
  return { left: `${left}%`, width: `${width}%` }
}

// 平滑滚动到目标锚点（原生能力即可，替代旧版「每次点击新建 ScrollSmoother」的做法）
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        @click="heroActiveIndex = i"
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
            @click="scrollToSection(i === 0 ? 'learnMoreTarget' : 'techGroupTarget')">
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
  <!-- 优秀队伍 & 优秀队员：仿 JetBrains「Customer Stories」卡片布局，一页三张翻页展示 -->
  <story-cards :items="teamStories" />
  <story-cards :items="memberStories" />


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

/* .infoContainer / .title 全局类样式由 styles/global.scss 提供，此处不再重复 */

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
  padding: 0 var(--page-padding-x);
}

/* 收益卡片网格：全宽铺平，仿 Microsoft 内容卡片布局 */
.benefitsCardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 2em 0 4em;
  padding: 0 var(--page-padding-x);
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

/* 代表队伍 / 优秀队员卡片样式已迁移至 components/home/StoryCards.vue */

.articleListGridHome {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 2em 0 2em;
  padding: 0 var(--page-padding-x);
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
   首页平板/手机适配（≤1024）：Hero 手风琴
   由「左右 70/30」改为「上下 68/32」纵向堆叠，
   避免窄屏下展开面板文字被挤压截断（内容占满全宽）。
   窄屏下 getHeroAccordionStyle 不输出内联 left/width，CSS 直接接管布局
   ==================================== */
@include touch {
  .heroSection {
    height: 100vh;
    height: 100svh; /* 移动端地址栏收起时不留黑边 */
  }

  .heroAccordionItem {
    left: 0;
    width: 100%;
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

  /* 背景图层取消水平位移补偿：选择器与桌面 nth-child 位移规则同优先级，靠源顺序覆盖 */
  .heroAccordionItem:nth-child(1).collapsed .heroPanelBgFixed.isLeft,
  .heroAccordionItem:nth-child(1):not(.collapsed) .heroPanelBgFixed.isLeft,
  .heroAccordionItem:nth-child(2).collapsed .heroPanelBgFixed.isRight,
  .heroAccordionItem:nth-child(2):not(.collapsed) .heroPanelBgFixed.isRight {
    left: 0;
    right: auto;
    transform: none;
  }

  /* 展开面板锚顶、折叠面板锚底 */
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
}

/* ====================================
   首页手机端适配（≤768，全局类的响应式见 styles/global.scss）
   ==================================== */
@include mobile {
  .subtitle {
    font-size: 1.5em; /* 缩小副标题 */
    margin: 1.5em auto;
    padding: 0.5em;
  }

  .textCenter {
    font-size: 1.1em; /* 缩小中间的统计数据文字 */
    padding: 0 var(--page-padding-x);
    line-height: 1.8em;
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

  /* 4. 收益卡片网格 (加入集训队/技术组获得什么) 移动端 */
  .benefitsCardGrid {
    grid-template-columns: 1fr;
    padding: 0 var(--page-padding-x);
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

  /* 5. 优秀队员卡片 (StoryCards) 响应式规则在组件内部处理 */

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
    padding: 0 var(--page-padding-x);
    margin: 1.5em 0 2em;
  }

  .articleMoreLink {
    margin-bottom: 3em;
  }
}
</style>
