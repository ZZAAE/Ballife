import { useRef, useState } from "react";
import { Calendar, Clock, Pill, Trash2 } from "lucide-react";

export default function SavedRecordsCard({ records, todayKey, onDeleteRecord }) {
  const [viewDate, setViewDate] = useState(todayKey || "");
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.focus();
      dateInputRef.current?.click();
    }
  };

  const filtered = records.filter((r) => r.date === viewDate);
  const isToday = viewDate === todayKey;

  const formatViewLabel = (dateKey) => {
    if (!dateKey) return "";
    const [y, m, d] = dateKey.split("-");
    if (!y || !m || !d) return dateKey;
    return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900">
              상비약
            </h3>
          </div>
          {viewDate && (
            <button
              type="button"
              onClick={openDatePicker}
              className="text-[12px] text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full font-medium hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
            >
              {formatViewLabel(viewDate)}
              <Calendar className="w-3 h-3" />
            </button>
          )}
        </div>
        <span className="text-[12px] font-semibold text-gray-500">
          {filtered.length}건
        </span>
      </div>

      {/* 숨겨진 date input — 배지 클릭 시 picker 노출 */}
      <input
        ref={dateInputRef}
        type="date"
        value={viewDate}
        onChange={(e) => setViewDate(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />


      {filtered.length === 0 ? (
        <p className="flex-1 flex items-center justify-center text-[13px] text-gray-400 text-center">
          {isToday
            ? "오늘 기록된 상비약이 없습니다."
            : "해당 날짜에 기록된 상비약이 없습니다."}
        </p>
      ) : (
        <ul className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 max-h-[100px]">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-900 truncate">
                  {r.drugName}
                </p>
                {r.dosage && (
                  <p className="mt-0.5 text-[12px] text-gray-600">
                    {r.dosage}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                  {r.date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {r.date}
                    </span>
                  )}
                  {r.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.time}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteRecord(r.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
