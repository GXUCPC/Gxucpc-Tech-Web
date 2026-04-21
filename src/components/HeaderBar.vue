<script setup lang="ts">
import { useGlobalLoading } from '@/store/globalLoading.ts'
import { gsap } from 'gsap'
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDialog } from '@/store/globalLoading.ts'
import { useUserStore } from '@/store/user'

const { dialogVisibleLogin } = useDialog()
const { dialogVisibleFeedback } = useDialog()

const globalLoading = useGlobalLoading()
const router = useRouter()
const route = useRoute()

const activeIndex = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  }
)

const userStore = useUserStore()
const baseUrl = 'http://localhost:9090'

// --- 新增：控制手机端下拉菜单显示/隐藏的开关 ---
const isMobileMenuOpen = ref(false)

const expression = () => {
    dialogVisibleLogin.value = true;
}
const expressionFeedback = () => {
    dialogVisibleFeedback.value = true;
}
const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
        await fetch(`${baseUrl}/user/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        userStore.logout();
        location.reload();
    }
}

// 通用的路由跳转逻辑
const handleSelect = (key: string, keyPath: string[]) => {
  router.push(key)
  if (key === '/') {
    globalLoading.loading = true
    globalLoading.progress = 0
    const obj = { p: 0 }
    gsap.timeline().to(obj, {
      p: 99,
      duration: 3,
      ease: 'power1.inOut',
      onUpdate: () => {
        globalLoading.progress = obj.p.toFixed()
      },
      onComplete: () => {
        globalLoading.loading = false
      },
    })
  }
}

// --- 新增：手机端专属的点击事件，点完菜单后自动收起下拉框 ---
const handleMobileSelect = (key: string, keyPath: string[]) => {
  isMobileMenuOpen.value = false; // 关闭下拉菜单
  handleSelect(key, keyPath);     // 执行原本的跳转逻辑
}
</script>

<template>
  <div class="headerBarContainer">
    <div class="headerBar">

      <div class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      <div class="show-on-desktop">
        <h2>广西大学icpc集训队</h2>
      </div>

      <el-menu
        :default-active="activeIndex"
        class="centerMenu desktop-menu"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-sub-menu index="/xcpc">
          <template #title>集训队</template>
          <el-menu-item index="/xcpc">集训队主页</el-menu-item>
          <el-menu-item index="/xcpc/introdution">xcpc是什么？</el-menu-item>
          <el-menu-item index="/xcpc/join-us">加入我们</el-menu-item>
          <el-menu-item index="/xcpc/competitionSignUp">赛事报名</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/tech">
          <template #title>技术组</template>
          <el-menu-item index="/tech/introduction">技术组简介</el-menu-item>
          <el-menu-item index="/tech/contuctUs">加入我们</el-menu-item>
          <el-menu-item index="/tech/interview">招新面试申请</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="headerRight">
        <el-button size="large" @click.prevent="expressionFeedback" text>意见反馈</el-button>
        <el-button v-if="!userStore.isLoggedIn" size="large" @click.prevent="expression" text>登录</el-button>
        <div v-else class="userInfo">
          <span class="userName">欢迎，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
          <el-tag v-if="userStore.userInfo?.is_admin" size="small" type="danger" effect="light">管理员</el-tag>
          <el-button size="small" type="info" @click="handleLogout" text>退出</el-button>
        </div>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="isMobileMenuOpen" class="mobile-dropdown">
        <el-menu
          :default-active="activeIndex"
          mode="vertical"
          class="mobile-el-menu"
          @select="handleMobileSelect"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-sub-menu index="/xcpc">
            <template #title>集训队</template>
            <el-menu-item index="/xcpc">> 集训队主页</el-menu-item>
            <el-menu-item index="/xcpc/introdution">> xcpc是什么？</el-menu-item>
            <el-menu-item index="/xcpc/join-us">> 加入我们</el-menu-item>
            <el-menu-item index="/xcpc/competitionSignUp">> 赛事报名</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/tech">
            <template #title>技术组</template>
            <el-menu-item index="/tech/introduction">> 技术组简介</el-menu-item>
            <el-menu-item index="/tech/contuctUs">> 加入我们</el-menu-item>
            <el-menu-item index="/tech/interview">> 招新面试申请</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-collapse-transition>
  </div>
</template>

<style scoped>
/* 1. 拔掉父容器身上的毛玻璃属性，打破结界 */
.headerBarContainer {
  position: sticky;
  top: 0;
  width: 100%;
  border-bottom: 1px solid #424242;
  z-index: 99;
}

/* 2. 新增一个替身（伪元素），专门负责顶栏那 60px 的毛玻璃 */
.headerBarContainer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  z-index: -1; /* 垫在最底层，不影响文字和按钮点击 */
  transition: 0.25s ease-in-out;
}

/* 3. 只有在支持真实鼠标悬停的设备上，才触发加深效果 */
@media (hover: hover) {
  .headerBarContainer:hover::before {
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }
}
.headerBar {
  padding: 0 3em;
  width: min(100%, 1920px);
  height: 60px;
  position: relative;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.centerMenu {
  border-bottom: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.headerRight {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

/* --- 新增：移动端专属样式的基础设置 --- */
.mobile-menu-btn {
  display: none; /* 电脑端默认隐藏汉堡按钮 */
  cursor: pointer;
  color: var(--el-text-color-primary, #ffffff);
}
.mobile-dropdown {
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  /* 关键修改：背景设为半透明 */
  /* background-color: rgba(20, 20, 20, 0.8) !important; */
  /* 关键新增：毛玻璃效果 */
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #424242;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  z-index: 98;
}
.mobile-el-menu {
  border-right: none; /* 去掉 Element 竖向菜单自带的右侧边框线 */
}

/* --- 响应式断点：当屏幕小于 768px 时 --- */
@media (max-width: 768px) {
  .show-on-desktop { display: none; }
  .desktop-menu { display: none !important; } /* 隐藏电脑端横向菜单 */

  .mobile-menu-btn {
    display: flex;
    align-items: center;
  } /* 显示汉堡按钮 */

  .headerBar {
    padding: 0 15px; /* 手机端两边边距缩短，留出更多空间 */
  }
}
</style>
