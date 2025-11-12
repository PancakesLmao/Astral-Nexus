import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../shared/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '../shared/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth after Pinia is set up
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
