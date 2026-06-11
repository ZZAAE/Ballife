import api from "./api";
import { ACCESS_TOKEN_KEY } from "./api";

// axios baseURL 과 동일 — 조용한 백그라운드 폴링(raw fetch)에 사용
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const notificationApi = {
  // 내 알림 목록(최신순)
  getNotifications: () => {
    return api.get(`/notifications`);
  },

  // 안 읽은 알림 개수 — 헤더 배지 백그라운드 폴링용.
  // 공용 axios 인터셉터는 모든 에러에 toast 를 띄우므로, 폴링 실패가 토스트로
  // 도배되지 않도록 health 체크와 동일하게 raw fetch 로 조용히 처리한다.
  // 실패 시 null 을 돌려주고 호출부에서 무시한다.
  getUnreadCountSilently: async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return null;
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return typeof data?.count === "number" ? data.count : null;
    } catch {
      return null;
    }
  },

  // 단건 읽음 처리
  markAsRead: (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  // 전체 읽음 처리
  markAllAsRead: () => {
    return api.patch(`/notifications/read-all`);
  },
};

export default notificationApi;
