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
