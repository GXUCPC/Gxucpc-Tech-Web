import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<any>(null)
  const isLoggedIn = ref(false)

  // 设置用户信息
  const setUser = (user: any) => {
    userInfo.value = user
    isLoggedIn.value = !!user
  }

  // 退出登录：清空内存状态
  const logout = () => {
    userInfo.value = null
    isLoggedIn.value = false
    // 注意：因为你的 token 在 httpOnly Cookie 中，
    // 真正的清除需要调用后端的退出接口，或者等待 Cookie 过期。
  }

  return { userInfo, isLoggedIn, setUser, logout }
})
