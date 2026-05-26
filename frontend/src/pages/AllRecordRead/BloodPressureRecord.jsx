import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
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
import MetricCard from "../../components/record/MetricCard";
import AIAnalysisCard from "../../components/record/AIAnalysisCard";
import { useAuth } from "../../contexts/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";

const BP_CATEGORIES = [
  "BloodPressure_아침",
  "BloodPressure_점심",
  "BloodPressure_저녁",
  "BloodPressure_취침전",
];
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const formatRecordTime = (record) => {
  if (!record?.recordTime) return "";
  const [h, m] = String(record.recordTime).split(":");
  if (!h) return "";
  const date = record.recordDate ? new Date(record.recordDate) : null;
  if (!date) return `${h}:${m ?? "00"}`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${h}:${m ?? "00"}`;
};

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
        <p style={{ fontWeight: 600, marginBottom: 4, color: "#2d3335" }}>{label}</p>
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
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [todayRecords, setTodayRecords] = useState([]);
  const [rangeRecords, setRangeRecords] = useState([]);

  // 차트 기간 (기본: 오늘 기준 최근 7일)
  const defaultStart = toDateStr(daysAgo(6));
  const defaultEnd = toDateStr(new Date());
  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(defaultEnd);
  const [chartRange, setChartRange] = useState({
    start: defaultStart,
    end: defaultEnd,
  });

  // 오늘 평균/최고/최저 카드용 — userId 변경 시에만
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const todayStr = toDateStr(new Date());

    Promise.allSettled(
      BP_CATEGORIES.map((cat) =>
        bioValueRecordApi.searchByDate(userId, cat, todayStr),
      ),
    ).then((results) => {
      if (cancelled) return;
      const merged = results.flatMap((r) =>
        r.status === "fulfilled" && Array.isArray(r.value?.data) ? r.value.data : [],
      );
      setTodayRecords(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 차트용 — 기간 변경 시 재조회
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.allSettled(
      BP_CATEGORIES.map((cat) =>
        bioValueRecordApi.searchByDateBetween(
          userId,
          cat,
          chartRange.start,
          chartRange.end,
        ),
      ),
    ).then((results) => {
      if (cancelled) return;
      const merged = results.flatMap((r) =>
        r.status === "fulfilled" && Array.isArray(r.value?.data) ? r.value.data : [],
      );
      setRangeRecords(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [userId, chartRange]);

  // 오늘 평균 (수축기/이완기)
  const { avgSystolic, avgDiastolic } = useMemo(() => {
    const sys = todayRecords.map((r) => r.systolicBP).filter((v) => v != null);
    const dia = todayRecords.map((r) => r.diastolicBP).filter((v) => v != null);
    return {
      avgSystolic: sys.length
        ? Math.round(sys.reduce((a, b) => a + b, 0) / sys.length)
        : null,
      avgDiastolic: dia.length
        ? Math.round(dia.reduce((a, b) => a + b, 0) / dia.length)
        : null,
    };
  }, [todayRecords]);

  // 오늘 최고 수축기 + 시각
  const { maxSystolic, maxSystolicAt } = useMemo(() => {
    let row = null;
    todayRecords.forEach((r) => {
      if (r.systolicBP == null) return;
      if (!row || r.systolicBP > row.systolicBP) row = r;
    });
    return {
      maxSystolic: row?.systolicBP ?? null,
      maxSystolicAt: row ? formatRecordTime(row) : null,
    };
  }, [todayRecords]);

  // 오늘 최저 이완기 + 시각
  const { minDiastolic, minDiastolicAt } = useMemo(() => {
    let row = null;
    todayRecords.forEach((r) => {
      if (r.diastolicBP == null) return;
      if (!row || r.diastolicBP < row.diastolicBP) row = r;
    });
    return {
      minDiastolic: row?.diastolicBP ?? null,
      minDiastolicAt: row ? formatRecordTime(row) : null,
    };
  }, [todayRecords]);

  // 차트용 7일 데이터 (날짜별 평균, 두 줄: 수축기/이완기)
  const bpData = useMemo(() => {
    const byDate = new Map();
    rangeRecords.forEach((r) => {
      if (!r.recordDate) return;
      const key = r.recordDate;
      if (!byDate.has(key)) byDate.set(key, { sys: [], dia: [] });
      const bucket = byDate.get(key);
      if (r.systolicBP != null) bucket.sys.push(r.systolicBP);
      if (r.diastolicBP != null) bucket.dia.push(r.diastolicBP);
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, { sys, dia }]) => ({
        date: date.slice(5),
        systolic: sys.length ? Math.round(sys.reduce((a, b) => a + b, 0) / sys.length) : null,
        diastolic: dia.length ? Math.round(dia.reduce((a, b) => a + b, 0) / dia.length) : null,
      }));
  }, [rangeRecords]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
              혈압 기록 확인
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              지난 혈압 변화를 분석한 결과입니다.
            </p>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard className="ring-1 ring-blue-100 bg-gradient-to-br from-blue-50/60 to-white">
                <span className="text-sm font-semibold text-blue-600">
                  오늘 평균 혈압
                </span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-[#0F172A]">
                    {avgSystolic ?? "—"}
                  </span>
                  <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-cyan-600">
                    {avgDiastolic ?? "—"}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-[#64748B]">mmHg</span>
                </div>
                <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {todayRecords.length > 0
                    ? `오늘 ${todayRecords.length}회 측정`
                    : "오늘 기록 없음"}
                </div>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">
                  오늘 최고 수축기
                </span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {maxSystolic ?? "—"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">
                  {maxSystolicAt ?? "기록 없음"}
                </p>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">
                  오늘 최저 이완기
                </span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {minDiastolic ?? "—"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-cyan-600">
                  {minDiastolicAt ?? "기록 없음"}
                </p>
              </MetricCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <AIAnalysisCard />

              <div className="mb-8 flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:p-6 h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <h2 className="text-[18px] font-bold text-[#0F172A]">
                    혈압 변화 추이
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#64748B]">
                      <CalendarDays size={14} className="text-[#94A3B8]" />
                      <input
                        type="date"
                        value={startInput}
                        max={endInput}
                        onChange={(e) => setStartInput(e.target.value)}
                        className="border-none bg-transparent text-sm font-medium text-[#0F172A] outline-none"
                      />
                      <span className="text-[#94A3B8]">~</span>
                      <input
                        type="date"
                        value={endInput}
                        min={startInput}
                        max={defaultEnd}
                        onChange={(e) => setEndInput(e.target.value)}
                        className="border-none bg-transparent text-sm font-medium text-[#0F172A] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setChartRange({ start: startInput, end: endInput })
                      }
                      className="rounded-[10px] bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
                    >
                      적용
                    </button>
                    {(chartRange.start !== defaultStart ||
                      chartRange.end !== defaultEnd) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartInput(defaultStart);
                          setEndInput(defaultEnd);
                          setChartRange({ start: defaultStart, end: defaultEnd });
                        }}
                        className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>
                <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bpData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
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
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["dataMin - 10", "dataMax + 10"]}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="systolic"
                      name="수축기"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#systolicGrad)"
                      dot={{ fill: "#2563eb", r: 4, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="diastolic"
                      name="이완기"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fill="url(#diastolicGrad)"
                      dot={{ fill: "#06b6d4", r: 4, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
