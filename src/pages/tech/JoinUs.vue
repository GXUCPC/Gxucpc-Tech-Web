


<template>
  <div class="recruitment-overview-container">
    <header class="header">
      <h1 class="title" >🎓 广西大学Icpc集训队技术组招新概要</h1>
      <p class="subtitle" style="color: gray;">致力于培养具备核心竞争力的未来技术人才。</p>
    </header>

    <section class="section">
      <p class="content-text">
        技术组致力于将技术引用到实际。在这里，你可以参与到真实的项目开发，技术组为团队成员提供学习、应用技术的平台，培养具备核心竞争力的技术人才。我们严格遵循业界规范，确保团队产出具有高度的实用性和稳定性。
      </p>
    </section>

    <section class="section">
      <h2 class="section-title">未来个人发展方向选择：</h2>
      <p class="content-text">技术组提供多元化、符合主流工业标准的项目实践方向，成员可根据个人兴趣和职业规划选择以下一个或多个技术赛道：</p>

      <table class="tech-matrix">
        <thead>
          <tr>
            <th>技术方向</th>
            <th>核心学习内容</th>
            <th>实战目标</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>前端开发</td>
            <td>掌握前端框架的搭建，熟悉git团队开发流程，熟悉HTML、CSS、JavaScript,能使用后端api接口实现特定需求。</td>
            <td>设计面向用户的ui，配合后端共同完成项目开发。</td>
          </tr>
          <tr>
            <td>平台运维</td>
            <td>容器化技术（Docker），自动化部署（CI/CD），云计算平台管理。</td>
            <td>掌握服务的弹性伸缩与高可用性保障。</td>
          </tr>
          <tr>
            <td>后端开发</td>
            <td>熟悉至少一种主流编程语言（如Java/Python/Go/Node.js），掌握数据库设计与优化（SQL/NoSQL），理解API设计原则（RESTful/GraphQL），熟悉缓存机制和消息队列。</td>
            <td>撰写技术方案报告，指导项目技术栈升级。</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2 class="section-title">项目开发基础要求</h2>
        <li class="content-text">Git & GitHub：掌握代码的版本管理和协作开发。这是现代软件工程的基石.</li>

        <li class="content-text">一款现代编辑器/IDE：例如Visual Studio Code、IntelliJ IDEA、PyCharm等，提升代码编写效率和质量。</li>
        <li class="content-text">基础的网络概念：不需要很深，但最好能理解HTTP 请求（GET/POST）、API 接口是什么。</li>
        <li class="content-text">基础的命令行操作：了解基本的命令行操作，有助于更高效地使用开发工具和环境。</li>
        <li class="content-text">自学能力：自学能力是技术人员最大的核心素养</li>
        <li class="content-text">团队协作能力：良好的沟通和协作能力，能够与团队成员高效合作，共同完成项目目标。</li>
        <li class="content-text">一门主力编程语言：强烈推荐C/C++，与ACM集训队主线任务无缝衔接，同时也是大一C语言课程的完美预习/复习，学习性价比极高。</li>
        <p class="content-text">另外，有项目开发经验、在ICPC、CCPC等算法竞赛中有过获奖经历者优先。</p>
    </section>

    <section class="section">
      <h2 class="section-title">技术组工作形式</h2>
      <p class="content-text">技术组的一切活动均围绕真实的项目开发展开，没有灌水的讲座和团建，每周六晚例会讨论项目进展。平时的项目开发通过github远程协作，有疑问直接通过工作群共同讨论</p>
      <p class="content-text">组内每个实习生均由指定的组员指导,帮助实习生快速成长。</p>
      <p class="content-text">组内目前有多个项目正在同步推进，欢迎所有想要学习项目开发技术，积累经验的同学加入我们。</p>

    </section>

    <section class="section">
      <h2 class="section-title">联系我们</h2>
      <p class="content-text">如果你对技术组感兴趣，欢迎通过以下方式联系我们投递实习简历：</p>
      <li>github:?</li>
      <li>Email:@?</li>
    </section>
    <footer class="footer">
      <p>期待你的加入</p>
    </footer>
  </div>
</template>

<script setup>
// 内容为静态展示，<script setup> 保持简洁
</script>

<style scoped>
/* 定义一个强调色，在暗色背景下更醒目 */
:root {
  --primary-color: #61dafb; /* 类似 React 的蓝色，或者您可以选择其他亮色 */
  --text-color-light: #f0f0f0;
  --text-color-medium: #b0b0b0;
  --background-card: #2c2c2c;
  --border-color-dark: #444;
}

.recruitment-overview-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  background: var(--background-card); /* 卡片背景色 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); /* 调整阴影使其在暗色背景下可见 */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.7;
  color: var(--text-color-light); /* 默认文本颜色 */
}

.header {
  border-bottom: 3px solid var(--primary-color); /* 强调色 */
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color-light);
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-medium);
  margin-top: 5px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 30px;
  color: var(--primary-color); /* 强调色 */
  border-left: 4px solid var(--primary-color); /* 强调色 */
  padding-left: 10px;
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: 600;
}

.content-text {
  font-size: 20px;
  color: var(--text-color-medium);
  margin-bottom: 15px;
}

/* 技术矩阵表格样式 */
.tech-matrix {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
}

.tech-matrix th, .tech-matrix td {
  border: 1px solid var(--border-color-dark); /* 调整边框颜色 */
  padding: 12px;
  text-align: left;
  color: var(--text-color-light); /* 确保表格文字颜色 */
}

.tech-matrix th {
  background-color: #3a3a3a; /* 表格头部背景 */
  color: var(--text-color-light);
  font-weight: 600;
}
.tech-matrix td {
  background-color: #2c2c2c; /* 表格内容背景 */
}


/* 列表样式 */
.value-list {
  list-style: none;
  padding-left: 0;
}

.value-list li {
  background: #3a3a3a; /* 列表项背景色 */
  margin-bottom: 10px;
  padding: 10px 15px;
  border-left: 5px solid var(--primary-color); /* 强调色 */
  border-radius: 4px;
  font-size: 15px;
  color: var(--text-color-light);
}

.footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px dashed var(--border-color-dark); /* 调整分割线颜色 */
  color: var(--text-color-medium);
  font-style: italic;
}
</style>
