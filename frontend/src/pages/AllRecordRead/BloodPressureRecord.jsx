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
import AIAnalysisCard from "../../components/record/AIAnalysisCard";

const bpData = [
  { date: "05-08", systolic: 118, diastolic: 76 },
  { date: "05-09", systolic: 120, diastolic: 77 },
  { date: "05-10", systolic: 116, diastolic: 74 },
  { date: "05-11", systolic: 121, diastolic: 78 },
  { date: "05-12", systolic: 115, diastolic: 73 },
  { date: "05-13", systolic: 117, diastolic: 75 },
  { date: "05-14", systolic: 122, diastolic: 78 },
];

const records = [
  { time: "오늘 12:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "오늘 08:15", systolic: 134, diastolic: 76, pulse: 78, status: "주의", statusType: "warning" },
  { time: "어제 21:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "어제 12:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "05-13 09:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "05-12 21:30", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "05-12 08:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
  { time: "05-11 20:00", systolic: 118, diastolic: 76, pulse: 72, status: "정상", statusType: "normal" },
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
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">혈압 기록 확인</h1>
          <p className="mb-8 text-sm text-gray-500">지난 혈압 변화를 분석한 결과입니다.</p>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard className="ring-1 ring-blue-100 bg-gradient-to-br from-blue-50/60 to-white">
              <span className="text-sm font-semibold text-blue-600">평균 혈압</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-[44px] font-extrabold leading-none tracking-tight text-[#0F172A]">118</span>
                <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                <span className="text-[44px] font-extrabold leading-none tracking-tight text-cyan-600">76</span>
                <span className="pb-1 text-sm font-semibold text-[#64748B]">mmHg</span>
              </div>
              <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                정상 혈압 범위
              </div>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-[#64748B]">최고 수축기</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">134</span>
                <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
              </div>
              <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">5월 14일 오후 9:15</p>
            </MetricCard>

            <MetricCard>
              <span className="text-xs font-medium text-[#64748B]">최저 이완기</span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">70</span>
                <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
              </div>
              <p className="mt-auto py-1.5 text-xs font-semibold text-cyan-600">5월 14일 오후 9:15</p>
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AIAnalysisCard />

            <ChartSection
              title="혈압 변화 추이"
              startDate="2026.05.07" //
              endDate="2026.05.15"
              chartClassName="h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2"
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
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
