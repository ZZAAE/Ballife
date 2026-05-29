import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileText, Lock, Droplet, HeartPulse, Scale } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import subscriptionApi from "../../api/subscriptionApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userApi from "../../api/userApi";

const contentOf = (res) =>
  Array.isArray(res?.data?.content) ? res.data.content : [];

const avg = (nums) =>
  nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : null;

const CHART_TABS = [
  { key: "bloodSugar", label: "혈당" },
  { key: "bloodPressure", label: "혈압" },
  { key: "weight", label: "체중" },
  { key: "bmi", label: "BMI" },
];

function SummaryCard({ icon: Icon, accent, bg, label, value, unit, sub }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: bg, color: accent }}
        >
          <Icon size={16} />
        </div>
        <span className="text-[13px] font-medium text-[#64748B]">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-[28px] font-extrabold leading-none text-[#0F172A]">
          {value ?? "—"}
        </span>
        {value != null && unit && (
          <span className="pb-1 text-[12px] text-[#94A3B8]">{unit}</span>
        )}
      </div>
      {sub && <p className="mt-2 text-[11px] text-[#94A3B8]">{sub}</p>}
    </div>
  );
}

export default function HealthReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [loading, setLoading] = useState(true);
  const [reportAccess, setReportAccess] = useState(false);
  const [bloodSugar, setBloodSugar] = useState([]);
  const [bloodPressure, setBloodPressure] = useState([]);
  const [weight, setWeight] = useState([]);
  const [profile, setProfile] = useState(null);
  const [chartTab, setChartTab] = useState("bloodSugar");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const subRes = await subscriptionApi.getMySubscription();
        if (cancelled) return;
        const access = !!subRes?.data?.reportAccess;
        setReportAccess(access);
        if (!access) return;

        const [bs, bp, w, member] = await Promise.allSettled([
          bioValueRecordApi.getPageByCategory(userId, "BloodSugar", 0, 90),
          bioValueRecordApi.getPageByCategory(userId, "BloodPressure", 0, 90),
          bioValueRecordApi.getPageByCategory(userId, "Weight", 0, 90),
          userApi.getMember(userId),
        ]);
        if (cancelled) return;
        if (bs.status === "fulfilled") setBloodSugar(contentOf(bs.value));
        if (bp.status === "fulfilled") setBloodPressure(contentOf(bp.value));
        if (w.status === "fulfilled") setWeight(contentOf(w.value));
        if (member.status === "fulfilled") setProfile(member.value?.data ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const latestSugar = bloodSugar.find((r) => r.bloodSugar != null)?.bloodSugar;
  const latestBP = bloodPressure.find((r) => r.systolicBP != null);
  const profileWeight =
    profile?.weight ?? weight.find((r) => r.weight != null)?.weight ?? null;
  const heightCm = profile?.height ?? null;
  const bmi =
    profileWeight != null && heightCm
      ? Number(
          (profileWeight / ((heightCm / 100) * (heightCm / 100))).toFixed(1),
        )
      : null;

  const sugarAvg = useMemo(
    () => avg(bloodSugar.map((r) => Number(r.bloodSugar)).filter(Number.isFinite)),
    [bloodSugar],
  );

  // 최근 14건 혈당 추이 (오래된→최신)
  const sugarTrend = useMemo(() => {
    return bloodSugar
      .filter((r) => r.bloodSugar != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number(r.bloodSugar),
      }))
      .reverse();
  }, [bloodSugar]);

  // 최근 14건 혈압 추이 (오래된→최신)
  const bpTrend = useMemo(() => {
    return bloodPressure
      .filter((r) => r.systolicBP != null && r.diastolicBP != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        systolic: Number(r.systolicBP),
        diastolic: Number(r.diastolicBP),
      }))
      .reverse();
  }, [bloodPressure]);

  // 최근 14건 체중 추이 (오래된→최신)
  const weightTrend = useMemo(() => {
    return weight
      .filter((r) => r.weight != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number(r.weight),
      }))
      .reverse();
  }, [weight]);

  // 최근 14건 BMI 추이 (체중 기록 + 프로필 키 기준, 오래된→최신)
  const bmiTrend = useMemo(() => {
    if (!heightCm) return [];
    const h = heightCm / 100;
    return weight
      .filter((r) => r.weight != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number((Number(r.weight) / (h * h)).toFixed(1)),
      }))
      .reverse();
  }, [weight, heightCm]);

  const chartViews = {
    bloodSugar: {
      title: "최근 혈당 추이",
      data: sugarTrend,
      empty: "혈당 기록이 없습니다.",
      lines: [{ key: "value", name: "혈당", color: "#16a34a" }],
    },
    bloodPressure: {
      title: "최근 혈압 추이",
      data: bpTrend,
      empty: "혈압 기록이 없습니다.",
      lines: [
        { key: "systolic", name: "수축기", color: "#ED5934" },
        { key: "diastolic", name: "이완기", color: "#F59874" },
      ],
    },
    weight: {
      title: "최근 체중 추이",
      data: weightTrend,
      empty: "체중 기록이 없습니다.",
      lines: [{ key: "value", name: "체중", color: "#3B82F6" }],
    },
    bmi: {
      title: "최근 BMI 추이",
      data: bmiTrend,
      empty: heightCm ? "체중 기록이 없습니다." : "키 정보가 필요합니다.",
      lines: [{ key: "value", name: "BMI", color: "#0f1c33" }],
    },
  };
  const activeView = chartViews[chartTab] ?? chartViews.bloodSugar;

  const Shell = ({ children }) => (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1000px] px-6 py-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33] text-white">
                <FileText size={20} />
              </div>
              <div>
                <h1 className="text-[24px] font-extrabold tracking-tight">
                  건강 리포트
                </h1>
                <p className="text-sm text-[#64748B]">
                  나의 최근 건강 지표를 한눈에 확인하세요.
                </p>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="rounded-2xl bg-white p-16 text-center text-sm text-[#64748B] shadow-sm">
          불러오는 중...
        </div>
      </Shell>
    );
  }

  if (!reportAccess) {
    return (
      <Shell>
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
            <Lock size={24} />
          </div>
          <h2 className="text-[18px] font-bold">개인/가족 플랜 전용 기능입니다</h2>
          <p className="mt-2 text-[13px] text-[#64748B]">
            건강 리포트는 개인 플랜 또는 가족 플랜에서 이용할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => navigate("/member")}
            className="mt-5 h-11 rounded-xl bg-[#0f1c33] px-6 text-sm font-semibold text-white hover:bg-[#1a2d4d]"
          >
            구독하러 가기
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={Droplet}
          accent="#16a34a"
          bg="#ECFDF5"
          label="최근 혈당"
          value={latestSugar ?? null}
          unit="mg/dL"
          sub={sugarAvg != null ? `평균 ${sugarAvg} mg/dL` : "기록 없음"}
        />
        <SummaryCard
          icon={HeartPulse}
          accent="#ED5934"
          bg="#FFEEE3"
          label="최근 혈압"
          value={latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : null}
          unit="mmHg"
          sub={latestBP ? "수축기 / 이완기" : "기록 없음"}
        />
        <SummaryCard
          icon={Scale}
          accent="#3B82F6"
          bg="#EFF6FF"
          label="체중"
          value={profileWeight ?? null}
          unit="kg"
          sub={heightCm ? `키 ${heightCm}cm` : null}
        />
        <SummaryCard
          icon={FileText}
          accent="#0f1c33"
          bg="#F1F5F9"
          label="BMI"
          value={bmi ?? null}
          unit=""
          sub={
            bmi == null
              ? "체중/키 필요"
              : bmi < 18.5
                ? "저체중"
                : bmi < 23
                  ? "정상"
                  : bmi < 25
                    ? "과체중"
                    : "비만"
          }
        />
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[15px] font-bold">{activeView.title}</h3>
          <div className="inline-flex rounded-full bg-[#F1F5F9] p-1">
            {CHART_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setChartTab(t.key)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  chartTab === t.key
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {activeView.data.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#94A3B8]">
            {activeView.empty}
          </p>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeView.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
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
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                {activeView.lines.length > 1 && (
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                )}
                {activeView.lines.map((ln) => (
                  <Line
                    key={ln.key}
                    type="monotone"
                    dataKey={ln.key}
                    name={ln.name}
                    stroke={ln.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: ln.color, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Shell>
  );
}
