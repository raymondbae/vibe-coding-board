import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 🔗 로컬 개발용 프록시 서버 설정
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Express 백엔드 포트
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

