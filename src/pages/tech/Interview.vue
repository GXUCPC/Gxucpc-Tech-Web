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
          <!-- 用户名输入框 -->
          <div class="form-item">
            <label class="form-label">用户名 <span class="required">*</span></label>
            <input
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名（至少4位）"
              :class="{ 'input-error': errors.username }"
              maxlength="50"
            />
            <span class="error-tip" v-if="errors.username">{{ errors.username }}</span>
          </div>

          <!-- GitHub 昵称 -->
          <div class="form-item">
            <label class="form-label">GitHub 昵称 <span class="required">*</span></label>
            <input
              v-model="form.githubName"
              type="text"
              class="form-input"
              placeholder="请输入你的GitHub昵称"
              :class="{ 'input-error': errors.githubName }"
              maxlength="50"
            />
            <span class="error-tip" v-if="errors.githubName">{{ errors.githubName }}</span>
          </div>

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
              @blur="checkApplyStatusByEmail"
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
          <button class="submit-btn" @click="resetForm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// 配置axios
axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true
axios.defaults.timeout = 10000

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 优先从cookie取token（和后端auth.guard逻辑对齐）
    // 如果需要从localStorage取也可以保留原有逻辑
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器统一处理错误
axios.interceptors.response.use(
  response => response,
  error => {
    const errMsg = error.response?.data?.msg || '网络异常，请稍后重试'
    return Promise.reject(new Error(errMsg))
  }
)

// 表单数据
const form = reactive({
  username: '',
  githubName: '',
  githubUrl: '',
  email: ''
})

// 错误提示
const errors = reactive({
  username: '',
  githubName: '',
  githubUrl: '',
  email: ''
})

// 状态管理
const hasSubmitted = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// URL格式校验（强化GitHub URL校验）
const isValidUrl = (url) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    // 严格校验GitHub域名
    return urlObj.hostname === 'github.com' && urlObj.pathname.length > 1
  } catch {
    return false
  }
}

// Email格式校验
const isValidEmail = (email) => {
  const reg = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

// 表单校验
const validateForm = () => {
  let isValid = true
  // 清空所有错误提示
  Object.keys(errors).forEach(key => errors[key] = '')

  // 用户名校验
  if (!form.username.trim()) {
    errors.username = '用户名不能为空'
    isValid = false
  } else if (form.username.length < 4 || form.username.length > 50) {
    errors.username = '用户名长度需在4-50个字符之间'
    isValid = false
  }

  // GitHub昵称校验
  if (!form.githubName.trim()) {
    errors.githubName = 'GitHub昵称不能为空'
    isValid = false
  } else if (form.githubName.length < 2 || form.githubName.length > 50) {
    errors.githubName = '昵称长度需在2-50个字符之间'
    isValid = false
  }

  // GitHub URL校验
  if (!form.githubUrl.trim()) {
    errors.githubUrl = 'GitHub主页URL不能为空'
    isValid = false
  } else if (!isValidUrl(form.githubUrl)) {
    errors.githubUrl = '请输入合法的GitHub URL（例如：https://github.com/xxx）'
    isValid = false
  }

  // 邮箱校验
  if (!form.email.trim()) {
    errors.email = '电子邮箱不能为空'
    isValid = false
  } else if (!isValidEmail(form.email)) {
    errors.email = '请输入合法的电子邮箱格式'
    isValid = false
  }

  return isValid
}

// 检查当前用户是否已提交申请
const checkSubmitStatus = async () => {
  try {
    // 先从本地缓存读取，提升体验
    const submittedStatus = localStorage.getItem('interview_submitted')
    if (submittedStatus === 'true') {
      hasSubmitted.value = true
      return
    }

    // 调用后端接口校验（需要后端新增/interview/check接口）
    const res = await axios.get('/interview/my')
    if (res.data.code === 200 && res.data.data) {
      hasSubmitted.value = true
      localStorage.setItem('interview_submitted', 'true')
    }
  } catch (error) {
    // 非登录状态/接口不存在时不报错，仅控制台提示
    console.warn('检查提交状态失败:', error.message)
  }
}

// 检查邮箱是否已提交
const checkApplyStatusByEmail = async () => {
  if (!form.email || !isValidEmail(form.email)) return
  
  try {
    // 这里需要后端配合实现邮箱查重接口，示例逻辑
    const res = await axios.get('/interview/check', {
      params: { email: form.email.trim() }
    })
    if (res.data.submitted) {
      hasSubmitted.value = true
      localStorage.setItem('interview_submitted', 'true')
      alert('该邮箱已提交过申请，请勿重复提交')
    }
  } catch (error) {
    console.warn('检查邮箱提交状态失败:', error.message)
  }
}

// 提交表单
const handleSubmit = async () => {
  // 前置校验
  if (!validateForm()) return
  if (hasSubmitted.value) {
    alert('你已提交过申请，请勿重复提交')
    return
  }
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    
    // 提交数据到后端
    await axios.post('/interview/create', {
      username: form.username.trim(),
      github_username: form.githubName.trim(),
      github_url: form.githubUrl.trim(),
      email: form.email.trim()
    })

    // 提交成功处理
    localStorage.setItem('interview_submitted', 'true')
    hasSubmitted.value = true
    showSuccessModal.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.username = ''
  form.githubName = ''
  form.githubUrl = ''
  form.email = ''
  showSuccessModal.value = false
}

// 页面挂载时检查提交状态
onMounted(() => {
  checkSubmitStatus()
})

// 页面卸载时清理状态
onUnmounted(() => {
  hasSubmitted.value = false
  isSubmitting.value = false
  showSuccessModal.value = false
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

/* 页面容器 */
.interview-page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent !important;
  padding: 20px;
  box-sizing: border-box;
}

/* 卡片容器 */
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

/* 头部样式 */
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

/* 章节样式 */
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

/* 表单样式 */
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

/* 输入框样式 */
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

/* 提交按钮 */
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

/* 弹窗样式 */
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

/* 响应式适配 */
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