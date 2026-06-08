// 런타임 엔드포인트 설정 (Expo). 모든 백엔드/AI 주소를 한 곳에서 관리.
//
// Expo 에서 클라이언트 노출 환경변수는 EXPO_PUBLIC_ 접두사를 쓴다(.env).
// 실기기에서는 "localhost" 가 기기 자신을 가리키므로, 반드시 PC 의 LAN IP /
// 운영 도메인을 지정할 것.
//   .env 예)
//     EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8080/api
//     EXPO_PUBLIC_AI_SERVICE_BASE_URL=http://192.168.0.10:8001

const trimSlash = (u) => (typeof u === "string" ? u.replace(/\/+$/, "") : u);

export const API_BASE_URL = trimSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
);

export const AI_SERVICE_BASE_URL = trimSlash(
  process.env.EXPO_PUBLIC_AI_SERVICE_BASE_URL || "http://localhost:8001",
);

// Unity WebGL 펫 빌드 호스팅 URL(index.html 포함). 미설정 시 펫 화면은 안내만 표시.
export const UNITY_PET_URL = trimSlash(
  process.env.EXPO_PUBLIC_UNITY_URL || "",
);
