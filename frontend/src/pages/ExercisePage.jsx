import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import ExerciseModal from "../modals/ExerciseModal";
import { useAuth } from "../contexts/AuthContext";
import { getExercisesInRange } from "../api/exerciseApi";
import {
  dbExerciseToRecord,
  exerciseDisplayName,
  hydrateExerciseSessions,
  ICON_BY_TYPE,
} from "../utils/exerciseRecords";
import { formatTime } from "../utils/format";

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ---------- 유틸 ---------- */
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function sameWeek(a, b) {
  return startOfWeek(a).getTime() === startOfWeek(b).getTime();
}

function formatDuration(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimeOfDay(date) {
  return formatTime(date);
}

function formatDateLabel(date) {
  const dayNames = [
    i18n.t("exercisePage.weekday.sun"),
    i18n.t("exercisePage.weekday.mon"),
    i18n.t("exercisePage.weekday.tue"),
    i18n.t("exercisePage.weekday.wed"),
    i18n.t("exercisePage.weekday.thu"),
    i18n.t("exercisePage.weekday.fri"),
    i18n.t("exercisePage.weekday.sat"),
  ];
  return i18n.t("exercisePage.dateLabel", {
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: dayNames[date.getDay()],
  });
}

function formatWeekRangeLabel(start) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return i18n.t("exercisePage.weekRange", {
    startMonth: start.getMonth() + 1,
    startDay: start.getDate(),
    endDay: end.getDate(),
  });
}

/* ---------- 컴포넌트 ---------- */
function WeekSelector({
  weekStart,
  selectedDate,
  sessionsInWeek,
  onSelectDate,
  onMoveWeek,
}) {
  const { t } = useTranslation();
  const WEEK_KO = [
    t("exercisePage.weekday.sun"),
    t("exercisePage.weekday.mon"),
    t("exercisePage.weekday.tue"),
    t("exercisePage.weekday.wed"),
    t("exercisePage.weekday.thu"),
    t("exercisePage.weekday.fri"),
    t("exercisePage.weekday.sat"),
  ];
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => onMoveWeek(-1)}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          aria-label={t("exercisePage.prevWeek")}
        >
          {"<"}
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {formatWeekRangeLabel(weekStart)}
        </span>
        <button
          onClick={() => onMoveWeek(1)}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          aria-label={t("exercisePage.nextWeek")}
        >
          {">"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const isSelected = selectedDate ? sameDay(d, selectedDate) : false;
          const isToday = sameDay(d, today);
          const hasActivity = sessionsInWeek.some((s) => sameDay(s.date, d));
          const dayColor =
            idx === 0
              ? "text-red-400"
              : idx === 6
                ? "text-blue-400"
                : "text-gray-400";
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(d)}
              className={`flex flex-col items-center gap-1 py-2 rounded-2xl transition ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : isToday
                    ? "bg-emerald-50 ring-2 ring-emerald-400"
                    : "hover:bg-gray-50"
              }`}
            >
              {/* 요일 위쪽: 활동 점 (없을 땐 자리만 유지) */}
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasActivity && !isSelected
                    ? "bg-emerald-500"
                    : "bg-transparent"
                }`}
              />

              {/* 요일 라벨 (오늘이어도 SUN/MON/... 유지) */}
              <span
                className={`text-[11px] font-semibold ${
                  isSelected
                    ? "text-gray-300"
                    : isToday
                      ? "text-emerald-600"
                      : dayColor
                }`}
              >
                {WEEK_KO[idx]}
              </span>

              {/* 날짜 숫자 */}
              <span
                className={`text-sm font-bold ${
                  isSelected
                    ? "text-white"
                    : isToday
                      ? "text-emerald-700"
                      : idx === 0
                        ? "text-red-500"
                        : idx === 6
                          ? "text-blue-500"
                          : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ label, totalSec, sessions, kcal }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm">
      <div className="text-sm font-semibold text-gray-500">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="text-3xl font-extrabold text-sky-500 sm:text-4xl">
          {formatDuration(totalSec)}
        </span>
        <div className="flex items-baseline gap-3 pb-1 text-sm">
          <span className="text-gray-500">
            <span className="font-semibold text-gray-700">{sessions}</span>{" "}
            {t("exercisePage.sessions")}
          </span>
          <span className="text-pink-500">
            <span className="font-bold">{kcal}</span> kcal
          </span>
        </div>
      </div>
    </div>
  );
}

function SessionRow({ session, onClick }) {
  const { t } = useTranslation();
  const emoji =
    ICON_BY_TYPE[session.iconType] ?? (session.kind === "cardio" ? "🚶" : "🏋️");
  return (
    <button
      type="button"
      onClick={() => onClick?.(session)}
      className="flex w-full items-center gap-4 py-3 text-left transition hover:bg-gray-50"
      aria-label={t("exercisePage.editSession")}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold text-gray-800">
          {exerciseDisplayName(session)}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-amber-500">
          {session.kind === "cardio"
            ? session.distanceKm != null
              ? `${session.distanceKm.toFixed(2)} km`
              : "—"
            : session.sets != null && session.reps != null
              ? t("exercisePage.setsReps", {
                  sets: session.sets,
                  reps: session.reps,
                })
              : "—"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-bold text-sky-500">
          {formatDuration(session.durationSec)}
        </div>
        <div className="mt-0.5 text-xs text-gray-400">
          {formatTimeOfDay(session.date)}
        </div>
      </div>
    </button>
  );
}

function DaySection({ date, sessions, onSelectSession }) {
  const totalSec = sessions.reduce((acc, s) => acc + s.durationSec, 0);
  const kcal = sessions.reduce((acc, s) => acc + s.calories, 0);
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <span className="text-sm font-semibold text-gray-700">
          {formatDateLabel(date)}
        </span>
        <div className="flex items-baseline gap-3 text-sm">
          <span className="font-bold text-sky-500">
            {formatDuration(totalSec)}
          </span>
          <span className="font-bold text-pink-500">{kcal} kcal</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {sessions.map((s) => (
          <SessionRow key={s.id} session={s} onClick={onSelectSession} />
        ))}
      </div>
    </div>
  );
}

/* ---------- 메인 페이지 ---------- */
function ExercisePage({ isModalOpen, onCloseModal }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // 보고 있는 주의 기준 날짜 (주 이동용)
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  // 선택된 단일 날짜 필터 — null 이면 전체 주 보기
  const [filterDay, setFilterDay] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"
  const [storedSessions, setStoredSessions] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const userId = user?.userId ?? user?.id ?? null;

  const handleEditSession = (session) => {
    setEditingRecord({
      id: session.id,
      serverId: session.serverId ?? session.id,
      exerciseTypeId: session.exerciseTypeId,
      kind: session.kind,
      dateIso: session.dateIso,
      durationSec: session.durationSec,
      distanceKm: session.distanceKm,
      sets: session.sets,
      reps: session.reps,
      weightKg: session.weightKg,
      intensity: session.intensity,
    });
  };

  const handleCloseEdit = () => {
    setEditingRecord(null);
  };

  const weekStart = useMemo(() => startOfWeek(viewDate), [viewDate]);

  const fetchWeek = useCallback(async () => {
    if (!userId) return;
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    try {
      const list = await getExercisesInRange(
        userId,
        formatYmd(weekStart),
        formatYmd(end),
      );
      console.debug("[ExercisePage] fetched", list);
      const records = (list || []).map(dbExerciseToRecord);
      setStoredSessions(hydrateExerciseSessions(records));
    } catch (error) {
      console.error("[ExercisePage] fetchWeek failed:", error);
      toast.error(
        t("exercisePage.toast.fetchFailed", {
          error: error.message || error,
        }),
      );
      setStoredSessions([]);
    }
  }, [userId, weekStart, t]);

  useEffect(() => {
    if (!userId) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchWeek();
    const onUpdated = () => {
      void fetchWeek();
    };
    window.addEventListener("exercise-records-updated", onUpdated);
    return () =>
      window.removeEventListener("exercise-records-updated", onUpdated);
  }, [fetchWeek, userId]);

  // 선택 주(일~토)에 해당하는 세션
  const thisWeekSessions = useMemo(
    () => storedSessions.filter((session) => sameWeek(session.date, viewDate)),
    [storedSessions, viewDate],
  );

  const thisWeekStats = useMemo(() => {
    const totalSec = thisWeekSessions.reduce((a, s) => a + s.durationSec, 0);
    const kcal = thisWeekSessions.reduce((a, s) => a + s.calories, 0);
    return { totalSec, sessions: thisWeekSessions.length, kcal };
  }, [thisWeekSessions]);

  // 화면에 보일 세션: filterDay 가 있으면 그날만, 없으면 주 전체
  const visibleSessions = useMemo(() => {
    if (!filterDay) return thisWeekSessions;
    return thisWeekSessions.filter((s) => sameDay(s.date, filterDay));
  }, [thisWeekSessions, filterDay]);

  // 날짜별 그룹핑 + 정렬
  const dayGroups = useMemo(() => {
    const map = new Map();
    for (const s of visibleSessions) {
      const key = `${s.date.getFullYear()}-${s.date.getMonth()}-${s.date.getDate()}`;
      if (!map.has(key)) map.set(key, { date: new Date(s.date), sessions: [] });
      map.get(key).sessions.push(s);
    }
    const dir = sortOrder === "desc" ? -1 : 1;
    return Array.from(map.values())
      .sort((a, b) => (a.date - b.date) * dir)
      .map((g) => ({
        ...g,
        sessions: g.sessions.sort((a, b) => (a.date - b.date) * dir),
      }));
  }, [visibleSessions, sortOrder]);

  const handleSelectDay = (d) => {
    // 같은 날짜 다시 클릭하면 해제, 다른 날이면 그 날로 필터
    setFilterDay((prev) => (prev && sameDay(prev, d) ? null : d));
  };

  const handleMoveWeek = (offset) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + offset * 7);
    setViewDate(next);
    setFilterDay(null); // 주를 옮기면 필터 해제
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen bg-gray-50 pt-[55px] text-gray-900">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
                {t("exercisePage.title")}
              </h1>
              <p className="mb-8 text-sm text-gray-500">
                {t("exercisePage.subtitle")}
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-4">
            <WeekSelector
              weekStart={weekStart}
              selectedDate={filterDay}
              sessionsInWeek={thisWeekSessions}
              onSelectDate={handleSelectDay}
              onMoveWeek={handleMoveWeek}
            />

            <SummaryCard
              label={formatWeekRangeLabel(weekStart)}
              totalSec={thisWeekStats.totalSec}
              sessions={thisWeekStats.sessions}
              kcal={thisWeekStats.kcal}
            />

            {/* 정렬 토글 */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-gray-400">
                {t("exercisePage.sort")}
              </span>
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSortOrder("desc")}
                  className={`rounded-full px-3 py-1 transition ${
                    sortOrder === "desc"
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t("exercisePage.sortNewest")}
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder("asc")}
                  className={`rounded-full px-3 py-1 transition ${
                    sortOrder === "asc"
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t("exercisePage.sortOldest")}
                </button>
              </div>
            </div>

            {dayGroups.length > 0 ? (
              dayGroups.map((g) => (
                <DaySection
                  key={g.date.toISOString()}
                  date={g.date}
                  sessions={g.sessions}
                  onSelectSession={handleEditSession}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-400 shadow-sm">
                {filterDay
                  ? t("exercisePage.emptyDay")
                  : t("exercisePage.emptyWeek")}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExerciseModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSaved={fetchWeek}
      />

      <ExerciseModal
        isOpen={!!editingRecord}
        onClose={handleCloseEdit}
        onSaved={fetchWeek}
        editingRecord={editingRecord}
      />
    </div>
  );
}

export default ExercisePage;
