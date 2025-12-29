# gxucpc-tech-web-discussion

## 设置GitHub Personal Token

在项目根目录下创建.env文件，然后添加下面内容到.env中
```sh
GITHUB_TOKEN=github_pat_***********************(YOUR GITHUB PERSONAL TOKEN HERE)
```

## 环境配置

```sh
pnpm add -g vercel
```

### 修改仓库地址

要将comment提交自己的仓库，请修改/api/submit-comment.ts下的内容，为您自己的仓库。
要获取这些配置信息，可以参考[Giscus](https://giscus.app/zh-CN)
```ts
    const repositoryId = 'R_kgDOQwpnQw';
    const categoryId = 'DIC_kwDOQwpnQ84C0WnN';
```

### 热预览项目

```sh
vercel dev
```

## 前端调用 API

前端应用可以通过向我们创建的后端 API 端点发送 `POST` 请求来提交新的评论或反馈。

**API 端点**: `/api/submit-comment`

### 调用示例

下面是一个在 Vue 或任何 JavaScript/TypeScript 项目中如何调用此 API 的示例代码：

```javascript
/**
 * @param {string} commentText - 用户在输入框中填写的评论内容
 */
async function submitFeedback(commentText) {
  // 检查评论内容是否为空
  if (!commentText || commentText.trim() === '') {
    alert('评论内容不能为空！');
    return;
  }

  try {
    const response = await fetch('/api/submit-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 将评论内容放入请求体中
      body: JSON.stringify({ comment: commentText }),
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

// 示例用法：
// const userInput = "这是我的第一条测试反馈。";
// submitFeedback(userInput);
```

您只需要将 `submitFeedback` 函数集成到您的前端组件（例如 `contact.vue`）中，在用户点击“提交”按钮时调用它即可。
