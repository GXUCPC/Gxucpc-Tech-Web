<script setup lang="ts">
import { ref, watch, nextTick } from 'vue' // 必须引入 these hooks
import { useDialog } from '@/store/globalLoading.ts'
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// import { CommentAPI } from '@/api/submit-comment.js'
import { Icon } from '@iconify/vue' // 引入 Icon 组件
import { gsap } from 'gsap'         // 引入 GSAP

// 获取全局弹窗状态
const { dialogVisibleFeedback } = useDialog()

// 表单数据
const feedbackData = ref({
  username: '',
  text: '',
})

// 获取弹窗和遮罩的引用
const modalRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

watch(dialogVisibleFeedback, async (val) => {
  if (val) {
    await nextTick() // 等待 DOM 渲染出来

    // === 初始化状态 ===
    gsap.set(overlayRef.value, { opacity: 0 })
    gsap.set(modalRef.value, {
      scale: 0.1,
      opacity: 0,
      transformOrigin: "center center",// 设定生长点为中间
    })

    // === 执行进场动画 ===
    const tl = gsap.timeline()
    tl.to(overlayRef.value, { opacity: 1, duration: 0.3 })
      .to(modalRef.value, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)" // 弹性弹出效果
      }, "<0.1")
  }
})

// 5. 关闭逻辑 (包含离场动画)
const handleClose = () => {
  // === 执行离场动画 ===
  const tl = gsap.timeline({
    onComplete: () => {
      dialogVisibleFeedback.value = false // 动画播完后再销毁 DOM
    }
  })

  // 缩回右上角
  tl.to(modalRef.value, {
    scale: 0.1,
    opacity: 0,
    x: 50,
    y: -50,
    duration: 0.3,
    ease: "power2.in"
  })
  .to(overlayRef.value, { opacity: 0, duration: 0.3 }, "<")
}
// // 提交反馈
// async function submitFeedback() {
//   const commentText = feedbackData.value.text
//   const title = feedbackData.value.username
// 
//   if (!commentText || commentText.trim() === '') {
//     alert('评论内容不能为空！')
//     return
//   }
// 
//   const requestBody = {
//     content: commentText,
//     title: title && title.trim() !== '' ? title : '用户反馈',
//   }
// 
//   try {
//     const response = await CommentAPI.submitComment(requestBody)
//     if (response.code === 200 || response.success) {
//       alert('反馈提交成功！')
//       feedbackData.value.text = '' // 清空输入
//       handleClose() // 关闭弹窗
//     } else {
//       alert(response.msg || '提交失败')
//     }
//   } catch (error) {
//     console.error('提交反馈错误:', error)
//     alert('发生意外错误，请稍后再试。')
//   }
// }
</script>

<template>
  <Teleport to="body">
    <div v-if="dialogVisibleFeedback" class="feedback-overlay" ref="overlayRef" @click.self="handleClose">

      <div class="feedback-modal" ref="modalRef">

        <div class="modal-header">
          <h3>
            <Icon icon="mingcute:message-4-line" class="icon"/>
            意见反馈
          </h3>
          <button class="close-btn" @click="handleClose">
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label>您的建议或问题</label>
            <textarea
              v-model="feedbackData.text"
              placeholder="请详细描述您遇到的问题或建议..."
              rows="4"
            ></textarea>
          </div>
          <div class="input-group">
            <label>联系方式 (可选)</label>
            <input
              type="text"
              v-model="feedbackData.username"
              placeholder="请输入您的联系方式，以便我们回复您"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="handleClose">取消</button>
          <button class="btn-submit" @click="submitFeedback">提交反馈</button>
        </div>
      </div>

    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use "sass:color";

.contentContainer { width: 100%; }
.content { margin: 0 auto; width: min(100%, 1920px); min-height: calc(100vh - 4em); }

.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999; /* 保证最顶层 */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);       /* 背景模糊 */

  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. 弹窗主体 (磨砂玻璃) */
.feedback-modal {
  width: min(450px, calc(100vw - 32px));

  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* 玻璃边缘光 */

  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* 阴影 */
  color: #fff;
  overflow: hidden;

  /* 头部样式 */
  .modal-header {
    padding: 20px 24px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    h3 {
      margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;
      .icon { font-size: 1.4rem; }
    }

    .close-btn {
      background: none; border: none; color: rgba(255, 255, 255, 0.5);
      font-size: 1.5rem; cursor: pointer; transition: color 0.3s;
      display: flex; /* 让图标居中 */
      &:hover { color: #fff; }
    }
  }

  /* 内容区域 */
  .modal-body {
    padding: 24px;

    .input-group {
      margin-bottom: 20px;
      label {
        display: block; margin-bottom: 8px; font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
      }

      /* 自定义输入框样式 (为了配合暗色背景) */
      textarea, input {
        width: 100%;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        color: #fff;
        font-family: inherit; font-size: 1rem;
        transition: all 0.3s;
        box-sizing: border-box; /* 防止padding撑破宽度 */

        /* 聚焦时的样式 (高亮 + 光晕) */
        &:focus {
          outline: none;
          border-color: #F2C94C;
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 0 2px rgba(242, 201, 76, 0.1);
        }
      }
      textarea { resize: none; }
    }
  }

  /* 底部按钮 */
  .modal-footer {
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.2);
    display: flex; justify-content: flex-end; gap: 12px;

    button {
      padding: 8px 20px; border-radius: 6px; cursor: pointer;
      font-weight: 600; font-size: 0.9rem; transition: all 0.3s;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      &:hover { border-color: #fff; color: #fff; }
    }

    .btn-submit {
      background: #F2C94C; /* 主题黄 */
      border: none; color: #000;
      &:hover {
        background: color.adjust(#F2C94C, $lightness: 10%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(242, 201, 76, 0.3);
      }
      &:active { transform: translateY(0); }
    }
  }
}
</style>
