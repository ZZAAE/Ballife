import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // 백엔드(:8080)에 저장된 업로드 이미지를 프론트(:5173)에서 그대로 노출
    // 예: <img src="/uploads/meal/2026/05/29/xxx.jpg" />
    //     → 실제로는 http://localhost:8080/uploads/... 로 프록시됨
    proxy: {
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
