<script setup lang="ts">

</script>

<template>
  <div class="page-layout">
    <main class="article-container">
      <h2 class="subtitle">加入我们</h2>

      <h1 class="main-title">广西大学 ICPC 集训队招新</h1>

      <p class="paragraph">
        集训队每年招新只在 9 月初，可搜索加入 QQ 群（1040465549）了解更多。
      </p>

      <div class="divider"></div>

      <p class="paragraph">
        欢迎对算法竞赛感兴趣的同学加入我们，一起在 ACM-ICPC / CCPC 的舞台上磨砺成长。
      </p>
    </main>
  </div>
</template>

<style scoped lang="scss">
.page-layout {
  display: flex;
  justify-content: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.article-container {
  flex: 1;
  max-width: 1000px;
  color: #e5e7eb;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}

.subtitle {
  margin: 1em 0 2em 0;
  padding: 0.5em 1em;
  font-size: 3em;
  width: fit-content;
  position: relative;
  color: #fff;

  &::after {
    content: '';
    height: 20px;
    width: 100%;
    opacity: 0.3;
    background-color: var(--el-color-primary, #409eff);
    position: absolute;
    border-radius: 5px;
    z-index: -1;
    bottom: 20%;
    left: 0;
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

.paragraph {
  font-size: 20px;
  line-height: 1.8;
  color: #d1d5db;
  margin-bottom: 16px;
}

.divider {
  border: none;
  border-top: 1px solid #374151;
  margin: 40px 0;
}
</style>
