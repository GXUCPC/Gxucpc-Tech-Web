<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
import { useRoute } from 'vue-router'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import  { VisitAPI }  from '@/api/visit.js'

const route = useRoute()

// const registerVisible = ref(false)
// 
// onMounted(() => {
//   // 页面加载完成后，发送埋点请求
//   recordVisit()
// })
// 
// function recordVisit() {
//   if (!BACKEND_ENABLED) return // 纯前端模式：跳过埋点上报
//   const visitData = {
//     time: new Date().toISOString(),
//   }
//   VisitAPI.submitVisit(visitData)
//     .then((response) => {
//       console.log('埋点成功:', response)
//     })
//     .catch((error) => {
//       console.error('埋点失败:', error)
//     })
// }



// const loginData = ref({
//   username: '',
//   password: '',
// });
// 
// const registerData = ref({
//   username: '',
//   password: '',
//   email: '',
//   captchaCode: ''
// });
// 
// const baseUrl = 'http://localhost:9090'
// const checkLogin = async () => {
//   if (!BACKEND_ENABLED) return // 纯前端模式：跳过登录态检查
//   try {
//     const response = await fetch(`${baseUrl}/user/info`, {
//       method: 'GET',
//       credentials: 'include'
//     })
//     const res = await response.json()
//     if (res.code === 200) {
//       userStore.setUser(res.data)
//     }
//   } catch (e) {
//     userStore.logout()
//   }
// }
// 
// onMounted(() => {
//   checkLogin()
// })

// const login = async () => {
//   if (!loginData.value.username || !loginData.value.password) {
//     alert('请输入账号和密码！')
//     return
//   }
//   try {
//     const response = await fetch(`${baseUrl}/user/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(loginData.value)
//     })
//     const res = await response.json()
//     if (res.code === 200) {
//       userStore.setUser(res.data)
//       dialogVisibleLogin.value = false
//       alert('登录成功！')
//       router.push('/')
//     } else {
//       alert('登录失败：' + (res.message || '账号或密码错误'))
//     }
//   } catch (error) {
//     alert('网络错误，请检查后端是否启动')
//   }
// }
// 
// 
// const handleRegister = async () => {
//   try {
//     const response = await fetch(`${baseUrl}/user/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(registerData.value)
//     })
//     const res = await response.json()
//     if (res.code === 200) {
//       alert('注册成功，请登录！')
//       registerVisible.value = false
//       dialogVisibleLogin.value = true
//     } else {
//       alert('注册失败：' + res.message)
//     }
//   } catch (error) {
//     alert('注册请求失败')
//   }
// }
// 
// const sendCode = async () => {
//   if (!registerData.value.email) {
//     alert('请先输入邮箱')
//     return
//   }
//   try {
//     const response = await fetch(`${baseUrl}/user/send_code`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email: registerData.value.email })
//     })
//     const res = await response.json()
//     alert(res.message || '验证码已发送')
//   } catch (error) {
//     alert('发送失败')
//   }
// }
// 
// const switchToRegister = () => {
//   dialogVisibleLogin.value = false
//   registerVisible.value = true
// }
</script>

<template>
  <!--
    纯前端模式不挂载登录/注册及意见反馈弹窗：它们的提交操作依赖后端接口。
    后端恢复后，再恢复组件导入与下面两个挂载点。
    <FeedbackModal />
    <LoginWindow />
  -->

  <header-nav />
  <div class="contentContainer">
    <!-- 按 path 重新挂载，使每次切换页面时内容整体渐显 -->
    <div :key="route.path" class="content pageFadeIn"><router-view /></div>
  </div>
  <!-- footer 内容已改为纯前端静态信息（品牌/导航/QQ群），不依赖后端，恢复常显 -->
  <footer-content />
</template>

<style scoped lang="scss">
.contentContainer { width: 100%; }
.content { margin: 0 auto; width: min(100%, var(--content-max)); min-height: calc(100vh - 4em); }

/* 页面内容渐显：挂载（首次加载 / 切换路由）时整体淡入 */
.pageFadeIn {
  animation: pageFadeIn 0.6s ease both;
}
@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 大屏（2K/4K）流式放大：仅 >1920 生效，1921px 处 0.83vw≈16px 保证边界连续无跳变 */
@include wide {
  .content {
    width: min(92vw, 2560px);
    font-size: clamp(16px, 0.83vw, 24px);
  }
}
</style>
