// AI 서비스(FastAPI) 베이스 URL.
//  - 운영: 빌드 시 VITE_AI_BASE_URL=/ai 로 주입 → nginx 가 ai-service 로 프록시(같은 오리진).
//  - 개발: 미설정 시 localhost:8001 직접 호출.
export const AI_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AI_BASE_URL) ||
  "http://localhost:8001";

export default AI_BASE_URL;
