<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
import { ref } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { onMounted } from 'vue'

const { dialogVisible } = useDialog()
const router = useRouter()
const userStore = useUserStore()

const registerVisible = ref(false)

const loginData = ref({
  username: '',
  password: '',
});

const registerData = ref({
  username: '',
  password: '',
  email: '',
  captchaCode: ''
});

const baseUrl = 'http://localhost:9090'
const checkLogin = async () => {
  try {
    const response = await fetch(`${baseUrl}/user/info`, {
      method: 'GET',
      credentials: 'include'
    })
    const res = await response.json()
    if (res.code === 200) {
      userStore.setUser(res.data)
    }
  } catch (e) {
    userStore.clearUser()
  }
}

onMounted(() => {
  checkLogin()
})

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
      dialogVisible.value = false
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
      registerVisible.value = false
      dialogVisible.value = true
    } else {
      alert('注册失败：' + res.message)
    }
  } catch (error) {
    alert('注册请求失败')
  }
}

const sendCode = async () => {
  if (!registerData.value.email) {
    alert('请先输入邮箱')
    return
  }
  try {
    const response = await fetch(`${baseUrl}/user/send_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerData.value.email })
    })
    const res = await response.json()
    alert(res.message || '验证码已发送')
  } catch (error) {
    alert('发送失败')
  }
}

const switchToRegister = () => {
  dialogVisible.value = false
  registerVisible.value = true
}
</script>

<template>

  <el-dialog v-model="dialogVisible" width="40%" style="text-align: center;">
    <template #header>
      <div style="font-size: 30px; text-align: left; margin-top: 20px; margin-left: 30px;">用户登录</div>
    </template>
    <el-form :model="loginData" label-width="60px">
      <el-form-item label="账号" style="margin-bottom: 30px;">
        <el-input v-model="loginData.username" size="large" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="密码" style="margin-bottom: 20px;">
        <el-input v-model="loginData.password" size="large" type="password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <el-button size="large" @click.prevent="login" text style="font-size: 24px; margin: 10px;">登录</el-button>
    <div style="margin-top: 10px; color: #666;">
      还没有账号？<el-link type="primary" @click="switchToRegister">立即注册</el-link>
    </div>
  </el-dialog>

  <el-dialog v-model="registerVisible" width="45%" style="text-align: center;">
    <template #header>
      <div style="font-size: 30px; text-align: left; margin-top: 20px; margin-left: 30px;">新用户注册</div>
    </template>
    <el-form :model="registerData" label-width="80px" style="padding: 0 30px;">
      <el-form-item label="用户名">
        <el-input v-model="registerData.username" placeholder="至少4位字符" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="registerData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="验证码">
        <div style="display: flex; gap: 10px; width: 100%;">
          <el-input v-model="registerData.captchaCode" placeholder="验证码" />
          <el-button @click="sendCode" type="info">发送</el-button>
        </div>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="registerData.password" type="password" placeholder="至少8位字符" />
      </el-form-item>
    </el-form>
    <el-button size="large" @click="handleRegister" type="primary" style="width: 200px; margin-top: 20px;">提交注册</el-button>
  </el-dialog>

  <header-nav />
  <div class="contentContainer">
    <div class="content"><router-view /></div>
  </div>
  <footer-content />
</template>

<style scoped>
.contentContainer { width: 100%; }
.content { margin: 0 auto; width: min(100%, 1920px); min-height: calc(100vh - 4em); }
</style>
