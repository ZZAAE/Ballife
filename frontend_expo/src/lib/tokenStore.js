// 액세스 토큰 저장소.
// - 보안 저장: expo-secure-store(iOS Keychain / Android Keystore)
// - 동기 읽기: axios 요청 인터셉터가 동기로 토큰을 읽어야 하므로 메모리 캐시 유지
//
// 웹(Expo Web)에서는 SecureStore 가 지원되지 않을 수 있어 try/catch 로 보호한다.

import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "accessToken";

let cachedToken = null;
let hydrated = false;

/** 앱 시작 시 보안 저장소에서 토큰을 메모리로 로드 */
export async function hydrateToken() {
  if (hydrated) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  hydrated = true;
  return cachedToken;
}

/** 동기 토큰 조회 (인터셉터용) */
export function getToken() {
  return cachedToken;
}

export async function setToken(token) {
  cachedToken = token || null;
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, String(token));
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* 웹 등 미지원 환경 무시 (메모리 캐시는 유지) */
  }
}

export async function clearToken() {
  cachedToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* 무시 */
  }
}
