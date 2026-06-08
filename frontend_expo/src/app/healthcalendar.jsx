import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEKDAY_KO = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

const WEEKDAY_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// 해당 주의 일요일 0시로 정규화
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// 주간 캘린더 컴포넌트
function WeeklyCalendar({ onDayClick }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
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

  const moveWeek = (offset) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + offset * 7);
    setWeekStart(next);
  };

  const monthTitle = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월`;
  const rangeLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${
    days[6].getMonth() + 1
  }/${days[6].getDate()}`;

  return (
    <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      {/* 헤더 */}
      <View className="flex-row justify-between items-center mb-6">
        <Pressable
          onPress={() => moveWeek(-1)}
          className="w-9 h-9 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <Text className="text-[16px] font-bold text-gray-600">{"<"}</Text>
        </Pressable>
        <View className="items-center">
          <Text className="font-bold text-[18px] text-gray-800">
            {monthTitle}
          </Text>
          <Text className="text-[12px] text-gray-400 mt-0.5">{rangeLabel}</Text>
        </View>
        <Pressable
          onPress={() => moveWeek(1)}
          className="w-9 h-9 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <Text className="text-[16px] font-bold text-gray-600">{">"}</Text>
        </Pressable>
      </View>

      {/* 요일 + 날짜 헤더 */}
      <View className="flex-row gap-2 mb-3">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          const dayColor =
            idx === 0
              ? "text-red-400"
              : idx === 6
                ? "text-blue-400"
                : "text-gray-400";
          return (
            <View key={idx} className="flex-1 items-center justify-center py-1.5">
              <Text className={`text-[11px] font-semibold ${dayColor}`}>
                {WEEKDAY_EN[idx]}
              </Text>
              <Text
                className={`text-[14px] font-bold mt-0.5 ${
                  isToday ? "text-emerald-600" : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 요일 칸 */}
      <View className="flex-row gap-2">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          return (
            <Pressable
              key={idx}
              onPress={() =>
                onDayClick?.({
                  year: d.getFullYear(),
                  month: d.getMonth(),
                  day: d.getDate(),
                })
              }
              className={`flex-1 min-h-[140px] rounded-xl border bg-gray-50 p-2 ${
                isToday
                  ? "border-emerald-400 border-2"
                  : "border-gray-100"
              }`}
            />
          );
        })}
      </View>
    </View>
  );
}

// 건강 지표 비교 테이블 (원본 페이지 구성 유지)
function Table() {
  const rows = [
    ["혈당", "118 mg/dL", "112 mg/dL", "+6 개선"],
    ["혈압", "125 mmHg", "118 mmHg", "+7 개선"],
    ["체중", "78.5 kg", "78.0 kg", "-0.5 kg"],
    ["운동", "3회", "5회", "+2회"],
    ["식사", "72점", "85점", "+13점"],
    ["수면", "85%", "100%", "+15%"],
  ];

  return (
    <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <Text className="font-bold text-gray-800 mb-4 text-[16px]">
        이번주의 나는 얼마나 건강해졌을까요?
      </Text>

      {/* 헤더 */}
      <View className="flex-row border-b border-gray-100 pb-3">
        <Text className="flex-1 text-[12px] font-semibold text-gray-400">
          항목
        </Text>
        <Text className="flex-1 text-[12px] font-semibold text-gray-400">
          지난 주
        </Text>
        <Text className="flex-1 text-[12px] font-semibold text-gray-400">
          이번 주
        </Text>
        <Text className="flex-1 text-[12px] font-semibold text-gray-400">
          변화
        </Text>
      </View>
      {rows.map((r, i) => (
        <View
          key={i}
          className="flex-row py-3 border-b border-gray-50 items-center"
        >
          <Text className="flex-1 text-[13px] font-medium text-gray-700">
            {r[0]}
          </Text>
          <Text className="flex-1 text-[13px] text-gray-700">{r[1]}</Text>
          <Text className="flex-1 text-[13px] font-semibold text-gray-900">
            {r[2]}
          </Text>
          <Text
            className={`flex-1 text-[13px] font-bold ${
              r[3].includes("-") ? "text-blue-500" : "text-green-500"
            }`}
          >
            {r[3]}
          </Text>
        </View>
      ))}

      <View className="mt-5 bg-green-50 p-4 rounded-xl flex-row items-center gap-1.5">
        <Text>👍</Text>
        <Text className="text-green-700 text-[12px] font-semibold">
          전체적으로 개선되고 있습니다! 아주 멋진 변화예요.
        </Text>
      </View>
    </View>
  );
}

// 우측 사이드바 (원본 페이지 구성 유지)
function Sidebar() {
  const perf = [
    ["식단 건강", 82],
    ["혈당 안정도", 50],
    ["수면 리듬", 65],
    ["체력 지수", 100],
    ["운동 수행", 75],
  ];
  const weekly = [20, 40, 30, 60, 50, 80, 90];
  const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <View className="gap-4">
      <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <Text className="font-bold text-gray-800 mb-4 text-[14px]">
          월간 종합 성과
        </Text>
        {perf.map(([label, val], i) => (
          <View key={i} className="mb-3.5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-[12px] font-medium text-gray-500">
                {label}
              </Text>
              <Text className="text-[12px] font-bold text-gray-800">
                {val}%
              </Text>
            </View>
            <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <View
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${val}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="bg-gray-900 rounded-2xl p-5">
        <Text className="font-bold text-white mb-1.5 text-[14px]">주간 분석</Text>
        <Text className="text-[12px] text-gray-400 mb-4 font-medium">
          🔥 7일 연속 운동 달성 중!
        </Text>
        <View className="flex-row items-end justify-between gap-2.5 h-24 pt-2">
          {weekly.map((h, i) => (
            <View key={i} className="flex-1 items-center gap-1.5">
              <View className="w-full bg-gray-800 rounded-t h-20 justify-end">
                <View
                  className="bg-blue-400 w-full rounded-t"
                  style={{ height: `${h}%` }}
                />
              </View>
              <Text className="text-[10px] text-gray-500 font-medium">
                {weekLabels[i]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// 일별 타임라인 (DailyTimelineModal 대체 — 인라인 RN Modal)
function DailyTimelineModal({ data, onClose }) {
  if (!data) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-[20px] p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-bold text-[#0F172A]">
              {data.date}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text className="text-[16px] text-[#64748B]">닫기</Text>
            </Pressable>
          </View>
          <Text className="text-[14px] text-[#64748B] mb-2">
            {data.month} {data.day}
          </Text>
          <Text className="text-[13px] text-[#94A3B8]">
            선택한 날짜의 상세 기록은 전체 기록 관리에서 확인할 수 있습니다.
          </Text>
          <View className="h-4" />
        </View>
      </View>
    </Modal>
  );
}

export default function HealthCalendarPage() {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const handleDayClick = (dayInfo) => {
    setSelectedDayInfo(dayInfo);
    setIsTimelineOpen(true);
  };

  const timelineData = useMemo(() => {
    if (!selectedDayInfo) return null;
    const { year, month, day } = selectedDayInfo;
    const dateObj = new Date(year, month, day);
    return {
      month: `${month + 1}월`,
      day: WEEKDAY_KO[dateObj.getDay()],
      date: `${year}년 ${month + 1}월 ${day}일`,
    };
  }, [selectedDayInfo]);

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView>
        <View className="px-4 py-8 sm:px-6">
          <View className="mb-8">
            <Text className="text-[26px] font-bold text-gray-900">
              건강 지표 관리 캘린더
            </Text>
            <Text className="text-[14px] text-gray-500 mt-1.5">
              지난 한 달간의 수치와 활동을 추적하고 분석한 스마트 리포트입니다.
            </Text>
          </View>

          <View className="gap-6">
            <WeeklyCalendar onDayClick={handleDayClick} />
            <Table />
            <Sidebar />
          </View>
        </View>
      </ScrollView>

      {isTimelineOpen && (
        <DailyTimelineModal
          data={timelineData}
          onClose={() => setIsTimelineOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
