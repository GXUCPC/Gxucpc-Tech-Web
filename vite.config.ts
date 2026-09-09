import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        logoDemo: fileURLToPath(new URL('./logo-demo.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局注入响应式 mixin（src/styles/_mixins.scss），
        // 组件内可直接使用 mobile()/touch() 等语义别名，禁止再手动 @use
        additionalData: `@use "@/styles/_mixins.scss" as *;\n`,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9091/',
        changeOrigin: true,
      },
    },
  },
})
