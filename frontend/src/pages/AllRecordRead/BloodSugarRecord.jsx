import { useState } from "react";
import { MessageCircle } from "lucide-react";
import HealthIndicatorMenu from "../../components/HealthMenu";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import ChartSection from "../../components/record/ChartSection";
import MetricCard from "../../components/record/MetricCard";
import RecordTable from "../../components/record/RecordTable";
import StatusBadge from "../../components/record/StatusBadge";
// 더미데이터 
const bgData = [
  { date: "05-08", fasting: 82, postMeal: 135 },
  { date: "05-09", fasting: 88, postMeal: 141 },
  { date: "05-10", fasting: 79, postMeal: 163 },
  { date: "05-11", fasting: 72, postMeal: 178 },
  { date: "05-12", fasting: 68, postMeal: 196 },
  { date: "05-13", fasting: 68, postMeal: 196 },
  { date: "05-14", fasting: 94, postMeal: 148 }
];

const records = [
  { time: "오늘 12:30", category: "식후", value: 145, status: "주의", type: "warning" },
  { time: "오늘 08:00", category: "식후", value: 95,  status: "정상", type: "normal" },
  { time: "어제 21:00", category: "식후", value: 145, status: "정상", type: "normal" },
  { time: "어제 12:30", category: "식후", value: 145, status: "정상", type: "normal" },
  { time: "05-13 09:00", category: "식후", value: 145, status: "정상", type: "normal" },
  { time: "05-12 21:30", category: "식후", value: 145, status: "정상", type: "normal" },
  { time: "05-12 08:00", category: "식후", value: 145, status: "정상", type: "normal" },
  { time: "05-11 20:00", category: "식후", value: 145, status: "정상", type: "normal" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 16px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>2026-{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: <strong>{p.value}</strong> mg/dL
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BloodSugarRecord() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-[55px]">
      <div className="flex w-full flex-col xl:flex-row mx-auto max-w-[1280px]">
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <h1 className="tmb-1 text-2xl font-bold text-gray-900 sm:text-3xl">혈당 기록 확인</h1>
          <p className="mb-8 text-sm text-gray-500">지난 혈당 변화를 분석한 결과입니다.</p>

          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard>
              <span className="text-xs font-medium text-rose-600">평균 혈당</span>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-bold text-rose-600">148</span>
                <span className="pb-1 text-xl text-slate-300">/</span>
                <span className="text-3xl font-bold text-blue-600">94</span>
                <span className="pb-1 text-sm text-gray-500">mg/dL</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />정상 혈당 범위
              </div>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-gray-500">식전 혈당</span>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">94</span>
                <span className="pb-1 text-sm text-gray-500">mg/dL</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-blue-600">5월 14일 오후 8:15</p>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-gray-500">식후 혈당</span>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-rose-600">148</span>
                <span className="pb-1 text-sm text-gray-500">mg/dL</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-rose-600">5월 14일 오후 9:15</p>
            </MetricCard>
          </div>

          <ChartSection
            title="혈당 변화 추이"
            startDate="2026.05.07"
            endDate="2026.05.15"
          >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bgData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <Legend
                                      verticalAlign="top"
                                      align="right"
                                      height={36}
                                      iconType="circle"
                                      wrapperStyle={{ fontSize:12 , paddingBottom: 10 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} tickFormatter={(v) => `2026-${v}`} />
                  <YAxis domain={[0, 210]} ticks={[0, 50, 100, 150, 200]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="postMeal" name="식후" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#fff", stroke: "#f43f5e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="fasting" name="식전" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#fff", stroke: "#2563eb", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          </ChartSection>

          <RecordTable
            title="최근 측정 기록"
            columns={["측정 일시", "분류", "수치", "상태"]}
            rows={records}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            renderDesktopRow={(row, index) => (
              <tr key={index} className={`border-t border-gray-50 ${index % 2 === 1 ? "bg-blue-50/20" : ""}`}>
                <td className="px-6 py-3.5 text-center font-medium text-gray-700">{row.time}</td>
                <td className="px-6 py-3.5 text-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{row.category}</span></td>
                <td className={`px-6 py-3.5 text-center font-semibold ${row.type === "warning" ? "text-rose-600" : "text-slate-700"}`}>{row.value}</td>
                <td className="px-6 py-3.5 text-center"><StatusBadge status={row.status} type={row.type} /></td>
              </tr>
            )}
            renderMobileCard={(row, index) => (
              <div key={index} className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-gray-400">측정 일시</span>
                  <span className="text-sm text-gray-700">{row.time}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-[11px] text-gray-400">분류</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{row.category}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">수치</p>
                    <p className={`mt-1 text-sm font-semibold ${row.type === "warning" ? "text-rose-600" : "text-slate-700"}`}>{row.value}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">상태</p>
                    <div className="mt-1"><StatusBadge status={row.status} type={row.type} /></div>
                  </div>
                </div>
              </div>
            )}
          />
        </main>
      </div>
    </div>
    
  );
}
