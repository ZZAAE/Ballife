// AI 서비스(FastAPI) 베이스 URL.
// 운영: /ai 를 사용하면 nginx가 AI 서버로 프록시한다.
// 개발에서 직접 AI 서버를 호출해야 할 때만 .env.local에 VITE_AI_BASE_URL을 지정한다.
export const AI_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AI_BASE_URL) ||
  "/ai";

export default AI_BASE_URL;