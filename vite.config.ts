import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://west-store.ru',
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://west-store.ru',
        changeOrigin: true,
        secure: true,
      },
      '/sanctum': {
        target: 'https://west-store.ru',
        changeOrigin: true,
        secure: true,
      },
      '/bot': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bot/, ''),
      }
    }
  }
})
