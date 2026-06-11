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
      // 프론트(:5173)의 상대경로 /api 요청을 백엔드(:8080)로 전달.
      // 운영에선 nginx 가 /api 를 백엔드로 프록시하므로(VITE_API_BASE_URL=/api),
      // 로컬 dev 에서도 동일하게 동작시키기 위한 설정. 백엔드가 /api 프리픽스를
      // 기대하므로(@RequestMapping("/api/...")) 경로 rewrite 는 하지 않는다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 백엔드(:8080)에 저장된 업로드 이미지를 프론트(:5173)에서 그대로 노출
      // 예: <img src="/uploads/meal/2026/05/29/xxx.jpg" />
      //     → 실제로는 http://localhost:8080/uploads/... 로 프록시됨
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
