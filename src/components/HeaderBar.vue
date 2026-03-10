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

const route = useRoute() // 拿到当前路由信息对象

// 1. 初始化时，直接读取当前的 URL 路径
const activeIndex = ref(route.path)

// 2. 监听路由变化（解决浏览器前进/后退按钮导致高亮不对的问题）
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  }
)
const userStore = useUserStore()
const baseUrl = 'http://localhost:9090'

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
</script>

<template>
  <div class="headerBarContainer">
    <div>
      <div class="headerLeft"></div>
    </div>
    <div class="headerBar">
      <div class="headerLeft">
        <h2>广西大学icpc集训队技术组</h2>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="centerMenu"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-sub-menu index="/xcpc">
          <template #title>集训队</template>
          <el-menu-item index="/xcpc">集训队主页</el-menu-item>
          <el-menu-item index="1-2">item two</el-menu-item>
          <el-menu-item index="1-3">item three</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/tech">
          <template #title>技术组</template>
          <el-menu-item index="/tech/introduction">技术组简介</el-menu-item>
          <el-menu-item index="/tech/tiemExprience">技术组主要开发经历</el-menu-item>
          <el-menu-item index="/tech/contuctUs">加入我们</el-menu-item>
          <el-menu-item index="/tech/interview">招新面试申请</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <div class="headerRight">
        <el-button size="large" @click.prevent="expressionFeedback" text>意见反馈</el-button>
        <el-button
          v-if="!userStore.isLoggedIn"
          size="large"
          @click.prevent="expression"
          text
        >
          登录
        </el-button>

        <div v-else class="userInfo">
          <span class="userName">欢迎，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
          <el-tag
            v-if="userStore.userInfo?.is_admin"
            size="small"
            type="danger"
            effect="light"
          >
            管理员
          </el-tag>
          <el-button size="small" type="info" @click="handleLogout" text>退出</el-button>
        </div>
      </div>
    </div>
  </div>
</template>




<style scoped>
.headerBarContainer {
  position: sticky;
  top: 0;
  width: 100%;
  border-bottom: 1px solid #424242;
  backdrop-filter: blur(5px);
  transition: 0.25s ease-in-out;
  z-index: 99;

  &:hover {
    backdrop-filter: blur(25px);
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
}
</style>
