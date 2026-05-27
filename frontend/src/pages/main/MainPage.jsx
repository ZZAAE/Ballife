import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import newsApi from "../../api/newsApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import mealApi from "../../api/mealApi";
import userApi from "../../api/userApi";
import userConfigApi from "../../api/userConfigApi";
import { getBurnedCalorieByDate } from "../../api/exerciseApi";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import HealthMenu from "../../components/HealthMenu";
import Card from "../../components/mainpage/card.jsx";
import Calendar from "../../components/mainpage/calendar.jsx";
import ChartSection from "../../components/mainpage/chart.jsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { Unity, useUnityContext } from "react-unity-webgl";
import { ArrowRight } from "lucide-react";

/* ============================================================
 * 페이지 레벨 카드 공통 스타일 토큰
 * - Calendar(rounded-3xl, shadow-sm, border-slate-100)와 통일
 * ============================================================ */
const CARD_STYLE =
  "rounded-3xl border border-slate-100 bg-white shadow-sm";

const bloodPressureData = [
  { date: "03-01", systolic: 128, diastolic: 82 },
  { date: "03-05", systolic: 125, diastolic: 80 },
  { date: "03-10", systolic: 130, diastolic: 84 },
  { date: "03-15", systolic: 122, diastolic: 79 },
  { date: "03-20", systolic: 118, diastolic: 76 },
  { date: "03-25", systolic: 119, diastolic: 77 },
  { date: "03-31", systolic: 116, diastolic: 74 },
  { date: "04-05", systolic: 121, diastolic: 78 },
  { date: "04-12", systolic: 118, diastolic: 75 },
  { date: "04-20", systolic: 115, diastolic: 73 },
  { date: "04-28", systolic: 117, diastolic: 76 },
  { date: "05-01", systolic: 114, diastolic: 72 },
  { date: "05-06", systolic: 112, diastolic: 70 },
];

const bloodSugarData = [
  { date: "03-01", glucose: 118 },
  { date: "03-05", glucose: 114 },
  { date: "03-10", glucose: 121 },
  { date: "03-15", glucose: 110 },
  { date: "03-20", glucose: 108 },
  { date: "03-25", glucose: 115 },
  { date: "03-31", glucose: 112 },
  { date: "04-05", glucose: 109 },
  { date: "04-12", glucose: 107 },
  { date: "04-20", glucose: 104 },
  { date: "04-28", glucose: 106 },
  { date: "05-01", glucose: 103 },
  { date: "05-06", glucose: 101 },
];

const weightData = [
  { date: "03-01", weight: 78.5 },
  { date: "03-05", weight: 78.3 },
  { date: "03-10", weight: 78.4 },
  { date: "03-15", weight: 78.1 },
  { date: "03-20", weight: 77.9 },
  { date: "03-25", weight: 78.0 },
  { date: "03-31", weight: 77.8 },
  { date: "04-05", weight: 77.6 },
  { date: "04-12", weight: 77.5 },
  { date: "04-20", weight: 77.3 },
  { date: "04-28", weight: 77.1 },
  { date: "05-01", weight: 77.0 },
  { date: "05-06", weight: 76.8 },
];

const pad2 = (n) => String(n).padStart(2, "0");
const formatToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";

const readMedicationSchedules = (dateKey) => {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + dateKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildMedicineData = () => {
  const todayKey = formatToday();
  const schedules = readMedicationSchedules(todayKey);

  let todayRemaining = 0;
  const itemSet = new Set();
  schedules.forEach((s) => {
    (s.drugs || []).forEach((d) => {
      itemSet.add(d.name);
      if (!d.taken) todayRemaining += 1;
    });
  });

  const items = Array.from(itemSet);
  const groups = items.length > 0 ? [{ name: "처방 그룹", items }] : [];

  return { todayRemaining, groups };
};

const MainPage = () => {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const [selectedChartType, setSelectedChartType] = useState("bloodPressure");
  const [newsCards, setNewsCards] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [memberProfile, setMemberProfile] = useState(null);
  const [latestBloodSugar, setLatestBloodSugar] = useState(null);
  const [latestBloodPressure, setLatestBloodPressure] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);
  const [todayMealKcal, setTodayMealKcal] = useState(null);
  const [todayBurnedKcal, setTodayBurnedKcal] = useState(null);
  const [todayWaterCups, setTodayWaterCups] = useState(0);
  const [targetWaterCups, setTargetWaterCups] = useState(null);
  const [medicineData, setMedicineData] = useState(() => buildMedicineData());

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const today = formatToday();

    const tasks = [
      bioValueRecordApi
        .getLatestPageByCategory(userId, "BloodSugar")
        .then((res) => {
          if (cancelled) return;
          const rec = res?.data?.content?.[0];
          if (rec?.bloodSugar != null) {
            setLatestBloodSugar({
              value: Number(rec.bloodSugar),
              recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
            });
          }
        })
        .catch(() => {}),

      bioValueRecordApi
        .getLatestPageByCategory(userId, "BloodPressure")
        .then((res) => {
          if (cancelled) return;
          const rec = res?.data?.content?.[0];
          if (rec?.systolicBP != null && rec?.diastolicBP != null) {
            setLatestBloodPressure({
              systolic: Number(rec.systolicBP),
              diastolic: Number(rec.diastolicBP),
              recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
            });
          }
        })
        .catch(() => {}),

      bioValueRecordApi
        .getLatestPageByCategory(userId, "Weight")
        .then((res) => {
          if (cancelled) return;
          const rec = res?.data?.content?.[0];
          if (rec?.weight != null) {
            setLatestWeight({
              value: Number(rec.weight),
              recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
            });
          }
        })
        .catch(() => {}),

      mealApi
        .getDayTotalNutrient(userId, today)
        .then((res) => {
          if (cancelled) return;
          const data = res?.data;
          const kcal = Array.isArray(data) ? Number(data[0]) || 0 : 0;
          setTodayMealKcal(kcal);
        })
        .catch(() => {
          if (!cancelled) setTodayMealKcal(0);
        }),

      getBurnedCalorieByDate(userId)
        .then((value) => {
          if (cancelled) return;
          setTodayBurnedKcal(Number(value) || 0);
        })
        .catch(() => {
          if (!cancelled) setTodayBurnedKcal(0);
        }),

      bioValueRecordApi
        .searchByDate(userId, "water", today)
        .then((res) => {
          if (cancelled) return;
          const list = Array.isArray(res?.data) ? res.data : [];
          const cups = list.reduce(
            (sum, r) => sum + (r.waterIntakeCup || 0),
            0,
          );
          setTodayWaterCups(cups);
        })
        .catch(() => {}),

      userConfigApi
        .getTargetDailyWaterIntake(userId)
        .then((res) => {
          if (cancelled) return;
          if (res?.data != null) setTargetWaterCups(Number(res.data));
        })
        .catch(() => {}),

      userApi
        .getMember(userId)
        .then((res) => {
          if (cancelled) return;
          if (res?.data) setMemberProfile(res.data);
        })
        .catch(() => {}),
    ];

    Promise.allSettled(tasks);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 복약 데이터는 localStorage 기반이라 포커스/가시성 변화 때 재계산
  useEffect(() => {
    const refresh = () => setMedicineData(buildMedicineData());
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setNewsLoading(true);
    newsApi
      .getCards()
      .then((res) => {
        if (cancelled) return;
        setNewsCards(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setNewsCards([]);
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/Unity/Build.loader.js",
    dataUrl: "/Unity/Build.data",
    frameworkUrl: "/Unity/Build.framework.js",
    codeUrl: "/Unity/Build.wasm",
  });
  const loadingPercent = Math.round(loadingProgression * 100);

  const chartConfig = useMemo(() => {
    return {
      bloodPressure: {
        data: bloodPressureData,
        legends: [
          { label: "수축기", color: "#2563eb" },
          { label: "이완기", color: "#06b6d4" },
          { label: "목표", color: "#94A3B8", dashed: true },
        ],
        unit: "mmHg",
        yDomain: [60, 150],
        areas: [
          {
            key: "systolic",
            name: "수축기",
            stroke: "#2563eb",
            gradientId: "systolicGrad",
          },
          {
            key: "diastolic",
            name: "이완기",
            stroke: "#06b6d4",
            gradientId: "diastolicGrad",
          },
        ],
        references: [
          { value: 120, label: "목표 수축기 120", color: "#94A3B8" },
          { value: 80, label: "목표 이완기 80", color: "#94A3B8" },
        ],
      },
      bloodSugar: {
        data: bloodSugarData,
        legends: [
          { label: "혈당", color: "#16a34a" },
          { label: "목표", color: "#94A3B8", dashed: true },
        ],
        unit: "mg/dL",
        yDomain: [60, 150],
        areas: [
          {
            key: "glucose",
            name: "혈당",
            stroke: "#16a34a",
            gradientId: "glucoseGrad",
          },
        ],
        references: [
          { value: 100, label: "목표 100", color: "#94A3B8" },
        ],
      },
      weight: {
        data: weightData,
        legends: [
          { label: "체중", color: "#f97316" },
          { label: "목표", color: "#94A3B8", dashed: true },
        ],
        unit: "kg",
        yDomain: [74, 80],
        areas: [
          {
            key: "weight",
            name: "체중",
            stroke: "#f97316",
            gradientId: "weightGrad",
          },
        ],
        references: [
          { value: 76, label: "목표 76", color: "#94A3B8" },
        ],
      },
    };
  }, []);

  const activeChart = chartConfig[selectedChartType];

  const cardData = useMemo(
    () => ({
      bloodSugar: latestBloodSugar,
      bloodPressure: latestBloodPressure,
      weight: latestWeight,
      todayMealKcal,
      todayBurnedKcal,
      water: { cups: todayWaterCups, targetCups: targetWaterCups },
      medicine: medicineData,
      normal: {
        bloodSugar: memberProfile?.normalFastingGlucose,
        systolicBP: memberProfile?.normalSystolicBP,
        diastolicBP: memberProfile?.normalDiastolicBP,
      },
    }),
    [
      latestBloodSugar,
      latestBloodPressure,
      latestWeight,
      todayMealKcal,
      todayBurnedKcal,
      todayWaterCups,
      targetWaterCups,
      medicineData,
      memberProfile,
    ],
  );

  const computeAgeFromBirth = (birthDate) => {
    if (!birthDate) return null;
    const b = new Date(birthDate);
    if (Number.isNaN(b.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
    return age;
  };

  const age = computeAgeFromBirth(memberProfile?.birthDate);
  const gender = memberProfile?.gender ?? null;
  const heightCm = memberProfile?.height ?? null;
  const profileWeightKg = latestWeight?.value ?? memberProfile?.weight ?? null;
  const bmiValue =
    profileWeightKg != null && heightCm
      ? Number((profileWeightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1))
      : null;
  const bmiLabel = (() => {
    if (bmiValue == null) return "—";
    if (bmiValue < 18.5) return `${bmiValue} (저체중)`;
    if (bmiValue < 23) return `${bmiValue} (정상)`;
    if (bmiValue < 25) return `${bmiValue} (과체중)`;
    return `${bmiValue} (비만)`;
  })();
  const bmiColor = (() => {
    if (bmiValue == null) return "text-[#0F172A]";
    if (bmiValue < 18.5) return "text-blue-500";
    if (bmiValue < 23) return "text-emerald-600";
    if (bmiValue < 25) return "text-amber-500";
    return "text-red-500";
  })();

  const userStats = {
    ageGender:
      age != null || gender
        ? `${age != null ? `${age}세` : "—"}${gender ? ` / ${gender}` : ""}`
        : "—",
    height: heightCm != null ? `${heightCm}cm` : "—",
    weight: profileWeightKg != null ? `${profileWeightKg}kg` : "—",
    bmi: bmiLabel,
    bmiColor,
  };

  const displayName = memberProfile?.username ?? user?.nickname ?? "회원";

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <p className="text-[12px] font-semibold text-[#0F172A] mb-2">{`2026-${label}`}</p>
          <div className="space-y-1">
            {payload.map((p) => (
              <div key={p.dataKey} className="flex items-center gap-2 text-[12px]">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[#64748B]">{p.name}</span>
                <span className="ml-auto font-bold text-[#0F172A]">
                  {p.value}
                  <span className="ml-0.5 text-[10px] font-medium text-[#94A3B8]">{activeChart.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      {/* <Header /> */}
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 lg:space-y-10">

            {/* ====================== 헤더 & 사용자 스탯 ====================== */}
            <header className="pb-4 border-b border-[#E5E7EB]">
              {/* 모바일: 인사말 위, 스탯 2×2 아래 */}
              {/* lg+: 좌측 인사말, 우측 스탯 가로 */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  {displayName}님 안녕하세요.
                </h1>

                {/* 모바일: 2×2 그리드 / sm+: 가로 나열 */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:gap-6 text-sm">
                  <div>
                    <p className="text-xs text-[#94A3B8]">나이 / 성별</p>
                    <p className="font-semibold text-[#0F172A]">{userStats.ageGender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">키</p>
                    <p className="font-semibold text-[#0F172A]">{userStats.height}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">몸무게</p>
                    <p className="font-semibold text-[#0F172A]">{userStats.weight}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">BMI</p>
                    <p className={`font-semibold ${userStats.bmiColor}`}>{userStats.bmi}</p>
                  </div>
                </div>
              </div>
            </header>

            {/* ====================== 펫 섹션 ====================== */}
            <section className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 p-6 shadow-[0_10px_26px_rgba(15,23,42,0.22)] sm:p-8">
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                    내 펫이 기다리고 있어요
                  </h2>
                  <p className="mt-2 text-sm lg:text-base text-slate-300">
                    펫과 함께 건강한 하루를 시작해보세요.
                  </p>
                  <Link
                    to="/member/pet"
                    className="group mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    내 펫 자세히 보기
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="relative mx-auto w-full max-w-[520px]">
                  <div className="relative overflow-hidden rounded-3xl">
                    <Unity
                      unityProvider={unityProvider}
                      style={{
                        width: '100%',
                        height: 360,
                        display: 'block',
                        background: '#F0F7FF',
                      }}
                    />
                    {!isLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="mb-3 text-3xl">🐾</div>
                        <p className="text-sm font-semibold text-blue-700">
                          펫을 데려오는 중이에요…
                        </p>
                        <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/70">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${loadingPercent}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-semibold text-blue-500">
                          {loadingPercent}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ====================== Status Cards ====================== */}
            <Card data={cardData} />

            {/* ====================== Calendar & Chart ====================== */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <Calendar />

              <ChartSection
                title="주간 건강 추이"
                data={activeChart.data}
                legends={activeChart.legends}
                areas={activeChart.areas}
                unit={activeChart.unit}
                selectedType={selectedChartType}
                onTypeChange={setSelectedChartType}
                chartTypes={[
                  { value: "bloodSugar", label: "혈당" },
                  { value: "bloodPressure", label: "혈압" },
                  { value: "weight", label: "체중" },
                ]}
              >
                {(filteredData) => {
                  // 데이터+기준선 기준 Y축 동적 도메인 (위/아래 빈 공간 최소화)
                  const allValues = [];
                  activeChart.areas.forEach((a) => {
                    filteredData.forEach((d) => {
                      if (d[a.key] != null) allValues.push(d[a.key]);
                    });
                  });
                  activeChart.references?.forEach((r) => allValues.push(r.value));
                  const dataMin = allValues.length ? Math.min(...allValues) : 0;
                  const dataMax = allValues.length ? Math.max(...allValues) : 100;
                  const range = dataMax - dataMin || 1;
                  const pad = Math.max(range * 0.18, 3);
                  const yDomain = [
                    Math.floor(dataMin - pad),
                    Math.ceil(dataMax + pad),
                  ];

                  // 각 데이터 키별 min/max 점 위치 계산
                  const extremes = activeChart.areas.flatMap((a) => {
                    let maxRow, minRow;
                    filteredData.forEach((d) => {
                      const v = d[a.key];
                      if (v == null) return;
                      if (!maxRow || v > maxRow[a.key]) maxRow = d;
                      if (!minRow || v < minRow[a.key]) minRow = d;
                    });
                    const result = [];
                    if (maxRow)
                      result.push({
                        type: "max",
                        areaKey: a.key,
                        stroke: a.stroke,
                        date: maxRow.date,
                        value: maxRow[a.key],
                      });
                    if (minRow && minRow !== maxRow)
                      result.push({
                        type: "min",
                        areaKey: a.key,
                        stroke: a.stroke,
                        date: minRow.date,
                        value: minRow[a.key],
                      });
                    return result;
                  });

                  return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 40, right: 16, left: 0, bottom: 28 }}>
                      <defs>
                        <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.16} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 6" stroke="#EEF2F7" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 13, fill: "#475569", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        domain={yDomain}
                        tick={{ fontSize: 13, fill: "#475569", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        width={46}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
                      />

                      {/* 목표 기준선 (점선 위에 흰 배지로 라벨) */}
                      {activeChart.references?.map((ref) => {
                        const labelText = ref.label;
                        const pillWidth = labelText.length * 9 + 18;
                        return (
                          <ReferenceLine
                            key={`${ref.label}-${ref.value}`}
                            y={ref.value}
                            stroke="#CBD5E1"
                            strokeDasharray="6 6"
                            strokeWidth={1.5}
                            label={(props) => {
                              const { viewBox } = props;
                              const cx = viewBox.x + viewBox.width - pillWidth - 6;
                              const cy = viewBox.y - 14;
                              return (
                                <g>
                                  <rect
                                    x={cx}
                                    y={cy - 12}
                                    width={pillWidth}
                                    height={24}
                                    rx={12}
                                    fill="#F1F5F9"
                                  />
                                  <text
                                    x={cx + pillWidth / 2}
                                    y={cy + 5}
                                    textAnchor="middle"
                                    fontSize={13}
                                    fontWeight={800}
                                    fill="#475569"
                                  >
                                    {labelText}
                                  </text>
                                </g>
                              );
                            }}
                            ifOverflow="extendDomain"
                          />
                        );
                      })}

                      {activeChart.areas.map((area) => (
                        <Area
                          key={area.key}
                          type="monotone"
                          dataKey={area.key}
                          name={area.name}
                          stroke={area.stroke}
                          strokeWidth={2.5}
                          fill={`url(#${area.gradientId})`}
                          dot={{ r: 3, fill: "#fff", stroke: area.stroke, strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: area.stroke, stroke: "#fff", strokeWidth: 2 }}
                        />
                      ))}

                      {/* Max/Min 강조 점 */}
                      {extremes.map((e) => {
                        const isMax = e.type === "max";
                        const bg = isMax ? "#FEE2E2" : "#DCFCE7";
                        const fg = isMax ? "#DC2626" : "#16A34A";
                        const valueStr = String(e.value);
                        const pillWidth = valueStr.length * 10 + 18;
                        return (
                          <ReferenceDot
                            key={`${e.areaKey}-${e.type}`}
                            x={e.date}
                            y={e.value}
                            r={8}
                            fill={e.stroke}
                            stroke="#fff"
                            strokeWidth={3}
                            ifOverflow="extendDomain"
                            label={(props) => {
                              const { viewBox } = props;
                              const cx = viewBox.cx ?? viewBox.x;
                              const cy = viewBox.cy ?? viewBox.y;
                              const labelY = isMax ? cy - 24 : cy + 24;
                              return (
                                <g>
                                  <rect
                                    x={cx - pillWidth / 2}
                                    y={labelY - 13}
                                    width={pillWidth}
                                    height={26}
                                    rx={13}
                                    fill={bg}
                                  />
                                  <text
                                    x={cx}
                                    y={labelY + 5}
                                    textAnchor="middle"
                                    fontSize={15}
                                    fontWeight={800}
                                    fill={fg}
                                  >
                                    {e.value}
                                  </text>
                                </g>
                              );
                            }}
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                  );
                }}
              </ChartSection>
            </section>

            {/* ====================== 건강 뉴스 ====================== */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0F172A]">건강 뉴스</h2>
                <p className="text-[#64748B] text-sm mt-1">
                  하이닥에서 큐레이션한 건강 정보를 만나보세요.
                </p>
              </div>

              {newsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`${CARD_STYLE} overflow-hidden animate-pulse`}
                    >
                      <div className="h-48 w-full bg-slate-100" />
                      <div className="p-6 space-y-2">
                        <div className="h-3 w-16 rounded bg-slate-100" />
                        <div className="h-4 w-full rounded bg-slate-100" />
                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {newsCards.map((news, idx) => (
                    <a
                      key={news.link || idx}
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${CARD_STYLE} overflow-hidden group cursor-pointer transition hover:shadow-md block`}
                    >
                      {news.thumbnail ? (
                        <img
                          src={news.thumbnail}
                          alt={news.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-3xl">
                          📰
                        </div>
                      )}
                      <div className="p-6">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A]">
                          HIDOC
                        </span>
                        <p className="mt-3 text-sm font-semibold text-[#0F172A] leading-snug line-clamp-2">
                          {news.title}
                        </p>
                        {news.pubDate && (
                          <p className="mt-2 text-[11px] text-[#94A3B8]">
                            {news.pubDate}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {!newsLoading && newsCards.length === 0 && (
                <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#94A3B8]">
                  뉴스를 불러오지 못했습니다.
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;