import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Polyline, Line as SvgLine } from "react-native-svg";
import { MessageCircle } from "lucide-react-native";
import { UNITY_PET_URL } from "../lib/runtime";

// Unity WebGL 모바일 차단 우회용 데스크톱 UA
const PET_DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
import newsApi from "../api/newsApi";
import bioValueRecordApi from "../api/bioValueRecordApi";
import mealApi from "../api/mealApi";
import userApi from "../api/userApi";
import userConfigApi from "../api/userConfigApi";
import { getBurnedCalorieByDate } from "../api/exerciseApi";
import medicineApi from "../api/medicineApi";
import { useAuth } from "../context/AuthContext";

// ── 처방 데이터 변환 (web prescriptionData.js 포팅) ─────────────────────────
const SCHEDULE_SLOTS = [
  { id: "morning", label: "아침", time: "08:00", keyword: "아침" },
  { id: "lunch", label: "점심", time: "13:00", keyword: "점심" },
  { id: "dinner", label: "저녁", time: "19:00", keyword: "저녁" },
  { id: "bedtime", label: "취침전", time: "22:00", keyword: "취침전" },
];

const mapPrescriptionsToGroups = (prescriptions) =>
  (prescriptions || []).map((p) => ({
    id: p.prescriptionId,
    groupName: p.prescriptionName || "이름 없음",
    drugId: `presc-${p.prescriptionId}`,
    startDate: p.prescriptionDate || null,
    intakeIntervals: p.intakeIntervals || "",
    medicines: (p.medicines || []).map((m) => ({
      id: m.userMedicationId,
      name: m.medicineName || "이름 없음",
    })),
  }));

const buildSchedulesFromGroups = (groups, dateKey) => {
  const list = Array.isArray(groups) ? groups : [];
  return SCHEDULE_SLOTS.map((slot) => {
    const drugs = list
      .filter(
        (g) =>
          g.medicines.length > 0 &&
          (g.intakeIntervals || "").includes(slot.keyword) &&
          (!dateKey || !g.startDate || g.startDate <= dateKey)
      )
      .map((g) => ({ id: g.drugId, name: g.groupName, taken: false }));
    return { id: slot.id, label: slot.label, drugs };
  }).filter((s) => s.drugs.length > 0);
};

const pad2 = (n) => String(n).padStart(2, "0");
const formatToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";

const readMedicationSchedules = async (dateKey) => {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULE_STORAGE_PREFIX + dateKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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
  const groups = items.length > 0 ? [{ name: "처방 그룹", items }] : [];
  return { todayRemaining, groups };
};

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

// ── 간단한 라인 차트 (recharts AreaChart 대체) ──────────────────────────────
function MiniLineChart({ data, areas, unit }) {
  const width = 300;
  const height = 160;
  const padX = 8;
  const padY = 16;

  const allValues = [];
  areas.forEach((a) => {
    data.forEach((d) => {
      if (d[a.key] != null) allValues.push(d[a.key]);
    });
  });
  if (allValues.length === 0) {
    return (
      <View className="h-[160px] items-center justify-center">
        <Text className="text-[13px] text-[#94A3B8]">데이터가 없습니다.</Text>
      </View>
    );
  }
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const range = dataMax - dataMin || 1;

  const xFor = (i) =>
    data.length <= 1
      ? width / 2
      : padX + (i * (width - padX * 2)) / (data.length - 1);
  const yFor = (v) =>
    padY + (1 - (v - dataMin) / range) * (height - padY * 2);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <SvgLine
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="#EEF2F7"
          strokeWidth={1}
        />
        {areas.map((a) => {
          const pts = data
            .map((d, i) =>
              d[a.key] != null ? `${xFor(i)},${yFor(d[a.key])}` : null
            )
            .filter(Boolean)
            .join(" ");
          return (
            <Polyline
              key={a.key}
              points={pts}
              fill="none"
              stroke={a.stroke}
              strokeWidth={2.5}
            />
          );
        })}
      </Svg>
      <View className="flex-row justify-between mt-1 px-2">
        <Text className="text-[11px] text-[#94A3B8]">
          최저 {dataMin}
          {unit}
        </Text>
        <Text className="text-[11px] text-[#94A3B8]">
          최고 {dataMax}
          {unit}
        </Text>
      </View>
    </View>
  );
}

export default function MainPage() {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.userId ?? user?.id ?? null;

  const [selectedChartType, setSelectedChartType] = useState("bloodPressure");
  const [newsCards, setNewsCards] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [petLoading, setPetLoading] = useState(true);

  const [memberProfile, setMemberProfile] = useState(null);
  const [bloodSugarRecords, setBloodSugarRecords] = useState([]);
  const [bloodPressureRecords, setBloodPressureRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [todayMealKcal, setTodayMealKcal] = useState(null);
  const [todayBurnedKcal, setTodayBurnedKcal] = useState(null);
  const [todayWaterCups, setTodayWaterCups] = useState(0);
  const [targetWaterCups, setTargetWaterCups] = useState(null);
  const [targetWeight, setTargetWeight] = useState(null);
  const [medicineData, setMedicineData] = useState({
    todayRemaining: 0,
    groups: [],
  });

  // localStorage 기반 복약 데이터 → AsyncStorage 로 재계산
  const refreshMedicineFromStorage = async () => {
    const schedules = await readMedicationSchedules(formatToday());
    setMedicineData(computeMedicineData(schedules));
  };

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const today = formatToday();

    const tasks = [
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
              .sort(byDateDesc)
          );
          setBloodPressureRecords(
            list
              .filter(
                (r) =>
                  startsWith(r, "BloodPressure") &&
                  r.systolicBP != null &&
                  r.diastolicBP != null
              )
              .sort(byDateDesc)
          );
          setWeightRecords(
            list
              .filter((r) => startsWith(r, "Weight") && r.weight != null)
              .sort(byDateDesc)
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
          const cups = list.reduce((sum, r) => sum + (r.waterIntakeCup || 0), 0);
          setTodayWaterCups(cups);
        })
        .catch(() => {}),

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

  // 로그인 직후 백엔드 처방전으로 복약알림 즉시 표시
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
        const saved = await readMedicationSchedules(todayKey);
        const merged = mergeTakenState(base, saved);
        if (!cancelled) setMedicineData(computeMedicineData(merged));
      } catch {
        // 실패 시 storage 기반 값 유지
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // web 의 focus/visibilitychange/storage 리스너 → 주기적 새로고침으로 대체
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMedicineFromStorage();
    }, 30000);
    return () => clearInterval(interval);
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

  const chartConfig = useMemo(() => {
    return {
      bloodPressure: {
        accent: "#ED5934",
        data: bloodPressureChartData,
        legends: [
          { label: "수축기", color: "#ED5934" },
          { label: "이완기", color: "#F59874" },
        ],
        unit: "mmHg",
        areas: [
          { key: "systolic", name: "수축기", stroke: "#ED5934" },
          { key: "diastolic", name: "이완기", stroke: "#F59874" },
        ],
      },
      bloodSugar: {
        accent: "#D40000",
        data: bloodSugarChartData,
        legends: [{ label: "혈당", color: "#D40000" }],
        unit: "mg/dL",
        areas: [{ key: "glucose", name: "혈당", stroke: "#D40000" }],
      },
      weight: {
        accent: "#434335",
        data: weightChartData,
        legends: [{ label: "체중", color: "#434335" }],
        unit: "kg",
        areas: [{ key: "weight", name: "체중", stroke: "#434335" }],
      },
    };
  }, [bloodPressureChartData, bloodSugarChartData, weightChartData]);

  const activeChart = chartConfig[selectedChartType];

  const todayStr = formatToday();

  const todayBloodSugar = useMemo(() => {
    const rec = bloodSugarRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.bloodSugar != null
    );
    if (!rec) return null;
    return { value: Number(rec.bloodSugar) };
  }, [bloodSugarRecords, todayStr]);

  const todayBloodPressure = useMemo(() => {
    const rec = bloodPressureRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.systolicBP != null &&
        r.diastolicBP != null
    );
    if (!rec) return null;
    return {
      systolic: Number(rec.systolicBP),
      diastolic: Number(rec.diastolicBP),
    };
  }, [bloodPressureRecords, todayStr]);

  const todayWeight = useMemo(() => {
    const rec = weightRecords.find(
      (r) =>
        String(r?.recordDate || "").slice(0, 10) === todayStr &&
        r.weight != null
    );
    if (!rec) return null;
    return { value: Number(rec.weight) };
  }, [weightRecords, todayStr]);

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
      ? Number(
          (profileWeightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1)
        )
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

  // 오늘 상태 카드 (Card 컴포넌트 대체 — 인라인)
  const statusCards = [
    {
      label: "혈당",
      value: todayBloodSugar ? `${todayBloodSugar.value} mg/dL` : "기록 없음",
      has: !!todayBloodSugar,
    },
    {
      label: "혈압",
      value: todayBloodPressure
        ? `${todayBloodPressure.systolic}/${todayBloodPressure.diastolic} mmHg`
        : "기록 없음",
      has: !!todayBloodPressure,
    },
    {
      label: "체중",
      value: todayWeight ? `${todayWeight.value} kg` : "기록 없음",
      has: !!todayWeight,
    },
    {
      label: "오늘 섭취",
      value: todayMealKcal != null ? `${todayMealKcal} kcal` : "—",
      has: todayMealKcal != null,
    },
    {
      label: "오늘 소모",
      value: todayBurnedKcal != null ? `${todayBurnedKcal} kcal` : "—",
      has: todayBurnedKcal != null,
    },
    {
      label: "수분",
      value:
        targetWaterCups != null
          ? `${todayWaterCups} / ${targetWaterCups} 컵`
          : `${todayWaterCups} 컵`,
      has: todayWaterCups > 0,
    },
    {
      label: "남은 복약",
      value:
        medicineData.groups.length > 0
          ? `${medicineData.todayRemaining}건 남음`
          : "처방 없음",
      has: medicineData.groups.length > 0,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="px-4 py-6 sm:px-6 sm:py-8">
          {/* ── 헤더 & 사용자 스탯 ── */}
          <View className="pb-4 border-b border-[#E5E7EB] mb-6">
            <Text className="text-[24px] font-bold text-[#0F172A] mb-4">
              {displayName}님 안녕하세요.
            </Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-3">
              <View>
                <Text className="text-[12px] text-[#94A3B8]">나이 / 성별</Text>
                <Text className="font-semibold text-[#0F172A]">
                  {userStats.ageGender}
                </Text>
              </View>
              <View>
                <Text className="text-[12px] text-[#94A3B8]">키</Text>
                <Text className="font-semibold text-[#0F172A]">
                  {userStats.height}
                </Text>
              </View>
              <View>
                <Text className="text-[12px] text-[#94A3B8]">몸무게</Text>
                <Text className="font-semibold text-[#0F172A]">
                  {userStats.weight}
                </Text>
              </View>
              <View>
                <Text className="text-[12px] text-[#94A3B8]">BMI</Text>
                <Text className={`font-semibold ${userStats.bmiColor}`}>
                  {userStats.bmi}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 펫 섹션 — Unity 펫을 홈에 바로 임베드 ── */}
          <View className="rounded-[18px] bg-slate-800 p-6 mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] font-bold text-white">내 펫</Text>
              <Pressable
                onPress={() => router.push("/member/pet")}
                className="rounded-full bg-white/15 px-3 py-1.5"
              >
                <Text className="text-[12px] font-semibold text-white">
                  전체화면 ›
                </Text>
              </Pressable>
            </View>
            <Text className="mt-1 text-[13px] text-slate-300">
              펫과 함께 건강한 하루를 시작해보세요.
            </Text>
            <View
              className="mt-4 overflow-hidden rounded-[14px] bg-slate-700/60"
              style={{ height: 260 }}
            >
              {UNITY_PET_URL ? (
                <>
                  <WebView
                    source={{ uri: UNITY_PET_URL }}
                    userAgent={PET_DESKTOP_UA}
                    originWhitelist={["*"]}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    onLoadEnd={() => setPetLoading(false)}
                    style={{ flex: 1, backgroundColor: "transparent" }}
                  />
                  {petLoading && (
                    <View className="absolute inset-0 items-center justify-center">
                      <ActivityIndicator color="#FFFFFF" />
                      <Text className="mt-2 text-[12px] text-slate-200">
                        펫 불러오는 중…
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-[40px]">🐾</Text>
                  <Text className="mt-2 text-[13px] font-semibold text-slate-200">
                    펫 준비 중
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── 오늘의 상태 카드 ── */}
          <View className="flex-row flex-wrap gap-3 mb-8">
            {statusCards.map((c) => (
              <View
                key={c.label}
                className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 flex-1 min-w-[140px]"
              >
                <Text className="text-[12px] text-[#94A3B8] mb-1">
                  {c.label}
                </Text>
                <Text
                  className={`text-[16px] font-bold ${
                    c.has ? "text-[#0F172A]" : "text-[#94A3B8]"
                  }`}
                >
                  {c.value}
                </Text>
              </View>
            ))}
          </View>

          {/* ── 주간 건강 추이 (recharts 대체) ── */}
          <View className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 mb-8">
            <Text className="text-[18px] font-bold text-[#0F172A]">
              주간 건강 추이
            </Text>
            <Text className="text-[13px] text-[#64748B] mt-0.5 mb-4">
              일자별 평균 수치 추이
            </Text>

            {/* 타입 토글 */}
            <View className="flex-row gap-2 mb-4">
              {[
                { value: "bloodSugar", label: "혈당" },
                { value: "bloodPressure", label: "혈압" },
                { value: "weight", label: "체중" },
              ].map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setSelectedChartType(t.value)}
                  className={`rounded-full px-4 py-1.5 border ${
                    selectedChartType === t.value
                      ? "bg-[#0F172A] border-[#0F172A]"
                      : "bg-white border-[#E5E7EB]"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      selectedChartType === t.value
                        ? "text-white"
                        : "text-[#64748B]"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 범례 */}
            <View className="flex-row gap-4 mb-2">
              {activeChart.legends.map((lg) => (
                <View key={lg.label} className="flex-row items-center gap-1.5">
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: lg.color }}
                  />
                  <Text className="text-[12px] text-[#64748B]">{lg.label}</Text>
                </View>
              ))}
            </View>

            <MiniLineChart
              data={activeChart.data}
              areas={activeChart.areas}
              unit={activeChart.unit}
            />
          </View>

          {/* ── 건강 캘린더 바로가기 ── */}
          <Pressable
            onPress={() => router.push("/healthcalendar")}
            className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 mb-8 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-[16px] font-bold text-[#0F172A]">
                건강 지표 관리 캘린더
              </Text>
              <Text className="text-[13px] text-[#64748B] mt-0.5">
                지난 활동과 수치를 확인해보세요.
              </Text>
            </View>
            <Text className="text-[18px] text-[#94A3B8]">→</Text>
          </Pressable>

          {/* ── 건강 뉴스 ── */}
          <View>
            <Text className="text-[22px] font-bold text-[#0F172A]">
              건강 뉴스
            </Text>
            <Text className="text-[#64748B] text-[14px] mt-1 mb-6">
              하이닥에서 큐레이션한 건강 정보를 만나보세요.
            </Text>

            {newsLoading ? (
              <View className="gap-6">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="rounded-3xl border border-[#E5E7EB] bg-white overflow-hidden"
                  >
                    <View className="h-40 w-full bg-slate-100" />
                    <View className="p-6 gap-2">
                      <View className="h-3 w-16 rounded bg-slate-100" />
                      <View className="h-4 w-full rounded bg-slate-100" />
                    </View>
                  </View>
                ))}
              </View>
            ) : newsCards.length === 0 ? (
              <View className="rounded-[18px] border border-[#E5E7EB] bg-white p-10">
                <Text className="text-center text-[14px] text-[#94A3B8]">
                  뉴스를 불러오지 못했습니다.
                </Text>
              </View>
            ) : (
              <View className="gap-6">
                {newsCards.map((news, idx) => (
                  <Pressable
                    key={news.link || idx}
                    onPress={() =>
                      news.link && Linking.openURL(news.link).catch(() => {})
                    }
                    className="rounded-3xl border border-[#E5E7EB] bg-white overflow-hidden"
                  >
                    {news.thumbnail ? (
                      <Image
                        source={{ uri: news.thumbnail }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-48 w-full items-center justify-center bg-slate-100">
                        <Text className="text-[30px]">📰</Text>
                      </View>
                    )}
                    <View className="p-6">
                      <View className="self-start rounded bg-[#F1F5F9] px-2 py-0.5">
                        <Text className="text-[11px] font-bold text-[#0F172A]">
                          HIDOC
                        </Text>
                      </View>
                      <Text
                        className="mt-3 text-[14px] font-semibold text-[#0F172A] leading-snug"
                        numberOfLines={2}
                      >
                        {news.title}
                      </Text>
                      {news.pubDate && (
                        <Text className="mt-2 text-[11px] text-[#64748B]">
                          {news.pubDate}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── AI 챗봇 플로팅 버튼 ── */}
      <Pressable
        onPress={() => router.push("/chatbot")}
        accessibilityLabel="AI 챗봇 열기"
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0F172A] items-center justify-center shadow-lg"
        style={{
          shadowColor: "#0F1A2E",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <MessageCircle size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
