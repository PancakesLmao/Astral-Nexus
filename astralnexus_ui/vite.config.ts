import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    // Custom plugin for subdomain routing
    {
      name: 'subdomain-router',
      configureServer(server: any) {
        server.middlewares.use('/', (req: any, res: any, next: any) => {
          const host = req.headers.host || ''

          // Only intercept root requests
          if (req.url === '/' || req.url === '/index.html') {
            if (host.startsWith('admin.localtest.me')) {
              req.url = '/admin.html'
            } else if (host.startsWith('blog.localtest.me')) {
              req.url = '/blog.html'
            } else {
              req.url = '/root.html'
            }
          }

          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Allow all localtest.me subdomains
    allowedHosts: [
      'localtest.me',
      'blog.localtest.me',
      'admin.localtest.me',
      'api.localtest.me'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        root: 'root.html',
        blog: 'blog.html',
        admin: 'admin.html'
      }
    }
  }
})
