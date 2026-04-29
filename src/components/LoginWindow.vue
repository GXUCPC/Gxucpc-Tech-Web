<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { gsap } from 'gsap'
import type { LoginForm, RegisterForm } from '@/api/user-login'
import { loginAPI, registerAPI, sendCodeAPI } from '@/api/user-login'
import http from '@/api/http'

// 获取全局弹窗状态
const { dialogVisibleLogin } = useDialog()
const router = useRouter()
const userStore = useUserStore()

const registerVisible = ref(false)

const loginData = ref<LoginForm>({
  username: '',
  password: '',
})
const registerData = ref<RegisterForm>({
  username: '',
  password: '',
  email: '',
  captchaCode: '',
})

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
    const res = await http.get('/user/info')
    if (res.code === 200) userStore.setUser(res.data)
  } catch (e) {
    userStore.logout()
  }
}

onMounted(() => checkLogin())

const login = async () => {
  try {
    const response = await loginAPI(loginData.value)
    if (response.code === 200) {
      userStore.setUser(response.data)
      closeLogin()
      alert('登录成功！')
      router.push('/')
    }
    else {
      alert('登录失败: ' + (response.message || '账号或密码错误'))
    }
  }
  catch(error: any) {
    alert('网络错误，请检查后端是否启动：' + error.message)
  }
}

const handleRegister = async () => {
  try {
    const response = await registerAPI(registerData.value)
    if (response.code === 200) {
      alert('注册成功，请登录！')
      switchToLogin()
    }
    else {
      alert('注册失败：' + response.message)
    }
  } catch (error: unknown) {
    alert('注册请求失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const sendCode = async () => {
  try {
    const response = await sendCodeAPI(registerData.value)
    if (response.code === 200) {
      alert('验证码已发送')
    }
    else {
      alert('发送失败：' + response.message)
    }
  } catch (error: unknown) {
    alert('发送请求失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="dialogVisibleLogin" class="gh-overlay" ref="loginOverlayRef" @click.self="closeLogin">

      <div class="github-styled-modal" ref="loginModalRef">
        <div class="gh-header">
          <svg width="64" height="64" role="img" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Icinga</title><path d="M13.8285.0086a2.122 2.122 0 00-1.1546.4705c-.9134.7446-1.052 2.0897-.3057 3.0038.1738.2135.382.3803.6085.5076l-1.9992 4.1526c-1.3307-.5156-2.8925-.3242-4.0768.6411a4.1264 4.1264 0 00-.2805.2538L4.3895 7.2125c.124-.31.1253-.6679-.0326-.9913-.2979-.6072-1.0314-.859-1.6385-.561-.6079.2963-.8581 1.0298-.561 1.637.2979.6063 1.029.8595 1.637.5624.0991-.0483.1849-.1119.2642-.181l2.1846 1.7868c-1.1343 1.4732-1.1567 3.5843.0712 5.0876.2648.3253.5696.5978.9009.8193l-2.5067 3.5945c-.5002-.3428-1.1085-.5336-1.7602-.4838-1.522.114-2.663 1.4395-2.5482 2.9608.114 1.522 1.4403 2.663 2.9623 2.5483 1.522-.114 2.6622-1.4396 2.5482-2.9609-.0494-.6638-.3388-1.2483-.7658-1.6948l2.569-3.6836c1.1473.5518 2.5128.5527 3.6718-.0505l1.444 2.4117c-.1372.1332-.2392.3041-.2627.509-.0547.472.2836.899.7555.9529.471.054.8965-.2836.9528-.7555.054-.471-.2836-.898-.7554-.9528-.057-.007-.1097.0104-.1648.0148l-1.4856-2.4829c.072-.0512.1443-.1008.2137-.1573 1.0746-.8777 1.584-2.1864 1.493-3.4729l6.968-1.7186c.3257.484.888.7887 1.5108.742.9248-.0698 1.6171-.8747 1.548-1.7987-.07-.924-.8755-1.6156-1.7988-1.5464-.9247.0706-1.6163.874-1.5464 1.7972.007.0956.0267.1876.049.2776l-6.8092 1.68c-.1312-.6151-.4011-1.2094-.8252-1.7305-.3373-.4132-.7407-.7403-1.1799-.9854l2.017-4.1882c.6295.1558 1.3211.0324 1.8625-.4081.9134-.7447 1.0504-2.092.3058-3.0054-.466-.5709-1.1665-.8375-1.8492-.7762z"/></svg>
          <h1 class="gh-title">登录到技术组门户</h1>
        </div>

        <div class="gh-auth-form-card">
          <el-form :model="loginData" label-position="top" @submit.prevent="login">
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
          <el-form :model="registerData" label-position="top" @submit.prevent="handleRegister">
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
                <el-button type="info" class="gh-btn-info" @click.prevent="sendCode">发送</el-button>
              </div>
            </div>
            <div class="gh-form-group">
              <label class="gh-label">密码</label>
              <el-input v-model="registerData.password" type="password" class="gh-input" placeholder="至少8位字符" />
            </div>
            <el-button class="gh-btn-primary gh-btn-block gh-btn-lg" @click.prevent="handleRegister">提交注册</el-button>
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
