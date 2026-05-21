import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

const ringColors = [
  "stroke-red-400",
  "stroke-purple-400",
  "stroke-blue-400",
  "stroke-sky-400",
  "stroke-green-400",
  "stroke-orange-400",
  "stroke-yellow-400",
];

const legendItems = [
    { label: "식단", color: "bg-red-400" },
    { label: "혈압", color: "bg-purple-400" },
    { label: "혈당", color: "bg-blue-400" },
    { label: "수분", color: "bg-sky-400" },
    { label: "복약", color: "bg-green-400" },
    { label: "운동", color: "bg-orange-400" },
    { label: "체중", color: "bg-yellow-400" },
  ];

function RingChart() {
  const count = ringColors.length;      // 7
  const slot = 100 / count;         // 각 조각 전체 폭
  const gap = 0.8;                  // 조각 사이 간격(원하면 0)
  const segment = slot - gap;       // 실제 색 구간
  return (
    <svg viewBox="0 0 36 36" className="mx-auto mt-1.5 h-9 w-9">
      {ringColors.map((color, i) => (
        <circle
          key={color}
          cx="18"
          cy="18"
          r="15"
          fill="transparent"
          strokeWidth="4"
          className={color}
          strokeDasharray={`${segment} ${100 - segment}`}
          strokeDashoffset={-(i * slot)}
          transform="rotate(-90 18 18)"
        />
      ))}
    </svg>
  );
}

function Calendar() {
  const navigate = useNavigate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthTitle = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  const { daysInMonth, firstDayOfWeek, totalCells } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);

    const firstDay = firstDate.getDay();
    const daysCount = lastDate.getDate();
    const cells = Math.ceil((firstDay + daysCount) / 7) * 7;

    return {
      daysInMonth: daysCount,
      firstDayOfWeek: firstDay,
      totalCells: cells,
    };
  }, [currentDate]);

  const moveMonth = (offset) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderDayCell = (index) => {
    const dayNumber = index - firstDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

    if (!isCurrentMonth) {
      return <div key={`empty-${index}`} className="h-20 rounded-xl bg-slate-50/60" />;
    }

    return (
      <button
        key={`day-${dayNumber}`}
        type="button"
        className="group h-20 rounded-xl border border-slate-100 bg-white p-2 transition hover:border-slate-200 hover:shadow-sm"
        onClick={() => navigate("/calender", {state:{year:currentDate.getFullYear(), month:currentDate.getMonth()}})}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">{dayNumber}</span>
        </div>
        <RingChart />
      </button>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{monthTitle}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            다음
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {weekdays.map((day, idx) => (
          <div
            key={day}
            className={`pb-1 text-xs font-bold ${idx === 0 ? "text-red-500" : "text-slate-400"}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">{Array.from({ length: totalCells }, (_, i) => renderDayCell(i))}</div>
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
}

export default Calendar;