import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// 0 ~ 7 점수에 따른 셀 배경 색상 (잔디 스타일)
const levelStyles = [
  { bg: "bg-slate-100", text: "text-slate-300" }, // 0
  { bg: "bg-emerald-100", text: "text-emerald-600" }, // 1
  { bg: "bg-emerald-200", text: "text-emerald-700" }, // 2
  { bg: "bg-emerald-300", text: "text-emerald-800" }, // 3
  { bg: "bg-emerald-400", text: "text-white" }, // 4
  { bg: "bg-emerald-500", text: "text-white" }, // 5
  { bg: "bg-emerald-600", text: "text-white" }, // 6
  { bg: "bg-emerald-700", text: "text-white" }, // 7
];

// TODO: 실제 기록 데이터와 연동 (현재는 데모용 시드 기반 점수)
function getDayLevel(year, month, day) {
  const seed = (year * 100 + (month + 1)) * 100 + day;
  const pseudo = Math.abs(Math.sin(seed) * 10000);
  return Math.floor(pseudo % 8); // 0 ~ 7
}

function Calendar({
  onDayClick,
  initialDate,
  selectedDay,
  title = "건강 달력",
  compact = false,
  showLegend = true,
}) {
  const navigate = useNavigate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [currentDate, setCurrentDate] = useState(
    () => initialDate ?? new Date(),
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthTitle = `${year}년 ${month + 1}월`;

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
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
    );
  };

  const renderDayCell = (index) => {
    const dayNumber = index - firstDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dayOfWeek = index % 7;

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

    const sizeClass = compact
      ? "rounded-xl text-sm md:text-base font-semibold"
      : "rounded-2xl text-lg md:text-xl font-bold";

    const handleClick = () => {
      if (onDayClick) {
        onDayClick({ year, month, day: dayNumber });
      } else {
        navigate("/calender", { state: { year, month, day: dayNumber } });
      }
    };

    return (
      <div
        key={`day-${dayNumber}`}
        type="button"
        disabled={isFuture}
        onClick={handleClick}
        className={`aspect-square ${sizeClass} ${bg} ${ringClass} flex items-center justify-center ${text} transition ${
          isFuture
            ? "cursor-not-allowed opacity-70"
            : "hover:scale-[1.04] hover:shadow-sm"
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

  // 팝오버 위치 계산 — 셀 우측 / 모자라면 좌측
  const getPopoverStyle = () => {
    if (!hoveredCell) return {};
    const { rect } = hoveredCell;
    const popoverWidth = 260;
    const gap = 8;
    const viewportWidth = window.innerWidth;

    let left = rect.right + gap;
    if (left + popoverWidth > viewportWidth - 16) {
      left = rect.left - popoverWidth - gap;
    }

    return {
      position: "fixed",
      top: rect.top,
      left,
      width: popoverWidth,
      zIndex: 50,
      pointerEvents: "none", // 팝오버 위에 마우스 올라가도 깜빡임 방지
    };
  };

  // 호버 미리보기 — 간단한 요약만
  const previewItems = hoveredCell ? dummyTimeline.slice(0, 4) : [];
  const totalCount = hoveredCell ? dummyTimeline.length : 0;

  return (
    <div
      className={`rounded-3xl border border-slate-100 bg-white shadow-sm ${compact ? "p-5 md:p-6" : "p-6 md:p-8"}`}
    >
      <div
        className={`flex items-center justify-between gap-4 ${compact ? "mb-4" : "mb-6"}`}
      >
        <div>
          {title ? (
            <p className="text-lg font-bold text-slate-900">{title}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
            className="text-slate-400 hover:text-slate-700 transition text-lg font-semibold"
          >
            {"<"}
          </button>
          <h2 className="min-w-[110px] text-center text-base font-bold text-slate-900 md:text-lg">
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

      <div
        className={`mb-2 grid grid-cols-7 ${compact ? "gap-1.5" : "gap-2"} text-center`}
      >
        {weekdays.map((day, idx) => (
          <div
            key={day}
            className={`pb-1 text-xs font-bold ${idx === 0 ? "text-red-400" : "text-slate-400"}`}
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-sm font-bold text-slate-900">
                {currentDate.getMonth() + 1}월 {hoveredCell.day}일
              </p>
              <span className="text-xs text-slate-400">{totalCount}건</span>
            </div>

            <div className="space-y-2">
              {previewItems.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400">기록 없음</p>
              ) : (
                previewItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        categoryDot[item.category] || "bg-slate-300"
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-500 w-10 shrink-0">
                      {item.time}
                    </span>
                    <span className="text-xs text-slate-700 truncate">{item.title}</span>
                  </div>
                ))
              )}
              {totalCount > previewItems.length && (
                <p className="pt-1 text-[10px] text-slate-400">
                  +{totalCount - previewItems.length}건 더 (클릭해서 보기)
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-7 ${compact ? "gap-1.5" : "gap-2"}`}>
        {Array.from({ length: totalCells }, (_, i) => renderDayCell(i))}
      </div>

      {showLegend ? (
        <div className={`flex items-center gap-3 ${compact ? "mt-5" : "mt-6"}`}>
          <span className="text-xs text-slate-400">0</span>
          <div
            className="h-2 flex-1 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #f1f5f9, #d1fae5, #6ee7b7, #34d399, #10b981, #059669, #047857, #065f46)",
            }}
          />
          <span className="text-xs text-slate-400">7</span>
        </div>
      ) : null}
    </div>
  );
}

export default Calendar;
