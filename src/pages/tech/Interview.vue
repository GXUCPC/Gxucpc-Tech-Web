<template>
  <div class="interview-page-container">
    <!-- 已提交提示 -->
    <div class="recruitment-overview-container submitted-container" v-if="hasSubmitted">
      <div class="header">
        <h1 class="title">招新面试申请</h1>
        <p class="subtitle">加入我们，一起成长</p>
      </div>
      <div class="section">
        <div class="content-text" style="text-align: center; font-size: 22px;">
          你已提交过面试申请，请勿重复提交！
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button class="submit-btn" @click="clearSubmitStatus">重新提交申请</button>
        </div>
      </div>
    </div>

    <!-- 表单容器 -->
    <div class="recruitment-overview-container form-container" v-else>
      <div class="header">
        <h1 class="title">招新面试申请</h1>
        <p class="subtitle">请填写真实有效信息，我们会尽快联系你</p>
      </div>

      <div class="section">
        <h2 class="section-title">基础信息填写</h2>

        <form class="apply-form" @submit.prevent="handleSubmit">


          <!-- GitHub 主页 URL -->
          <div class="form-item">
            <label class="form-label">GitHub 主页 URL <span class="required">*</span></label>
            <input
              v-model="form.githubUrl"
              type="text"
              class="form-input"
              placeholder="例如：https://github.com/你的昵称"
              :class="{ 'input-error': errors.githubUrl }"
              maxlength="200"
            />
            <span class="error-tip" v-if="errors.githubUrl">{{ errors.githubUrl }}</span>
          </div>

          <!-- 电子邮箱 -->
          <div class="form-item">
            <label class="form-label">电子邮箱 <span class="required">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="请输入你的常用邮箱"
              :class="{ 'input-error': errors.email }"
              maxlength="100"
            />
            <span class="error-tip" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <!-- 提交按钮 -->
          <div class="form-item submit-item">
            <button
              type="submit"
              class="submit-btn"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">提交申请</span>
              <span v-if="isSubmitting">提交中...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 成功提示弹窗 -->
    <div class="modal" v-if="showSuccessModal">
      <div class="modal-content">
        <div class="header">
          <h1 class="title" style="font-size: 24px;">提交成功</h1>
        </div>
        <div class="content-text" style="text-align: center; font-size: 18px;">
          申请已提交，请留意邮件通知，我们会尽快与你联系！
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button class="submit-btn" @click="closeSuccessModal">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'

// 配置axios（适配后端9090端口）
axios.defaults.baseURL = 'http://localhost:9090'
axios.defaults.withCredentials = true
axios.defaults.timeout = 10000

// 请求拦截器：添加token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：适配后端返回格式
axios.interceptors.response.use(
  response => {
    const res = response.data
    // 兼容后端200/201状态码
    if (res.code !== 200 && response.status !== 201) {
      return Promise.reject(new Error(res.msg || '提交失败'))
    }
    return res
  },
  error => {
    let errMsg = '网络异常，请稍后重试'
    if (error.message.includes('请先登录')) {
      errMsg = '请先登录后再提交申请'
    } else if (error.response?.data?.msg) {
      errMsg = error.response.data.msg
    } else if (error.code === 'ECONNABORTED') {
      errMsg = '请求超时，请检查网络'
    } else if (error.response?.status === 500) {
      errMsg = '提交失败：用户名/GitHub地址可能已重复，或登录状态失效，请重新登录后重试'
    }
    return Promise.reject(new Error(errMsg))
  }
)

// 表单数据
const form = reactive({
  githubUrl: '',
  email: ''
})

// 错误提示
const errors = reactive({
  githubUrl: '',
  email: ''
})

// 状态管理
const hasSubmitted = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// 邮箱正则（和后端对齐）
const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z]{2,6}$/

// URL格式校验
const isValidUrl = (url) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'github.com' && urlObj.pathname.length > 1
  } catch {
    return false
  }
}

// 表单校验
const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (!form.githubUrl.trim()) {
    errors.githubUrl = 'GitHub主页URL不能为空'
    isValid = false
  } else if (!isValidUrl(form.githubUrl)) {
    errors.githubUrl = '请输入合法的GitHub URL（例如：https://github.com/xxx）'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = '电子邮箱不能为空'
    isValid = false
  } else if (!emailReg.test(form.email)) {
    errors.email = '请输入合法的电子邮箱格式（例：xxx@xxx.com）'
    isValid = false
  }

  return isValid
}

// 提交表单（适配后端参数）
const handleSubmit = async () => {
  if (!validateForm()) return
  if (hasSubmitted.value) {
    alert('你已提交过申请，请勿重复提交')
    return
  }
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    await axios.post('/interview/create', {
      github_url: form.githubUrl.trim(),
      email: form.email.trim(),
    })

    // 提交成功：标记状态
    localStorage.setItem('interview_submitted', 'true')
    hasSubmitted.value = true
    showSuccessModal.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isSubmitting.value = false
  }
}

// 关闭成功弹窗
const closeSuccessModal = () => {
  showSuccessModal.value = false
}

// 重置表单
const resetForm = () => {
  form.githubUrl = ''
  form.email = ''
}

// 清除提交状态
const clearSubmitStatus = () => {
  localStorage.removeItem('interview_submitted')
  hasSubmitted.value = false
  resetForm()
}

// 检查提交状态
const checkSubmitStatus = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    localStorage.removeItem('interview_submitted')
    hasSubmitted.value = false
    return
  }
  const submittedStatus = localStorage.getItem('interview_submitted')
  hasSubmitted.value = submittedStatus === 'true'
}

// 监听登录状态变化
watch(
  () => localStorage.getItem('token'),
  (newToken) => {
    if (!newToken) {
      localStorage.removeItem('interview_submitted')
      hasSubmitted.value = false
    }
  },
  { immediate: true }
)

// 页面挂载时检查状态
onMounted(() => {
  checkSubmitStatus()
})
</script>

<style scoped>
:root {
  --primary-color: #61dafb;
  --text-color-light: #f0f0f0;
  --text-color-medium: #b0b0b0;
  --background-card: rgba(44, 44, 44, 0.85);
  --border-color-dark: #444;
  --modal-bg: rgba(0, 0, 0, 0.7);
  --error-color: #ff6b6b;
}

.interview-page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent !important;
  padding: 20px;
  box-sizing: border-box;
}

.recruitment-overview-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 30px;
  background: var(--background-card);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.7;
  color: var(--text-color-light);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.submitted-container {
  text-align: center;
}

.form-container {
  max-width: 700px;
}

.header {
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color-light);
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-medium);
  margin-top: 5px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 30px;
  color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: 600;
}

.content-text {
  font-size: 20px;
  color: var(--text-color-medium);
  margin-bottom: 15px;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 18px;
  color: var(--text-color-light);
}

.required {
  color: var(--primary-color);
}

.form-input {
  height: 45px;
  padding: 0 15px;
  background-color: rgba(58, 58, 58, 0.9);
  border: 1px solid var(--border-color-dark);
  border-radius: 4px;
  color: var(--text-color-light);
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
}

.input-error {
  border-color: var(--error-color);
}

.error-tip {
  font-size: 14px;
  color: var(--error-color);
  line-height: 1.4;
}

.submit-item {
  margin-top: 10px;
  text-align: center;
}

.submit-btn {
  padding: 12px 30px;
  background-color: var(--primary-color);
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:disabled {
  background-color: #4a9fb8;
  cursor: not-allowed;
  opacity: 0.8;
}

.submit-btn:hover:not(:disabled) {
  background-color: #4fc3f7;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--modal-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 30px;
  background: var(--background-card);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .recruitment-overview-container {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .section-title {
    font-size: 24px;
  }

  .form-input {
    height: 40px;
  }

  .submit-btn {
    padding: 10px 24px;
    font-size: 16px;
  }
}
</style>
