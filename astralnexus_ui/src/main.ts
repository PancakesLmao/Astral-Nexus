import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/shared/assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth store after Pinia is ready
import { useAuthStore } from './shared/stores/auth'
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
