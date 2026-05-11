import { useState } from "react";
import { TrendingDown, MessageCircle } from "lucide-react";
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
  { date: "2026-03-25", weight: 58 },
  { date: "2026-03-26", weight: 55 },
  { date: "2026-03-27", weight: 48 },
  { date: "2026-03-28", weight: 56 },
  { date: "2026-03-29", weight: 53 },
  { date: "2026-03-30", weight: 52 },
  { date: "2026-03-31", weight: 65 },
];

const measurementData = Array(8).fill({
  date: "2026.02.22",
  weight: 72.4,
  bmi: 22.8,
  status: "정상",
});


export default function WeightRecord() {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate] = useState("2023.10.01");
  const [endDate] = useState("2023.10.31");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ───────── Body ───────── */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col xl:flex-row">
        {/* ───────── Main Content ───────── */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {/* Header */}
          <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            체중 기록 확인
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            지난 한 달간의 신체 변화를 분석한 결과입니다.
          </p>

          {/* ── Stat Cards ── */}
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* 현재 체중 */}
            {/* 카드 3개  */}
            <MetricCard>
              <span className="text-xs text-blue-600 font-medium">
                현재 체중
              </span>
              <div className="mt-2 text-4xl font-bold text-gray-900">
                72.4{" "}
                <span className="text-base font-normal text-gray-500">kg</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-blue-500">
                <TrendingDown size={14} />
                <span>지난주 대비 -0.5 kg</span>
              </div>
            </MetricCard>

            {/* BMI 지수 */}
            <MetricCard>
              <span className="text-xs text-gray-500 font-medium">
                BMI 지수
              </span>
              <div className="flex items-end gap-3 mt-2">
                <span className="text-4xl font-bold text-gray-900">23.8</span>
                <span className="mb-1 px-3 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                  NORMAL
                </span>
              </div>
              {/* BMI Bar */}
              <div className="mt-5 flex items-center gap-1 text-[10px] text-gray-400">
                <span>저체중</span>
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400 relative">
                  {/* 나중에 left 값 계산해서 위치 조정 필요 */}
                  <div
                    className="absolute -top-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-white shadow"
                    style={{ left: "45%" }}
                  />
                </div>
                <span>정상</span>
                <span className="ml-6">과체중</span>
              </div>
            </MetricCard>

            {/* 목표 체중 */}
            <MetricCard>
              <span className="text-xs text-red-500 font-medium">
                목표 체중
              </span>
              <div className="mt-2 text-4xl font-bold text-gray-900">
                68.0{" "}
                <span className="text-base font-normal text-gray-500">kg</span>
              </div>
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>현재 체중:72.4kg</span>
                  <span>목표까지:-4.4kg</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100">
                  {/* 이 부분도 동일 하게 width 계산해서 조정 필요 */}
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: "80%" }}
                  />
                </div>
                <span className="text-[10px] text-blue-600 font-medium">
                  80%
                </span>
              </div>
            </MetricCard>
          </div>

          <ChartSection
            title="체중 변화 추이"
            startDate={startDate}
            endDate={endDate}
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
                    domain={[0, 90]}
                    ticks={[0, 30, 60, 90]}
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

          <RecordTable
            title="최근 측정 기록"
            columns={["측정 일시", "체중 (KG)", "BMI", "상태"]}
            rows={measurementData}
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
            renderDesktopRow={(row, index) => (
              <tr key={index} className={`border-t border-gray-50 ${index % 2 === 1 ? "bg-blue-50/30" : ""}`}>
                <td className="px-6 py-3.5 text-center text-gray-700">{row.date}</td>
                <td className="cursor-pointer px-6 py-3.5 text-center font-medium text-blue-600 underline">{row.weight}</td>
                <td className="px-6 py-3.5 text-center text-gray-700">{row.bmi}</td>
                <td className="px-6 py-3.5 text-center"><StatusBadge status={row.status} type="normal" /></td>
              </tr>
            )}
            renderMobileCard={(row, index) => (
              <div key={index} className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-gray-400">측정 일시</span>
                  <span className="text-sm text-gray-700">{row.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-[11px] text-gray-400">체중</p>
                    <p className="mt-1 text-sm font-semibold text-blue-600">{row.weight}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">BMI</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{row.bmi}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">상태</p>
                    <div className="mt-1"><StatusBadge status={row.status} type="normal" /></div>
                  </div>
                </div>
              </div>
            )}
          />
        </main>
      </div>

      {/* ───────── Chat FAB ───────── */}
      <button className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors hover:bg-blue-700 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14">
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  );
}
