<template>
  <div class="interview-page-container">
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
          <el-button class="submit-btn" @click="clearSubmitStatus">重新提交申请</el-button>
        </div>
      </div>
    </div>

    <div class="recruitment-overview-container form-container" v-else>
      <div class="header">
        <h1 class="title">招新面试申请</h1>
        <p class="subtitle">请填写真实有效信息，我们会尽快联系你</p>
      </div>

      <div class="section">
        <h2 class="section-title">基础信息填写</h2>

        <el-form class="apply-form" @submit.prevent="handleSubmit">
          <!-- GitHub 主页 URL -->
          <div class="form-item">
            <label class="form-label">GitHub 主页 URL <span class="required">*</span></label>
            <el-input
              v-model="form.githubUrl"
              type="text"
              class="form-input github-input"
              placeholder="例如：https://github.com/你的昵称"
              :class="{ 'input-error': errors.githubUrl }"
              maxlength="200"
            ></el-input>
            <span class="error-tip" v-if="errors.githubUrl">{{ errors.githubUrl }}</span>
          </div>

          <div class="form-item">
            <label class="form-label">电子邮箱 <span class="required">*</span></label>
            <el-input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="请输入你的常用邮箱"
              :class="{ 'input-error': errors.email }"
              maxlength="100"
            ></el-input>
            <span class="error-tip" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="form-item submit-item">
            <el-button
              type="button"
              class="submit-btn"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="!isSubmitting">提交申请</span>
              <span v-if="isSubmitting">提交中...</span>
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <el-dialog
      v-model="showSuccessModal"
      title="提交成功"
      width="500px"
      center
      :close-on-click-modal="false"
    >
      <div class="content-text" style="text-align: center; font-size: 18px;">
        申请已提交，请留意邮件通知，我们会尽快与你联系！
      </div>
      <template #footer>
        <el-button class="submit-btn" @click="closeSuccessModal">确认</el-button>
      </template>
    </el-dialog>
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

const form = reactive({
  githubUrl: '',
  email: ''
})

const errors = reactive({
  githubUrl: '',
  email: ''
})

const hasSubmitted = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// 邮箱正则（和后端对齐）
const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z]{2,6}$/

const isValidUrl = (url) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'github.com' && urlObj.pathname.length > 1
  } catch {
    return false
  }
}

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

    localStorage.setItem('interview_submitted', 'true')
    hasSubmitted.value = true
    showSuccessModal.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const resetForm = () => {
  form.githubUrl = ''
  form.email = ''
}

const clearSubmitStatus = () => {
  localStorage.removeItem('interview_submitted')
  hasSubmitted.value = false
  resetForm()
}

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  overflow-x: hidden;
}

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
  background: transparent;
  padding: 20px;
  box-sizing: border-box;
}

.interview-page-container .recruitment-overview-container {
  width: 100%;
  max-width: 800px;
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

.interview-page-container .recruitment-overview-container .form-container {
  max-width: 800px;
}

.interview-page-container .recruitment-overview-container .header {
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.interview-page-container .recruitment-overview-container .header .title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color-light);
  margin: 0;
  text-align: left;
}

.interview-page-container .recruitment-overview-container .header .subtitle {
  font-size: 16px;
  color: var(--text-color-medium);
  margin-top: 6px;
  text-align: left;
}

.interview-page-container .recruitment-overview-container .section {
  margin-bottom: 30px;
}

.interview-page-container .recruitment-overview-container .section .section-title {
  font-size: 30px;
  color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
  padding-left: 12px;
  margin-top: 0;
  margin-bottom: 18px;
  font-weight: 600;
}

.interview-page-container .recruitment-overview-container .section .apply-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item .form-label {
  font-size: 18px;
  color: var(--text-color-light);
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item .form-label .required {
  color: var(--primary-color);
}

:deep(.interview-page-container .recruitment-overview-container .section .apply-form .form-item .form-input) {
  width: 100%;
  max-width: none;
}
:deep(.interview-page-container .recruitment-overview-container .section .apply-form .form-item .form-input .el-input__wrapper) {
  width: 100%;
  max-width: none;
  height: 48px;
  padding: 0 20px;
  font-size: 16px;
  background-color: rgba(58, 58, 58, 0.9);
  border: 1px solid var(--border-color-dark);
}
:deep(.interview-page-container .recruitment-overview-container .section .apply-form .form-item .form-input .el-input__inner) {
  font-size: 16px;
  color: var(--text-color-light);
  background: transparent;
}
:deep(.interview-page-container .recruitment-overview-container .section .apply-form .form-item .github-input .el-input__wrapper) {
  height: 50px;
  font-size: 17px;
}
:deep(.interview-page-container .recruitment-overview-container .section .apply-form .form-item .input-error .el-input__wrapper) {
  border-color: var(--error-color);
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item .error-tip {
  font-size: 14px;
  color: var(--error-color);
  line-height: 1.4;
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item.submit-item {
  margin-top: 20px;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item.submit-item .submit-btn {
  padding: 10px 24px;
  background-color: #ffffff;
  color: #000000;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: none;
  display: inline-block;
  min-width: 140px;
  max-width: 220px;
  margin: 0 auto;
}

.interview-page-container .recruitment-overview-container .section .apply-form .form-item.submit-item .submit-btn:disabled {
  background-color: #f0f0f0;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.8;
}

:deep(.interview-page-container .el-dialog) {
  background: var(--background-card);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  width: 500px;
  margin: 0 auto;
}
:deep(.interview-page-container .el-dialog__header) {
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 15px;
  margin-bottom: 20px;
}
:deep(.interview-page-container .el-dialog__title) {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-light);
  text-align: left;
}
:deep(.interview-page-container .el-dialog__body) {
  padding: 0;
}
:deep(.interview-page-container .el-dialog__footer) {
  padding: 20px 0 0 0;
  border-top: none;
  text-align: center;
}
</style>
