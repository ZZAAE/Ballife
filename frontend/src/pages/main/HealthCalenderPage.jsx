import React, { useState } from "react";

// 1. 링 차트 컴포넌트
const RingChart = () => {
  const colors = [
    "stroke-red-400",
    "stroke-yellow-400",
    "stroke-blue-400",
    "stroke-green-400",
    "stroke-purple-400",
    "stroke-orange-400",
  ];

  return (
    <svg viewBox="0 0 36 36" className="w-10 h-10">
      {colors.map((c, i) => (
        <circle
          key={i}
          cx="18"
          cy="18"
          r="15.915"
          fill="transparent"
          strokeWidth="3"
          className={c}
          strokeDasharray={`${10 + i * 5}, 100`}
          strokeDashoffset={i * -15}
        />
      ))}
    </svg>
  );
};

// 2. 작동하는 달력 컴포넌트
const Calendar = () => {
  // 현재 날짜 기준 (2026년 3월 또는 오늘 날짜 기준)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // 2026년 3월 1일 기본값 설정

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11

  // 달력 연산 로직
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 시작 요일 (0: 일요일 ~ 6: 토요일)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 총 일수

  // 이전/다음 달 이동 함수
  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  // 달력 격자(Grid)에 채울 배열 생성 (시작 요일 전 빈칸 + 실제 날짜들)
  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 범례 데이터 (CSS 클래스가 빌드 시 누락되지 않도록 풀 클래스명 작성)
  const legendItems = [
    { label: "식단", color: "bg-red-400" },
    { label: "혈압", color: "bg-yellow-400" },
    { label: "혈당", color: "bg-blue-400" },
    { label: "수면", color: "bg-green-400" },
    { label: "체력", color: "bg-purple-400" },
    { label: "운동", color: "bg-orange-400" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 달력 헤더: 월 이동 버튼 탑재 */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
        >
          {"<"}
        </button>
        <h2 className="font-bold text-lg text-gray-800">
          {year}년 {month + 1}월
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
        >
          {">"}
        </button>
      </div>

      {/* 요일 정보 헤더 */}
      <div className="grid grid-cols-7 text-xs font-semibold text-gray-400 mb-4 text-center">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, index) => (
          <div
            key={d}
            className={
              index === 0
                ? "text-red-400"
                : index === 6
                ? "text-blue-400"
                : "text-gray-400"
            }
          >
            {d}
          </div>
        ))}
      </div>

      {/* 실제 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;

          return (
            <div
              key={index}
              className={`rounded-xl p-2 flex flex-col items-center min-h-[85px] transition-all ${
                day
                  ? "bg-gray-50 hover:bg-gray-100/70 border border-gray-100"
                  : "bg-transparent border-none"
              }`}
            >
              {day && (
                <>
                  <span
                    className={`text-xs font-bold mb-1.5 ${
                      isSunday
                        ? "text-red-500"
                        : isSaturday
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    {day}
                  </span>
                  <RingChart />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 범례 */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500 border-t pt-4">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="font-medium text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. 건강 지표 테이블 컴포넌트
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

// 4. 우측 사이드바 컴포넌트
const Sidebar = () => {
  return (
    <div className="space-y-4">
      {/* 성과 바 그래프 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 text-sm">
          월간 종합 성과
        </h4>
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

      {/* 주간 분석 그래프 */}
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
          <Calendar />

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
    </div>
  );
}