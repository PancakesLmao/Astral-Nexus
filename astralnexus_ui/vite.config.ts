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
          const pathname = req.url.split('?')[0] // Get path without query params

          // Route HTML requests to appropriate entry point based on subdomain
          // Only rewrite SPA routes, not assets or virtual modules
          const isVueRoute =
            pathname === '/' ||
            pathname === '/index.html' ||
            pathname === '/login' ||
            pathname === '/landing' ||
            (pathname.startsWith('/') &&
              !pathname.includes('.') &&
              !pathname.startsWith('/@') &&
              !pathname.startsWith('/node_modules') &&
              !pathname.includes('virtual:'))

          if (isVueRoute) {
            if (host.startsWith('admin.localtest.me')) {
              req.url = '/admin.html' + req.url.substring(pathname.length)
            } else if (host.startsWith('blog.localtest.me')) {
              req.url = '/blog.html' + req.url.substring(pathname.length)
            } else {
              // Root domain - serve root.html for all non-file requests
              req.url = '/root.html' + req.url.substring(pathname.length)
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
