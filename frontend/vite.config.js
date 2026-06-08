import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // 릴리즈 빌드에 소스맵을 남기지 않음(소스 노출 방지)
    sourcemap: false,
  },
  // 프로덕션 빌드(vite build)에서만 console/debugger 제거 → 디버그 로그 유출 방지.
  // 개발 서버(vite)에서는 그대로 두어 디버깅 가능.
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : {},
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
}))
