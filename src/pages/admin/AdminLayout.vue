<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { onMounted, ref, watchEffect } from 'vue'
import http from '@/api/http'
import { logoutAPI } from '@/api/user-login'
import { useBreakpoint } from '@/composables/useBreakpoint'

const userStore = useUserStore()

const router = useRouter()

// 手机端抽屉侧栏
const { isMobile } = useBreakpoint()
const sidebarOpen = ref(false)

// 桌面端常显侧栏，回桌面时收起抽屉态
watchEffect(() => {
  if (!isMobile.value) sidebarOpen.value = false
})

// 权限检查逻辑
const checkPermission = () => {
  // 如果没登录，或者登录了但不是管理员
  if (!userStore.userInfo?.is_admin) {
    alert('无权访问管理后台')
    router.replace('/') // 强制踢回首页
  }
}

onMounted(async () => {
  try {
    const res = await http.get('/user/info')
    if (res.code === 200 && res.data) {
      userStore.setUser(res.data)
    }
  }
  catch (error) {
    console.error('身份验证请求失败', error)
  }
  checkPermission()
})

watchEffect(() => {
  if (userStore.userInfo && !userStore.isLoggedIn) {
    router.replace('/')
  }
})

const logout = async () => {
  await logoutAPI()
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="admin-layout" v-if="userStore.userInfo?.is_admin">
    <div
      v-if="isMobile && sidebarOpen"
      class="sidebar-backdrop"
      @click="sidebarOpen = false"
    />

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="logo">管理后台系统</div>
      <nav class="nav-menu">
        <router-link to="/admin/interview" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
          控制台首页
        </router-link>
        <router-link to="/admin/competition" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
          比赛管理
        </router-link>
        <router-link to="/admin/notice" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
          通知管理
        </router-link>
      </nav>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
          <button
            v-if="isMobile"
            class="menu-toggle-btn"
            aria-label="打开菜单"
            @click="sidebarOpen = !sidebarOpen">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h2>欢迎回来</h2>
        </div>
        <div class="header-right">
          <span class="user-info">{{ userStore.userInfo?.username || '管理员' }}</span>
          <button @click="logout" class="logout-btn">退出</button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 使用 fixed 定位铺满全屏，彻底遮住 App.vue 全局的黑底浮动方块 */
.admin-layout {
  position: fixed;
  inset: 0;
  display: flex;
  background-color: #f3f4f6;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  z-index: 9999;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background-color: #1f2937;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 手机端：抽屉式侧栏，由顶栏汉堡按钮驱动 */
@include mobile {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.25s ease;

    &.open {
      transform: translateX(0);
      box-shadow: 8px 0 24px rgba(0, 0, 0, 0.35);
    }
  }
}

.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid #374151;
  background-color: #111827;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}

.nav-item {
  padding: 16px 24px;
  color: #d1d5db;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #374151;
  color: #ffffff;
}

.nav-item.active {
  background-color: #3b82f6;
  color: #ffffff;
  border-right: 4px solid #60a5fa;
}

/* 主体容器样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #f3f4f6;
}

/* 顶部导航样式 */
.header {
  height: 64px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 5;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #374151;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  padding: 6px 16px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}

/* 核心内容区样式 */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 顶栏汉堡按钮（仅手机端渲染） */
.menu-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }
}

/* 手机端：内容区/顶栏留白收敛，欢迎语缩小 */
@include mobile {
  .content {
    padding: 12px;
  }

  .header {
    padding: 0 12px;
  }

  .header-left h2 {
    font-size: 16px;
  }

  .user-info {
    max-width: 6em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
