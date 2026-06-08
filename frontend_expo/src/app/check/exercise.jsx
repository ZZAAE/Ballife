import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getExercisesInRange } from "../../api/exerciseApi";
import {
  dbExerciseToRecord,
  hydrateExerciseSessions,
  ICON_BY_TYPE,
} from "../../lib/exerciseRecords";
import toast from "../../lib/toast";
import ExerciseModal from "../../components/modals/ExerciseModal";

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
  const h = date.getHours();
  const m = date.getMinutes();
  const isPM = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${isPM ? "오후" : "오전"} ${h12}:${String(m).padStart(2, "0")}`;
}

function formatDateLabel(date) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
}

function formatWeekRangeLabel(start) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`;
}

/* ---------- 컴포넌트 ---------- */
function WeekSelector({
  weekStart,
  selectedDate,
  sessionsInWeek,
  onSelectDate,
  onMoveWeek,
}) {
  const WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
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
    [weekStart]
  );

  return (
    <View className="rounded-2xl bg-white border border-[#E5E7EB] px-4 py-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => onMoveWeek(-1)}
          className="rounded-full p-1.5"
          hitSlop={8}
        >
          <Text className="text-[16px] text-gray-500">{"<"}</Text>
        </Pressable>
        <Text className="text-[14px] font-semibold text-gray-700">
          {formatWeekRangeLabel(weekStart)}
        </Text>
        <Pressable
          onPress={() => onMoveWeek(1)}
          className="rounded-full p-1.5"
          hitSlop={8}
        >
          <Text className="text-[16px] text-gray-500">{">"}</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2">
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
            <Pressable
              key={idx}
              onPress={() => onSelectDate(d)}
              className={`flex-1 items-center gap-1 py-2 rounded-2xl ${
                isSelected
                  ? "bg-gray-900"
                  : isToday
                    ? "bg-emerald-50 border-2 border-emerald-400"
                    : ""
              }`}
            >
              <View
                className={`h-1.5 w-1.5 rounded-full ${
                  hasActivity && !isSelected ? "bg-emerald-500" : "bg-transparent"
                }`}
              />
              <Text
                className={`text-[11px] font-semibold ${
                  isSelected
                    ? "text-gray-300"
                    : isToday
                      ? "text-emerald-600"
                      : dayColor
                }`}
              >
                {WEEK_KO[idx]}
              </Text>
              <Text
                className={`text-[14px] font-bold ${
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
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SummaryCard({ label, totalSec, sessions, kcal }) {
  return (
    <View className="rounded-2xl bg-white border border-[#E5E7EB] px-5 py-5">
      <Text className="text-[14px] font-semibold text-gray-500">{label}</Text>
      <View className="mt-2 flex-row items-end justify-between gap-3">
        <Text className="text-[34px] font-extrabold text-sky-500">
          {formatDuration(totalSec)}
        </Text>
        <View className="flex-row items-baseline gap-3 pb-1">
          <Text className="text-[14px] text-gray-500">
            <Text className="font-semibold text-gray-700">{sessions}</Text> 세션
          </Text>
          <Text className="text-[14px] text-pink-500">
            <Text className="font-bold">{kcal}</Text> kcal
          </Text>
        </View>
      </View>
    </View>
  );
}

function SessionRow({ session, onPress }) {
  const emoji =
    ICON_BY_TYPE[session.iconType] ?? (session.kind === "cardio" ? "🚶" : "🏋️");
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-4 py-3">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
        <Text className="text-[22px]">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-bold text-gray-800">
          {session.name}
        </Text>
        <Text className="mt-0.5 text-[14px] font-semibold text-amber-500">
          {session.kind === "cardio"
            ? session.distanceKm != null
              ? `${session.distanceKm.toFixed(2)} km`
              : "—"
            : session.sets != null && session.reps != null
              ? `${session.sets} Sets · ${session.reps}회`
              : "—"}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[16px] font-bold text-sky-500">
          {formatDuration(session.durationSec)}
        </Text>
        <Text className="mt-0.5 text-[12px] text-gray-400">
          {formatTimeOfDay(session.date)}
        </Text>
      </View>
    </Pressable>
  );
}

function DaySection({ date, sessions, onSelectSession }) {
  const totalSec = sessions.reduce((acc, s) => acc + s.durationSec, 0);
  const kcal = sessions.reduce((acc, s) => acc + s.calories, 0);
  return (
    <View className="rounded-2xl bg-white border border-[#E5E7EB] px-5 py-4">
      <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
        <Text className="text-[14px] font-semibold text-gray-700">
          {formatDateLabel(date)}
        </Text>
        <View className="flex-row items-baseline gap-3">
          <Text className="text-[14px] font-bold text-sky-500">
            {formatDuration(totalSec)}
          </Text>
          <Text className="text-[14px] font-bold text-pink-500">{kcal} kcal</Text>
        </View>
      </View>
      <View>
        {sessions.map((s, idx) => (
          <View
            key={s.id}
            className={idx > 0 ? "border-t border-gray-100" : ""}
          >
            <SessionRow session={s} onPress={() => onSelectSession?.(s)} />
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- 메인 페이지 ---------- */
export default function ExercisePage() {
  const { user } = useAuth();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [filterDay, setFilterDay] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"
  const [storedSessions, setStoredSessions] = useState([]);
  const userId = user?.userId ?? user?.id ?? null;

  // 운동 등록/수정 모달 (allRecord.jsx 패턴)
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // undefined/null = 신규

  const openAddExercise = () => {
    setEditTarget(null);
    setExerciseModalOpen(true);
  };

  // 기존 세션 행 → 수정 모드. session 객체가 곧 ExerciseModal 의 editTarget.
  const openEditExercise = (session) => {
    setEditTarget(session);
    setExerciseModalOpen(true);
  };

  const closeExerciseModal = () => {
    setExerciseModalOpen(false);
    setEditTarget(null);
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
        formatYmd(end)
      );
      const records = (list || []).map(dbExerciseToRecord);
      setStoredSessions(hydrateExerciseSessions(records));
    } catch (error) {
      console.error("[ExercisePage] fetchWeek failed:", error);
      toast.error(`운동 기록 조회 실패: ${error.message || error}`);
      setStoredSessions([]);
    }
  }, [userId, weekStart]);

  // web 의 visibilitychange/focus + custom event → 단순 주기적 새로고침
  useEffect(() => {
    if (!userId) return undefined;
    void fetchWeek();
    const interval = setInterval(() => {
      void fetchWeek();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchWeek, userId]);

  const thisWeekSessions = useMemo(
    () => storedSessions.filter((session) => sameWeek(session.date, viewDate)),
    [storedSessions, viewDate]
  );

  const thisWeekStats = useMemo(() => {
    const totalSec = thisWeekSessions.reduce((a, s) => a + s.durationSec, 0);
    const kcal = thisWeekSessions.reduce((a, s) => a + s.calories, 0);
    return { totalSec, sessions: thisWeekSessions.length, kcal };
  }, [thisWeekSessions]);

  const visibleSessions = useMemo(() => {
    if (!filterDay) return thisWeekSessions;
    return thisWeekSessions.filter((s) => sameDay(s.date, filterDay));
  }, [thisWeekSessions, filterDay]);

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
    setFilterDay((prev) => (prev && sameDay(prev, d) ? null : d));
  };

  const handleMoveWeek = (offset) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + offset * 7);
    setViewDate(next);
    setFilterDay(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView>
        <View className="px-4 py-8 sm:px-6">
          <View className="mb-6">
            <Text className="text-[26px] font-extrabold text-[#0F172A]">
              운동 기록
            </Text>
            <Text className="mt-1 text-[14px] text-gray-500">
              지난 운동 변화를 분석한 결과입니다.
            </Text>
          </View>

          <View className="gap-4">
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
            <View className="flex-row items-center justify-end gap-2">
              <Text className="text-[12px] text-gray-400">정렬</Text>
              <View className="flex-row rounded-full border border-gray-200 bg-white p-0.5">
                <Pressable
                  onPress={() => setSortOrder("desc")}
                  className={`rounded-full px-3 py-1 ${
                    sortOrder === "desc" ? "bg-gray-900" : ""
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      sortOrder === "desc" ? "text-white" : "text-gray-500"
                    }`}
                  >
                    최신순
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSortOrder("asc")}
                  className={`rounded-full px-3 py-1 ${
                    sortOrder === "asc" ? "bg-gray-900" : ""
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      sortOrder === "asc" ? "text-white" : "text-gray-500"
                    }`}
                  >
                    오래된순
                  </Text>
                </Pressable>
              </View>
            </View>

            {dayGroups.length > 0 ? (
              dayGroups.map((g) => (
                <DaySection
                  key={g.date.toISOString()}
                  date={g.date}
                  sessions={g.sessions}
                  onSelectSession={openEditExercise}
                />
              ))
            ) : (
              <View className="rounded-2xl bg-white border border-[#E5E7EB] px-5 py-10">
                <Text className="text-center text-[14px] text-gray-400">
                  {filterDay
                    ? "선택한 날짜의 기록이 없습니다."
                    : "이번 주 기록이 없습니다."}
                </Text>
              </View>
            )}

            {/* 운동 추가 버튼 → ExerciseModal (신규 등록) */}
            <Pressable
              onPress={openAddExercise}
              className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-[#1a1a2e] px-5 py-5"
            >
              <Text className="text-[15px] font-bold text-white">+ 운동 추가</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ExerciseModal
        visible={exerciseModalOpen}
        onClose={closeExerciseModal}
        onSaved={() => fetchWeek()}
        date={filterDay ? formatYmd(filterDay) : formatYmd(new Date())}
        editTarget={editTarget}
      />
    </SafeAreaView>
  );
}
