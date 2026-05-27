import { CalendarDays } from "lucide-react";

// 차트 영역 컴포넌트
// startDate, endDate는 사용자 입력으로 날짜 받아와서 나중에 수정 필요 할 수도? 
export default function ChartSection({ title, startDate, endDate, legends = [], children, chartClassName = "h-[320px]", onStartDateChange, onEndDateChange, onApply, headerExtra }) {
  const isInteractive = typeof onApply === "function";
  return (
    <div className={`mb-8 flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:p-6 ${chartClassName}`}>
      <div className="mb-4 flex min-h-[38px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-[18px] font-bold text-[#0F172A]">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          {headerExtra}
          <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#64748B]">
            {!isInteractive && <CalendarDays size={14} />}
            {isInteractive ? (
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="border-none bg-transparent text-sm text-[#64748B] outline-none cursor-pointer"
              />
            ) : (
              <span>{startDate}</span>
            )}
            <span className="text-[#94A3B8]">~</span>
            {!isInteractive && <CalendarDays size={14} />}
            {isInteractive ? (
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="border-none bg-transparent text-sm text-[#64748B] outline-none cursor-pointer"
              />
            ) : (
              <span>{endDate}</span>
            )}
          </div>
          <button
            onClick={isInteractive ? onApply : undefined}
            className="rounded-[10px] bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
          >
            적용
          </button>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
            {legends.map((legend) => (
              <span
                key={legend.label}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: legend.color }} />
                {legend.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {children}
      </div>
    </div>
  );
}