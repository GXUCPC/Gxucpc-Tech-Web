<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
import { ref } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
const { dialogVisible} = useDialog()
const feedbackData = ref({
  username: '',
  text: '',
});

/**
 * @param {string} commentText - 用户在输入框中填写的评论内容。
 * @param {string} [title] - (可选) 希望设定的标题。
 */
async function submitFeedback(commentText, title) {
  // 检查评论内容是否为空
  if (!commentText || commentText.trim() === '') {
    alert('评论内容不能为空！');
    return;
  }

  // 构建请求体
  const requestBody = {
    comment: commentText,
    title: '用户反馈', // 默认标题
  };

  // 如果提供了标题，就加入到请求体中
  if (title && title.trim() !== '') {
    requestBody.title = title;
  }

  try {
    const response = await fetch('/api/submit-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 将评论内容和可选的标题放入请求体中
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok) {
      // 成功创建 (状态码 201)
      alert('反馈提交成功！');
      // 可以在这里清空输入框或给出其他成功提示
    } else {
      // API返回错误
      alert(`提交失败: ${result.message}`);
    }
  } catch (error) {
    // 网络或其他意外错误
    console.error('提交反馈时发生网络错误:', error);
    alert('发生意外错误，请稍后再试。');
  }
}

// 示例用法 1：带标题
// const userInput = "这是我的第一条测试反馈。";
// const userTitle = "关于首页的建议";
// submitFeedback(userInput, userTitle);

// 示例用法 2：不带标题
// submitFeedback("这条反馈没有自定义标题。");



</script>

<template>

<el-dialog
    v-model="dialogVisible"
    width="450px"
    class="custom-dialog"
    destroy-on-close
    align-center
  >
    <template #header>
      <div class="dialog-header">
        <span style="font-size: 20px; font-weight: bold;">意见反馈</span>
      </div>
    </template>

    <el-form :model="feedbackData" label-position="top" size="large">
      <el-form-item label="您的建议或问题">
        <el-input
          v-model="feedbackData.text"
          type="textarea"
          :rows="4"
          placeholder="请详细描述您遇到的问题或建议..."
          resize="none"
        />
      </el-form-item>

      <el-form-item label="联系方式（可选）">
        <el-input
          v-model="feedbackData.username"
          placeholder="请输入您的联系方式，以便我们联系您"
        >
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitFeedback(feedbackData.text, feedbackData.username)"
          color="#1e1e1e"
        >
          提交反馈
        </el-button>
        </div>
    </template>
  </el-dialog>
  <header-nav />
  <div class="contentContainer">
    <div class="content">
      <router-view />
    </div>
  </div>
  <footer-content />
</template>

<style scoped>
.contentContainer {
  width: 100%;
}

.content {
  margin: 0 auto;
  width: min(100%, 1920px);
  min-height: calc(100vh - 4em);
}
/* 一些微调样式 */
.dialog-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-right: 20px; /* 防止标题碰到关闭按钮 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
  padding-top: 10px;
}
</style>
