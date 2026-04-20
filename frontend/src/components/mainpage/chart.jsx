import { CalendarDays } from "lucide-react";
import { useState } from "react";

// 차트 영역 컴포넌트
export default function ChartSection({ title, legends = [], children }) {

    const now = new Date();
    const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    // 날짜 값 다 거시기해야됨


  return (
    <div className="mb-100 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm md:p-10">
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <CalendarDays size={14} />
            <span>{startDate.toLocaleDateString()}</span>
            <span className="text-gray-300">~</span>
            <CalendarDays size={14} />
            <span>{endDate.toLocaleDateString()}</span>
          </div>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">적용</button>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {legends.map((legend) => (
              <span key={legend.label} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: legend.color }} />
                {legend.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[500px] rounded-xl border border-gray-200 bg-white p-1 sm:p-12">{children}</div>
    </div>
  );
}