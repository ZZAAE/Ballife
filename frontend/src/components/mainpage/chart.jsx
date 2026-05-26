import { useState } from "react";

// 차트 영역 컴포넌트
export default function ChartSection({
  title,
  legends = [],
  data = [],
  chartTypes = [],
  selectedType,
  onTypeChange,
  children,
}) {
  const now = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  const [startInput, setStartInput] = useState(fmt(new Date(now.getFullYear(), 0, 1)));
  const [endInput, setEndInput] = useState(fmt(now));
  const [activeRange, setActiveRange] = useState(null);

  const year = now.getFullYear();

  const filteredData =
    activeRange && data.length
      ? data.filter((d) => {
          const full = `${year}-${d.date}`;
          return full >= activeRange.start && full <= activeRange.end;
        })
      : data;

  const handleApply = () => {
    setActiveRange({ start: startInput, end: endInput });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm md:p-8 flex flex-col">
      {/* Row 1: 제목 + 차트 타입 탭 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {chartTypes.length > 0 && (
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onTypeChange?.(type.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
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
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: legend.color }}
              />
              {legend.label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="border-none bg-transparent text-xs text-slate-600 outline-none"
            />
            <span className="text-slate-300">~</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="border-none bg-transparent text-xs text-slate-600 outline-none"
            />
          </div>
          <button
            onClick={handleApply}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            적용
          </button>
        </div>
      </div>

      {/* 차트 영역 — 카드 안 내부 박스 제거 */}
      <div className="flex-1 min-h-[360px]">
        {typeof children === "function" ? children(filteredData) : children}
      </div>
    </div>
  );
}
