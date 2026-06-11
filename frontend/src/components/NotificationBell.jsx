import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import notificationApi from "../api/notificationApi";

const TOKENS = {
  brand: "#00844a",
  grey1: "#707070",
  grey2: "#8e9097",
  black: "#121212",
};

// 안 읽은 개수 폴링 주기(ms)
const POLL_MS = 30_000;

// createdAt(ISO, 타임존 없음 → 로컬 해석) → "방금 전 / N분 전 / N시간 전 / N일 전"
function useRelativeTime() {
  const { t } = useTranslation();
  return useCallback(
    (iso) => {
      if (!iso) return "";
      const then = new Date(iso).getTime();
      if (Number.isNaN(then)) return "";
      const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
      if (diffSec < 60) return t("notification.time.justNow");
      const min = Math.floor(diffSec / 60);
      if (min < 60) return t("notification.time.minutesAgo", { count: min });
      const hour = Math.floor(min / 60);
      if (hour < 24) return t("notification.time.hoursAgo", { count: hour });
      const day = Math.floor(hour / 24);
      return t("notification.time.daysAgo", { count: day });
    },
    [t]
  );
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const relativeTime = useRelativeTime();

  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  // 안 읽은 개수 백그라운드 폴링 (조용한 fetch — 실패해도 토스트 없음)
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setItems([]);
      setOpen(false);
      return undefined;
    }
    let alive = true;
    const tick = async () => {
      const count = await notificationApi.getUnreadCountSilently();
      if (alive && count != null) setUnreadCount(count);
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [isAuthenticated]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch {
      // 인터셉터가 에러 토스트를 띄우므로 별도 처리 없음
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const messageFor = (n) => {
    const actor = n.actorNickname || "";
    return t(`notification.types.${n.type}`, {
      actor,
      defaultValue: t("notification.types.DEFAULT", { actor }),
    });
  };

  const handleClickItem = async (n) => {
    // 낙관적 읽음 처리
    if (!n.read) {
      setItems((prev) =>
        prev.map((it) => (it.id === n.id ? { ...it, read: true } : it))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationApi.markAsRead(n.id).catch(() => {});
    }
    setOpen(false);
    if (n.postId != null) {
      navigate(`/posts/${n.postId}`);
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((it) => ({ ...it, read: true })));
    setUnreadCount(0);
    notificationApi.markAllAsRead().catch(() => {});
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={t("notification.ariaLabel")}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/25 bg-transparent text-white transition-all duration-200 hover:border-white hover:bg-white hover:text-[#121212]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[17px] w-[17px]"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -right-[3px] -top-[3px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-[4px] text-[10px] font-bold leading-none text-white"
            style={{ backgroundColor: "#e53935" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[340px] overflow-hidden rounded-[10px] bg-white shadow-[0_12px_28px_rgba(18,18,18,0.18)]">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
            <span className="text-[14px] font-semibold" style={{ color: TOKENS.black }}>
              {t("notification.title")}
            </span>
            {items.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[12px] font-medium hover:underline"
                style={{ color: TOKENS.brand }}
              >
                {t("notification.markAllRead")}
              </button>
            )}
          </div>

          {/* 목록 */}
          <ul className="max-h-[400px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-[13px]" style={{ color: TOKENS.grey2 }}>
                …
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-[13px]" style={{ color: TOKENS.grey2 }}>
                {t("notification.empty")}
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClickItem(n)}
                    className="flex w-full items-start gap-2 border-b border-[#f2f2f2] px-4 py-3 text-left transition-colors hover:bg-[#f7faf8]"
                    style={{ backgroundColor: n.read ? "transparent" : "#f0f8f3" }}
                  >
                    {/* 안 읽음 점 */}
                    <span
                      className="mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ backgroundColor: n.read ? "transparent" : TOKENS.brand }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-[13px] leading-snug"
                        style={{ color: TOKENS.black }}
                      >
                        {messageFor(n)}
                      </span>
                      {n.snippet && (
                        <span
                          className="mt-[2px] block truncate text-[12px]"
                          style={{ color: TOKENS.grey1 }}
                        >
                          “{n.snippet}”
                        </span>
                      )}
                      <span
                        className="mt-[3px] block text-[11px]"
                        style={{ color: TOKENS.grey2 }}
                      >
                        {relativeTime(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
