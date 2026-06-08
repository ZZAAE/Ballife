# syntax=docker/dockerfile:1

# ============================================================
# Ballife 프론트엔드 이미지
#   1) build  : Node 로 Vite 정적 빌드(dist) 생성
#   2) runtime: nginx 로 dist 서빙 + /api·/uploads 백엔드 프록시
# 빌드 컨텍스트는 frontend/ 디렉터리 기준.
# ============================================================

# ---------- 1) 빌드 스테이지 ----------
# Vite 8 은 Node 20.19+ / 22.12+ 필요 → 22-alpine 사용
FROM node:22-alpine AS build
WORKDIR /app

# 의존성 레이어 캐시: 잠금파일이 바뀔 때만 npm ci 재실행
COPY package.json package-lock.json ./
RUN npm ci

# 소스 전체 복사 후 빌드 (public/Unity 대용량 에셋 포함)
COPY . .

# 운영에서는 같은 도메인의 /api·/ai 로 호출 → nginx 가 백엔드/AI 로 프록시.
# GitHub Actions 에서 --build-arg 로 덮어쓸 수 있음.
ARG VITE_API_BASE_URL=/api
ARG VITE_AI_BASE_URL=/ai
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL
RUN npm run build

# ---------- 2) 런타임 스테이지 ----------
FROM nginx:1.27-alpine AS runtime

# 기본 사이트 설정을 우리 설정으로 교체
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 배치 (Unity 에셋도 dist 안에 함께 포함됨)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
