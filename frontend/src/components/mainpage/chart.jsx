import { useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

const DEFAULT_DAYS = 7;
const fmt = (d) => d.toISOString().split("T")[0];

/**
 * 차트 카드 — Toss 스타일 (정보 계층 강화 버전)
 *  - props.areas/unit 로 최신 수치를 자동 계산해 헤드라인으로 표시
 */
export default function ChartSection({
  title,
  legends = [],
  data = [],
  chartTypes = [],
  selectedType,
  onTypeChange,
  areas = [],
  unit = "",
  children,
}) {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();

  const [showCustom, setShowCustom] = useState(false);
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
    // 기본: 오늘부터 7일 전까지
    return data.slice(-DEFAULT_DAYS);
  }, [data, activeRange, year]);

  const handleApplyCustom = () => {
    setActiveRange({ start: startInput, end: endInput });
    setShowCustom(false);
  };

  const handleReset = () => {
    setActiveRange(null);
    setShowCustom(false);
  };

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:p-5">
      {/* 헤더: 타이틀 + 타입 전환 + 기간 설정 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#0F172A]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {chartTypes.length > 0 && (
            <div className="inline-flex shrink-0 rounded-full bg-[#F1F5F9] p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onTypeChange?.(type.value)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
                    selectedType === type.value
                      ? "bg-white text-[#0F172A] shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
          {activeRange && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full px-3 py-1.5 text-[13px] font-bold text-[#64748B] hover:bg-[#F1F5F9] transition"
            >
              초기화
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition ${
              showCustom || activeRange
                ? "bg-[#3182F6] text-white"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            기간 설정
          </button>
        </div>
      </div>

      {showCustom && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#F8FAFC] p-3">
          <div className="flex flex-1 min-w-0 items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-[12px]">
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent text-[12px] font-medium text-[#0F172A] outline-none"
            />
            <span className="text-[#CBD5E1]">~</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent text-[12px] font-medium text-[#0F172A] outline-none"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="shrink-0 rounded-[10px] bg-[#3182F6] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#1B64DA] transition"
          >
            적용
          </button>
        </div>
      )}

      {/* 차트 */}
      <div className="relative mt-2 h-[440px]">
        {typeof children === "function" ? children(filteredData) : children}
      </div>

      {/* 범례 */}
      {legends.length > 0 && (
        <div className="-mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold text-[#64748B]">
          {legends.map((legend) => (
            <span key={legend.label} className="inline-flex items-center gap-1.5">
              {legend.dashed ? (
                <span
                  className="inline-block h-[2px] w-4"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to right, ${legend.color} 0 4px, transparent 4px 8px)`,
                  }}
                />
              ) : (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: legend.color }}
                />
              )}
              {legend.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}