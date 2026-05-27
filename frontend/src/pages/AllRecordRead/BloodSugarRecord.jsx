import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { USER_KEY } from "../../api/api";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import ChartSection from "../../components/record/ChartSection";
import MetricCard from "../../components/record/MetricCard";
import AIAnalysisCard from "../../components/record/AIAnalysisCard";

//const BLOOD_SUGAR_CATEGORY = "BloodSugar";

const resolveUserId = (user) => {
  const fromContext = user?.userId ?? user?.id ?? user?.memberId;
  if (fromContext != null) return fromContext;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem("user") ||
      localStorage.getItem("loginUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? parsed?.id ?? parsed?.memberId ?? null;
  } catch {
    return null;
  }
};

const CustomXTick = ({ x, y, payload }) => {
  const [datePart, timePart] = (payload.value ?? "").split("|");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#9ca3af" fontSize={11}>{datePart}</text>
      <text x={0} y={0} dy={24} textAnchor="middle" fill="#b0b8c8" fontSize={10}>{timePart}</text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const [datePart, timePart] = (label ?? "").split("|");
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 16px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>{datePart}{timePart ? ` ${timePart}` : ""}</p>
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
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [chartView, setChartView] = useState("mealtime"); // "mealtime" | "fasting"

  const [pendingStart, setPendingStart] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [pendingEnd, setPendingEnd] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterStart, setFilterStart] = useState(pendingStart);
  const [filterEnd, setFilterEnd] = useState(pendingEnd);

  const handleApply = () => {
    setFilterStart(pendingStart);
    setFilterEnd(pendingEnd);
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    bioValueRecordApi
      .getPageByCategorySugar(userId, 0, 200)
      .then((res) => {
        const content = res.data?.content ?? [];
        setRecords(content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // 필터 범위 내 기록 (차트 + 카드 공통)
  const filteredRecords = [...records]
    .filter((r) => r.recordDate >= filterStart && r.recordDate <= filterEnd);

  // category → 4개 그룹 매핑 헬퍼
  const toGroup = (cat) => {
    if (!cat) return null;
    if (cat === "공복혈당" || cat === "공복") return "공복";
    if (cat.includes("식전")) return "식전";
    if (cat.includes("식후")) return "식후";
    if (cat === "취침전") return "취침전";
    return null;
  };

  // 차트용: 오름차순 정렬, 4그룹 필드로 변환
  const chartData = [...filteredRecords]
    .reverse()
    .map((r) => {
      const group = toGroup(r.category);
      return {
        date: `${r.recordDate ? r.recordDate.slice(5) : ""}|${r.recordTime ? r.recordTime.slice(0, 5) : ""}`,
        공복: group === "공복" ? (r.bloodSugar ?? null) : null,
        식전: group === "식전" ? (r.bloodSugar ?? null) : null,
        식후: group === "식후" ? (r.bloodSugar ?? null) : null,
        취침전: group === "취침전" ? (r.bloodSugar ?? null) : null,
      };
    });

  // 뷰별 관련 데이터만 필터링 (선 연결 개선)
  const mealtimeData = chartData.filter((r) => r.식전 !== null || r.식후 !== null);
  const fastingData  = chartData.filter((r) => r.공복 !== null || r.취침전 !== null);

  // 그룹별 평균
  const avgByGroup = (group) => {
    const vals = filteredRecords
      .filter((r) => toGroup(r.category) === group)
      .map((r) => r.bloodSugar)
      .filter((v) => v != null);
    return vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const avgMealBefore = avgByGroup("식전");
  const avgMealAfter  = avgByGroup("식후");

  // 그룹별 최근 수치 (filteredRecords는 내림차순)
  const latestMealBefore = filteredRecords.find((r) => toGroup(r.category) === "식전");
  const latestMealAfter  = filteredRecords.find((r) => toGroup(r.category) === "식후");
  const latestFasting    = filteredRecords.find((r) => toGroup(r.category) === "공복");

  // 필터 기간 기록 수 + 날짜 범위
  const dataStart = filterStart;
  const dataEnd = filterEnd;

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
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-blue-500">
                    {loading ? "…" : (avgMealBefore ?? "--")}
                  </span>
                  <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-red-500">
                    {loading ? "…" : (avgMealAfter ?? "--")}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-[#64748B]">mg/dL</span>
                </div>
                <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  {filteredRecords.length > 0 ? `기간 내 ${filteredRecords.length}건 평균` : "기록 없음"}
                </div>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">최근 혈당</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-blue-500">
                    {loading ? "…" : (latestMealBefore?.bloodSugar ?? "--")}
                  </span>
                  <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                  <span className="text-4xl font-bold leading-none text-red-500">
                    {loading ? "…" : (latestMealAfter?.bloodSugar ?? "--")}
                  </span>
                  <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                  <span className="text-4xl font-bold leading-none text-slate-400">
                    {loading ? "…" : (latestFasting?.bloodSugar ?? "--")}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mg/dL</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">식전 / 식후 / 공복</p>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">총 기록 수</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-rose-600">
                    {loading ? "…" : filteredRecords.length}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">건</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-rose-600">
                  {dataStart && dataEnd ? `${dataStart} ~ ${dataEnd}` : "기록 없음"}
                </p>
              </MetricCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <AIAnalysisCard />

              <ChartSection
                title="혈당 변화 추이"
                startDate={pendingStart}
                endDate={pendingEnd}
                onStartDateChange={setPendingStart}
                onEndDateChange={setPendingEnd}
                onApply={handleApply}
                chartClassName="h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2"
                headerExtra={
                  <div className="inline-flex rounded-full bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setChartView("mealtime")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        chartView === "mealtime"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      식전 · 식후
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView("fasting")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        chartView === "fasting"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      공복 · 취침전
                    </button>
                  </div>
                }
              >
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    해당 기간에 혈당 기록이 없습니다.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartView === "mealtime" ? mealtimeData : fastingData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mealBeforeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="mealAfterGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fastingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="bedtimeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={<CustomXTick />} height={45} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                      <YAxis domain={[0, 250]} ticks={[0, 50, 100, 150, 200, 250]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      {chartView === "mealtime" ? (
                        <>
                          <Area type="monotone" dataKey="식전" name="식전" stroke="#3b82f6" strokeWidth={2.5} fill="url(#mealBeforeGrad)" dot={{ fill: "#fff", stroke: "#3b82f6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
                          <Area type="monotone" dataKey="식후" name="식후" stroke="#22c55e" strokeWidth={2.5} fill="url(#mealAfterGrad)" dot={{ fill: "#fff", stroke: "#22c55e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
                        </>
                      ) : (
                        <>
                          <Area type="monotone" dataKey="공복" name="공복" stroke="#f43f5e" strokeWidth={2.5} fill="url(#fastingGrad)" dot={{ fill: "#fff", stroke: "#f43f5e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
                          <Area type="monotone" dataKey="취침전" name="취침전" stroke="#a855f7" strokeWidth={2.5} fill="url(#bedtimeGrad)" dot={{ fill: "#fff", stroke: "#a855f7", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
                        </>
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartSection>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
