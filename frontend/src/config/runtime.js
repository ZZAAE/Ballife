// 런타임 엔드포인트 설정 — 모든 백엔드/AI 서비스 주소를 한 곳에서 관리.
//
// 하이브리드(Capacitor) 앱에서는 "localhost" 가 디바이스 자신을 가리키므로
// 개발 PC 의 백엔드에 닿지 않는다. 반드시 .env 로 LAN IP / 운영 도메인을 주입할 것.
//   예) .env
//       VITE_API_BASE_URL=https://api.ballife.example.com/api
//       VITE_AI_SERVICE_BASE_URL=https://ai.ballife.example.com
//
// 미지정 시(웹 로컬 개발용) localhost 로 폴백한다.

const trimTrailingSlash = (u) => (typeof u === "string" ? u.replace(/\/+$/, "") : u);

/** Spring 백엔드 REST API base (예: http://host:8080/api) */
export const API_BASE_URL = trimTrailingSlash(
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080/api",
);

/** FastAPI AI 서비스 base (예: http://host:8001) — 챗봇 / 분석 */
export const AI_SERVICE_BASE_URL = trimTrailingSlash(
  import.meta.env?.VITE_AI_SERVICE_BASE_URL || "http://localhost:8001",
);
