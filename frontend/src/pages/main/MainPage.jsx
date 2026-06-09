import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import newsApi from "../../api/newsApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import mealApi from "../../api/mealApi";
import userApi from "../../api/userApi";
import userConfigApi from "../../api/userConfigApi";
import { getBurnedCalorieByDate } from "../../api/exerciseApi";
import medicineApi from "../../api/medicineApi";
import {
  mapPrescriptionsToGroups,
  buildSchedulesFromGroups,
} from "../../components/medication/prescriptionData";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
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

// 복용 일정 배열 → 메인 복약알림용 데이터(오늘 남은 개수 + 약 목록)
const computeMedicineData = (schedules) => {
  let todayRemaining = 0;
  const itemSet = new Set();
  (schedules || []).forEach((s) => {
    (s.drugs || []).forEach((d) => {
      itemSet.add(d.name);
      if (!d.taken) todayRemaining += 1;
    });
  });

  const items = Array.from(itemSet);
  const groups = items.length > 0 ? [{ name: i18n.t("mainPage.prescriptionGroup"), items }] : [];

  return { todayRemaining, groups };
};

// localStorage 에 저장된 오늘 복용 기록 기반 (약 페이지 방문 후 갱신됨)
const buildMedicineData = () => computeMedicineData(readMedicationSchedules(formatToday()));

// 저장된 복용 여부(taken)를 슬롯/약 id 기준으로 기준 일정에 병합
const mergeTakenState = (base, saved) =>
  base.map((slot) => {
    const ss = (saved || []).find((s) => s.id === slot.id);
    if (!ss || !Array.isArray(ss.drugs)) return slot;
    return {
      ...slot,
      drugs: slot.drugs.map((d) => {
        const sd = ss.drugs.find((x) => x.id === d.id);
        return sd ? { ...d, taken: !!sd.taken } : d;
      }),
    };
  });

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const [selectedChartType, setSelectedChartType] = useState("bloodPressure");
  const [newsCards, setNewsCards] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [memberProfile, setMemberProfile] = useState(null);
  const [bloodSugarRecords, setBloodSugarRecords] = useState([]);
  const [bloodPressureRecords, setBloodPressureRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [todayMealKcal, setTodayMealKcal] = useState(null);
  const [todayBurnedKcal, setTodayBurnedKcal] = useState(null);
  const [todayWaterCups, setTodayWaterCups] = useState(0);
  const [targetWaterCups, setTargetWaterCups] = useState(null);
  const [targetWeight, setTargetWeight] = useState(null);
  const [medicineData, setMedicineData] = useState(() => buildMedicineData());

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const today = formatToday();

    const tasks = [
      // 전체 기록 1회 조회 후 카테고리 prefix로 분류 (category가 "BloodSugar-아침식전" 등
      // 접미사를 가져 exact-match 페이지 조회로는 누락되므로 startsWith 방식 사용)
      bioValueRecordApi
        .getAllBioValueRecords(userId)
        .then((res) => {
          if (cancelled) return;
          const list = Array.isArray(res?.data) ? res.data : [];
          const byDateDesc = (a, b) => {
            const ka = `${a.recordDate || ""} ${a.recordTime || ""}`;
            const kb = `${b.recordDate || ""} ${b.recordTime || ""}`;
            return kb.localeCompare(ka);
          };
          const startsWith = (r, prefix) =>
            typeof r.category === "string" && r.category.startsWith(prefix);

          setBloodSugarRecords(
            list
              .filter((r) => startsWith(r, "BloodSugar") && r.bloodSugar != null)
              .sort(byDateDesc),
          );
          setBloodPressureRecords(
            list
              .filter(
                (r) =>
                  startsWith(r, "BloodPressure") &&
                  r.systolicBP != null &&
                  r.diastolicBP != null,
              )
              .sort(byDateDesc),
          );
          setWeightRecords(
            list
              .filter((r) => startsWith(r, "Weight") && r.weight != null)
              .sort(byDateDesc),
          );
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

      // 목표값은 회원정보 페이지와 동일하게 user-config 단일 조회로 가져옴
      userConfigApi
        .getUserConfig(userId)
        .then((res) => {
          if (cancelled) return;
          const cfg = res?.data;
          if (!cfg) return;
          if (cfg.targetDailyWaterIntake != null)
            setTargetWaterCups(Number(cfg.targetDailyWaterIntake));
          if (cfg.targetWeight != null) setTargetWeight(Number(cfg.targetWeight));
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

  // 로그인 직후 백엔드에서 처방전을 직접 불러와 복약알림을 바로 표시한다.
  // (약 페이지를 방문해 localStorage 가 채워질 때까지 기다리지 않도록)
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await medicineApi.getPrescriptions(userId);
        const list = Array.isArray(data) ? data : [];
        const withMeds = await Promise.all(
          list.map((p) =>
            medicineApi
              .getUserMedicine(p.prescriptionId)
              .then((r) => ({ ...p, medicines: r.data || [] }))
              .catch(() => ({ ...p, medicines: [] }))
          )
        );
        const todayKey = formatToday();
        const groups = mapPrescriptionsToGroups(withMeds);
        const base = buildSchedulesFromGroups(groups, todayKey);
        const merged = mergeTakenState(base, readMedicationSchedules(todayKey));
        if (!cancelled) setMedicineData(computeMedicineData(merged));
      } catch {
        // 실패 시 localStorage 기반 값 유지
      }
    })();
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

  // 체중/회원정보가 다른 페이지에서 갱신되면 헤더의 몸무게·BMI 즉시 반영
  useEffect(() => {
    const onProfileUpdated = (e) => {
      const next = e?.detail;
      if (!next) return;
      setMemberProfile((prev) => ({ ...(prev ?? {}), ...next }));
    };
    window.addEventListener("member-profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("member-profile-updated", onProfileUpdated);
    };
  }, []);

  // 같은 페이지에 머무는 동안 체중 기록 모달 저장 시 체중 차트/카드도 즉시 반영
  useEffect(() => {
    if (!userId) return undefined;
    const refreshWeight = () => {
      bioValueRecordApi
        .getPageByCategory(userId, "Weight", 0, 90)
        .then((res) => {
          const list = Array.isArray(res?.data?.content) ? res.data.content : [];
          setWeightRecords(list);
        })
        .catch(() => {});
    };
    window.addEventListener("member-profile-updated", refreshWeight);
    return () => {
      window.removeEventListener("member-profile-updated", refreshWeight);
    };
  }, [userId]);

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
    // 언어 전환 시 재요청 — 백엔드가 Accept-Language(현재 언어)에 맞춘 제목을 내려준다.
  }, [i18n.language]);

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: "/Unity/Build.loader.js",
    dataUrl: "/Unity/Build.data",
    frameworkUrl: "/Unity/Build.framework.js",
    codeUrl: "/Unity/Build.wasm",
    streamingAssetsUrl: "/Unity/StreamingAssets",
  });
  const loadingPercent = Math.round(loadingProgression * 100);

  // Unity 통신 — ready 전 메시지는 큐잉 후 ready 시점에 일괄 전송
  const [unityReady, setUnityReady] = useState(false);
  const queueRef = useRef([]);

  const send = useCallback((type, payload) => {
    const json = JSON.stringify({ type, payload });
    if (unityReady) {
      sendMessage("ReactBrideController", "OnReactMessage", json);
    } else {
      queueRef.current.push(json);
    }
  }, [unityReady, sendMessage]);

  // Unity → React: ready 신호 수신
  useEffect(() => {
    const handleReady = () => setUnityReady(true);
    addEventListener("unityReady", handleReady);
    return () => removeEventListener("unityReady", handleReady);
  }, [addEventListener, removeEventListener]);

  // ready 되는 순간: 큐 비우고 PREVIEW 메시지 전송
  useEffect(() => {
    if (!unityReady) return;
    queueRef.current.forEach((json) =>
      sendMessage("ReactBrideController", "OnReactMessage", json)
    );
    queueRef.current = [];

    send("PREVIEW", null);
  }, [unityReady, sendMessage, send]);

  const bloodPressureChartData = useMemo(() => {
    if (!bloodPressureRecords.length) return [];
    const byDate = new Map();
    bloodPressureRecords.forEach((r) => {
      const date = String(r?.recordDate || "").slice(5, 10);
      if (!date || r.systolicBP == null || r.diastolicBP == null) return;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push({ s: Number(r.systolicBP), d: Number(r.diastolicBP) });
    });
    return Array.from(byDate.entries())
      .map(([date, arr]) => ({
        date,
        systolic: Math.round(arr.reduce((s, x) => s + x.s, 0) / arr.length),
        diastolic: Math.round(arr.reduce((s, x) => s + x.d, 0) / arr.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bloodPressureRecords]);

  const bloodSugarChartData = useMemo(() => {
    if (!bloodSugarRecords.length) return [];
    const byDate = new Map();
    bloodSugarRecords.forEach((r) => {
      const date = String(r?.recordDate || "").slice(5, 10);
      if (!date || r.bloodSugar == null) return;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push(Number(r.bloodSugar));
    });
    return Array.from(byDate.entries())
      .map(([date, arr]) => ({
        date,
        glucose: Math.round(arr.reduce((s, x) => s + x, 0) / arr.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bloodSugarRecords]);

  const weightChartData = useMemo(() => {
    if (!weightRecords.length) return [];
    const byDate = new Map();
    weightRecords.forEach((r) => {
      const date = String(r?.recordDate || "").slice(5, 10);
      if (!date || r.weight == null) return;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push(Number(r.weight));
    });
    return Array.from(byDate.entries())
      .map(([date, arr]) => ({
        date,
        weight: +(arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(1),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [weightRecords]);

  const bpReferences = useMemo(() => {
    const sysMax = (() => {
      const raw = memberProfile?.normalSystolicBP;
      if (raw == null) return 120;
      const m = String(raw).match(/(\d+(?:\.\d+)?)/);
      return m ? Number(m[1]) : 120;
    })();
    const diaMax = (() => {
      const raw = memberProfile?.normalDiastolicBP;
      if (raw == null) return 80;
      const m = String(raw).match(/(\d+(?:\.\d+)?)/);
      return m ? Number(m[1]) : 80;
    })();
    return [
      { value: sysMax, label: t("mainPage.chart.targetSystolic", { value: sysMax }), color: "#94A3B8" },
      { value: diaMax, label: t("mainPage.chart.targetDiastolic", { value: diaMax }), color: "#94A3B8" },
    ];
  }, [memberProfile, t]);

  const bloodSugarReferences = useMemo(() => {
    const raw = memberProfile?.normalFastingGlucose;
    let target = 100;
    if (raw != null) {
      const m = String(raw).match(/(\d+(?:\.\d+)?)\s*[~-]\s*(\d+(?:\.\d+)?)/);
      if (m) target = Number(m[2]);
      else {
        const single = String(raw).match(/(\d+(?:\.\d+)?)/);
        if (single) target = Number(single[1]);
      }
    }
    return [{ value: target, label: t("mainPage.chart.target", { value: target }), color: "#94A3B8" }];
  }, [memberProfile, t]);

  const weightReferences = useMemo(() => {
    if (targetWeight == null) return [];
    return [
      { value: targetWeight, label: t("mainPage.chart.target", { value: targetWeight }), color: "#94A3B8" },
    ];
  }, [targetWeight, t]);

  const chartConfig = useMemo(() => {
    return {
      bloodPressure: {
        accent: "#ED5934",
        data: bloodPressureChartData,
        legends: [
          { label: t("mainPage.chart.systolic"), color: "#ED5934" },
          { label: t("mainPage.chart.diastolic"), color: "#F59874" },
        ],
        unit: "mmHg",
        areas: [
          {
            key: "systolic",
            name: t("mainPage.chart.systolic"),
            stroke: "#ED5934",
            gradientId: "systolicGrad",
          },
          {
            key: "diastolic",
            name: t("mainPage.chart.diastolic"),
            stroke: "#F59874",
            gradientId: "diastolicGrad",
          },
        ],
        references: bpReferences,
      },
      bloodSugar: {
        accent: "#D40000",
        data: bloodSugarChartData,
        legends: [
          { label: t("mainPage.chart.bloodSugar"), color: "#D40000" },
        ],
        unit: "mg/dL",
        areas: [
          {
            key: "glucose",
            name: t("mainPage.chart.bloodSugar"),
            stroke: "#D40000",
            gradientId: "glucoseGrad",
          },
        ],
        references: bloodSugarReferences,
      },
      weight: {
        accent: "#434335",
        data: weightChartData,
        legends: [
          { label: t("mainPage.chart.weight"), color: "#434335" },
        ],
        unit: "kg",
        areas: [
          {
            key: "weight",
            name: t("mainPage.chart.weight"),
            stroke: "#434335",
            gradientId: "weightGrad",
          },
        ],
        references: weightReferences,
      },
    };
  }, [
    bloodPressureChartData,
    bloodSugarChartData,
    weightChartData,
    bpReferences,
    bloodSugarReferences,
    weightReferences,
    t,
  ]);

  const activeChart = chartConfig[selectedChartType];

  const todayStr = formatToday();

  const todayBloodSugar = useMemo(() => {
    const rec = bloodSugarRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.bloodSugar != null,
    );
    if (!rec) return null;
    return {
      value: Number(rec.bloodSugar),
      recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
    };
  }, [bloodSugarRecords, todayStr]);

  const todayBloodPressure = useMemo(() => {
    const rec = bloodPressureRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.systolicBP != null &&
        r.diastolicBP != null,
    );
    if (!rec) return null;
    return {
      systolic: Number(rec.systolicBP),
      diastolic: Number(rec.diastolicBP),
      recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
    };
  }, [bloodPressureRecords, todayStr]);

  const todayWeight = useMemo(() => {
    const rec = weightRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.weight != null,
    );
    if (!rec) return null;
    return {
      value: Number(rec.weight),
      recordedAt: `${rec.recordDate} ${(rec.recordTime || "").slice(0, 5)}`,
    };
  }, [weightRecords, todayStr]);

  const cardData = useMemo(
    () => ({
      bloodSugar: todayBloodSugar,
      bloodPressure: todayBloodPressure,
      weight: todayWeight,
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
      todayBloodSugar,
      todayBloodPressure,
      todayWeight,
      todayMealKcal,
      todayBurnedKcal,
      todayWaterCups,
      targetWaterCups,
      medicineData,
      memberProfile,
    ],
  );

  // 회원정보 몸무게가 없을 때만 보조적으로 가장 최근 체중 기록을 사용
  const latestWeightValue = useMemo(() => {
    const rec = weightRecords.find((r) => r?.weight != null);
    return rec ? Number(rec.weight) : null;
  }, [weightRecords]);

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
  const profileWeightKg = memberProfile?.weight ?? latestWeightValue ?? null;
  const bmiValue =
    profileWeightKg != null && heightCm
      ? Number((profileWeightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1))
      : null;
  const bmiLabel = (() => {
    if (bmiValue == null) return "—";
    if (bmiValue < 18.5) return t("mainPage.bmi.underweight", { value: bmiValue });
    if (bmiValue < 23) return t("mainPage.bmi.normal", { value: bmiValue });
    if (bmiValue < 25) return t("mainPage.bmi.overweight", { value: bmiValue });
    return t("mainPage.bmi.obese", { value: bmiValue });
  })();
  const bmiColor = (() => {
    if (bmiValue == null) return "text-[#0F172A]";
    if (bmiValue < 18.5) return "text-blue-500";
    if (bmiValue < 23) return "text-emerald-600";
    if (bmiValue < 25) return "text-amber-500";
    return "text-red-500";
  })();

  const genderLabel = (() => {
    if (gender === "남성") return t("mainPage.gender.male");
    if (gender === "여성") return t("mainPage.gender.female");
    return gender;
  })();

  const userStats = {
    ageGender:
      age != null || gender
        ? `${age != null ? t("mainPage.ageYears", { age }) : "—"}${gender ? ` / ${genderLabel}` : ""}`
        : "—",
    height: heightCm != null ? `${heightCm}cm` : "—",
    weight: profileWeightKg != null ? `${profileWeightKg}kg` : "—",
    bmi: bmiLabel,
    bmiColor,
  };

  const displayName = memberProfile?.username ?? user?.nickname ?? t("mainPage.defaultName");

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <p className="text-[12px] font-semibold text-[#0F172A] mb-2">{`${new Date().getFullYear()}-${label}`}</p>
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
                  {t("mainPage.greeting", { name: displayName })}
                </h1>

                {/* 모바일: 2×2 그리드 / sm+: 가로 나열 */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:gap-6 text-sm">
                  <div>
                    <p className="text-xs text-[#94A3B8]">{t("mainPage.stats.ageGender")}</p>
                    <p className="font-semibold text-[#0F172A]">{userStats.ageGender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">{t("mainPage.stats.height")}</p>
                    <p className="font-semibold text-[#0F172A]">{userStats.height}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">{t("mainPage.stats.weight")}</p>
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
                    {t("mainPage.pet.title")}
                  </h2>
                  <p className="mt-2 text-sm lg:text-base text-slate-300">
                    {t("mainPage.pet.subtitle")}
                  </p>
                  <Link
                    to="/member/pet"
                    className="group mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    {t("mainPage.pet.detailLink")}
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
                          {t("mainPage.pet.loading")}
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
                title={t("mainPage.chart.weeklyTitle")}
                subtitle={t("mainPage.chart.weeklySubtitle")}
                data={activeChart.data}
                legends={activeChart.legends}
                areas={activeChart.areas}
                unit={activeChart.unit}
                accentColor={activeChart.accent}
                primaryAreaKey={activeChart.areas[0]?.key}
                primaryAreaName={activeChart.areas[0]?.name}
                selectedType={selectedChartType}
                onTypeChange={setSelectedChartType}
                chartTypes={[
                  { value: "bloodSugar", label: t("mainPage.chart.bloodSugar"), color: "#D40000" },
                  { value: "bloodPressure", label: t("mainPage.chart.bloodPressure"), color: "#ED5934" },
                  { value: "weight", label: t("mainPage.chart.weight"), color: "#434335" },
                ]}
              >
                {(filteredData) => {
                  // 데이터 기준 Y축 동적 도메인 (위/아래 여백 최소화)
                  const allValues = [];
                  activeChart.areas.forEach((a) => {
                    filteredData.forEach((d) => {
                      if (d[a.key] != null) allValues.push(d[a.key]);
                    });
                  });
                  const dataMin = allValues.length ? Math.min(...allValues) : 0;
                  const dataMax = allValues.length ? Math.max(...allValues) : 100;
                  const range = dataMax - dataMin || 1;
                  const pad = Math.max(range * 0.15, 3);
                  const yDomain = [
                    Math.floor(dataMin - pad),
                    Math.ceil(dataMax + pad),
                  ];

                  return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                      <defs>
                        <linearGradient id="systolicGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ED5934" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#ED5934" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="diastolicGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59874" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#F59874" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D40000" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#D40000" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#434335" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#434335" stopOpacity={0} />
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

                      {activeChart.areas.map((area) => (
                        <Area
                          key={area.key}
                          type="monotone"
                          dataKey={area.key}
                          name={area.name}
                          stroke={area.stroke}
                          strokeWidth={3}
                          fill={`url(#${area.gradientId})`}
                          dot={{ r: 3, fill: "#fff", stroke: area.stroke, strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: area.stroke, stroke: "#fff", strokeWidth: 2 }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                  );
                }}
              </ChartSection>
            </section>

            {/* ====================== 건강 뉴스 ====================== */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0F172A]">{t("mainPage.news.title")}</h2>
                <p className="text-[#64748B] text-sm mt-1">
                  {t("mainPage.news.subtitle")}
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
                  {t("mainPage.news.loadFailed")}
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