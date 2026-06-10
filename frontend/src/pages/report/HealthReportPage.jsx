import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

// 비정상/테스트용 이상치(예: 99999999)가 차트 Y축을 망가뜨리지 않도록 현실적인 체중만 사용
const isRealisticWeight = (w) => Number.isFinite(w) && w > 0 && w < 1000;

const CHART_TABS = [
  { key: "bloodSugar", labelKey: "healthReportPage.tab.bloodSugar" },
  { key: "bloodPressure", labelKey: "healthReportPage.tab.bloodPressure" },
  { key: "weight", labelKey: "healthReportPage.tab.weight" },
  { key: "bmi", labelKey: "healthReportPage.tab.bmi" },
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
  const { t } = useTranslation();
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

  // 최근 14건 혈당 추이 — 식전/식후 두 줄로 분리 (혈압 차트처럼 두 계열로 표시)
  // 각 기록은 식전 또는 식후 한쪽 값만 채우고 나머지는 null → 라인은 connectNulls 로 이어 그린다.
  const sugarTrend = useMemo(() => {
    return bloodSugar
      .filter((r) => r.bloodSugar != null)
      .slice(0, 14)
      .map((r) => {
        // 카테고리 접미사가 "식후"면 식후, 그 외(공복·취침전·식전)는 식전으로 본다.
        const isAfterMeal = String(r.category || "").endsWith("식후");
        const value = Number(r.bloodSugar);
        return {
          date: String(r.recordDate || "").slice(5),
          before: isAfterMeal ? null : value,
          after: isAfterMeal ? value : null,
        };
      })
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
      .filter((r) => r.weight != null && isRealisticWeight(Number(r.weight)))
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
      .filter((r) => r.weight != null && isRealisticWeight(Number(r.weight)))
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number((Number(r.weight) / (h * h)).toFixed(1)),
      }))
      .reverse();
  }, [weight, heightCm]);

  const chartViews = {
    bloodSugar: {
      title: t("healthReportPage.chart.bloodSugar.title"),
      data: sugarTrend,
      empty: "혈당 기록이 없습니다.",
      lines: [
        { key: "before", name: "식전", color: "#16a34a" },
        { key: "after", name: "식후", color: "#F59E0B" },
      ],
    },
    bloodPressure: {
      title: t("healthReportPage.chart.bloodPressure.title"),
      data: bpTrend,
      empty: t("healthReportPage.chart.bloodPressure.empty"),
      lines: [
        {
          key: "systolic",
          name: t("healthReportPage.chart.bloodPressure.systolic"),
          color: "#ED5934",
        },
        {
          key: "diastolic",
          name: t("healthReportPage.chart.bloodPressure.diastolic"),
          color: "#F59874",
        },
      ],
    },
    weight: {
      title: t("healthReportPage.chart.weight.title"),
      data: weightTrend,
      empty: t("healthReportPage.chart.weight.empty"),
      lines: [
        {
          key: "value",
          name: t("healthReportPage.chart.weight.lineName"),
          color: "#3B82F6",
        },
      ],
    },
    bmi: {
      title: t("healthReportPage.chart.bmi.title"),
      data: bmiTrend,
      empty: heightCm
        ? t("healthReportPage.chart.bmi.emptyWeight")
        : t("healthReportPage.chart.bmi.emptyHeight"),
      lines: [
        {
          key: "value",
          name: t("healthReportPage.chart.bmi.lineName"),
          color: "#0f1c33",
        },
      ],
    },
  };
  const activeView = chartViews[chartTab] ?? chartViews.bloodSugar;

  // Y축 도메인은 이상치(예: 99999999)를 제외한 실제 값에서 계산한다.
  // 문자열 도메인("dataMax + 10")은 데이터에 이상치가 섞이면 축 눈금이 거대해지므로 숫자로 직접 산출.
  const yValues = activeView.data
    .flatMap((d) => activeView.lines.map((ln) => d[ln.key]))
    .filter((v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 100000);
  const yDomain =
    yValues.length > 0
      ? [
          Math.floor(Math.min(...yValues) - 10),
          Math.ceil(Math.max(...yValues) + 10),
        ]
      : [0, 10];

  const Shell = ({ children }) => (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-4 sm:px-6 py-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33] text-white">
                <FileText size={20} />
              </div>
              <div>
                <h1 className="text-[24px] font-extrabold tracking-tight">
                  {t("healthReportPage.header.title")}
                </h1>
                <p className="text-sm text-[#64748B]">
                  {t("healthReportPage.header.subtitle")}
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
          {t("healthReportPage.loading")}
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
          <h2 className="text-[18px] font-bold">
            {t("healthReportPage.locked.title")}
          </h2>
          <p className="mt-2 text-[13px] text-[#64748B]">
            {t("healthReportPage.locked.description")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/member")}
            className="mt-5 h-11 rounded-xl bg-[#0f1c33] px-6 text-sm font-semibold text-white hover:bg-[#1a2d4d]"
          >
            {t("healthReportPage.locked.subscribe")}
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
          label={t("healthReportPage.summary.bloodSugar.label")}
          value={latestSugar ?? null}
          unit="mg/dL"
          sub={
            sugarAvg != null
              ? t("healthReportPage.summary.bloodSugar.avg", { value: sugarAvg })
              : t("healthReportPage.summary.noRecord")
          }
        />
        <SummaryCard
          icon={HeartPulse}
          accent="#ED5934"
          bg="#FFEEE3"
          label={t("healthReportPage.summary.bloodPressure.label")}
          value={latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : null}
          unit="mmHg"
          sub={
            latestBP
              ? t("healthReportPage.summary.bloodPressure.sub")
              : t("healthReportPage.summary.noRecord")
          }
        />
        <SummaryCard
          icon={Scale}
          accent="#3B82F6"
          bg="#EFF6FF"
          label={t("healthReportPage.summary.weight.label")}
          value={profileWeight ?? null}
          unit="kg"
          sub={
            heightCm
              ? t("healthReportPage.summary.weight.height", { value: heightCm })
              : null
          }
        />
        <SummaryCard
          icon={FileText}
          accent="#0f1c33"
          bg="#F1F5F9"
          label={t("healthReportPage.summary.bmi.label")}
          value={bmi ?? null}
          unit=""
          sub={
            bmi == null
              ? t("healthReportPage.summary.bmi.needData")
              : bmi < 18.5
                ? t("healthReportPage.summary.bmi.underweight")
                : bmi < 23
                  ? t("healthReportPage.summary.bmi.normal")
                  : bmi < 25
                    ? t("healthReportPage.summary.bmi.overweight")
                    : t("healthReportPage.summary.bmi.obese")
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[15px] font-bold">{activeView.title}</h3>
          <div className="inline-flex rounded-full bg-[#F1F5F9] p-1">
            {CHART_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setChartTab(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  chartTab === tab.key
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {t(tab.labelKey)}
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
                  domain={yDomain}
                  allowDataOverflow
                  tickFormatter={(v) => String(Math.round(Number(v) * 10) / 10)}
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
                    connectNulls
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
