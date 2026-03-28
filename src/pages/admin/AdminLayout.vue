<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { onMounted, watchEffect } from 'vue'
const userStore = useUserStore()

const router = useRouter()
const base_url = 'http://localhost:9090'
// 权限检查逻辑
const checkPermission = () => {
  // 如果没登录，或者登录了但不是管理员
  if (!userStore.userInfo?.is_admin) {
    alert('无权访问管理后台')
    router.replace('/') // 强制踢回首页
  }
}

onMounted(async () => {
  try{
    const response=await fetch(`${base_url}/user/info`,{
      method:'GET',
      credentials:'include',
    });

    const res=await response.json();
    if (res.code===200&&res.data){
      userStore.setUser(res.data);
    }
  }
  catch (error){
    console.error('身份验证请求失败', error);
  }
  checkPermission()
})

watchEffect(() => {
  if (userStore.userInfo&&!userStore.isLoggedIn) {
    router.replace('/')
  }
})

const logout = () => {
  fetch(`${base_url}/user/info`,{
     method: 'POST', credentials: 'include'
  });
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="admin-layout" v-if="userStore.userInfo?.is_admin">
    <aside class="sidebar">
      <div class="logo">管理后台系统</div>
      <nav class="nav-menu">
        <router-link to="/admin/interview" class="nav-item" exact-active-class="active">
          控制台首页
        </router-link>
        <router-link to="/admin/competition" class="nav-item" exact-active-class="active">
          比赛管理
        </router-link>
      </nav>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
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

<style scoped>
/* 使用 fixed 定位铺满全屏，彻底遮住 App.vue 全局的黑底浮动方块 */
.admin-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  background-color: #1f2937;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
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
</style>
