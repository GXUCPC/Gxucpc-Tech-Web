<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'


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
      { threshold: 0.3 }, // 稍微调低阈值，让表格等大元素更容易触发
    )
    observer.observe(el)
  },
}

// ==========================================
// 2. 右侧悬浮目录逻辑 (Scrollspy)
// ==========================================
const activeId = ref<string>('overview')
let tocObserver: IntersectionObserver | null = null

// 目录数据配置
const tocList = [
  { id: 'overview', title: '招新概要' },
  { id: 'directions', title: '一、发展方向选择' },
  { id: 'requirements', title: '二、项目开发基础要求' },
  { id: 'format', title: '三、技术组工作形式' },
  { id: 'contact', title: '四、联系我们' }
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
    // 只侦测屏幕顶部往下 10%~20% 的区域
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

      <h2 id="overview" class="subtitle" v-slide-show>技术组招新概要</h2>
      <p class="paragraph sub-text">
        致力于培养具备核心竞争力的未来技术人才。
      </p>
      <p class="paragraph">
        技术组致力于将技术引用到实际。在这里，你可以参与到真实的项目开发，技术组为团队成员提供学习、应用技术的平台，培养具备核心竞争力的技术人才。我们严格遵循业界规范，确保团队产出具有高度的实用性和稳定性。
      </p>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="directions" class="section-title" v-slide-show>一、 未来个人发展方向选择</h2>
      <p class="paragraph">
        技术组提供多元化、符合主流工业标准的项目实践方向，成员可根据个人兴趣和职业规划选择以下一个或多个技术赛道：
      </p>

      <table class="tech-matrix" v-slide-show>
        <thead>
          <tr>
            <th>技术方向</th>
            <th>核心学习内容</th>
            <th>实战目标</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>前端开发</td>
            <td>掌握前端框架的搭建，熟悉 Git 团队开发流程，熟悉 HTML、CSS、JavaScript，能使用后端 API 接口实现特定需求。</td>
            <td>设计面向用户的 UI，配合后端共同完成项目开发。</td>
          </tr>
          <tr>
            <td>平台运维</td>
            <td>容器化技术（Docker），自动化部署（CI/CD），云计算平台管理。</td>
            <td>掌握服务的弹性伸缩与高可用性保障。</td>
          </tr>
          <tr>
            <td>后端开发</td>
            <td>熟悉至少一种主流编程语言（如 Java/Python/Go/Node.js），掌握数据库设计与优化，理解 API 设计原则，熟悉缓存与消息队列。</td>
            <td>撰写技术方案报告，指导项目技术栈升级。</td>
          </tr>
        </tbody>
      </table>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="requirements" class="section-title" v-slide-show>二、 项目开发基础要求</h2>
      <ul class="value-list" v-slide-show>
        <li><strong>Git & GitHub：</strong>掌握代码的版本管理和协作开发。这是现代软件工程的基石。</li>
        <li><strong>现代编辑器/IDE：</strong>例如 VS Code、IntelliJ IDEA、PyCharm等，提升代码编写效率和质量。</li>
        <li><strong>基础的网络概念：</strong>不需要很深，但最好能理解 HTTP 请求（GET/POST）、API 接口是什么。</li>
        <li><strong>基础的命令行操作：</strong>了解基本的命令行操作，有助于更高效地使用开发工具和环境。</li>
        <li><strong>自学能力：</strong>自学能力是技术人员最大的核心素养。</li>
        <li><strong>团队协作能力：</strong>良好的沟通和协作能力，能够与团队成员高效合作，共同完成项目目标。</li>
        <li><strong>一门主力编程语言：</strong>强烈推荐 C/C++，与 ACM 集训队主线任务无缝衔接，同时也是大一课程的完美预习，学习性价比极高。</li>
      </ul>
      <p class="paragraph remark-text">
        * 另外，有项目开发经验、在 ICPC、CCPC 等算法竞赛中有过获奖经历者优先。
      </p>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="format" class="section-title" v-slide-show>三、 技术组工作形式</h2>
      <p class="paragraph">
        技术组的一切活动均围绕真实的项目开发展开，没有灌水的讲座和团建，每周六晚例会讨论项目进展。平时的项目开发通过 GitHub 远程协作，有疑问直接通过工作群共同讨论。
      </p>
      <p class="paragraph">
        组内每个实习生均由指定的组员指导，帮助实习生快速成长。
      </p>
      <p class="paragraph">
        组内目前有多个项目正在同步推进，欢迎所有想要学习项目开发技术，积累经验的同学加入我们。
      </p>

      <div class="animated-divider" v-slide-show></div>

      <h2 id="contact" class="section-title" v-slide-show>四、 联系我们</h2>
      <p class="paragraph">
        如果你对技术组感兴趣，欢迎通过以下方式联系我们投递实习简历：
      </p>
      <ul class="value-list" style="margin-bottom: 50px;" v-slide-show>
        <li><strong>GitHub: <a href="https://github.com/E1aina2007/Gxutech-Recruitment" target="_blank" style="color: white;">https://github.com/E1aina2007/Gxutech-Recruitment</a></strong> </li>
        <li><strong>QQ群:</strong> 977870023</li>
      </ul>

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
/* 布局部分保持原样 */
.page-layout {
  display: flex;
  justify-content: center;
  gap: 50px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  align-items: flex-start;
}

.article-container {
  flex: 1;
  max-width: 1000px;
  /* 统一底层字体设定 */
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 标题样式：去除了所有花哨的边框和背景，仅保留纯净的白灰色 */
.subtitle {
  margin: 1em 0 0.5em 0;
  font-size: 2.5em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 1px;
}

.section-title {
  color: rgba(255, 255, 255, 0.95);
  font-size: 22px;
  font-weight: 600;
  margin-top: 50px;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

/* ====================================
   核心文字排版（复用 .text3 的美学标准）
   ==================================== */
.paragraph, .tech-matrix td, .value-list li {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85); /* 降低刺眼感 */
  text-align: justify;               /* 两端对齐消除狗牙 */
  text-justify: inter-ideograph;
  word-break: break-word;            /* 防止英文单词撑破 */
}

.paragraph {
  margin-bottom: 16px;
}

.sub-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin-bottom: 30px;
}

.remark-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin-top: 20px;
}

/* ====================================
   极简表格
   ==================================== */
.tech-matrix {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.6s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }

  th, td {
    border: 1px solid rgba(255, 255, 255, 0.15); /* 极细且半透明的边框 */
    padding: 16px 20px;
  }

  th {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    text-align: left;
    background-color: rgba(255, 255, 255, 0.02); /* 几乎不可见的底色区分 */
  }
}

/* ====================================
   极简列表（去除了背景块和粗边框）
   ==================================== */
.value-list {
  list-style: none;
  padding-left: 0;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.6s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }

  li {
    margin-bottom: 14px;
    position: relative;
    padding-left: 18px; /* 给前面的破折号留出空间 */

    /* 用干净的半透明破折号代替传统的圆点或色块 */
    &::before {
      content: '-';
      position: absolute;
      left: 0;
      top: 0;
      color: rgba(255, 255, 255, 0.4);
    }

    strong {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
    }
  }
}

/* ====================================
   低调的黑白灰分割线
   ==================================== */
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

@media (max-width: 1100px) {
  .sidebar-container {
    display: none;
  }
  .page-layout {
    gap: 0;
  }
}
</style>
