import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      // 로컬 개발: 프론트(:5173) → 백엔드(:8080) API 프록시
      // api.js 기본 baseURL 이 "/api" 라서, .env.local 없이도 로그인 등 API 가 동작한다.
      // (운영은 nginx 가 /api 를 프록시하므로 이 설정과 무관)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 백엔드(:8080)에 저장된 업로드 이미지를 프론트(:5173)에서 그대로 노출
      // 예: <img src="/uploads/meal/2026/05/29/xxx.jpg" />
      //     → 실제로는 http://localhost:8080/uploads/... 로 프록시됨
      '/uploads': {
