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
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-[55px]">

      {/* ───────── Body ───────── */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col xl:flex-row">
        {/* ───────── Main Content ───────── */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {/* Header */}
          <h1 className="tmb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            체중 기록 확인
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            지난 신체 변화를 분석한 결과입니다.
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
            startDate="2026.05.07"
            endDate="2026.05.15"
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

          <RecordTable
                      title="최근 측정 기록"
                      columns={["측정 일시", "체중 (KG)", "BMI", "상태"]}
                      rows={records}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      renderDesktopRow={(row, index) => (
                        <tr key={index} className={`border-t border-gray-50 ${index % 2 === 1 ? "bg-blue-50/20" : ""}`}>
                          <td className="px-6 py-3.5 text-center font-medium text-gray-700">{row.time}</td>
                          <td className="px-6 py-3.5 text-center font-semibold text-slate-700">{row.weight}</td>
                          <td className="px-6 py-3.5 text-center font-semibold text-slate-700">{row.bmi }</td>
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
