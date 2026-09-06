<template>
  <div class="competition-page">
    <div class="page-header">
      <h1 class="main-title">近期赛事</h1>
    </div>

    <div class="content-layout">
      <div class="main-content">
        <div class="competition-card" v-for="comp in competitionList" :key="comp.id">
          <h2 class="comp-title">{{ comp.name }}</h2>
          <a
    class="details-link"
    :href="comp.detail_image"
    target="_blank"
    v-if="comp.detail_image && comp.detail_image !== '0'"
  >
    详情安排 &gt;
  </a>

          <div class="comp-meta">
            <span class="meta-item"> 地点：{{ comp.location || '线上/待定' }}</span>
            <span class="meta-item"> 比赛时间：{{ formatDate(comp.start_time) }}</span>
            <span class="meta-item"> 报名开始：{{ formatDate(comp.registration_start) }}</span>
            <span class="meta-item"> 报名截止：{{ formatDate(comp.registration_end) }}</span>
            <span class="meta-item" style="width: 100%; margin-top: -10px;"> 比赛时长：{{ calculateDuration(comp.start_time, comp.end_time) }}</span>
            <span class="meta-item status-tag" :class="comp.status" style="width: 100%; margin-top: -10px;">
              {{ isPastDeadline(comp.registration_end) ? '停止报名' : getStatusText(comp.status) }}
            </span>
            <span class="meta-item"> 已报名人数：{{ comp.registered_count }}</span>
          </div>

          <p class="comp-desc">{{ comp.description }}</p>

          <button
  class="apply-btn"
  :disabled="comp.status !== 'published' || isPastDeadline(comp.registration_end)"
  @click="openApplyModal(comp)"
>
  {{
    isPastDeadline(comp.registration_end)
      ? '已截止报名'
      : (comp.status === 'published' ? '立即报名' : '不可报名')
  }}
</button>
        </div>
      </div>

      <!-- <aside class="side-nav">
        <h3>赛事导航</h3>
        <ul>
          <li><a href="#rules">一、参赛规则与须知</a></li>
          <li><a href="#faq">二、常见问题解答</a></li>
          <li><a href="#contact">关于加入技术组</a></li>
        </ul>
      </aside> -->
    </div>

    <div class="modal-overlay" v-if="showModal">
      <div class="modal-content">
        <h3>报名：{{ selectedComp?.name }}</h3>
        <form @submit.prevent="submitApplication" class="apply-form">
          <div class="form-group">
            <label>学号</label>
            <input
              type="text"
              v-model="formData.student_id"
              required
              placeholder="请输入真实学号" />
          </div>
          <div class="form-group">
            <label>真实姓名</label>
            <input type="text" v-model="formData.real_name" required placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" v-model="formData.phone" required placeholder="请输入手机号" />
          </div>
          <div class="form-group">
            <label>联系邮箱</label>
            <input type="email" v-model="formData.email" required placeholder="接收通知的邮箱" />
          </div>
          <div class="form-group">
  <label>邮箱验证码</label>
  <div class="code-input-wrapper">
    <input type="text" v-model="formData.code" required placeholder="请输入邮箱验证码" />
    <button type="button" class="send-code-btn" @click="sendCode" >发送</button>
  </div>
</div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn">确认提交</button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import { CompetitionAPI } from '../../api/competitionSignUp'
const userStore = useUserStore()

const competitionList = ref([])
const loading = ref(false)

// const sendCode = async () => {
//   if (!formData.email) {
//     alert('请先输入邮箱地址')
//     return
//   }
//   try {
//     const res = await CompetitionAPI.sendCode({ email: formData.email, action: "signUp" })
//     if (res.code === 200) {
//       alert('验证码已发送，请查收邮箱')
//     } else {
//       alert('发送验证码失败：' + (res.message || '未知错误'))
//     }
//   } catch (error) {
//     alert('发送验证码失败：' + (error.response?.data?.message || error.message))
//   }
// }
// 
// const getCompetitionList = async () => {
//   loading.value = true;
//   try {
//     const res = await CompetitionAPI.getCompetitionList();
// 
//     // 假设你的后端统一返回格式是 { code: 200, data: [...] }
//     if (res.code === 200) {
//       competitionList.value = res.data;
//     } else {
//       console.error('获取比赛列表失败:', res.message || '未知错误');}
//   } catch (error) {
//     console.error('获取比赛列表失败:', error);
//   } finally {
//     loading.value = false;
//   }
// };
// getCompetitionList();

// 弹窗状态管理
const showModal = ref(false)
const selectedComp = ref(null)

// 表单数据绑定
const formData = reactive({
  student_id: '',
  real_name: '',
  phone: '',
  email: '',
  code: '',
})

// 打开弹窗
const openApplyModal = (comp) => {
  selectedComp.value = comp
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  // 清空表单
  Object.keys(formData).forEach((key) => (formData[key] = ''))
}

// // 提交表单（这里对接你刚才写好的后端接口）
// const submitApplication = async () => {
//   try {
//     const res = await CompetitionAPI.applyCompetition({
//       competition_id: selectedComp.value.id,
//       student_id: formData.student_id,
//       real_name: formData.real_name,
//       phone: formData.phone,
//       email: formData.email,
//       code: formData.code,
//     })
// 
//     if(res.code === 200) {
//       alert('🎉 报名成功！请留意邮箱通知。');
//       closeModal();
//     } else {
//       alert('报名失败：' + (res.msg || '未知错误'));
//     }
//   } catch (error) {
//     alert('报名失败：' + (error.response?.data?.message || error.message));
//   }
// }

// 工具函数：格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '待定'
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  // 把日期和时间拼起来，中间加个空格
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 工具函数：状态翻译
const getStatusText = (status) => {
  const map = { published: '报名中', ended: '已结束', draft: '敬请期待' }
  return map[status] || status
}

// 工具函数：根据时间判断是否停止报名
const isPastDeadline = (endTime) => {
  if (!endTime) return false; // 如果没设置截止时间，默认还没过
  const now = new Date().getTime(); // 当前系统时间的时间戳
  const deadline = new Date(endTime).getTime(); // 截止时间的时间戳
  return now > deadline; // 如果现在的时间大于截止时间，返回 true
};

// 工具函数：计算比赛持续时长
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '未知时长'

  // 将时间字符串转为时间戳 (毫秒)
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  // 计算差值
  const diff = end - start
  if (diff <= 0) return '时间设置异常'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  // 拼接显示字符串
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainHours = hours % 24
    return remainHours > 0 ? `${days}天${remainHours}小时` : `${days}天`
  }

  if (hours === 0) return `${minutes}分钟`
  if (minutes === 0) return `${hours}小时`
  return `${hours}小时 ${minutes}分钟`
}
</script>

<style scoped>
/* 核心暗黑主题配色 */
:root {
  --bg-dark: #141414;
  --text-main: #e5e5e5;
  --text-muted: #999999;
  --accent-gold: #9e8433; /* 截图里的暗金色 */
  --accent-gold-hover: #bda247;
  --border-dark: #333333;
}

.competition-page {
  background-color: var(--bg-dark, #141414);
  color: var(--text-main, #e5e5e5);
  min-height: 100vh;
  padding: 40px 10%;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 完美复刻带底色下划线的标题 */
.page-header {
  margin-bottom: 50px;
}
.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  display: inline-block;
  position: relative;
  z-index: 1;
}
.main-title::after {
  content: '';
  position: absolute;
  left: -5%;
  bottom: 5px;
  width: 110%;
  height: 12px;
  background-color: var(--accent-gold, #9e8433);
  z-index: -1;
  opacity: 0.7;
}

/* 布局：左侧内容，右侧导航 */
.content-layout {
  display: flex;
  gap: 60px;
}
.main-content {
  flex: 1;
}

/* 比赛卡片样式 */
.competition-card {
  border-bottom: 1px solid var(--border-dark, #333);
  padding-bottom: 40px;
  margin-bottom: 40px;
}
.comp-title {
  font-size: 1.8rem;
  margin-bottom: 15px;
}
.comp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--text-muted, #999);
  font-size: 0.9rem;
  margin-bottom: 20px;
}
.status-tag {
  color: var(--accent-gold, #9e8433);
  font-weight: bold;
}
.status-tag.ended {
  color: #d9534f;
}
.comp-desc {
  white-space: pre-wrap;
  line-height: 1.8;
  margin-bottom: 25px;
  color: #cccccc;
}

/* 报名按钮 */
.apply-btn {
  background: transparent;
  color: var(--accent-gold, #9e8433);
  border: 1px solid var(--accent-gold, #9e8433);
  padding: 10px 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}
.apply-btn:hover:not(:disabled) {
  background: var(--accent-gold, #9e8433);
  color: #fff;
}
.apply-btn:disabled {
  border-color: #555;
  color: #555;
  cursor: not-allowed;
}

/* 右侧侧边栏 */
.side-nav {
  width: 250px;
  border-left: 2px solid var(--border-dark, #333);
  padding-left: 20px;
  align-self: flex-start;
  position: sticky;
  top: 40px;
}
.side-nav h3 {
  color: var(--text-muted, #999);
  font-size: 0.9rem;
  margin-bottom: 15px;
}
.side-nav ul {
  list-style: none;
  padding: 0;
}
.side-nav li {
  margin-bottom: 15px;
}
.side-nav a {
  color: var(--text-main, #e5e5e5);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}
.side-nav a:hover {
  color: var(--accent-gold, #9e8433);
}

/* 报名弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #1e1e1e;
  padding: 30px;
  width: 100%;
  max-width: 450px;
  border-radius: 4px;
  border: 1px solid var(--accent-gold, #4c4940);
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--accent-gold, #9e8433);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #ccc;
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  padding: 10px;
  background: #111;
  border: 1px solid #333;
  color: #fff;
  outline: none;
}
.form-group input:focus {
  border-color: var(--accent-gold, #9e8433);
}
/* 新增：验证码输入框和按钮的外层容器 */
.code-input-wrapper {
  display: flex;
  gap: 10px; /* 输入框和按钮之间的间距 */
  width: 100%; /* 确保总宽度和其他输入框一致 */
}

/* 新增：让验证码的输入框自动占满剩下的空间 */
.code-input-wrapper input {
  flex: 1;
  /* 注意：这里会自动继承你上面写的 .form-group input 样式 (比如 padding, background) */
}

/* 新增：发送按钮的专属样式 */
.send-code-btn {
  padding: 0 20px; /* 左右留白，高度会自动被 flex 拉伸到和 input 一样高 */
  background: #222;
  color: #ccc;
  border: 1px solid #333;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap; /* 强制“发送”两个字在一行，不换行 */
  transition: all 0.3s ease;
}

/* 按钮悬停效果：用你项目里的暗金色 */
.send-code-btn:hover:not(:disabled) {
  border-color: var(--accent-gold, #9e8433);
  color: var(--accent-gold, #9e8433);
}

/* 按钮禁用时的状态（比如倒计时60秒时） */
.send-code-btn:disabled {
  background: #111;
  color: #555;
  cursor: not-allowed;
}
.modal-actions {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
.modal-actions button {
  padding: 8px 20px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}
.cancel-btn {
  background: transparent;
  color: #999;
}
.cancel-btn:hover {
  color: #fff;
}
.submit-btn {
  background: var(--accent-gold, #9e8433);
  color: #fff;
}
.submit-btn:hover {
  background: var(--accent-gold-hover, #bda247);
}
</style>
