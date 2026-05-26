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
import AIAnalysisCard from "../../components/record/AIAnalysisCard";
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
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-['Noto_Sans_KR']">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">혈당 기록 확인</h1>
          <p className="mb-8 text-sm text-gray-500">지난 혈당 변화를 분석한 결과입니다.</p>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard className="ring-1 ring-rose-100 bg-gradient-to-br from-rose-50/40 to-white">
              <span className="text-sm font-semibold text-rose-500">평균 혈당</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-[44px] font-extrabold leading-none tracking-tight text-rose-500">148</span>
                <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                <span className="text-[44px] font-extrabold leading-none tracking-tight text-blue-600">94</span>
                <span className="pb-1 text-sm font-semibold text-[#64748B]">mg/dL</span>
              </div>
              <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
                <span className="h-2 w-2 rounded-full bg-rose-400" />정상 혈당 범위
              </div>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-[#64748B]">식전 혈당</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">94</span>
                <span className="pb-1 text-sm text-[#64748B]">mg/dL</span>
              </div>
              <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">5월 14일 오후 8:15</p>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-[#64748B]">식후 혈당</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-rose-600">148</span>
                <span className="pb-1 text-sm text-[#64748B]">mg/dL</span>
              </div>
              <p className="mt-auto py-1.5 text-xs font-semibold text-rose-600">5월 14일 오후 9:15</p>
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AIAnalysisCard />

            <ChartSection
              title="혈당 변화 추이"
              startDate="2026.05.07"
              endDate="2026.05.15"
              chartClassName="h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2"
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
          </div>
          </div>
        </main>
      </div>
    </div>

  );
}
