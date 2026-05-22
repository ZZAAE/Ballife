import React, { useMemo, useState } from "react";
import DailyTimelineModal from "../../modals/DailyTimelineModal";

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
const WeeklyCalendar = ({ onDayClick }) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 이 주의 7일
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 헤더: < 2026년 5월 (주 범위) > */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => moveWeek(-1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
          aria-label="이전 주"
        >
          {"<"}
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-lg text-gray-800">{monthTitle}</h2>
          <span className="text-xs text-gray-400 mt-0.5">{rangeLabel}</span>
        </div>
        <button
          onClick={() => moveWeek(1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
          aria-label="다음 주"
        >
          {">"}
        </button>
      </div>

      {/* 요일 + 날짜 헤더 */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          const dayColor =
            idx === 0
              ? "text-red-400"
              : idx === 6
                ? "text-blue-400"
                : "text-gray-400";
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center py-1.5"
            >
              <span className={`text-[11px] font-semibold ${dayColor}`}>
                {WEEKDAY_EN[idx]}
              </span>
              <span
                className={`text-sm font-bold mt-0.5 ${
                  isToday ? "text-emerald-600" : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* 요일 칸 */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={idx}
              type="button"
              onClick={() =>
                onDayClick?.({
                  year: d.getFullYear(),
                  month: d.getMonth(),
                  day: d.getDate(),
                })
              }
              className={`min-h-[280px] rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-gray-100 ${
                isToday
                  ? "border-emerald-400 ring-2 ring-emerald-400/40"
                  : "border-gray-100"
              }`}
              title={`${d.getMonth() + 1}월 ${d.getDate()}일`}
            />
          );
        })}
      </div>
    </div>
  );
};

// 건강 지표 테이블 컴포넌트
const Table = () => {
  const rows = [
    ["혈당", "118 mg/dL", "112 mg/dL", "+6 개선"],
    ["혈압", "125 mmHg", "118 mmHg", "+7 개선"],
    ["체중", "78.5 kg", "78.0 kg", "-0.5 kg"],
    ["운동", "3회", "5회", "+2회"],
    ["식사", "72점", "85점", "+13점"],
    ["수면", "85%", "100%", "+15%"],
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
      <h3 className="font-bold text-gray-800 mb-4 text-base">
        이번주의 나는 얼마나 건강해졌을까요?
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-left">
            <tr className="border-b border-gray-100">
              <th className="pb-3 font-semibold">항목</th>
              <th className="pb-3 font-semibold">지난 주</th>
              <th className="pb-3 font-semibold">이번 주</th>
              <th className="pb-3 font-semibold">변화</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/40">
                <td className="py-3.5 font-medium">{r[0]}</td>
                <td className="py-3.5">{r[1]}</td>
                <td className="py-3.5 font-semibold text-gray-900">{r[2]}</td>
                <td
                  className={`py-3.5 font-bold ${
                    r[3].includes("-") ? "text-blue-500" : "text-green-500"
                  }`}
                >
                  {r[3]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 bg-green-50 text-green-700 p-4 rounded-xl text-xs font-semibold flex items-center gap-1.5">
        <span>👍</span> 전체적으로 개선되고 있습니다! 아주 멋진 변화예요.
      </div>
    </div>
  );
};

// 우측 사이드바 컴포넌트
const Sidebar = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 text-sm">월간 종합 성과</h4>
        {[
          ["식단 건강", 82],
          ["혈당 안정도", 50],
          ["수면 리듬", 65],
          ["체력 지수", 100],
          ["운동 수행", 75],
        ].map(([label, val], i) => (
          <div key={i} className="mb-3.5 last:mb-0">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-800 font-bold">{val}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-md">
        <h4 className="font-bold mb-1.5 text-sm">주간 분석</h4>
        <p className="text-xs text-gray-400 mb-4 font-medium">
          🔥 7일 연속 운동 달성 중!
        </p>
        <div className="flex items-end justify-between gap-2.5 h-24 pt-2">
          {[20, 40, 30, 60, 50, 80, 90].map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
              <div className="w-full bg-gray-800 rounded-t h-20 flex items-end">
                <div
                  className="bg-blue-400 w-full rounded-t hover:bg-blue-300 transition-colors"
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {["월", "화", "수", "목", "금", "토", "일"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-['Noto_Sans_KR']">
      <div className="px-4 py-8 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 max-w-[1920px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
            건강 지표 관리 캘린더
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            지난 한 달간의 수치와 활동을 추적하고 분석한 스마트 리포트입니다.
          </p>
        </header>

        <div className="space-y-6">
          <WeeklyCalendar onDayClick={handleDayClick} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
            <div className="lg:col-span-7">
              <Table />
            </div>
            <div className="lg:col-span-3">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      <DailyTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        data={timelineData}
      />
    </div>
  );
}
