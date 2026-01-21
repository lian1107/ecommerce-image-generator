import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/styles/main.css'
import './assets/styles/accessibility.css'
import { initAccessibilityLiveRegion } from './utils/accessibility'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')

// 初始化可访问性支持
initAccessibilityLiveRegion()
