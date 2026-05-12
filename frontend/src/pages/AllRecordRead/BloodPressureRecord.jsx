import { useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import ChartSection from "../../components/record/ChartSection";
import MetricCard from "../../components/record/MetricCard";
import RecordTable from "../../components/record/RecordTable";
import StatusBadge from "../../components/record/StatusBadge";

const bpData = [
  { date: "03-26", systolic: 122, diastolic: 78 },
  { date: "03-27", systolic: 118, diastolic: 76 },
  { date: "03-28", systolic: 120, diastolic: 77 },
  { date: "03-29", systolic: 116, diastolic: 74 },
  { date: "03-30", systolic: 121, diastolic: 78 },
  { date: "03-31", systolic: 115, diastolic: 73 },
  { date: "04-01", systolic: 117, diastolic: 75 },
];

const records = [
  { time: "오늘 12:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "오늘 08:15", systolic: 134, diastolic: 76, pulse: 78, status: "주의", statusType: "warning" },
  { time: "어제 21:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "어제 12:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "03-30 09:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "03-29 21:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "03-29 08:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "03-28 20:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 13,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>{`2026-${label}`}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: <strong>{p.value}</strong> mmHg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BloodPressureRecord() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-[55px]">


      <div className="mx-auto flex w-full max-w-[1280px] flex-col xl:flex-row">
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <h1 className="tmb-1 text-2xl font-bold text-gray-900 sm:text-3xl">혈압 기록 확인</h1>
          <p className="mb-8 text-sm text-gray-500">지난 한 달간의 신체 변화를 분석한 결과입니다.</p>

          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard>
              <span className="text-xs font-medium text-blue-600">평균 혈압</span>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-900">118</span>
                <span className="pb-1 text-xl text-slate-300">/</span>
                <span className="text-3xl font-bold text-cyan-600">76</span>
                <span className="pb-1 text-sm text-gray-500">mmHg</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                정상 혈압 범위
              </div>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-gray-500">최고 수축기</span>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">134</span>
                <span className="pb-1 text-sm text-gray-500">mmHg</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-blue-600">5월 28일 오후 9:15</p>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-gray-500">최저 이완기</span>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">70</span>
                <span className="pb-1 text-sm text-gray-500">mmHg</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-cyan-600">5월 28일 오후 9:15</p>
            </MetricCard>
          </div>

          <ChartSection
            title="혈압 변화 추이"
            startDate="2023.10.01" // 
            endDate="2023.10.31"
           
          >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bpData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize:12 , paddingBottom: 10 }}
                  />
                  <defs>
                    <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} tickFormatter={(v) => `2026-${v}`} />
                  <YAxis domain={[0, 150]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="systolic" name="수축기" stroke="#2563eb" strokeWidth={3} fill="url(#systolicGrad)" dot={{ fill: "#2563eb", r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="diastolic" name="이완기" stroke="#06b6d4" strokeWidth={3} fill="url(#diastolicGrad)" dot={{ fill: "#06b6d4", r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
          </ChartSection>

          <RecordTable
            title="최근 측정 기록"
            columns={["측정 일시", "수축기", "이완기", "맥박", "상태"]}
            rows={records}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            renderDesktopRow={(row, index) => (
              <tr key={index} className={`border-t border-gray-50 ${index % 2 === 1 ? "bg-blue-50/20" : ""}`}>
                <td className="px-6 py-3.5 text-center font-medium text-gray-700">{row.time}</td>
                <td className={`px-6 py-3.5 text-center font-semibold ${row.statusType === "warning" ? "text-amber-700" : "text-blue-600"}`}>{row.systolic}</td>
                <td className="px-6 py-3.5 text-center font-semibold text-gray-700">{row.diastolic}</td>
                <td className="px-6 py-3.5 text-center text-gray-600">{row.pulse}</td>
                <td className="px-6 py-3.5 text-center"><StatusBadge status={row.status} type={row.statusType} /></td>
              </tr>
            )}
            renderMobileCard={(row, index) => (
              <div key={index} className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-gray-400">측정 일시</span>
                  <span className="text-sm text-gray-700">{row.time}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-[11px] text-gray-400">수축기</p>
                    <p className={`mt-1 text-sm font-semibold ${row.statusType === "warning" ? "text-amber-700" : "text-blue-600"}`}>{row.systolic}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">이완기</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{row.diastolic}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">맥박</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{row.pulse}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">상태</p>
                    <div className="mt-1"><StatusBadge status={row.status} type={row.statusType} /></div>
                  </div>
                </div>
              </div>
            )}
          />
        </main>
      </div>

      <button className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors hover:bg-blue-700 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14">
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  );
}
