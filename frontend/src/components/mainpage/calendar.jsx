import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// 0 ~ 7 점수에 따른 셀 배경 색상 (잔디 스타일)
const levelStyles = [
  { bg: "bg-slate-100", text: "text-slate-300" },        // 0
  { bg: "bg-emerald-100", text: "text-emerald-600" },    // 1
  { bg: "bg-emerald-200", text: "text-emerald-700" },    // 2
  { bg: "bg-emerald-300", text: "text-emerald-800" },    // 3
  { bg: "bg-emerald-400", text: "text-white" },          // 4
  { bg: "bg-emerald-500", text: "text-white" },          // 5
  { bg: "bg-emerald-600", text: "text-white" },          // 6
  { bg: "bg-emerald-700", text: "text-white" },          // 7
];

// TODO: 실제 기록 데이터와 연동 (현재는 데모용 시드 기반 점수)
function getDayLevel(year, month, day) {
  const seed = (year * 100 + (month + 1)) * 100 + day;
  const pseudo = Math.abs(Math.sin(seed) * 10000);
  return Math.floor(pseudo % 8); // 0 ~ 7
}

function Calendar({ onDayClick, initialDate, selectedDay }) {
  const navigate = useNavigate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [currentDate, setCurrentDate] = useState(() => initialDate ?? new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthTitle = `${month + 1}월`;

  const { daysInMonth, firstDayOfWeek, totalCells } = useMemo(() => {
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
  }, [year, month]);

  const moveMonth = (offset) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderDayCell = (index) => {
    const dayNumber = index - firstDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

    if (!isCurrentMonth) {
      return <div key={`empty-${index}`} className="aspect-square" />;
    }

    const cellDate = new Date(year, month, dayNumber);
    const isFuture = cellDate > today;
    const isToday = cellDate.getTime() === today.getTime();
    const isSelected =
      selectedDay &&
      selectedDay.year === year &&
      selectedDay.month === month &&
      selectedDay.day === dayNumber;

    // 미래 날짜는 기록이 없으므로 항상 0 (빈 셀)
    const level = isFuture ? 0 : getDayLevel(year, month, dayNumber);
    const { bg, text } = levelStyles[level];

    const ringClass = isSelected
      ? "ring-2 ring-emerald-700 ring-offset-2 ring-offset-white"
      : isToday
      ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-white"
      : "";

    const handleClick = () => {
      if (onDayClick) {
        onDayClick({ year, month, day: dayNumber });
      } else {
        navigate("/calender", { state: { year, month, day: dayNumber } });
      }
    };

    return (
      <button
        key={`day-${dayNumber}`}
        type="button"
        disabled={isFuture}
        onClick={handleClick}
        className={`aspect-square rounded-2xl ${bg} ${ringClass} flex items-center justify-center font-bold text-lg md:text-xl ${text} transition ${
          isFuture ? "cursor-not-allowed opacity-70" : "hover:scale-[1.04] hover:shadow-sm"
        }`}
        title={
          isFuture
            ? `${month + 1}월 ${dayNumber}일`
            : `${month + 1}월 ${dayNumber}일 · 활동 ${level}/7`
        }
      >
        {dayNumber}
      </button>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      {/* 헤더: < 월 > */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="이전 달"
          className="text-slate-400 hover:text-slate-700 transition text-lg font-semibold"
        >
          {"<"}
        </button>
        <h2 className="text-xl font-bold text-slate-900 min-w-[64px] text-center">
          {monthTitle}
        </h2>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="다음 달"
          className="text-slate-400 hover:text-slate-700 transition text-lg font-semibold"
        >
          {">"}
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {weekdays.map((day, idx) => (
          <div
            key={day}
            className={`pb-1 text-xs font-bold ${idx === 0 ? "text-red-400" : "text-slate-400"}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalCells }, (_, i) => renderDayCell(i))}
      </div>

      {/* 하단 그라데이션 범례 (0 ~ 7) */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-xs text-slate-400">0</span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #f1f5f9, #d1fae5, #6ee7b7, #34d399, #10b981, #059669, #047857, #065f46)",
          }}
        />
        <span className="text-xs text-slate-400">7</span>
      </div>
    </div>
  );
}

export default Calendar;
