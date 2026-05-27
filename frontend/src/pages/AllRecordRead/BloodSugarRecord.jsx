import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { USER_KEY } from "../../api/api";
import bioValueRecordApi from "../../api/bioValueRecordApi";
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
import AIAnalysisCard from "../../components/record/AIAnalysisCard";

const BLOOD_SUGAR_CATEGORY = "BloodSugar";

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
      .getPageByCategory(userId, BLOOD_SUGAR_CATEGORY, 0, 200)
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

  // 차트용: 오름차순 정렬
  const chartData = [...filteredRecords]
    .reverse()
    .map((r) => ({
      date: `${r.recordDate ? r.recordDate.slice(5) : ""}|${r.recordTime ? r.recordTime.slice(0, 5) : ""}`,
      bloodSugar: r.bloodSugar ?? null,
    }));

  // 요약 통계 (필터 기간 기준)
  const validValues = filteredRecords.map((r) => r.bloodSugar).filter((v) => v != null);
  const avg =
    validValues.length > 0
      ? Math.round(validValues.reduce((s, v) => s + v, 0) / validValues.length)
      : null;
  const latest = filteredRecords[0] ?? null;
  const latestLabel =
    latest?.recordDate && latest?.recordTime
      ? `${latest.recordDate} ${latest.recordTime.slice(0, 5)}`
      : null;

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
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-rose-500">
                    {loading ? "…" : (avg ?? "--")}
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
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {loading ? "…" : (latest?.bloodSugar ?? "--")}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mg/dL</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">
                  {latestLabel ?? "기록 없음"}
                </p>
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
              >
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    해당 기간에 혈당 기록이 없습니다.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={<CustomXTick />} height={45} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                      <YAxis domain={[0, 250]} ticks={[0, 50, 100, 150, 200, 250]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="bloodSugar" name="혈당" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#fff", stroke: "#f43f5e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} connectNulls />
                    </LineChart>
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
