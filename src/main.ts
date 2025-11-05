import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

const pinia = createPinia()
app.use(router)

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
