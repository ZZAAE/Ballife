import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";

const DEFAULT_DAYS = 7;
const fmt = (d) => d.toISOString().split("T")[0];

/**
 * 차트 카드 — 주간 건강 추이
 *  - 기본: 최근 7일
 *  - 날짜를 변경하면 별도 버튼 없이 즉시 반영
 */
export default function ChartSection({
  title,
  legends = [],
  data = [],
  chartTypes = [],
  selectedType,
  onTypeChange,
  // 지표별 액센트 컬러 (탭 활성에 사용)
  accentColor = "#2563EB",
  children,
  // areas / primaryAreaKey / primaryAreaName / unit prop 은 사용 안 함 (시그니처 호환용)
}) {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();

  const defaultStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - (DEFAULT_DAYS - 1));
    return fmt(d);
  }, [now]);

  // 날짜 변경 시 즉시 반영 (별도 적용 버튼 없음)
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(fmt(now));

  const filteredData = useMemo(() => {
    if (!data.length) return data;
    return data.filter((d) => {
      const full = `${year}-${d.date}`;
      return full >= startDate && full <= endDate;
    });
  }, [data, startDate, endDate, year]);

  const hasData = filteredData.length > 0;

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:p-8"
    >
      {/* 상단 액센트 바 */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />

      {/* Row 1: 제목 + 차트 타입 탭 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900 sm:text-[22px]">
          {title}
        </h2>

        {chartTypes.length > 0 && (
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {chartTypes.map((type) => {
              const isActive = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onTypeChange?.(type.value)}
                  style={
                    isActive && type.color
                      ? { color: type.color }
                      : undefined
                  }
                  className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${
                    isActive
                      ? "bg-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 2: 기간 필터 + 범례 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none bg-transparent text-[12px] font-semibold text-slate-700 outline-none"
          />
          <span className="text-slate-300">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none bg-transparent text-[12px] font-semibold text-slate-700 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {legends.map((legend) => (
            <span
              key={legend.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-100"
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
      </div>

      {/* 차트 영역 */}
      <div className="min-h-[380px] flex-1">
        {hasData ? (
          typeof children === "function" ? children(filteredData) : children
        ) : (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-10 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
            >
              <LineChart className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <p className="text-[14px] font-bold text-slate-700">
              {data.length === 0
                ? "아직 기록이 없습니다"
                : "선택한 기간에 기록이 없습니다"}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              {data.length === 0
                ? "측정 결과를 등록하면 이곳에 추이가 표시됩니다"
                : "다른 기간을 선택해 보세요"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
