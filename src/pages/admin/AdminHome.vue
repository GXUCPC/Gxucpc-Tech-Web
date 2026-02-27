<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义面试记录的数据接口
interface Interview {
  id?: number;
  username: string;
  email: string;
  github_username: string;
  github_url: string;
  status: string;
  admin_remark: string;
}

// 顶部统计数据
const stats = ref([
  { title: '总投递简历数', value: 0, color: '#3b82f6' },
  { title: '待处理面试', value: 0, color: '#f59e0b' },
  { title: '已通过面试', value: 0, color: '#10b981' },
  { title: '已拒绝简历', value: 0, color: '#ef4444' }
])

// 列表相关状态
const interviews = ref<Interview[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const statusFilter = ref('')
const loading = ref(false)

// 编辑相关状态
const editingUser = ref<string | null>(null)
const editForm = ref({
  status: '',
  admin_remark: ''
})

const getToken = () => localStorage.getItem('token') || ''

// 这里的 baseUrl 需要填入你真实的后端运行地址和端口
const baseUrl = 'http://localhost:9090'

// 请求后端真实列表接口
const fetchInterviews = async () => {
  loading.value = true
  try {
    let url = `${baseUrl}/interview/list?page=${page.value}&size=${size.value}`
    if (statusFilter.value) {
      url += `&status=${statusFilter.value}`
    }

    const response = await fetch(url, {

      headers: {
      },
      credentials: 'include'
    })
    const res = await response.json()

    const dataObj = res.data ? res.data : res;

    if (dataObj && dataObj.list) {
      interviews.value = dataObj.list
      total.value = dataObj.total || 0

      // 动态更新顶部的总数卡片
      stats.value[0].value = total.value
      stats.value[1].value = interviews.value.filter(i => i.status === 'pending').length
      stats.value[2].value = interviews.value.filter(i => i.status === 'passed').length
      stats.value[3].value = interviews.value.filter(i => i.status === 'rejected').length
    }
  } catch (error) {
    console.error('获取面试列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 触发状态筛选
const handleFilterChange = () => {
  page.value = 1
  fetchInterviews()
}

// 开启编辑模式
const startEdit = async (interview: Interview) => {
  editingUser.value = interview.username
  editForm.value = {
    status: interview.status || 'pending',
    admin_remark: interview.admin_remark || ''
  }
}

// 取消编辑
const cancelEdit = () => {
  editingUser.value = null
}

// 提交更新到真实后端接口
const saveEdit = async (username: string) => {
  try {
    const response = await fetch(`${baseUrl}/interview/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        status: editForm.value.status,
        admin_remark: editForm.value.admin_remark
      })
    })

    const res = await response.json()

    if (res.code === 200 || res.success || res.username) {
      editingUser.value = null
      await fetchInterviews()
    } else {
      alert(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('网络请求失败，请检查控制台')
  }
}

// 分页控制
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchInterviews()
  }
}

const nextPage = () => {
  if (interviews.value.length === size.value) {
    page.value++
    fetchInterviews()
  }
}

onMounted(() => {
  fetchInterviews()
})
</script>

<template>
  <div class="admin-home">
    <div class="welcome-section">
      <h1>控制台首页</h1>
      <p>欢迎来到管理后台，您可以在此直接处理真实的面试记录数据。</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-title">{{ stat.title }}</div>
        <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h2>面试记录管理</h2>
        <div class="filter-box">
          <label for="statusFilter">状态筛选：</label>
          <select id="statusFilter" v-model="statusFilter" @change="handleFilterChange" class="select-input">
            <option value="">全部</option>
            <option value="pending">待处理 (pending)</option>
            <option value="passed">已通过 (passed)</option>
            <option value="rejected">已拒绝 (rejected)</option>
          </select>
          <button @click="fetchInterviews" class="refresh-btn" :disabled="loading">
            {{ loading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>GitHub 账号</th>
              <th>GitHub 主页</th>
              <th>当前状态</th>
              <th>管理员备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && interviews.length === 0">
              <td colspan="7" class="empty-text">数据加载中...</td>
            </tr>
            <tr v-else-if="interviews.length === 0">
              <td colspan="7" class="empty-text">暂无数据，请检查后端是否已启动并有简历投递</td>
            </tr>
            <tr v-for="item in interviews" :key="item.username">
              <td>{{ item.username }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.github_username }}</td>
              <td>
                <a :href="item.github_url" target="_blank" class="link-text">查看主页</a>
              </td>

              <td v-if="editingUser !== item.username">
                <span class="status-badge" :class="item.status">{{ item.status || 'pending' }}</span>
              </td>
              <td v-else>
                <select v-model="editForm.status" class="edit-select">
                  <option value="pending">pending</option>
                  <option value="passed">passed</option>
                  <option value="rejected">rejected</option>
                </select>
              </td>

              <td v-if="editingUser !== item.username">
                {{ item.admin_remark || '-' }}
              </td>
              <td v-else>
                <input type="text" v-model="editForm.admin_remark" class="edit-input" placeholder="输入备注信息" />
              </td>

              <td>
                <div v-if="editingUser !== item.username" class="action-btns">
                  <button @click="startEdit(item)" class="action-btn edit">处理状态</button>
                </div>
                <div v-else class="action-btns">
                  <button @click="saveEdit(item.username)" class="action-btn save">保存</button>
                  <button @click="cancelEdit" class="action-btn cancel">取消</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1 || loading" class="page-btn">上一页</button>
        <span class="page-info">第 {{ page }} 页</span>
        <button @click="nextPage" :disabled="interviews.length < size || loading" class="page-btn">下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #f3f4f6;
  min-height: 100%;
}

.welcome-section {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #111827;
  font-weight: 600;
}

.welcome-section p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-title {
  color: #4b5563;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
}

.list-section {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.list-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.select-input, .edit-select, .edit-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.select-input:focus, .edit-select:focus, .edit-input:focus {
  border-color: #3b82f6;
}

.refresh-btn {
  padding: 6px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.data-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
}

.empty-text {
  text-align: center;
  color: #9ca3af;
  padding: 32px !important;
}

.link-text {
  color: #3b82f6;
  text-decoration: none;
}

.link-text:hover {
  text-decoration: underline;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #4b5563;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.passed {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #ffffff;
}

.action-btn.edit {
  background-color: #3b82f6;
}
.action-btn.edit:hover { background-color: #2563eb; }

.action-btn.save {
  background-color: #10b981;
}
.action-btn.save:hover { background-color: #059669; }

.action-btn.cancel {
  background-color: #6b7280;
}
.action-btn.cancel:hover { background-color: #4b5563; }

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  gap: 16px;
}

.page-info {
  font-size: 14px;
  color: #4b5563;
}

.page-btn {
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
