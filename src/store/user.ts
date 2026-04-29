import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<any>(null)
  const isLoggedIn = ref(false)

  const setUser = (user: any) => {
    userInfo.value = user
    isLoggedIn.value = !!user
  }

  const logout = () => {
    userInfo.value = null
    isLoggedIn.value = false
  }

  const clearUser = () => {
    logout()
  }

  return { userInfo, isLoggedIn, setUser, logout, clearUser }
})
