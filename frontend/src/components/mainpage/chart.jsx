import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";

const DEFAULT_DAYS = 7;
const fmt = (d) => d.toISOString().split("T")[0];

/**
 * 차트 카드 — 주간 건강 추이
 *  - 기본: 최근 7일
 *  - 직접 기간 지정 가능 (적용/초기화)
 */
export default function ChartSection({
  title,
  legends = [],
  data = [],
  chartTypes = [],
  selectedType,
  onTypeChange,
  children,
  // areas, unit prop은 사용 안 함 (시그니처 호환용)
}) {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();

  const defaultStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - (DEFAULT_DAYS - 1));
    return fmt(d);
  }, [now]);

  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(fmt(now));
  const [activeRange, setActiveRange] = useState(null);

  const filteredData = useMemo(() => {
    if (!data.length) return data;
    if (activeRange) {
      return data.filter((d) => {
        const full = `${year}-${d.date}`;
        return full >= activeRange.start && full <= activeRange.end;
      });
    }
    return data.slice(-DEFAULT_DAYS);
  }, [data, activeRange, year]);

  const handleApply = () => {
    setActiveRange({ start: startInput, end: endInput });
  };

  const handleReset = () => {
    setActiveRange(null);
    setStartInput(defaultStart);
    setEndInput(fmt(now));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm md:p-8 flex flex-col">
      {/* Row 1: 제목 + 차트 타입 탭 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>
        {chartTypes.length > 0 && (
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onTypeChange?.(type.value)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${
                  selectedType === type.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Row 2: 범례 + 기간 필터 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          {legends.map((legend) => (
            <span
              key={legend.label}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600"
            >
              {legend.dashed ? (
                <span
                  className="inline-block h-[2px] w-4"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to right, ${legend.color} 0 4px, transparent 4px 8px)`,
                  }}
                />
              ) : (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: legend.color }}
                />
              )}
              {legend.label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="border-none bg-transparent text-[12px] font-semibold text-slate-700 outline-none"
            />
            <span className="text-slate-300">~</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="border-none bg-transparent text-[12px] font-semibold text-slate-700 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-700 transition"
          >
            적용
          </button>
          {activeRange && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex-1 min-h-[420px]">
        {typeof children === "function" ? children(filteredData) : children}
      </div>
    </div>
  );
}
