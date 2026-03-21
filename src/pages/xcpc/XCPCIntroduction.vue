<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { onMounted, onUnmounted, ref } from 'vue'

const globalLoading = useGlobalLoading()

// ==========================================
// 1. 滚动动画指令：v-slide-show
// ==========================================
const vSlideShow = {
  mounted: (el: HTMLElement) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('show')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
  },
}

// ==========================================
// 2. 右侧悬浮目录逻辑 (Scrollspy)
// ==========================================
const activeId = ref<string>('intro')
let tocObserver: IntersectionObserver | null = null

// 目录数据配置（需与下方 HTML 中 h2 的 id 完全一致）
const tocList = [
  { id: 'intro', title: 'XCPC是什么？' },
  { id: 'matrix', title: '一、 赛事矩阵与生态体系' },
  { id: 'rules', title: '二、 核心赛制与竞技特点' },
  { id: 'about', title: '关于参赛' },
  { id: 'gain', title: '参加 XCPC 能得到什么？' },
  { id: 'guide', title: 'XCPC 竞赛入门指南' }
]

onMounted(() => {
  const headings = document.querySelectorAll('h2[id]')
  tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    // 黑魔法：只侦测屏幕顶部往下 10%~20% 的区域
    { rootMargin: '-10% 0px -80% 0px' },
  )
  headings.forEach((h) => tocObserver!.observe(h))
})

onUnmounted(() => {
  if (tocObserver) tocObserver.disconnect()
})

// 点击目录平滑滚动
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="page-layout">
    <main class="article-container">
      <h2 id="intro" class="subtitle" v-slide-show>XCPC是什么？</h2>

      <h1 class="main-title">ACM（XCPC）系列赛事</h1>

      <p class="paragraph">
        XCPC是以 ICPC (国际大学生程序设计竞赛) 、CCPC (中国大学生程序设计竞赛) 为代表的大学生程
        序设计竞赛统称，是全球高校最具含金量、最具影响力的算法竞技舞台。在这里，来自全国乃
        至全球的高校精英同台竞技，在 5 个小时的极限高压下，挑战 10 到 13 道极具深度的复杂算法难题。
      </p>

      <div class="divider" v-slide-show></div>

      <h2 id="matrix" class="section-title">一、 赛事矩阵与生态体系</h2>
      <p class="paragraph">
        XCPC 并非单一比赛，而是一个呈金字塔结构的庞大竞赛生态，主要由以下核心赛事构成：
      </p>
      <p class="paragraph">
        <strong>ICPC（国际大学生程序设计竞赛）：</strong>
        被誉为计算机界的“奥林匹克”。赛事体系自下而上分为网络资格赛、省级赛、区域赛（Regional）与世界总决赛（World
        Finals）。区域赛的题目通常具备极高的国际化视野，全英文命题，是对团队综合实力的全面检验。能够站上
        WF 舞台的，皆是全球顶尖高校的顶尖天才。
      </p>
      <p class="paragraph">
        <strong>CCPC（中国大学生程序设计竞赛）：</strong> 随着国内算法竞技水平的井喷，ICPC
        的赛区名额已无法满足国内强校的竞技需求，CCPC
        应运而生。由国内竞赛圈顶级教练组成的命题组，使得其题目风格更加贴合国内顶尖高校的训练体系，题目深度、防
        AK（All Kill，指解出所有题）机制以及整体竞技水平完全对标甚至在某些维度超越了 ICPC 区域赛。
      </p>
      <p class="paragraph">
        <strong>省赛与邀请赛：</strong>
        如广西壮族自治区大学生程序设计竞赛等，作为金字塔的基石，不仅是各高校检验阶段性训练成果的试金石，也是通往国家级、世界级赛场的必经之路和重要热身。
      </p>

      <div class="divider" v-slide-show></div>

      <h2 id="rules" class="section-title">二、 核心赛制与竞技特点</h2>
      <p class="paragraph">
        XCPC 拒绝任何形式的“纸上谈兵”与“面向搜索编程”，其核心赛制将竞技的压迫感推向了极致：
      </p>
      <p class="paragraph">
        <strong>“3 人 1 机”的算力博弈：</strong> 三名队员在 5
        个小时内，仅能使用一台不联网的计算机。这要求团队必须具备精密如齿轮般的战术配合：通常需要有人负责在纸上进行复杂的数学推演与状态压缩，有人负责主导键盘将抽象逻辑迅速工程化，还有人负责设计极端测试用例并进行静态查错，默契团队的分工是必不可少的一环。
      </p>
      <p class="paragraph">
        <strong>毫秒必争的底层校验：</strong> 比赛通常包含 10 到 13
        道全英文题目。选手提交的代码将由机器（Online
        Judge）进行极其严苛的黑盒测试。代码不仅要逻辑正确（Accepted），还必须在严苛的运行时间（通常为
        1000ms 内）和内存空间（如
        256MB）内跑完所有极端数据。任何一次内存溢出或超时，都会带来残酷的罚时（每错误提交一次，总用时增加
        20 分钟）。
      </p>
      <p class="paragraph">
        <strong>心理战与“封榜”机制：</strong>
        赛场内悬挂的彩色气球代表着各队解题的进度，实时滚动的排行榜让所有人的实力暴露无遗。而在比赛的最后一小时，排行榜将被冻结（封榜），你只能看到对手提交了代码，却不知道是否通过。
      </p>
      <p class="paragraph">另外值得一提的是，xcpc 竞赛可以携带纸质资料参赛，内容不限。</p>



      <div class="animated-divider" v-slide-show></div>

      <h2 id="about" class="section-title">关于参赛</h2>
      <p class="paragraph">
        参赛名额由“网络赛”决定每所学校所能分配的区域赛资格数量，集训队随之组织队伍分配；省赛、区域赛、邀请赛、国际总决赛获奖比例为金牌 10%， 银牌 20%， 铜牌 30%；每年下半年，各高校会陆续举办区域赛，每年区域赛约 4-5 场。
      </p>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="gain" class="section-title">参加 XCPC 能得到什么？</h2>
      <p class="paragraph">
        作为算法界的“奥林匹克”，xcpc赛事的含金量毋庸置疑，无论是保研深造还是去大厂就业，xcpc经历都是极具竞争力的。
      </p>
      <p class="paragraph">
        对于腾讯、阿里、字节跳动等一线互联网大厂而言，XCPC
        奖牌是极其稀缺的硬通货。在校招极度内卷的当下，拥有区域赛奖牌往往意味着直接免除在线笔试，直通核心技术岗位的多轮技术面。在薪资定级上，更是获取
        SP（Special Offer）甚至 SSP（Super Special Offer）的最强筹码。
      </p>
      <p class="paragraph">
        在计算机保研与考研的面试中，无论是人工智能、高性能计算还是底层系统架构方向的导师，都极为看重
        XCPC 选手的代码落地能力与数学基础。这段经历证明了你具备独立攻克复杂科研工程难题的潜力。
      </p>
      <p class="paragraph">
        如果你是大一的新生，参加 XCPC
        可以作为算法，程序设计等课程的预习，提前适应程序员式的学习节奏和思维方式。
      </p>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="guide" class="section-title" v-slide-show>XCPC 竞赛入门指南</h2>

      <p class="paragraph">
        <strong>编程语言的选择：</strong>
        踏入 XCPC 的竞技场，首先需要掌握一门主力编程语言。由于 XCPC 对算法复杂度的高要求，我们强烈推荐 C/C++，它不仅
        是算法竞赛中运行效率极高的绝对霸主，更是与大一程序设计基础课程完美契合的高分保障，学习性价比极高
        。掌握基础的语法逻辑后，你可以直接在主流的在线评测平台（如洛谷、Codeforces 等）作为真刀
        真枪验证代码的战场，在 AC（通过）与 WA（错误）中学习进步。
      </p>

      <p class="paragraph">
        <strong>编译器的选择：</strong>
        对于 XCPC 入门者而言，选择开发工具的原则是“轻量、稳定、易调试”。如果你追求开箱即用，小熊猫 C++ (Red Panda C++)
         是当下的最优选，它延续了 Dev-C++ 的极简风格，同时针对算法竞赛强化了代码补全、静态分析和一键调试功能。
        其他IED如 VS Code, CLion 等配置过程较为复杂，可以作为日后的进阶选择，但对 XCPC 入门来说，小熊猫 C++
        绝对是完全够用的了。      </p>



      <div style="height: 30vh"></div>
    </main>

    <aside class="sidebar-container">
      <nav class="toc-nav">
        <ul class="toc-list">
          <li
            v-for="item in tocList"
            :key="item.id"
            :class="['toc-item', { active: activeId === item.id }]"
            @click="scrollToSection(item.id)">
            {{ item.title }}
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<style scoped lang="scss">
/* ====================================
   1. 宏观布局 (新增区)
   ==================================== */
.page-layout {
  display: flex;
  justify-content: center; /* 居中对齐 */
  gap: 50px; /* 左文右录的间距 */
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  align-items: flex-start; /* 关键：防止侧边栏被纵向拉伸 */
}

/* ====================================
   2. 左侧文章区 (结合你的原有样式)
   ==================================== */
.article-container {
  flex: 1;
  max-width: 1000px; /* 维持你设定的宽度 */
  color: #e5e7eb;
  /* 移除了原本的 margin-left/right，交由 Flexbox 管理居中 */
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.subtitle {
  margin: 1em 0 2em 0; /* 修改为左对齐，适配分栏布局 */
  padding: 0.5em 1em;
  font-size: 3em;
  width: fit-content;
  position: relative;
  color: #fff;

  &::after {
    content: '';
    height: 20px;
    width: 0;
    opacity: 0.3;
    background-color: var(--el-color-primary, #409eff);
    position: absolute;
    border-radius: 5px;
    z-index: -1;
    transition: 1s ease-in-out;
    bottom: 20%;
    left: 0;
  }

  &.show::after {
    width: 100%;
  }
}

.main-title {
  color: #ffffff;
  font-size: 30px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

.section-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 20px;
}

.paragraph {
  font-size: 20px;
  line-height: 1.8;
  color: #d1d5db;
  margin-bottom: 16px;
}

.text-link {
  color: #60a5fa;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: #93c5fd;
}

/* 动态渐变分割线 */
.animated-divider {
  width: 100%;
  height: 1px;
  margin: 50px 0;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);

  &.show {
    transform: scaleX(1);
  }
}

/* 普通分割线 */
.divider {
  border: none;
  border-top: 1px solid #374151;
  margin: 40px 0;
}

/* ====================================
   3. 右侧目录区 (替换原来的这部分即可)
   ==================================== */
/* 侧边栏保持极简 */
.sidebar-container {
  width: 250px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  padding: 10px 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.toc-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 0 8px 16px;
  margin-left: -1px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1.5;

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }

  &.active {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    border-left: 1px solid rgba(255, 255, 255, 0.8);
  }
}

/* 响应式处理：屏幕变窄时隐藏目录 */
@media (max-width: 1100px) {
  .sidebar-container {
    display: none;
  }
  .page-layout {
    gap: 0;
  }
}
</style>
