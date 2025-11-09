import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalLoading = defineStore('globalLoading', () => {
  const loading = ref(false)
  const progress = ref(0)
  const text = ref('内容加载中')

  return { loading, progress, text }
})
