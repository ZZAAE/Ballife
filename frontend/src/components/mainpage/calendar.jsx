import { useMemo, useState } from "react";
import DailyTimelineModal from "../../modals/DailyTimelineModal";

// 더미 타임라인 데이터 — API 연동 시 교체
const dummyTimeline = [
  { id: 1, time: "08:15", category: "체중", color: "yellow", title: "체중 측정", value: "58.0kg", valueSub: "↓ 0.5kg" },
  { id: 2, time: "08:30", category: "식단", color: "red", title: "아침 식사", value: "450 kcal" },
  { id: 3, time: "09:00", category: "혈압", color: "purple", title: "혈압 측정", value: "118/70", valueUnit: "mmHg" },
  { id: 4, time: "10:30", category: "혈당", color: "blue", title: "혈당 체크", value: "112", valueUnit: "mg/dL" },
  { id: 5, time: "11:30", category: "수분", color: "sky", title: "수분 섭취", value: "250ml" },
  { id: 6, time: "13:00", category: "복약", color: "green", title: "종합 비타민", value: "1정" },
  { id: 7, time: "14:00", category: "운동", color: "orange", title: "운동 (걷기)", subtitle: "30분", value: "120", valueUnit: "kcal" },
];

const categoryDot = {
  식단: "bg-rose-400",
  혈압: "bg-purple-400",
  혈당: "bg-blue-400",
  수분: "bg-sky-400",
  복약: "bg-emerald-400",
  운동: "bg-orange-400",
  체중: "bg-amber-400",
};

function Calendar() {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredCell, setHoveredCell] = useState(null); // { day, rect } | null
  const [modalDate, setModalDate] = useState(null); // { year, month, day } | null

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
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setHoveredCell(null);
  };

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth() &&
    today.getDate() === day;

  const handleMouseEnter = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCell({ day, rect });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleCellClick = (day) => {
    setModalDate({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day,
    });
  };

  // 모달에 전달할 데이터 (날짜만 동적, items는 더미)
  const buildModalData = () => {
    if (!modalDate) return null;
    const dateObj = new Date(modalDate.year, modalDate.month, modalDate.day);
    const weekdayKor = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    return {
      month: `${modalDate.month + 1}월`,
      day: weekdayKor[dateObj.getDay()],
      date: `${modalDate.year}년 ${modalDate.month + 1}월 ${modalDate.day}일`,
      // items는 일단 더미 — API 연동 시 이 부분만 교체
      items: dummyTimeline,
    };
  };

  const renderDayCell = (index) => {
    const dayNumber = index - firstDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dayOfWeek = index % 7;

    if (!isCurrentMonth) {
      return <div key={`empty-${index}`} className="aspect-square rounded-xl bg-slate-50/60" />;
    }

    const dayColor =
      dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : "text-slate-700";

    return (
      <div
        key={`day-${dayNumber}`}
        className={`relative aspect-square rounded-xl border bg-white px-3 py-2.5 transition cursor-pointer
          ${isToday(dayNumber)
            ? "border-blue-400 ring-1 ring-blue-200"
            : "border-slate-100 hover:border-slate-300 hover:shadow-sm"}
        `}
        onMouseEnter={(e) => handleMouseEnter(e, dayNumber)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleCellClick(dayNumber)}
      >
        <div className="flex items-start justify-between">
          <span
            className={`text-sm font-semibold ${
              isToday(dayNumber)
                ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
                : dayColor
            }`}
          >
            {dayNumber}
          </span>
        </div>
      </div>
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
    <>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h2 className="flex-1 text-center text-xl font-bold tracking-tight text-slate-900">
            {monthTitle}
          </h2>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="다음 달"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekdays.map((day, idx) => (
            <div
              key={day}
              className={`pb-2 text-xs font-bold ${
                idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-2">
          {Array.from({ length: totalCells }, (_, i) => renderDayCell(i))}
        </div>

        {/* 호버 팝오버 — 작은 미리보기 */}
        {hoveredCell && (
          <div
            style={getPopoverStyle()}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
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

      {/* 정식 모달 */}
      <DailyTimelineModal
        isOpen={!!modalDate}
        onClose={() => setModalDate(null)}
        data={buildModalData()}
      />
    </>
  );
}

export default Calendar;
