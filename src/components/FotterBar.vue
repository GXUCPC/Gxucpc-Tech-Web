<script setup lang="ts">
// ===== 纯前端模式：留言区（Giscus，第三方 GitHub Discussions）暂时不对外展示 =====
// import Giscus from '@giscus/vue'
import { Icon } from '@iconify/vue'

// 站内导航：仅包含当前开放的板块（文章/赛事报名入口依赖后端，暂不展示）
const quickLinks = [
  { label: '首页', path: '/' },
  { label: '集训队', path: '/xcpc' },
  { label: '技术组', path: '/tech' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footerBar">
    <div class="footerInner">
      <div class="footerBrand">
        <div class="footerLogo">广西大学 ICPC 集训队</div>
        <p class="footerDesc">
          以算法竞赛锤炼思维，以真实项目积累经验——集训队与技术组共同构成西大的算法竞赛与校园技术开发社区。
        </p>
      </div>

      <div class="footerLinks">
        <div class="footerCol">
          <div class="footerColTitle">站内导航</div>
          <router-link v-for="link in quickLinks" :key="link.path" :to="link.path" class="footerLink">
            {{ link.label }}
          </router-link>
        </div>

        <div class="footerCol">
          <div class="footerColTitle">加入我们</div>
          <span class="footerText">
            <Icon icon="mdi:account-group-outline" :inline="true" />
            <span>招新 QQ 群：977870023</span>
          </span>
          <span class="footerText">
            <Icon icon="mdi:trophy-outline" :inline="true" />
            <span>ICPC / CCPC / 天梯赛 / 蓝桥杯</span>
          </span>
        </div>
      </div>
    </div>

    <div class="footerMeta">© {{ year }} 广西大学 ICPC 集训队技术组 · 网站由技术组开发维护</div>
  </footer>

  <!-- 纯前端模式：留言区暂时不对外展示（恢复时取消注释并还原 Giscus 导入） -->
  <!--
  <div class="comment-container">
    <h3 class="comment-title">留言区</h3>

    <Giscus
      id="comments"
      repo="susitata/Gxu-Tch-Web-discussion"
      repoId="R_kgDOQuwzKA"
      category="General"
      categoryId="DIC_kwDOQuwzKM4C0O3T"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="transparent_dark" lang="zh-CN"
    />
  </div>
  -->
</template>

<style scoped lang="scss">
.footerBar {
  width: 100%;
  margin-top: 4em;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(20px);
  padding: 3em 2.5em 2em;
  box-sizing: border-box;

  @include mobile {
    padding: 2em var(--page-padding-x) 1.5em;
  }
}

.footerInner {
  width: min(100%, 1092px);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 3em 6em;

  @include mobile {
    gap: 2em 1.5em;
  }
}

.footerBrand {
  max-width: 24em;
}

.footerLinks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 3em 6em;
  align-items: start;
}

.footerLogo {
  font-weight: 800;
  font-size: 1.05em;
  letter-spacing: 1px;
  color: #fff;
}

.footerDesc {
  margin-top: 0.8em;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9em;
  line-height: 1.7;
}

.footerCol {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.footerColTitle {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85em;
  letter-spacing: 2px;
  margin-bottom: 0.3em;
}

.footerLink {
  display: block;
  width: max-content;
  max-width: 100%;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.92em;
  transition: color var(--duration-short) ease;
}

.footerLink:hover {
  color: #fff;
}

.footerText {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92em;

  > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.footerMeta {
  width: min(100%, 1092px);
  margin: 2.5em auto 0;
  padding-top: 1.5em;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.8em;
}

/* 触屏设备的可用宽度不足以稳定容纳三列；改为单列，避免“加入我们”的 QQ 信息被裁切。 */
@include touch {
  .footerInner {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 2em;
  }

  .footerBrand,
  .footerLinks {
    width: 100%;
    max-width: none;
    min-width: 0;
  }

  .footerLinks {
    /* 导航列按内容保留宽度，加入我们使用剩余空间，避免“技术组”被压缩。 */
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 1.5em;
  }

  .footerCol {
    min-width: 0;
  }

  .footerText {
    width: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    line-height: 1.55;
    white-space: normal;
    overflow: visible;

    > span {
      overflow-wrap: anywhere;
    }
  }

  .footerMeta {
    margin-top: 2em;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
}

/* --- 评论区样式 --- */

.comment-container {
  width: 90%;
  max-width: 2000px;
  margin: 40px auto; /* 上下留出 40px 的间距，左右设为 auto 实现居中 */
  padding: 0 20px; /* 在手机端防止内容紧贴屏幕边缘 */
  box-sizing: border-box;
}

.comment-title {
  text-align: center; /* 让“留言区”标题也居中对齐 */
  margin-bottom: 24px; /* 标题和评论组件之间留点空隙 */
  color: rgba(255, 255, 255, 0.9); /* 配合你的暗色主题，给标题一点颜色 */
  font-size: 1.5rem;
  letter-spacing: 2px; /* 字间距稍微拉开一点点，更有设计感 */
}
</style>
