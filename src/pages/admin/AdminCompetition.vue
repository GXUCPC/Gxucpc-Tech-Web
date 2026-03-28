<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CompetitionAPI } from '@/api/competitionSignUp'

// ================= 类型定义 =================
interface Competition {
  id: number;
  name: string;
  location: string;
  registration_end: string;
  status: string;
  participant_count?: number; // 报名人数 (假设后端返回或前端计算)
}

interface Participant {
  id: number;
  student_id: string;
  real_name: string;
  phone: string;
  email: string;
}

const loading = ref(false)
const competitions = ref<Competition[]>([])

// 顶部统计数据
const stats = ref([
  { title: '总赛事数', value: 0, color: '#3b82f6' },
  { title: '报名中赛事', value: 0, color: '#10b981' },
  { title: '累计报名人次', value: 0, color: '#f59e0b' },
])

// ================= 弹窗控制 =================
const showAddModal = ref(false)
const showParticipantsModal = ref(false)

const newCompForm = ref({
  name: '',
  description: '',
  location: '',
  start_time: '',
  end_time: '',
  registration_start: '',
  registration_end: ''
})

const currentCompName = ref('')
const currentParticipants = ref<Participant[]>([])
const participantsLoading = ref(false)

// ================= 核心业务逻辑 =================

// 1. 获取比赛列表
const fetchCompetitions = async () => {
  loading.value = true
  try {
    const res = await CompetitionAPI.getCompetitionList()

    if (res.code === 200 && res.data) {
      competitions.value = res.data

      // 更新顶部统计数据
      stats.value[0].value = competitions.value.length
      // 假设状态为 published 且未到截止时间的为进行中 (这里做个简单演示)
      stats.value[1].value = competitions.value.filter(c => c.status === 'published').length
      // 假设后端会在列表中返回 participant_count，如果没有，这里先置为 0
      stats.value[2].value = competitions.value.reduce((sum, c) => sum + (c.participant_count || 0), 0)
    }
  } catch (error) {
    console.error('获取比赛列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 2. 添加新比赛
const submitAddCompetition = async () => {
  try {
    const res = await CompetitionAPI.addCompetition(newCompForm.value)
    if (res.code === 200) {
      alert('赛事发布成功！')
      showAddModal.value = false
      // 清空表单
      Object.keys(newCompForm.value).forEach(k => newCompForm.value[k as keyof typeof newCompForm.value] = '')
      // 刷新列表
      fetchCompetitions()
    } else {
      alert(res.msg || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

// 3. 删除比赛
const deleteCompetition = async (id: number, name: string) => {
  if (!confirm(`⚠️ 极其危险的操作：\n确定要永久删除【${name}】吗？\n该比赛的所有报名记录将被一并清空，且无法恢复！`)) {
    return
  }
  try {
    const res = await CompetitionAPI.deleteCompetition(id)
    if (res.code === 200) {
      alert('赛事删除成功')
      fetchCompetitions()
    } else {
      alert(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 4. 查看报名名单
const viewParticipants = async (comp: Competition) => {
  showParticipantsModal.value = true
  participantsLoading.value = true

  try {
    const res = await CompetitionAPI.getRecords(comp.id)
    if (res.code === 200 && res.data) {
      currentParticipants.value = res.data
    } else {
      alert(res.msg || '获取名单失败')
    }
    participantsLoading.value = false
    currentCompName.value = comp.name
  } catch (error) {
    console.error('获取名单失败:', error)
    participantsLoading.value = false
  }
}

// 工具函数：格式化时间
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// 工具函数：根据时间判断是否停止报名
const isPastDeadline = (endTime) => {
  if (!endTime) return false; // 如果没设置截止时间，默认还没过
  const now = new Date().getTime(); // 当前系统时间的时间戳
  const deadline = new Date(endTime).getTime(); // 截止时间的时间戳
  return now > deadline; // 如果现在的时间大于截止时间，返回 true
};

onMounted(() => {
  fetchCompetitions()
})
</script>

<template>
  <div class="admin-home">
    <div class="welcome-section">
      <h1>比赛管理</h1>
      <p>在此处发布新赛事、管理现有比赛，并查看各赛事的报名名单。</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-title">{{ stat.title }}</div>
        <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h2>赛事列表</h2>
        <div class="filter-box">
          <button @click="showAddModal = true" class="action-btn primary" style="padding: 8px 16px;">
            + 发布新比赛
          </button>
          <button @click="fetchCompetitions" class="refresh-btn" :disabled="loading">
            {{ loading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>赛事名称</th>
              <th>比赛地点</th>
              <th>报名截止时间</th>
              <th>状态</th>
              <th>报名人数</th>
              <th style="text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && competitions.length === 0">
              <td colspan="6" class="empty-text">数据加载中...</td>
            </tr>
            <tr v-else-if="competitions.length === 0">
              <td colspan="6" class="empty-text">暂无赛事记录</td>
            </tr>
            <tr v-for="item in competitions" :key="item.id">
              <td class="comp-name-td">{{ item.name }}</td>
              <td>{{ item.location || '线上/待定' }}</td>
              <td>{{ formatDate(item.registration_end) }}</td>
              <td>
                <span class="status-badge" :class="item.status === 'published' ? 'passed' : 'pending'">
                  {{ isPastDeadline(item.registration_end) ? '报名截止' : (item.status === 'published' ? '报名中' : '草稿') }}
                </span>
              </td>
              <td>
                <span style="font-weight: bold; color: #3b82f6;">{{ item.participant_count || 0 }}</span> 人
              </td>
              <td style="text-align: right;">
                <div class="action-btns" style="justify-content: flex-end;">
                  <button @click="viewParticipants(item)" class="action-btn view">查看名单</button>
                  <button @click="deleteCompetition(item.id, item.name)" class="action-btn danger">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>发布新赛事</h3>
          <span class="close-icon" @click="showAddModal = false">×</span>
        </div>
        <form @submit.prevent="submitAddCompetition" class="modal-form">
          <div class="form-group">
            <label>赛事名称 <span class="required">*</span></label>
            <input type="text" v-model="newCompForm.name" required placeholder="例如：2026校赛" class="form-input" />
          </div>
          <div class="form-group">
            <label>赛事描述 <span class="required">*</span></label>
            <textarea v-model="newCompForm.description" required rows="3" placeholder="填写比赛简介与规则..." class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label>比赛地点</label>
            <input type="text" v-model="newCompForm.location" placeholder="例如：计算机学院101机房" class="form-input" />
          </div>
          <div class="form-group">
            <label>比赛开始时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="newCompForm.start_time" required class="form-input" />
          </div>
          <div class="form-group">
            <label>比赛截止时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="newCompForm.end_time" required class="form-input" />
          </div>
          <div class="form-group">
            <label>报名开始时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="newCompForm.registration_start" required class="form-input" />
          </div>
          <div class="form-group">
            <label>报名截止时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="newCompForm.registration_end" required class="form-input" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showAddModal = false">取消</button>
            <button type="submit" class="btn-submit">确认发布</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" v-if="showParticipantsModal" @click.self="showParticipantsModal = false">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>报名名单：{{ currentCompName }}</h3>
          <span class="close-icon" @click="showParticipantsModal = false">×</span>
        </div>
        <div class="modal-body">
          <div class="table-container">
            <table class="data-table inner-table">
              <thead>
                <tr>
                  <th>学号</th>
                  <th>真实姓名</th>
                  <th>联系电话</th>
                  <th>邮箱</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="participantsLoading">
                  <td colspan="4" class="empty-text">名单加载中...</td>
                </tr>
                <tr v-else-if="currentParticipants.length === 0">
                  <td colspan="4" class="empty-text">暂无人报名</td>
                </tr>
                <tr v-for="p in currentParticipants" :key="p.id">
                  <td>{{ p.student_id }}</td>
                  <td>{{ p.real_name }}</td>
                  <td>{{ p.phone }}</td>
                  <td>{{ p.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 继承你原有的样式骨架 */
.admin-home { display: flex; flex-direction: column; gap: 24px; background-color: #f3f4f6; min-height: 100%; }
.welcome-section { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.welcome-section h1 { margin: 0 0 8px 0; font-size: 24px; color: #111827; font-weight: 600; }
.welcome-section p { margin: 0; color: #6b7280; font-size: 15px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.stat-card { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.stat-title { color: #4b5563; font-size: 16px; margin-bottom: 12px; font-weight: 500; }
.stat-value { font-size: 36px; font-weight: 700; }

.list-section { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
.list-header h2 { margin: 0; font-size: 18px; color: #111827; }
.filter-box { display: flex; align-items: center; gap: 12px; font-size: 14px; }

.refresh-btn { padding: 6px 16px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.refresh-btn:hover:not(:disabled) { background-color: #e5e7eb; }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937; }
.data-table th { background-color: #f9fafb; color: #4b5563; font-weight: 600; }
.empty-text { text-align: center; color: #9ca3af; padding: 32px !important; }

/* 状态徽章 */
.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background-color: #f3f4f6; color: #4b5563; }
.status-badge.pending { background-color: #fef3c7; color: #d97706; }
.status-badge.passed { background-color: #d1fae5; color: #059669; }

/* 操作按钮 */
.action-btns { display: flex; gap: 8px; }
.action-btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; color: #ffffff; transition: 0.2s; font-weight: 500;}
.action-btn.primary { background-color: #3b82f6; }
.action-btn.primary:hover { background-color: #2563eb; }
.action-btn.view { background-color: #10b981; }
.action-btn.view:hover { background-color: #059669; }
.action-btn.danger { background-color: #ef4444; }
.action-btn.danger:hover { background-color: #dc2626; }
.comp-name-td { font-weight: 500; color: #111827; }

/* ================= 浅色主题弹窗样式 ================= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.6); /* 半透明遮罩 */
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.large-modal {
  max-width: 800px; /* 查看名单的弹窗宽一点 */
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
  font-weight: 600;
}
.close-icon {
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}
.close-icon:hover { color: #4b5563; }

.modal-form { padding: 24px; }
.modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;}
.required { color: #ef4444; }
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
textarea.form-input { resize: vertical; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
.btn-cancel {
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.btn-cancel:hover { background-color: #f3f4f6; }
.btn-submit {
  padding: 8px 16px;
  background-color: #3b82f6;
  border: none;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.btn-submit:hover { background-color: #2563eb; }

.inner-table th { background-color: #f3f4f6; }
</style>
