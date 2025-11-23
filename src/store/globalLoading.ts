import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalLoading = defineStore('globalLoading', () => {
  const loading = ref(true)
  const progress = ref(0)
  const text = ref('内容加载中')

  return { loading, progress, text }
})

// ⚠️ 关键：在模块作用域中定义 ref，使其成为单例
const dialogVisible = ref(false)

export function useDialog() {
    // 返回 ref 和操作方法
    return {
        dialogVisible,
    }
}
