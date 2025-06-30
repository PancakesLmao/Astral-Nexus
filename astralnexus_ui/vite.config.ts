import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// Custom plugin to handle subdomain routing
const subdomainPlugin = () => ({
  name: 'subdomain-router',
  configureServer(server: any) {
    server.middlewares.use('/', (req: any, res: any, next: any) => {
      const host = req.headers.host || ''
      const url = req.url || ''

      // Skip asset requests (js, css, images, etc.)
      if (url.includes('.') && !url.endsWith('.html')) {
        return next()
      }

      // Route all requests based on subdomain to appropriate HTML entry point
      if (host.startsWith('blog.')) {
        // For blog subdomain, always serve blog.html and let Vue router handle the routing
        if (!url.includes('/blog.html') && !url.startsWith('/@') && !url.startsWith('/src/')) {
          req.url = '/blog.html'
        }
      } else if (host.startsWith('admin.')) {
        // For admin subdomain, always serve admin.html and let Vue router handle the routing
        if (!url.includes('/admin.html') && !url.startsWith('/@') && !url.startsWith('/src/')) {
          req.url = '/admin.html'
        }
      } else if (
        host.includes('localtest.me') &&
        !host.startsWith('blog.') &&
        !host.startsWith('admin.')
      ) {
        // For root domain, always serve root.html and let Vue router handle the routing
        if (!url.includes('/root.html') && !url.startsWith('/@') && !url.startsWith('/src/')) {
          req.url = '/root.html'
        }
      }

      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), subdomainPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        root: './root.html',
        blog: './blog.html',
        admin: './admin.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['localtest.me', '.localtest.me'],
  },
})
