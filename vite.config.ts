import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// 显式加载 .env.local 到 process.env（供 api/ai-chat.ts 使用）
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')
Object.assign(process.env, env)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    {
      name: 'local-ai-chat-api',
      configureServer(server) {
        server.middlewares.use('/api/ai-chat', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ code: 405, message: 'Method Not Allowed' }))
            return
          }
          try {
            const { handleNodeRequest } = await import('./api/ai-chat')
            await handleNodeRequest(req, res)
          } catch (error) {
            console.error('AI Chat API error:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ code: 500, message: 'Internal Server Error' }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9091/',
        changeOrigin: true,
        bypass(req) {
          const url = (req as { url?: string }).url || ''
          if (url.startsWith('/api/ai-chat')) {
            return url
          }
        },
      },
    },
  },
})
