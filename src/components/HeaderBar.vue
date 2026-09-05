<script setup lang="ts">
import { useDialog } from '@/store/globalLoading.ts'
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { logoutAPI } from '@/api/user-login'
import http from '@/api/http'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'

const { dialogVisibleLogin } = useDialog()
const { dialogVisibleFeedback } = useDialog()

const router = useRouter()
const route = useRoute()

const activeIndex = ref(route.path)

const isMobileMenuOpen = ref(false)

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
    isMobileMenuOpen.value = false
  }
)

const userStore = useUserStore()

// 顶部导航结构：带 children 的项 hover 展开下拉（桌面端）
interface NavChild {
  label: string
  path: string
}
interface NavItem {
  label: string
  path: string
  children?: NavChild[]
}
const NAV_ITEMS: NavItem[] = [
  { label: '首页', path: '/' },
  {
    label: '集训队',
    path: '/xcpc',
    children: [
      { label: '集训队主页', path: '/xcpc' },
      { label: 'XCPC 是什么？', path: '/xcpc/introdution' },
      { label: '加入我们', path: '/xcpc/join-us' },
      { label: '赛事报名', path: '/xcpc/competitionSignUp' },
    ],
  },
  {
    label: '技术组',
    path: '/tech',
    children: [
      { label: '技术组简介', path: '/tech/introduction' },
      { label: '加入我们', path: '/tech/contuctUs' },
      { label: '招新面试申请', path: '/tech/interview' },
    ],
  },
  { label: '文章', path: '/articles' },
]

function isActive(item: NavItem) {
  if (item.path === '/') return activeIndex.value === '/'
  return activeIndex.value === item.path || activeIndex.value.startsWith(item.path + '/')
}

const go = (path: string) => {
  router.push(path)
  isMobileMenuOpen.value = false
}

// el-menu（移动端下拉）选中回调
const handleSelect = (key: string) => {
  go(key)
}

const expression = () => {
    dialogVisibleLogin.value = true;
}
const expressionFeedback = () => {
    dialogVisibleFeedback.value = true;
}
const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
        await logoutAPI();
        userStore.logout();
        location.reload();
    }
}

// 通知功能
enum NoticeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
interface Notice {
  id?: number
  title: string
  content: string
  status: NoticeStatus
  username: string
  created_at: string
}
const noticeVisible = ref(false)
const notices = ref<Notice[]>([])
const loading = ref(false)

const openNoticeDialog = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录！')
    return
  }
  noticeVisible.value = true
  getAllNotices()
}

const getAllNotices = async () => {
  loading.value = true
  try {
    const res = await http.get('/notice/published', { params: { page: 1, size: 100 } })
    if (res.code === 200) notices.value = res.data.list
  } catch (err) {
    ElMessage.error('获取通知失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-')
}
</script>

<template>
  <div class="headerBarContainer">
    <div class="headerBar">d
      <div class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      <router-link to="/" class="brand">广西大学 ICPC 集训队</router-link>

      <!-- 桌面端导航：纯文字链接 + hover 下拉 -->
      <nav class="desktopNav">
        <template v-for="item in NAV_ITEMS" :key="item.label">
          <div v-if="item.children" class="navItem">
            <router-link :to="item.path" class="navLink" :class="{ active: isActive(item) }">
              {{ item.label }}
              <Icon icon="mdi:chevron-down" :inline="true" class="chevron" />
            </router-link>
            <div class="dropdownPanel">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="dropdownLink"
                :class="{ active: activeIndex === child.path }">
                {{ child.label }}
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="item.path"
            class="navLink navItem"
            :class="{ active: isActive(item) }">
            {{ item.label }}
          </router-link>
        </template>
      </nav>

      <div class="headerActions">
        <button class="textLink" type="button" @click="openNoticeDialog">通知</button>
        <button class="textLink" type="button" @click="expressionFeedback">意见反馈</button>
        <button v-if="!userStore.isLoggedIn" type="button" class="pillBtn" @click="expression">登录</button>
        <div v-else class="userInfo">
          <el-tag v-if="userStore.userInfo?.is_admin" size="small" type="danger" effect="light">管理员</el-tag>
          <span class="userName">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
          <button class="textLink" type="button" @click="handleLogout">退出</button>
        </div>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="isMobileMenuOpen" class="mobile-dropdown">
        <el-menu
          :default-active="activeIndex"
          mode="vertical"
          class="mobile-el-menu"
          @select="handleSelect"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-sub-menu index="/xcpc">
            <template #title>集训队</template>
            <el-menu-item index="/xcpc">集训队主页</el-menu-item>
            <el-menu-item index="/xcpc/introdution">XCPC 是什么？</el-menu-item>
            <el-menu-item index="/xcpc/join-us">加入我们</el-menu-item>
            <el-menu-item index="/xcpc/competitionSignUp">赛事报名</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/tech">
            <template #title>技术组</template>
            <el-menu-item index="/tech/introduction">技术组简介</el-menu-item>
            <el-menu-item index="/tech/contuctUs">加入我们</el-menu-item>
            <el-menu-item index="/tech/interview">招新面试申请</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/articles">文章</el-menu-item>
        </el-menu>
      </div>
    </el-collapse-transition>

    <Teleport to="body">
      <div v-if="noticeVisible" class="notice-overlay" @click.self="noticeVisible = false">
        <div class="notice-modal">
          <div class="modal-header">
            <h3>系统通知</h3>
            <button class="close-btn" @click="noticeVisible = false">×</button>
          </div>
          <div class="modal-body">
            <div class="notice-list">
              <div v-if="loading" class="loading-tip">加载中...</div>
              <div v-else-if="notices.length === 0" class="empty-tip">暂无通知</div>
              <div v-else class="notice-item" v-for="item in notices" :key="item.id">
                <div class="notice-title">{{ item.title }}</div>
                <div class="notice-content">{{ item.content }}</div>
                <div class="notice-time">{{ formatDate(item.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ===== 顶栏：参考 anthropic.com —— 简洁文字导航 + 描边胶囊按钮 =====
   载入时从视口上方划入 */
.headerBarContainer {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 99;
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  animation: headerSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
}

@keyframes headerSlideIn {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.headerBar {
  padding: 0 2.5em;
  width: min(100%, 1920px);
  height: 64px;
  position: relative;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
}

/* 品牌字标 */
.brand {
  color: #fff;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.05em;
  letter-spacing: 1px;
  white-space: nowrap;
  transition: opacity var(--duration-short) ease;
}
.brand:hover {
  opacity: 0.75;
}

/* ===== 桌面端导航 ===== */
.desktopNav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.25em;
  height: 100%;
}

.navItem {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.navLink {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.45em 0.9em;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.95em;
  white-space: nowrap;
  transition: color var(--duration-short) ease, background-color var(--duration-short) ease;
}
.navLink:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
}
.navLink.active {
  color: #fff;
}

.chevron {
  transition: transform var(--duration-short) ease;
}
.navItem:hover .chevron {
  transform: rotate(180deg);
}

/* 下拉面板 */
.dropdownPanel {
  position: absolute;
  top: calc(100% - 8px);
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  min-width: 200px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  background: rgba(24, 24, 24, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--duration-short) ease, transform var(--duration-short) ease,
    visibility var(--duration-short);
  z-index: 100;
}

@media (hover: hover) {
  .navItem:hover .dropdownPanel,
  .navItem:focus-within .dropdownPanel {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdownLink {
  padding: 10px 14px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.9em;
  white-space: nowrap;
  transition: color var(--duration-short) ease, background-color var(--duration-short) ease;
}
.dropdownLink:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}
.dropdownLink.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

/* ===== 右侧操作区 ===== */
.headerActions {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin-left: auto;
}

.textLink {
  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.45em 0.8em;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.95em;
  font-family: inherit;
  transition: color var(--duration-short) ease, background-color var(--duration-short) ease;
}
.textLink:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
}

/* 登录：描边胶囊按钮 */
.pillBtn {
  appearance: none;
  cursor: pointer;
  padding: 0.45em 1.4em;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;
  font-size: 0.95em;
  font-family: inherit;
  transition: background-color var(--duration-short) ease, color var(--duration-short) ease,
    border-color var(--duration-short) ease;
}
.pillBtn:hover {
  background: #f5f4ef;
  border-color: #f5f4ef;
  color: #111;
}

.userInfo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.userName {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9em;
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 移动端 ===== */
.mobile-menu-btn {
  display: none; /* 电脑端默认隐藏汉堡按钮 */
  cursor: pointer;
  color: var(--el-text-color-primary, #ffffff);
}
.mobile-dropdown {
  position: absolute;
  top: 64px;
  left: 0;
  width: 100%;
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  z-index: 98;
}
.mobile-el-menu {
  border-right: none; /* 去掉 Element 竖向菜单自带的右侧边框线 */
  background: transparent;
}

/* --- 响应式断点：当屏幕小于 768px 时 --- */
@media (max-width: 768px) {
  .desktopNav { display: none; } /* 隐藏电脑端导航 */

  .mobile-menu-btn {
    display: flex;
    align-items: center;
  } /* 显示汉堡按钮 */

  .brand { display: none; } /* 手机端隐藏站名，与原版一致 */

  .headerBar {
    padding: 0 15px; /* 手机端两边边距缩短，留出更多空间 */
    gap: 0.75em;
  }
}

/* 大屏对齐：与正文内容列同宽，避免导航与内容错位 */
@media (min-width: 1921px) {
  .headerBar { width: min(92vw, 2560px); }
}

/* 通知弹窗 */
.notice-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.notice-modal {
  width: 550px;
  max-width: 90%;
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: #fff;
  overflow: hidden;

  .modal-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.3s;
      &:hover { color: #fff; }
    }
  }

  .modal-body {
    padding: 16px 24px 24px;
  }
}

.notice-list {
  max-height: 400px;
  overflow-y: auto;
}
.notice-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.notice-item:last-child { border-bottom: none; }
.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}
.notice-content {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
}
.notice-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
.loading-tip, .empty-tip {
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.4);
}
</style>
