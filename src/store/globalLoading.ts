// 全屏 loading 遮罩已移除（改为页面内容渐显 + 导航栏划入），
// 本文件仅保留全局弹窗（登录 / 意见反馈）的共享状态。

// ⚠️ 关键：在模块作用域中定义 ref，使其成为单例
import { ref } from 'vue'

const dialogVisibleLogin = ref(false)
const dialogVisibleFeedback = ref(false)

export function useDialog() {
    // 返回 ref 和操作方法
    return {
        dialogVisibleLogin,
        dialogVisibleFeedback
    }
}
