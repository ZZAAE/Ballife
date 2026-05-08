import { CalendarDays } from "lucide-react";
import { useState } from "react";

// 차트 영역 컴포넌트
export default function ChartSection({ title, legends = [], data = [], children }) {
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm md:p-10">
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="border-none bg-transparent text-sm text-gray-600 outline-none"
            />
            <span className="text-gray-300">~</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="border-none bg-transparent text-sm text-gray-600 outline-none"
            />
          </div>
          <button
            onClick={handleApply}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            적용
          </button>
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

      <div className="h-[500px] rounded-xl border border-gray-200 bg-white p-1 sm:p-12">
        {typeof children === "function" ? children(filteredData) : children}
      </div>
    </div>
  );
}