import { useCallback, useEffect, useMemo, useState } from "react";
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
import AIAnalysisCard from "../../components/record/AIAnalysisCard";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import { useAuth } from "../../contexts/AuthContext";
import { USER_KEY } from "../../api/api";

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

// 혈압 카테고리는 "BloodPressure" 또는 "BloodPressure_아침" 등 prefix 형태
const isBloodPressureRecord = (r) =>
  r &&
  r.systolicBP != null &&
  (typeof r.category !== "string" || r.category.startsWith("BloodPressure"));

const pad2 = (n) => String(n).padStart(2, "0");

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  // recordDate 가 "2026-05-26" 또는 Date 객체로 올 수 있음
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
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
  const userId = resolveUserId(user);

  const [bpRecords, setBpRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 차트 날짜 필터 (혈당 페이지와 동일한 기준: 기본 최근 7일, 적용 버튼으로 반영)
  const [pendingStart, setPendingStart] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [pendingEnd, setPendingEnd] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterStart, setFilterStart] = useState(pendingStart);
  const [filterEnd, setFilterEnd] = useState(pendingEnd);

  const handleApply = () => {
    setFilterStart(pendingStart);
    setFilterEnd(pendingEnd);
  };

  const fetchRecords = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    bioValueRecordApi
      .getAllBioValueRecords(userId)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter(isBloodPressureRecord);
        // recordDate + recordTime 오름차순 정렬
        filtered.sort((a, b) => {
          const ka = `${a.recordDate} ${a.recordTime || "00:00:00"}`;
          const kb = `${b.recordDate} ${b.recordTime || "00:00:00"}`;
          return ka.localeCompare(kb);
        });
        setBpRecords(filtered);
      })
      .catch((err) => {
        console.error("혈압 기록 조회 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // 마운트 시 1회
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 탭 포커스 / 가시성 변화 / 뒤로가기 시 자동 재조회
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") fetchRecords();
    };
    window.addEventListener("focus", handler);
    window.addEventListener("pageshow", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("focus", handler);
      window.removeEventListener("pageshow", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, [fetchRecords]);

  // 페이지가 보이는 동안 5초마다 폴링 (DB에 새로 저장된 기록 자동 반영)
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchRecords();
    }, 5000);
    return () => clearInterval(id);
  }, [fetchRecords]);

  // 차트 데이터: 각 기록을 하나의 점으로 (date = MM-DD)
  const bpData = useMemo(() => {
    return bpRecords
      .filter((r) => {
        const d = String(r.recordDate ?? "").slice(0, 10);
        return d >= filterStart && d <= filterEnd;
      })
      .map((r) => ({
        date: formatDateLabel(r.recordDate),
        systolic: r.systolicBP,
        diastolic: r.diastolicBP,
      }));
  }, [bpRecords, filterStart, filterEnd]);

  // 메트릭 계산: 오늘 당일에 기록한 혈압만 사용 (평균/최고/최저) + 차트 범위는 전체 기준
  const metrics = useMemo(() => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
      now.getDate()
    )}`;

    const fmt = (dateStr) => {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
    };

    const startDateLabel =
      bpRecords.length > 0 ? fmt(bpRecords[0].recordDate) : "";
    const endDateLabel =
      bpRecords.length > 0 ? fmt(bpRecords[bpRecords.length - 1].recordDate) : "";

    // 오늘 날짜와 동일한 기록만 추출 (recordDate 가 "YYYY-MM-DD" 형식)
    const todayRecords = bpRecords.filter((r) => {
      if (!r.recordDate) return false;
      const dateStr = String(r.recordDate).slice(0, 10);
      return dateStr === todayKey;
    });

    if (todayRecords.length === 0) {
      return {
        avgSystolic: null,
        avgDiastolic: null,
        maxSystolicRecord: null,
        minDiastolicRecord: null,
        startDateLabel,
        endDateLabel,
      };
    }

    const sysSum = todayRecords.reduce((acc, r) => acc + (r.systolicBP || 0), 0);
    const diaSum = todayRecords.reduce((acc, r) => acc + (r.diastolicBP || 0), 0);
    const avgSystolic = Math.round(sysSum / todayRecords.length);
    const avgDiastolic = Math.round(diaSum / todayRecords.length);

    const maxSystolicRecord = todayRecords.reduce(
      (best, r) =>
        r.systolicBP > (best?.systolicBP ?? -Infinity) ? r : best,
      null
    );
    const minDiastolicRecord = todayRecords.reduce(
      (best, r) =>
        r.diastolicBP < (best?.diastolicBP ?? Infinity) ? r : best,
      null
    );

    return {
      avgSystolic,
      avgDiastolic,
      maxSystolicRecord,
      minDiastolicRecord,
      startDateLabel,
      endDateLabel,
    };
  }, [bpRecords]);

  // 평균 혈압 상태 (정상/주의/고혈압/저혈압)
  const avgStatus = useMemo(() => {
    const s = metrics.avgSystolic;
    const d = metrics.avgDiastolic;
    if (s == null || d == null) {
      return { label: "기록 없음", chip: "bg-gray-100 text-gray-500 ring-gray-200", dot: "bg-gray-400" };
    }
    if (s >= 140 || d >= 90) {
      return { label: "고혈압 범위", chip: "bg-rose-50 text-rose-700 ring-rose-100", dot: "bg-rose-500" };
    }
    if (s >= 120 || d >= 80) {
      return { label: "주의 범위", chip: "bg-amber-50 text-amber-700 ring-amber-100", dot: "bg-amber-500" };
    }
    if (s <= 90 || d <= 60) {
      return { label: "저혈압 범위", chip: "bg-blue-50 text-blue-700 ring-blue-100", dot: "bg-blue-500" };
    }
    return { label: "정상 혈압 범위", chip: "bg-emerald-50 text-emerald-700 ring-emerald-100", dot: "bg-emerald-500" };
  }, [metrics.avgSystolic, metrics.avgDiastolic]);

  // 측정 일시 라벨 ("5월 14일 오후 9:15" 형식)
  const formatRecordWhen = (r) => {
    if (!r) return "기록 없음";
    const d = new Date(r.recordDate);
    if (Number.isNaN(d.getTime())) return r.recordDate;
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const time = (r.recordTime || "00:00:00").slice(0, 5);
    const [hhStr, mm] = time.split(":");
    const hh = parseInt(hhStr, 10);
    const ampm = hh < 12 ? "오전" : "오후";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${month}월 ${day}일 ${ampm} ${h12}:${mm}`;
  };

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
                <span className="text-sm font-semibold text-blue-600">평균 혈압</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-[#0F172A]">
                    {metrics.avgSystolic ?? "-"}
                  </span>
                  <span className="pb-1 text-xl text-[#94A3B8]">/</span>
                  <span className="text-[44px] font-extrabold leading-none tracking-tight text-cyan-600">
                    {metrics.avgDiastolic ?? "-"}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-[#64748B]">mmHg</span>
                </div>
                <div
                  className={`mt-auto inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${avgStatus.chip}`}
                >
                  <span className={`h-2 w-2 rounded-full ${avgStatus.dot}`} />
                  {avgStatus.label}
                </div>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">최고 수축기</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {metrics.maxSystolicRecord?.systolicBP ?? "-"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-blue-600">
                  {formatRecordWhen(metrics.maxSystolicRecord)}
                </p>
              </MetricCard>

              <MetricCard>
                <span className="text-xs font-medium text-[#64748B]">최저 이완기</span>
                <div className="mt-3 flex min-h-[44px] items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-[#0F172A]">
                    {metrics.minDiastolicRecord?.diastolicBP ?? "-"}
                  </span>
                  <span className="pb-1 text-sm text-[#64748B]">mmHg</span>
                </div>
                <p className="mt-auto py-1.5 text-xs font-semibold text-cyan-600">
                  {formatRecordWhen(metrics.minDiastolicRecord)}
                </p>
              </MetricCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <AIAnalysisCard
                metric="bloodPressure"
                userId={userId}
                data={{
                  avgSystolic: metrics.avgSystolic,
                  avgDiastolic: metrics.avgDiastolic,
                  status: avgStatus.label,
                  maxSystolic: metrics.maxSystolicRecord?.systolicBP ?? null,
                  minDiastolic: metrics.minDiastolicRecord?.diastolicBP ?? null,
                  range: { start: filterStart, end: filterEnd },
                  trend: bpData,
                }}
              />

              <ChartSection
                title="혈압 변화 추이"
                startDate={pendingStart}
                endDate={pendingEnd}
                onStartDateChange={setPendingStart}
                onEndDateChange={setPendingEnd}
                onApply={handleApply}
                chartClassName="h-[calc(100vh-500px)] min-h-[280px] xl:col-span-2"
              >
                {bpData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    해당 기간에 혈압 기록이 없습니다.
                  </div>
                ) : (
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
                )}
              </ChartSection>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
