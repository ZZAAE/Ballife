import { useState } from "react";
import { TrendingDown, MessageCircle, Sparkles, Gift } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartSection from "../../components/record/ChartSection";
import MetricCard from "../../components/record/MetricCard";
import RecordTable from "../../components/record/RecordTable";
import StatusBadge from "../../components/record/StatusBadge";

const chartData = [
  { date: "2026-05-08", weight: 75.5 },
  { date: "2026-05-09", weight: 75.2 },
  { date: "2026-05-10", weight: 75.0 },
  { date: "2026-05-11", weight: 75.4 },
  { date: "2026-05-12", weight: 75.7 },
  { date: "2026-05-13", weight: 75.1 },
  { date: "2026-05-14", weight: 74.8 },
];


const records = [
  { time: "오늘 12:30", category: "체중", weight: 75.0, bmi: 24.1, status: "정상", type: "normal" },
  { time: "오늘 08:00", category: "체중", weight: 74.8, bmi: 24.0, status: "정상", type: "normal" },
  { time: "어제 21:00", category: "체중", weight: 75.1, bmi: 24.2, status: "정상", type: "normal" },
  { time: "어제 12:30", category: "체중", weight: 74.9, bmi: 24.1, status: "정상", type: "normal" },
  { time: "05-13 09:00", category: "체중", weight: 75.1, bmi: 24.2, status: "정상", type: "normal" },
  { time: "05-12 21:30", category: "체중", weight: 76.1, bmi: 24.5,  status: "정상", type: "normal" },
  { time: "05-12 08:00", category: "체중", weight: 75.7, bmi: 24.1, status: "정상", type: "normal" },
  { time: "05-11 20:00", category: "체중", weight: 75.4, bmi: 24.0, status: "정상", type: "normal" },

]

export default function WeightRecord() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-['Noto_Sans_KR']">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
          {/* Header */}
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
            체중 기록 확인
          </h1>
          <p className="mt-2 mb-6 text-sm text-[#64748B]">
            지난 신체 변화를 분석한 결과입니다.
          </p>

          {/* ── Stat Cards ── */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* 현재 체중 */}
            {/* 카드 3개  */}
            <MetricCard>
              <span className="text-xs font-medium text-blue-600">
                현재 체중
              </span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">72.4</span>
                <span className="pb-1 text-sm text-[#64748B]">kg</span>
              </div>
              <div className="mt-auto flex items-center gap-1 text-[10px] font-semibold text-blue-500">
                <TrendingDown size={12} />
                <span>지난주 대비 -0.5 kg</span>
              </div>
            </MetricCard>

            {/* BMI 지수 */}
            <MetricCard>
              <span className="text-xs text-[#64748B] font-medium">
                BMI 지수
              </span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">23.8</span>
              </div>
              {/* BMI Bar */}
              <div className="mt-auto">
                <div className="relative h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400">
                  <div
                    className="absolute -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0F172A] shadow"
                    style={{ left: "45%" }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
                  <span>저체중</span>
                  <span>정상</span>
                  <span>과체중</span>
                </div>
              </div>
            </MetricCard>

            {/* 목표 체중 */}
            <MetricCard>
              <span className="text-xs text-red-500 font-medium">
                목표 체중
              </span>
              <div className="mt-3 flex min-h-[44px] items-end gap-2">
                <span className="text-4xl font-bold leading-none text-[#0F172A]">68.0</span>
                <span className="pb-1 text-sm text-[#64748B]">kg</span>
              </div>
              {/* Progress */}
              <div className="mt-auto">
                <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: "80%" }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
                  <span>현재 72.4kg</span>
                  <span className="font-semibold text-blue-600">80%</span>
                  <span>목표까지 -4.4kg</span>
                </div>
              </div>
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* AI 분석 박스 */}
            <aside className="mb-8 flex h-[calc(100vh-500px)] min-h-[280px] flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-4 flex min-h-[38px] items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#0F172A]">
                  <Sparkles className="h-[18px] w-[18px] text-[#0F172A]" strokeWidth={2.4} />
                  AI 건강 분석
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F9FAFB]"
                >
                  <Gift className="h-3.5 w-3.5 text-[#0F172A]" strokeWidth={2.2} />
                  리워드
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-8 text-center">
                <Sparkles className="mb-3 h-6 w-6 text-[#94A3B8]" strokeWidth={1.8} />
                <p className="text-sm font-semibold text-[#64748B]">
                  분석 결과를 준비 중입니다
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  데이터가 누적되면 맞춤 인사이트를 제공해드려요
                </p>
              </div>
            </aside>

            <ChartSection
              title="체중 변화 추이"
              startDate="2026.05.07"
              endDate="2026.05.15"
              chartClassName="h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2"
            >
                <ResponsiveContainer width="100%" height = "100%">
                  <LineChart data={chartData}>
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize:12 , paddingBottom: 10 }}
                  />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 90]}
                      ticks={[50, 60, 70, 80, 90]}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="체중"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
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
