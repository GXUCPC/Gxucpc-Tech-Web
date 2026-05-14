<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

enum NoticeStatus { DRAFT = 'draft', PUBLISHED = 'published' }

interface Notice {
  id: number
  title: string
  content: string
  status: NoticeStatus
  username: string
  created_at: string
}

const stats = ref([
  { title: '总通知数', value: 0, color: '#3b82f6' },
  { title: '已发布通知', value: 0, color: '#10b981' },
  { title: '草稿通知', value: 0, color: '#f59e0b' },
])

const notices = ref<Notice[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const statusFilter = ref('')
const loading = ref(false)
const showAddModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref<number | null>(null)
const noticeForm = ref({ title: '', content: '', status: NoticeStatus.PUBLISHED })

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await http.get('/notice/list', { params: { page: page.value, size: size.value, status: statusFilter.value || undefined } })
    if (res.code === 200 && res.data) {
      notices.value = res.data.list
      total.value = res.data.total
      stats.value[0].value = total.value
      stats.value[1].value = notices.value.filter(i => i.status === 'published').length
      stats.value[2].value = notices.value.filter(i => i.status === 'draft').length
    }
  } catch (e) { console.error('获取通知失败:', e) } finally { loading.value = false }
}

const handleFilterChange = () => { page.value = 1; fetchNotices() }

const openAddModal = () => {
  editingId.value = null
  noticeForm.value = { title: '', content: '', status: NoticeStatus.PUBLISHED }
  showAddModal.value = true
}

const openEditModal = (item: Notice) => {
  editingId.value = item.id
  noticeForm.value = { title: item.title, content: item.content, status: item.status }
  showAddModal.value = true
}

const saveNotice = async () => {
  if (!noticeForm.value.title || !noticeForm.value.content) return ElMessage.warning('标题和内容不能为空！')
  saving.value = true
  try {
    if (editingId.value) {
      await http.post('/notice/update', { id: editingId.value, ...noticeForm.value })
    } else {
      await http.post('/notice/publish', noticeForm.value)
    }
    showAddModal.value = false
    ElMessage.success(editingId.value ? '编辑成功！' : '发布成功！')
    fetchNotices()
  } catch (e) { console.error('保存通知失败:', e) } finally { saving.value = false }
}

const deleteNotice = (id: number) => { pendingDeleteId.value = id; showDeleteConfirm.value = true }

const confirmDelete = async () => {
  const id = pendingDeleteId.value!
  showDeleteConfirm.value = false
  deletingId.value = id
  try {
    await http.post('/notice/delete', { id })
    ElMessage.success('删除成功！')
    fetchNotices()
  } catch (e) { console.error('删除通知失败:', e) } finally { deletingId.value = null; pendingDeleteId.value = null }
}

const cancelDelete = () => { showDeleteConfirm.value = false; pendingDeleteId.value = null }

const prevPage = () => { if (page.value > 1) { page.value--; fetchNotices() } }
const nextPage = () => { if (page.value * size.value < total.value) { page.value++; fetchNotices() } }

const formatDate = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\//g, '-')
}

onMounted(() => fetchNotices())
</script>

<template>
  <div class="admin-home">
    <div class="welcome-section">
      <h1>通知管理控制台</h1>
      <p>欢迎来到通知管理后台，您可以在此发布、编辑、删除通知。</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-for="s in stats" :key="s.title">
        <div class="stat-title">{{ s.title }}</div>
        <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h2>通知列表管理</h2>
        <div class="filter-box">
          <select v-model="statusFilter" @change="handleFilterChange" class="select-input">
            <option value="">全部</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          <button @click="openAddModal" class="refresh-btn primary-btn">+ 发布新通知</button>
          <button @click="fetchNotices" class="refresh-btn" :disabled="loading">{{ loading ? '加载中...' : '刷新列表' }}</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>通知标题</th><th>通知内容</th><th>发布人</th><th>发布时间</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && notices.length === 0"><td colspan="6" class="empty-text">数据加载中...</td></tr>
            <tr v-else-if="notices.length === 0"><td colspan="6" class="empty-text">暂无通知数据</td></tr>
            <tr v-for="item in notices" :key="item.id">
              <td>{{ item.title }}</td>
              <td><span class="content-cell">{{ item.content }}</span></td>
              <td>{{ item.username }}</td>
              <td>{{ formatDate(item.created_at) }}</td>
              <td><span class="status-badge" :class="item.status">{{ item.status === 'published' ? '已发布' : '草稿' }}</span></td>
              <td>
                <div class="action-btns">
                  <button @click="openEditModal(item)" class="action-btn edit">编辑</button>
                  <button @click="deleteNotice(item.id)" class="action-btn cancel" :disabled="deletingId === item.id">{{ deletingId === item.id ? '删除中...' : '删除' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1 || loading" class="page-btn">上一页</button>
        <span class="page-info">第 {{ page }} 页</span>
        <button @click="nextPage" :disabled="page * size >= total || loading" class="page-btn">下一页</button>
      </div>
    </div>

    <div v-show="showAddModal" class="modal-mask">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑通知' : '发布新通知' }}</h3>
          <button @click="showAddModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label for="title">通知标题</label>
            <input v-model="noticeForm.title" id="title" type="text" class="edit-input" placeholder="请输入通知标题" />
          </div>
          <div class="form-item">
            <label for="content">通知内容</label>
            <textarea v-model="noticeForm.content" id="content" class="edit-textarea" rows="6" placeholder="请输入通知内容"></textarea>
          </div>
          <div class="form-item">
            <label for="status">发布状态</label>
            <select v-model="noticeForm.status" id="status" class="edit-select">
              <option value="published">立即发布</option>
              <option value="draft">存为草稿</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddModal = false" class="cancel-btn">取消</button>
          <button @click="saveNotice" class="confirm-btn" :disabled="saving">{{ saving ? '保存中...' : '确认发布' }}</button>
        </div>
      </div>
    </div>

    <div v-show="showDeleteConfirm" class="modal-mask">
      <div class="confirm-box">
        <p>确定要删除这条通知吗？</p>
        <div class="confirm-btns">
          <button @click="confirmDelete" class="confirm-btn danger-btn">确认</button>
          <button @click="cancelDelete" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home { display: flex; flex-direction: column; gap: 24px; background-color: #f3f4f6; min-height: 100%; padding: 24px; }
.welcome-section { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.welcome-section h1 { margin: 0 0 8px; font-size: 24px; color: #111827; font-weight: 600; }
.welcome-section p { margin: 0; color: #6b7280; font-size: 15px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.stat-card { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: center; align-items: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.stat-title { color: #4b5563; font-size: 16px; margin-bottom: 12px; font-weight: 500; }
.stat-value { font-size: 36px; font-weight: 700; }

.list-section { background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
.list-header h2 { margin: 0; font-size: 18px; color: #111827; }
.filter-box { display: flex; align-items: center; gap: 12px; }

.select-input, .edit-select { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; outline: none; background: #ffffff; color: #111827; }

.refresh-btn { padding: 6px 16px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s; }
.refresh-btn:hover:not(:disabled) { background-color: #e5e7eb; }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.primary-btn { background-color: #3b82f6; color: #ffffff; border-color: #3b82f6; }
.primary-btn:hover:not(:disabled) { background-color: #2563eb; }

.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937; }
.data-table th { background-color: #f9fafb; color: #4b5563; font-weight: 600; }
.empty-text { text-align: center !important; color: #9ca3af; padding: 32px !important; }
.content-cell { display: block; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
.status-badge.published { background-color: #d1fae5; color: #059669; }
.status-badge.draft { background-color: #fef3c7; color: #d97706; }

.action-btns { display: flex; gap: 8px; }
.action-btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; color: #ffffff; transition: 0.2s; font-weight: 500; }
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.edit { background-color: #3b82f6; }
.cancel { background-color: #6b7280; }

.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 20px; }
.page-btn { padding: 6px 16px; border: 1px solid #d1d5db; background-color: #ffffff; border-radius: 4px; cursor: pointer; font-size: 14px; color: #111827; }
.page-btn:hover:not(:disabled) { background-color: #f3f4f6; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { color: #4b5563; }

.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { width: 600px; background: #ffffff; border-radius: 8px; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.modal-header h3 { margin: 0; color: #111827; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; }
.modal-body { padding: 24px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; margin-bottom: 8px; color: #374151; }
.edit-input, .edit-textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; outline: none; color: #111827; background: #ffffff; box-sizing: border-box; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
.cancel-btn, .confirm-btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
.cancel-btn { background: #e5e7eb; color: #374151; }
.confirm-btn { background: #3b82f6; color: #ffffff; }
.confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.danger-btn { background: #ef4444; }

.confirm-box { background: #ffffff; padding: 32px; border-radius: 8px; text-align: center; width: 400px; }
.confirm-box p { margin: 0 0 24px; font-size: 16px; color: #111827; }
.confirm-btns { display: flex; justify-content: center; gap: 16px; }
</style>
