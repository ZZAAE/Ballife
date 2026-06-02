import { useEffect, useMemo, useState } from "react";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
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
import MetricCard from "../../components/record/MetricCard";
import AIAnalysisCard from "../../components/record/AIAnalysisCard";
import { useAuth } from "../../contexts/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userConfigApi from "../../api/userConfigApi";
import userApi from "../../api/userApi";

const WEIGHT_CATEGORY = "Weight";
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const todayStr = () => toDateStr(new Date());
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
};

export default function WeightRecord() {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [latestWeight, setLatestWeight] = useState(null);
  const [weeklyRecords, setWeeklyRecords] = useState([]);
  const [targetWeight, setTargetWeight] = useState(null);
  const [heightCm, setHeightCm] = useState(null);

  // 차트 기간 (기본: 최근 7일)
  const defaultStart = daysAgoStr(6);
  const defaultEnd = todayStr();
  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(defaultEnd);
  const [chartRange, setChartRange] = useState({ start: defaultStart, end: defaultEnd });

  // 메트릭 카드용 데이터 (최신/지난주 평균/목표/키) — 한 번만 로드
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.allSettled([
      bioValueRecordApi.getLatestPageByCategory(userId, WEIGHT_CATEGORY),
      userConfigApi.getTargetWeight(userId),
      userApi.getMember(userId),
    ]).then(([latestRes, targetRes, memberRes]) => {
      if (cancelled) return;

      // 최신 체중 기록값
      let recordWeight = null;
      if (latestRes.status === "fulfilled") {
        const content = latestRes.value?.data?.content ?? [];
        if (content[0]?.weight != null) recordWeight = Number(content[0].weight);
      }

      // 회원정보(프로필) 몸무게 / 키
      let profileWeight = null;
      if (memberRes.status === "fulfilled" && memberRes.value?.data) {
        const member = memberRes.value.data;
        if (member.height != null) setHeightCm(Number(member.height));
        if (member.weight != null) profileWeight = Number(member.weight);
      }

      // 현재 체중: 회원정보 몸무게를 우선, 없으면 최신 체중 기록 (메인 페이지와 일관)
      setLatestWeight(profileWeight ?? recordWeight);

      if (targetRes.status === "fulfilled" && targetRes.value?.data != null) {
        setTargetWeight(Number(targetRes.value.data));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 차트용 기간 데이터 (기간 변경 시 재조회)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    bioValueRecordApi
      .searchByDateBetween(userId, WEIGHT_CATEGORY, chartRange.start, chartRange.end)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setWeeklyRecords(list);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId, chartRange]);


  // 파생 값
  const chartData = useMemo(
    () =>
      weeklyRecords
        .filter((r) => r.weight != null)
        .map((r) => ({ date: r.recordDate, weight: Number(r.weight) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [weeklyRecords],
  );

  const weeklyAvg = useMemo(() => {
    if (!chartData.length) return null;
    const sum = chartData.reduce((acc, r) => acc + r.weight, 0);
    return +(sum / chartData.length).toFixed(1);
  }, [chartData]);

  const weeklyDelta = useMemo(() => {
    if (latestWeight == null || weeklyAvg == null) return null;
    return +(latestWeight - weeklyAvg).toFixed(1);
  }, [latestWeight, weeklyAvg]);

  // BMI = 체중(kg) / (신장(m))²
  const bmi = useMemo(() => {
    if (latestWeight == null || !heightCm) return null;
    const h = heightCm / 100;
    return +(latestWeight / (h * h)).toFixed(1);
  }, [latestWeight, heightCm]);

  // BMI 바 위치: 15~30 범위를 0~100%로 매핑
  const bmiPosition = useMemo(() => {
    if (bmi == null) return 0;
    return Math.max(0, Math.min(100, ((bmi - 15) / (30 - 15)) * 100));
  }, [bmi]);

  // 목표 진행률: 목표와의 절대 거리를 10kg 스케일로 환산 (1kg ≈ 10%)
  // 0kg 차이 → 100%, 5kg 차이 → 50%, 10kg 이상 → 0%
  const PROGRESS_SCALE_KG = 10;
  const targetProgress = useMemo(() => {
    if (latestWeight == null || targetWeight == null) return 0;
    const diff = Math.abs(latestWeight - targetWeight);
    const progress = 100 - (diff / PROGRESS_SCALE_KG) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [latestWeight, targetWeight]);

  const remaining = useMemo(() => {
    if (latestWeight == null || targetWeight == null) return null;
    return +(targetWeight - latestWeight).toFixed(1);
  }, [latestWeight, targetWeight]);

  const showInc = weeklyDelta != null && weeklyDelta > 0;
  const showDec = weeklyDelta != null && weeklyDelta < 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] font-['Noto_Sans_KR']">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
              체중 기록 확인
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              지난 신체 변화를 분석한 결과입니다.
            </p>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {/* 현재 체중 */}
              <MetricCard>
                <span className="text-xs font-medium text-blue-600">현재 체중</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {latestWeight ?? "—"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">kg</span>
                </div>
                <div
                  className={`mt-auto flex items-center gap-1 text-[11px] font-semibold ${
                    showInc ? "text-rose-500" : showDec ? "text-blue-500" : "text-[#94A3B8]"
                  }`}
                >
                  {showInc && <TrendingUp size={12} />}
                  {showDec && <TrendingDown size={12} />}
                  <span>
                    {weeklyDelta != null
                      ? `지난주 평균 대비 ${weeklyDelta > 0 ? "+" : ""}${weeklyDelta} kg`
                      : "지난주 기록이 부족합니다"}
                  </span>
                </div>
              </MetricCard>

              {/* BMI 지수 */}
              <MetricCard>
                <span className="text-xs text-[#64748B] font-medium">BMI 지수</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {bmi ?? "—"}
                  </span>
                  {bmi != null && (
                    <span className="pb-1 text-xs text-[#94A3B8]">
                      체중 / 신장(m)²
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="relative h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400">
                    {bmi != null && (
                      <div
                        className="absolute -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0F172A] shadow"
                        style={{ left: `${bmiPosition}%` }}
                      />
                    )}
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
                <span className="text-xs text-red-500 font-medium">목표 체중</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {targetWeight ?? "—"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">kg</span>
                </div>
                <div className="mt-auto">
                  <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${targetProgress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
                    <span>
                      {latestWeight != null ? `현재 ${latestWeight}kg` : "현재 —"}
                    </span>
                    <span className="font-semibold text-blue-600">{targetProgress}%</span>
                    <span>
                      {remaining != null
                        ? `목표까지 ${remaining > 0 ? "+" : ""}${remaining}kg`
                        : "목표까지 —"}
                    </span>
                  </div>
                </div>
              </MetricCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <AIAnalysisCard
                metric="weight"
                userId={userId}
                data={{
                  current: latestWeight,
                  target: targetWeight,
                  bmi,
                  range: chartRange,
                  trend: chartData,
                }}
              />

              <div className="mb-8 flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:p-6 h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <h2 className="text-[18px] font-bold text-[#0F172A]">
                    체중 변화 추이
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
                        max={todayStr()}
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
                  <LineChart data={chartData}>
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
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
                      domain={["dataMin - 2", "dataMax + 2"]}
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
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
