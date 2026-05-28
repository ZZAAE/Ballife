import { useRef, useState } from "react";
import { CalendarDays, Check, Sun, Triangle, X } from "lucide-react";

// YYYY-MM-DD -> "YYYY년 M월 D일"
const formatScheduleDateLabel = (dateKey) => {
  const [y, m, d] = (dateKey ?? "").split("-");
  if (!y || !m || !d) return dateKey;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

const getStatus = (drugs) => {
  if (!drugs || drugs.length === 0) return "none";
  const takenCount = drugs.filter((d) => d.taken).length;
  if (takenCount === 0) return "none";
  if (takenCount === drugs.length) return "all";
  return "partial";
};

export default function TodayScheduleCard({
  schedules,
  scheduleDate,
  todayKey,
  onDateChange,
  onToggleDrug,
  onToggleAllDrugs,
}) {
  const [openScheduleId, setOpenScheduleId] = useState(null);
  const dateInputRef = useRef(null);

  const isToday = !scheduleDate || scheduleDate === todayKey;

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  const openSchedule = schedules.find((s) => s.id === openScheduleId);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[18px] font-bold text-gray-900">
            {isToday ? "오늘의 복용 일정" : "복용 일정"}
          </h2>
          <div className="relative">
            <input
              type="date"
              ref={dateInputRef}
              value={scheduleDate ?? ""}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="absolute opacity-0 pointer-events-none"
            />
            <button
              type="button"
              onClick={openDatePicker}
              className="inline-flex items-center gap-1.5 text-[12px] text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors"
            >
              {formatScheduleDateLabel(scheduleDate)}
              <CalendarDays className="h-3.5 w-3.5 text-[#2563EB]" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {schedules.map((schedule) => {
          const status = getStatus(schedule.drugs);

          const cardBorder =
            status === "none"
              ? "border-2 border-[#1B1F2A]"
              : "border border-gray-200";

          let btnClass = "";
          let btnContent = null;
          if (status === "all") {
            btnClass = "bg-gray-100 text-gray-900 hover:bg-gray-200";
            btnContent = (
              <>
                <Check className="w-4 h-4" /> 복용 완료
              </>
            );
          } else if (status === "partial") {
            btnClass = "bg-[#F2A35B] text-[#5A2E0E] hover:bg-[#E89249]";
            btnContent = (
              <>
                <Triangle className="w-4 h-4" strokeWidth={2.4} /> 부분 복용
              </>
            );
          } else {
            btnClass = "bg-[#1B1F2A] text-white hover:bg-[#2A2F3F]";
            btnContent = "복용 확인";
          }

          return (
            <div key={schedule.id} className={`rounded-xl p-5 ${cardBorder}`}>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
                <Sun className="w-3.5 h-3.5" /> {schedule.label} ({schedule.time})
              </div>
              <button
                type="button"
                onClick={() => setOpenScheduleId(schedule.id)}
                className="text-left w-full"
              >
                <p className="text-[16px] font-bold text-gray-900 mb-1 hover:underline">
                  {schedule.name}
                </p>
                <p className="text-[12px] text-gray-400 mb-4">{schedule.note}</p>
              </button>

              <button
                type="button"
                onClick={() => setOpenScheduleId(schedule.id)}
                className={`w-full h-[40px] rounded-lg text-[13px] font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${btnClass}`}
              >
                {btnContent}
              </button>
            </div>
          );
        })}
      </div>

      {/* 약 그룹 모달 */}
      {openSchedule && (
        <div
          onClick={() => setOpenScheduleId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">
                  {openSchedule.name}
                </h3>
                <p className="mt-1 text-[12px] text-gray-500">
                  {openSchedule.label} ({openSchedule.time}) · {openSchedule.note}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenScheduleId(null)}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openSchedule.drugs.every((d) => d.taken)}
                    onChange={() => onToggleAllDrugs(openSchedule.id)}
                    className="h-4 w-4 accent-[#1B1F2A]"
                  />
                  <span className="text-[12px] font-semibold text-gray-700">
                    전체 선택
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4">
              <ul className="space-y-2">
                {openSchedule.drugs.map((drug) => (
                  <li key={drug.id}>
                    <label className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={drug.taken}
                        onChange={() => onToggleDrug(openSchedule.id, drug.id)}
                        className="h-4 w-4 accent-[#1B1F2A]"
                      />
                      <span
                        className={`text-[14px] font-medium ${
                          drug.taken ? "text-gray-400 line-through" : "text-gray-900"
                        }`}
                      >
                        {drug.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-5 pt-2">
              <button
                type="button"
                onClick={() => setOpenScheduleId(null)}
                className="w-full h-[44px] rounded-lg bg-[#1B1F2A] text-white text-[14px] font-semibold hover:bg-[#2A2F3F] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
