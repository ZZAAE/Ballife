// 하이브리드(Capacitor) 런타임 초기화.
// - 웹/네이티브 공통: 온라인/오프라인 감지 토스트
// - 네이티브 전용: 상태바, 스플래시 숨김, 안드로이드 백버튼, 키보드 리사이즈,
//   토큰/프로필을 SecureStorage(Preferences)에 미러링(웹뷰 저장소 초기화 대비)
//
// 모든 네이티브 호출은 Capacitor.isNativePlatform() 으로 분기하므로
// 일반 웹(브라우저)에서도 안전하게 동작한다. 기존 인증 로직(localStorage 기반)은
// 그대로 두고, 네이티브에서만 Preferences 로 보강한다.

import toast from "react-hot-toast";
import { Capacitor } from "@capacitor/core";
import { ACCESS_TOKEN_KEY, USER_KEY } from "../api/api";

let started = false;

/** 웹/네이티브 공통 온라인·오프라인 감지 */
function initNetworkBanner() {
  let offlineToastId = null;
  const goOffline = () => {
    if (offlineToastId) return;
    offlineToastId = toast.error("오프라인 상태입니다. 네트워크를 확인해 주세요.", {
      duration: Infinity,
    });
  };
  const goOnline = () => {
    if (offlineToastId) {
      toast.dismiss(offlineToastId);
      offlineToastId = null;
      toast.success("다시 연결되었습니다.");
    }
  };
  window.addEventListener("offline", goOffline);
  window.addEventListener("online", goOnline);
  if (typeof navigator !== "undefined" && navigator.onLine === false) goOffline();
}

/** 네이티브에서 토큰/프로필을 Preferences 에 미러링하고 startup 시 복원 */
async function initSecureTokenMirror() {
  const { Preferences } = await import("@capacitor/preferences");
  const { App } = await import("@capacitor/app");

  const sync = async (key) => {
    const ls = localStorage.getItem(key);
    if (ls != null && ls !== "") {
      // 로컬에 값이 있으면 보안 저장소로 보존
      await Preferences.set({ key, value: ls });
    } else {
      // 로컬이 비었으면(웹뷰 저장소 초기화 등) 보안 저장소에서 복원
      const { value } = await Preferences.get({ key });
      if (value != null && value !== "") localStorage.setItem(key, value);
    }
  };

  await sync(ACCESS_TOKEN_KEY);
  await sync(USER_KEY);

  // 백그라운드 전환 시 현재 토큰/프로필을 보안 저장소에 저장
  App.addListener("appStateChange", async ({ isActive }) => {
    if (isActive) return;
    for (const key of [ACCESS_TOKEN_KEY, USER_KEY]) {
      const ls = localStorage.getItem(key);
      if (ls != null && ls !== "") await Preferences.set({ key, value: ls });
      else await Preferences.remove({ key });
    }
  });
}

/** 안드로이드 하드웨어/제스처 백버튼: 히스토리 있으면 뒤로, 없으면 종료 확인 */
async function initBackButton() {
  const { App } = await import("@capacitor/app");
  let lastBackAt = 0;
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack || window.history.length > 1) {
      window.history.back();
      return;
    }
    // 최상위 화면: 2초 내 두 번 누르면 종료
    const now = Date.now();
    if (now - lastBackAt < 2000) {
      App.exitApp();
    } else {
      lastBackAt = now;
      toast("한 번 더 누르면 종료됩니다.");
    }
  });
}

/** 상태바: 웹뷰가 상태바 아래에서 시작하도록(노치 영역 네이티브 처리) */
async function initStatusBar() {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlays: false });
    await StatusBar.setStyle({ style: Style.Dark }); // 어두운 헤더 → 밝은 아이콘
  } catch {
    /* 일부 기기/플랫폼 미지원 시 무시 */
  }
}

/** 키보드: 입력창이 가려지지 않도록 네이티브 리사이즈 */
async function initKeyboard() {
  try {
    const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
  } catch {
    /* 미지원 무시 */
  }
}

/** 스플래시: 앱 마운트 후 숨김(흰 화면 노출 방지) */
async function hideSplash() {
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* 무시 */
  }
}

export async function initAppRuntime() {
  if (started) return;
  started = true;

  initNetworkBanner();

  if (!Capacitor.isNativePlatform()) return;

  await Promise.allSettled([
    initStatusBar(),
    initKeyboard(),
    initBackButton(),
    initSecureTokenMirror(),
  ]);
  await hideSplash();
}
