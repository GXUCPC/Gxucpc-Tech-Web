<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { gsap } from 'gsap'

// 获取全局弹窗状态
const { dialogVisibleLogin } = useDialog()
const router = useRouter()
const userStore = useUserStore()

const registerVisible = ref(false)

const loginData = ref({ username: '', password: '' })
const registerData = ref({ username: '', password: '', email: '', captchaCode: '' })
const baseUrl = 'http://localhost:9090'

// DOM Refs (用于 GSAP 动画)
const loginOverlayRef = ref<HTMLElement | null>(null)
const loginModalRef = ref<HTMLElement | null>(null)
const registerOverlayRef = ref<HTMLElement | null>(null)
const registerModalRef = ref<HTMLElement | null>(null)

// === 登录弹窗进场动画 ===
watch(dialogVisibleLogin, async (val) => {
  if (val) {
    await nextTick()
    gsap.set(loginOverlayRef.value, { opacity: 0 })
    gsap.set(loginModalRef.value, { scale: 0.95, opacity: 0, y: -20 })

    const tl = gsap.timeline()
    tl.to(loginOverlayRef.value, { opacity: 1, duration: 0.2 })
      .to(loginModalRef.value, {
        scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power2.out"
      }, "<0.1")
  }
})

// === 注册弹窗进场动画 ===
watch(registerVisible, async (val) => {
  if (val) {
    await nextTick()
    gsap.set(registerOverlayRef.value, { opacity: 0 })
    gsap.set(registerModalRef.value, { scale: 0.95, opacity: 0, y: -20 })

    const tl = gsap.timeline()
    tl.to(registerOverlayRef.value, { opacity: 1, duration: 0.2 })
      .to(registerModalRef.value, {
        scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power2.out"
      }, "<0.1")
  }
})

// === 关闭逻辑 (带动画) ===
const closeLogin = () => {
  const tl = gsap.timeline({ onComplete: () => dialogVisibleLogin.value = false })
  tl.to(loginModalRef.value, { scale: 0.95, opacity: 0, y: -20, duration: 0.2, ease: "power2.in" })
    .to(loginOverlayRef.value, { opacity: 0, duration: 0.2 }, "<")
}

const closeRegister = () => {
  const tl = gsap.timeline({ onComplete: () => registerVisible.value = false })
  tl.to(registerModalRef.value, { scale: 0.95, opacity: 0, y: -20, duration: 0.2, ease: "power2.in" })
    .to(registerOverlayRef.value, { opacity: 0, duration: 0.2 }, "<")
}

// === 切换面板 (无缝切换) ===
const switchToRegister = () => {
  dialogVisibleLogin.value = false
  registerVisible.value = true
}

const switchToLogin = () => {
  registerVisible.value = false
  dialogVisibleLogin.value = true
}

// === 业务接口逻辑 ===
const checkLogin = async () => {
  try {
    const response = await fetch(`${baseUrl}/user/info`, { method: 'GET', credentials: 'include' })
    const res = await response.json()
    if (res.code === 200) userStore.setUser(res.data)
  } catch (e) {
    userStore.clearUser()
  }
}

onMounted(() => checkLogin())

const login = async () => {
  if (!loginData.value.username || !loginData.value.password) {
    alert('请输入账号和密码！')
    return
  }
  try {
    const response = await fetch(`${baseUrl}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(loginData.value)
    })
    const res = await response.json()
    if (res.code === 200) {
      userStore.setUser(res.data)
      closeLogin()
      alert('登录成功！')
      router.push('/')
    } else {
      alert('登录失败：' + (res.message || '账号或密码错误'))
    }
  } catch (error) {
    alert('网络错误，请检查后端是否启动')
  }
}

const handleRegister = async () => {
  try {
    const response = await fetch(`${baseUrl}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData.value)
    })
    const res = await response.json()
    if (res.code === 200) {
      alert('注册成功，请登录！')
      switchToLogin()
    } else {
      alert('注册失败：' + res.message)
    }
  } catch (error) {
    alert('注册请求失败')
  }
}

const sendCode = async () => {
  if (!registerData.value.email) { alert('请先输入邮箱'); return }
  try {
    const response = await fetch(`${baseUrl}/user/send_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerData.value.email })
    })
    const res = await response.json()
    alert(res.message || '验证码已发送')
  } catch (error) { alert('发送失败') }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="dialogVisibleLogin" class="gh-overlay" ref="loginOverlayRef" @click.self="closeLogin">

      <div class="github-styled-modal" ref="loginModalRef">
        <div class="gh-header">
          <svg height="48" viewBox="0 0 16 16" width="48" class="gh-logo">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          <h1 class="gh-title">登录到技术组门户</h1>
        </div>

        <div class="gh-auth-form-card">
          <el-form :model="loginData" label-position="top">
            <div class="gh-form-group">
              <label class="gh-label">账号</label>
              <el-input v-model="loginData.username" class="gh-input" placeholder="Username or email" />
            </div>
            <div class="gh-form-group">
              <div class="gh-label-row">
                <label class="gh-label">密码</label>
                <el-link type="primary" class="gh-forgot-link" :underline="false">忘记密码？</el-link>
              </div>
              <el-input v-model="loginData.password" class="gh-input" type="password" placeholder="Password" />
            </div>
            <el-button class="gh-btn-primary gh-btn-block" @click.prevent="login">登录</el-button>
          </el-form>
        </div>

        <div class="gh-create-account-prompt">
          还没有账号？
          <el-link type="primary" class="gh-blue-link" @click="switchToRegister" :underline="false">创建新账号</el-link>。
        </div>
      </div>

    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="registerVisible" class="gh-overlay" ref="registerOverlayRef" @click.self="closeRegister">

      <div class="github-styled-modal gh-register-modal" ref="registerModalRef">
        <div class="gh-header">
          <h1 class="gh-title">加入广西大学icpc集训队</h1>
        </div>

        <div class="gh-auth-form-card">
          <el-form :model="registerData" label-position="top">
            <div class="gh-form-group">
              <label class="gh-label">用户名</label>
              <el-input v-model="registerData.username" class="gh-input" placeholder="至少4位字符" />
            </div>
            <div class="gh-form-group">
              <label class="gh-label">邮箱</label>
              <el-input v-model="registerData.email" class="gh-input" placeholder="请输入有效邮箱" />
            </div>
            <div class="gh-form-group">
              <div class="gh-label-row"><label class="gh-label">验证码</label></div>
              <div class="gh-input-group">
                <el-input v-model="registerData.captchaCode" class="gh-input" placeholder="Code" />
                <el-button @click="sendCode" type="info" class="gh-btn-info">发送</el-button>
              </div>
            </div>
            <div class="gh-form-group">
              <label class="gh-label">密码</label>
              <el-input v-model="registerData.password" type="password" class="gh-input" placeholder="至少8位字符" />
            </div>
            <el-button class="gh-btn-primary gh-btn-block gh-btn-lg" @click="handleRegister">提交注册</el-button>
          </el-form>
        </div>

        <div class="gh-create-account-prompt gh-or-signin">
          已有账号？
          <el-link type="primary" class="gh-blue-link" @click="switchToLogin" :underline="false">登录</el-link>。
        </div>
      </div>

    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.gh-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  /* 关键修复：纯黑 60% 透明度 */
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);

  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. 弹窗主容器 */
.github-styled-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  color: #ffffff;

  /* 关键修正：增加不透明的中性深灰背景，和清晰边框线，对比度极高 */
  background-color: rgba(46, 45, 45, 0.2);
  //background-color: rgba(52, 52, 52, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1); /* 边框线提亮，增加立体感 */
  border-radius: 8px; /* 外部圆角，干净整洁 */
  padding: 24px; /* 增加大容器内边距，内容不贴边 */

}
.gh-register-modal .gh-auth-form-card { width: 450px; max-width: 90vw; }

/* 3. 头部：Logo 和标题 */
.gh-header {
  margin-bottom: 24px;
  text-align: center;

  .gh-logo { fill: #ffffff; }
  .gh-title {
    font-size: 24px;
    font-weight: 300;
    letter-spacing: -0.5px;
    margin-top: 16px;
    margin-bottom: 0;
  }
}
.gh-register-modal .gh-title { font-size: 32px; font-weight: 400; }

/* 4. 核心登录卡片：提亮底板，拉开和遮罩的对比度 */
.gh-auth-form-card {
  width: 340px;
  /* 关键修复：改成不透明的中性深灰，明显的小框背景就出来了 */
  background-color: rgba(52, 52, 52, 0.5);
  border: 1px solid rgba(79, 74, 74, 0.2); /* 边框稍微提亮，增加立体感 */
  border-radius: 8px;
  padding: 24px;
  /* 增强阴影，把卡片从背景里“托”起来 */
  //box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
}
.gh-register-modal .gh-auth-form-card { width: 450px; max-width: 90vw; }
/* 5. 表单内部控件 */
.gh-form-group { margin-bottom: 16px; }
.gh-label {
  display: block;
  font-weight: 400;
  margin-bottom: 8px;
  font-size: 14px;
  text-align: left;
}
.gh-label-row { display: flex; justify-content: space-between; align-items: baseline; }

/* 穿透修改 Element Plus 原生样式 */
:deep(.gh-input .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.3) !important; /* 输入框改用半透纯黑 */
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: none !important;
  border-radius: 6px;
  padding-left: 12px;
  transition: .2s ease-in-out;

  &:hover { border-color: rgba(255, 255, 255, 0.3) !important; }
}
:deep(.gh-input.is-focus .el-input__wrapper) {
  border-color: #1f6feb !important; /* 保留经典的 GitHub 蓝聚焦框 */
  box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.3) !important;
}
:deep(.gh-input .el-input__inner) { color: #ffffff !important; }

/* 验证码同行排列 */
.gh-input-group { display: flex; gap: 10px; }
.gh-input-group :deep(.gh-input) { flex: 1; }
.gh-btn-info {
  background-color: #21262d !important;
  border: 1px solid rgba(240, 246, 254, 0.1) !important;
  color: #c9d1d9 !important;
  border-radius: 6px;
  &:hover { background-color: #30363d !important; }
}

/* 6. GitHub 经典绿按钮 */
:deep(.gh-btn-primary) {
  background-color: #2da44e !important;
  border: 1px solid rgba(240, 246, 254, 0.1) !important;
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 6px;
  transition: background-color .1s;

  &:hover { background-color: #2c974b !important; }
}
.gh-btn-block { width: 100%; margin-left: 0 !important; }
.gh-btn-lg { padding: 12px 0; font-size: 16px; }

/* 7. 底部提示链接 */
.gh-create-account-prompt {
  margin-top: 16px;
  border: none !important; /* 关键修正：去边框 */
  background-color: transparent !important; /* 关键修正：变透明 */
  border-radius: 0 !important; /* 关键修正：去圆角 */
  box-shadow: none !important; /* 关键修正：去阴影 */
  padding: 0 !important; /* 关键修正：去内边距 */
  margin-bottom: 0 !important;

  width: 340px;
  text-align: center;
  font-size: 14px;
  font-weight: 300;

  border-top: 1px solid rgba(255, 255, 255, 0.1); /* 关键新增：底部上方分割线 */
  padding-top: 20px;
}
.gh-or-signin { width: 450px; max-width: 90vw; }
</style>
