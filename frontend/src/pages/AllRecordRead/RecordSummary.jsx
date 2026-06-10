import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import mealApi from "../../api/mealApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userConfigApi from "../../api/userConfigApi";
import { getExercisesInRange } from "../../api/exerciseApi";
import { BIO_CATEGORY } from "../../constants/bioCategory";
import { useAuth } from "../../contexts/AuthContext";

const MEAL_CATEGORY_LABEL_KEY = {
  BREAKFAST: "recordSummary.mealCategory.breakfast",
  LUNCH: "recordSummary.mealCategory.lunch",
  DINNER: "recordSummary.mealCategory.dinner",
  SNACK: "recordSummary.mealCategory.snack",
};
const MEAL_CATEGORY_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const ML_PER_CUP = 200;
const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";

const pad2 = (n) => String(n).padStart(2, "0");
const toDateStr = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const shiftDate = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};
const avg = (arr) =>
  arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : null;

// "BloodSugar-아침식전" 류 카테고리에서 meal/timing 추출
const parseBsCategory = (category) => {
  if (typeof category !== "string" || !category.includes("-"))
    return { meal: "공복", timing: "식전" };
  const suffix = category.split("-")[1];
  if (suffix === "공복") return { meal: "공복", timing: "식전" };
  if (suffix === "취침전") return { meal: "취침전", timing: "식전" };
  for (const m of ["아침", "점심", "저녁"]) {
    if (suffix.startsWith(m)) {
      const t = suffix.slice(m.length) === "식후" ? "식후" : "식전";
      return { meal: m, timing: t };
    }
  }
  return { meal: "공복", timing: "식전" };
};

// "BloodPressure-아침" 류 카테고리에서 timing 추출
const parseBpTiming = (category) =>
  typeof category === "string" && category.includes("-")
    ? category.split("-")[1]
    : "기타";

const BS_ORDER = ["아침", "점심", "저녁", "취침전", "공복"];
const BP_ORDER = ["아침", "점심", "저녁", "취침전", "기타"];

const readMedicationSchedules = (dateStr) => {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + dateStr);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatNumber = (n) =>
  n == null ? "—" : Number(n).toLocaleString();

const mapItemToCardFormat = (item) => ({
  name: item.foodName,
  kcal: item.calorie ?? 0,
  carb: item.carbohydrate ?? 0,
  protein: item.protein ?? 0,
  fat: item.saturatedFat ?? 0,
  sugar: item.sugar ?? 0,
  chol: item.cholesterol ?? 0,
  na: item.sodium ?? 0,
  image: item.mealPhoto ?? null, // 음식별 고유 사진
});

// MealDetailModal용 데이터 변환 (MealPage와 동일)
function buildMealData(meal) {
  if (!meal) return null;
  const sum = (key) => meal.items.reduce((s, i) => s + (i[key] || 0), 0);
  return {
    mealType: i18n.t("recordSummary.mealType", { label: meal.label }),
    foods: meal.items.map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      calories: item.kcal,
      nutrition: {
        carbs: item.carb,
        protein: item.protein,
        fat: item.fat,
        sugar: item.sugar,
        cholesterol: item.chol,
        sodium: item.na,
      },
      image: item.image || meal.image, // 음식 고유 사진 우선, 없으면 Meal 사진 fallback
    })),
    totalNutrition: {
      carbs: sum("carb"),
      protein: sum("protein"),
      fat: sum("fat"),
      sugar: sum("sugar"),
      cholesterol: sum("chol"),
      sodium: sum("na"),
    },
    totalCalories: sum("kcal"),
  };
}
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Droplets,
  Scale,
  Utensils,
  Dumbbell,
  Check,
  TrendingDown,
  Sun,
  Coffee,
  Moon,
  TrendingUp,
} from "lucide-react";

import SummaryCard from "../../components/SummaryCard";
import MealRecordCard from "../../components/MealRecordCard";
import MealRegisterModal from "../../modals/MealRegisterModal";
import DailyTimelineModal from "../../modals/DailyTimelineModal";
import MealDetailModal from "../../modals/MealDetailModal";

const MacroBadge = ({ label, value, unit = "g" }) => (
  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-50 rounded px-1.5 py-0.5">
    <span className="text-slate-500 font-medium">{label}</span> {value}
    {unit}
  </span>
);

// 혈압 차트 호버 시 상세값 툴팁
const BloodPressureTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <p className="mb-2 text-[12px] font-bold text-slate-900">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-[12px]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-slate-500">{p.name}</span>
            <span className="ml-auto font-bold text-slate-900">
              {p.value}
              <span className="ml-0.5 text-[10px] font-medium text-slate-400">
                mmHg
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RecordSummary() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isTimeLineModalOpen, setTimeLineModelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const dateInputRef = useRef(null);

  // 식단 데이터 fetch (MealPage와 동일 로직)
  const [meals, setMeals] = useState([]);

  // 요약 카드 / 차트 / 복약 실제 데이터
  const [summary, setSummary] = useState({
    intakeKcal: null,
    targetIntakeKcal: null,
    exerciseMin: null,
    burnedKcal: null,
    weightKg: null,
    weightDelta: null,
    waterMl: null,
    targetWaterMl: null,
  });
  const [bloodSugarData, setBloodSugarData] = useState([]);
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [medSchedules, setMedSchedules] = useState([]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setSummary({
        intakeKcal: null,
        targetIntakeKcal: null,
        exerciseMin: null,
        burnedKcal: null,
        weightKg: null,
        weightDelta: null,
        waterMl: null,
        targetWaterMl: null,
      });
      setBloodSugarData([]);
      setBloodPressureData([]);
      setMedSchedules([]);
      return undefined;
    }

    let cancelled = false;
    const date = selectedDate;
    const weekAgo = shiftDate(date, -7);
    const rangeStart = shiftDate(date, -14);

    Promise.allSettled([
      mealApi.getDayTotalNutrient(userId, date),
      getExercisesInRange(userId, date, date),
      bioValueRecordApi.searchByDateBetween(
        userId,
        BIO_CATEGORY.WEIGHT,
        rangeStart,
        date,
      ),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.WATER_INTAKE, date),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.BLOOD_SUGAR, date),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.BLOOD_PRESSURE, date),
      userConfigApi.getUserConfig(userId),
    ]).then(
      ([mealRes, exRes, wtRes, waterRes, bsRes, bpRes, cfgRes]) => {
        if (cancelled) return;

        // 식단 섭취 칼로리
        const intakeKcal =
          mealRes.status === "fulfilled" && Array.isArray(mealRes.value?.data)
            ? Number(mealRes.value.data[0]) || 0
            : 0;

        // 운동 활동시간 / 소모 칼로리
        let exerciseMin = 0;
        let burnedKcal = 0;
        if (exRes.status === "fulfilled" && Array.isArray(exRes.value)) {
          exRes.value.forEach((e) => {
            exerciseMin += Number(e.exerciseMin) || 0;
            burnedKcal += Number(e.burnedCalorie) || 0;
          });
        }

        // 체중 (선택일 기준 최신 + 지난주 대비)
        let weightKg = null;
        let weightDelta = null;
        if (wtRes.status === "fulfilled" && Array.isArray(wtRes.value?.data)) {
          const list = wtRes.value.data
            .filter((r) => r.weight != null)
            .sort((a, b) => (a.recordDate < b.recordDate ? -1 : 1));
          const latestOnOrBefore = (limit) =>
            [...list].reverse().find((r) => r.recordDate <= limit) || null;
          const cur = latestOnOrBefore(date);
          const prev = latestOnOrBefore(weekAgo);
          if (cur) weightKg = Number(cur.weight);
          if (cur && prev)
            weightDelta = +(Number(cur.weight) - Number(prev.weight)).toFixed(1);
        }

        // 수분 (컵 → ml)
        let waterMl = 0;
        if (
          waterRes.status === "fulfilled" &&
          Array.isArray(waterRes.value?.data)
        ) {
          const cups = waterRes.value.data.reduce(
            (s, r) => s + (r.waterIntakeCup || 0),
            0,
          );
          waterMl = cups * ML_PER_CUP;
        }

        // 목표치 (user_config)
        let targetIntakeKcal = null;
        let targetWaterMl = null;
        if (cfgRes.status === "fulfilled" && cfgRes.value?.data) {
          const cfg = cfgRes.value.data;
          targetIntakeKcal = cfg.targetDailyCaloriesIntake ?? null;
          targetWaterMl =
            cfg.targetDailyWaterIntake != null
              ? cfg.targetDailyWaterIntake * ML_PER_CUP
              : null;
        }

        setSummary({
          intakeKcal,
          targetIntakeKcal,
          exerciseMin,
          burnedKcal,
          weightKg,
          weightDelta,
          waterMl,
          targetWaterMl,
        });

        // 혈당 차트 (끼니별 식전/식후 평균)
        const bsMap = {};
        if (bsRes.status === "fulfilled" && Array.isArray(bsRes.value?.data)) {
          bsRes.value.data.forEach((r) => {
            if (r.bloodSugar == null) return;
            const { meal, timing } = parseBsCategory(r.category);
            if (!bsMap[meal]) bsMap[meal] = { fasting: [], postMeal: [] };
            if (timing === "식후") bsMap[meal].postMeal.push(Number(r.bloodSugar));
            else bsMap[meal].fasting.push(Number(r.bloodSugar));
          });
        }
        setBloodSugarData(
          BS_ORDER.filter((m) => bsMap[m]).map((m) => ({
            time: m,
            fasting: avg(bsMap[m].fasting),
            postMeal: avg(bsMap[m].postMeal),
          })),
        );

        // 혈압 차트 (시간대별 수축기/이완기 평균)
        const bpMap = {};
        if (bpRes.status === "fulfilled" && Array.isArray(bpRes.value?.data)) {
          bpRes.value.data.forEach((r) => {
            if (r.systolicBP == null || r.diastolicBP == null) return;
            const timing = parseBpTiming(r.category);
            if (!bpMap[timing]) bpMap[timing] = { sys: [], dia: [] };
            bpMap[timing].sys.push(Number(r.systolicBP));
            bpMap[timing].dia.push(Number(r.diastolicBP));
          });
        }
        setBloodPressureData(
          BP_ORDER.filter((t) => bpMap[t]).map((t) => ({
            time: t,
            systolic: avg(bpMap[t].sys),
            diastolic: avg(bpMap[t].dia),
          })),
        );
      },
    );

    setMedSchedules(readMedicationSchedules(date));

    return () => {
      cancelled = true;
    };
  }, [user?.id, selectedDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      if (!user?.id) {
        setMeals([]);
        return;
      }
      try {
        const res = await mealApi.getTodayMeals(user.id, selectedDate);
        const mealsData = res.data || [];
        const itemsPerMeal = await Promise.all(
          mealsData.map((m) =>
            mealApi.getMealItemsByMealId(m.mealId).then((r) => r.data || []),
          ),
        );
        if (cancelled) return;

        const groupedByCategory = {};
        mealsData.forEach((m, idx) => {
          const cat = m.mealCategory;
          if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = {
              id: cat,
              label: MEAL_CATEGORY_LABEL_KEY[cat] ? t(MEAL_CATEGORY_LABEL_KEY[cat]) : cat,
              time: (m.mealTime || "").slice(0, 5),
              image: m.mealPhoto || null,
              items: [],
            };
          }
          groupedByCategory[cat].items = groupedByCategory[cat].items.concat(
            itemsPerMeal[idx].map(mapItemToCardFormat),
          );
        });

        const ordered = MEAL_CATEGORY_ORDER
          .map((c) => groupedByCategory[c])
          .filter(Boolean);
        setMeals(ordered);
      } catch (err) {
        console.error("식단 조회 실패:", err);
        if (!cancelled) setMeals([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, selectedDate, t]);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  // ── 요약 카드 표시값 ──
  const intakeRemaining =
    summary.targetIntakeKcal != null && summary.intakeKcal != null
      ? summary.targetIntakeKcal - summary.intakeKcal
      : null;
  const mealUnit =
    summary.targetIntakeKcal != null
      ? t("recordSummary.meal.unitTarget", {
          value: formatNumber(summary.targetIntakeKcal),
        })
      : t("recordSummary.meal.unit");
  const mealBottom =
    intakeRemaining != null
      ? intakeRemaining >= 0
        ? t("recordSummary.meal.remaining", {
            value: formatNumber(intakeRemaining),
          })
        : t("recordSummary.meal.overTarget", {
            value: formatNumber(Math.abs(intakeRemaining)),
          })
      : t("recordSummary.meal.noTarget");

  const exerciseBottom =
    summary.burnedKcal != null
      ? t("recordSummary.exercise.totalBurned", {
          value: formatNumber(Math.round(summary.burnedKcal)),
        })
      : t("recordSummary.exercise.noRecord");

  const weightInc = summary.weightDelta != null && summary.weightDelta > 0;
  const weightDec = summary.weightDelta != null && summary.weightDelta < 0;
  const weightBottom =
    summary.weightDelta != null
      ? t("recordSummary.weight.weekDelta", {
          value: `${summary.weightDelta > 0 ? "+" : ""}${summary.weightDelta}`,
        })
      : t("recordSummary.weight.noWeekRecord");
  const weightBottomColor = weightInc
    ? "text-rose-600"
    : weightDec
      ? "text-emerald-600"
      : "text-slate-400";

  const waterL = summary.waterMl != null ? +(summary.waterMl / 1000).toFixed(1) : null;
  const targetWaterL =
    summary.targetWaterMl != null ? +(summary.targetWaterMl / 1000).toFixed(1) : null;
  const waterRemainingL =
    targetWaterL != null && waterL != null
      ? Math.max(0, +(targetWaterL - waterL).toFixed(1))
      : null;
  const waterUnit =
    targetWaterL != null
      ? t("recordSummary.water.unitTarget", { value: targetWaterL })
      : t("recordSummary.water.unit");
  const waterBottom =
    waterRemainingL != null
      ? waterRemainingL === 0
        ? t("recordSummary.water.goalReached")
        : t("recordSummary.water.remaining", { value: waterRemainingL })
      : t("recordSummary.water.noTarget");

  const medDateLabel = (() => {
    const d = new Date(selectedDate);
    if (Number.isNaN(d.getTime())) return selectedDate;
    return t("recordSummary.dateLabel", {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    });
  })();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-noto-sans">
      <div className="flex pt-[55px]">
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
                {t("recordSummary.header.title")}
              </h1>
              <p className="text-sm text-gray-500">
                {t("recordSummary.header.subtitle")}
              </p>
            </div>

            {/* 날짜 선택 */}
            <div className="relative">
              <input
                type="date"
                ref={dateInputRef}
                value={selectedDate}
                className="absolute opacity-0 pointer-events-none"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                type="button"
                onClick={openDatePicker}
                className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#64748B] shadow-sm hover:border-slate-300"
              >
                {selectedDate}
                <span className="ml-1 text-[10px] text-[#94A3B8]">▼</span>
              </button>
            </div>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            {/* 식단 Card */}
            <SummaryCard
              Icon={Utensils}
              colorText="text-red-600"
              colorBackgorund="bg-red-50"
              labelName={t("recordSummary.cards.meal.label")}
              description={t("recordSummary.cards.meal.description")}
              record={formatNumber(
                summary.intakeKcal != null ? Math.round(summary.intakeKcal) : null,
              )}
              unit={mealUnit}
              bottomLabel={mealBottom}
              bottomeLabelColor="text-red-600"
            />

            {/* 운동 Card */}
            <SummaryCard
              Icon={Dumbbell}
              colorText="text-orange-600"
              colorBackgorund="bg-orange-50"
              labelName={t("recordSummary.cards.exercise.label")}
              description={t("recordSummary.cards.exercise.description")}
              record={summary.exerciseMin != null ? formatNumber(summary.exerciseMin) : "—"}
              unit={t("recordSummary.cards.exercise.unit")}
              bottomLabel={exerciseBottom}
              bottomeLabelColor="text-orange-600"
            />

            {/* 체중 Card */}
            <SummaryCard
              Icon={Scale}
              colorText="text-yellow-600"
              colorBackgorund="bg-yellow-50"
              labelName={t("recordSummary.cards.weight.label")}
              description={t("recordSummary.cards.weight.description")}
              record={summary.weightKg != null ? summary.weightKg : "—"}
              unit="kg"
              bottomLabel={weightBottom}
              BottomIcon={weightInc ? TrendingUp : weightDec ? TrendingDown : undefined}
              bottomeLabelColor={weightBottomColor}
            />

            {/* 수분 Card */}
            <SummaryCard
              Icon={Droplets}
              colorText="text-sky-600"
              colorBackgorund="bg-sky-50"
              labelName={t("recordSummary.cards.water.label")}
              description={t("recordSummary.cards.water.description")}
              record={waterL != null ? waterL : "—"}
              unit={waterUnit}
              bottomLabel={waterBottom}
              bottomeLabelColor="text-sky-600"
            />
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-4 mb-8 xl:grid-cols-2">
            {/* 혈당 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  {t("recordSummary.bloodSugar.title")}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {t("recordSummary.bloodSugar.legendFasting")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {t("recordSummary.bloodSugar.legendPostMeal")}
                  </span>
                </div>
              </div>
              {bloodSugarData.length === 0 ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
                  {t("recordSummary.bloodSugar.empty")}
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={bloodSugarData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={[0, 180]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    ticks={[0, 30, 60, 90, 120, 150, 180]}
                  />
                  <ReferenceLine
                    y={120}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: "120",
                      position: "right",
                      fill: "#ef4444",
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#3b82f6"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: "100",
                      position: "right",
                      fill: "#3b82f6",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="fasting" fill="#6ea8fe" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="fasting"
                      position="top"
                      fill="#3b82f6"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                  <Bar dataKey="postMeal" fill="#fca5a5" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="postMeal"
                      position="top"
                      fill="#ef4444"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* 혈압 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  {t("recordSummary.bloodPressure.title")}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {t("recordSummary.bloodPressure.legendSystolic")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {t("recordSummary.bloodPressure.legendDiastolic")}
                  </span>
                </div>
              </div>
              {bloodPressureData.length === 0 ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
                  {t("recordSummary.bloodPressure.empty")}
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={bloodPressureData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={[0, 300]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    ticks={[0, 100, 200, 300]}
                  />
                  <Tooltip content={<BloodPressureTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    name={t("recordSummary.bloodPressure.systolic")}
                    stroke="#f87171"
                    fill="#fee2e2"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#fff", stroke: "#f87171", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    name={t("recordSummary.bloodPressure.diastolic")}
                    stroke="#818cf8"
                    fill="#e0e7ff"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#fff", stroke: "#818cf8", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* 복용 일정 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-900">
                  {t("recordSummary.medication.title")}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                  {medDateLabel}
                </span>
              </div>
            </div>

            {medSchedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                {t("recordSummary.medication.empty")}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {medSchedules.map((schedule) => {
                  const drugs = schedule.drugs || [];
                  const takenCount = drugs.filter((d) => d.taken).length;
                  const status =
                    drugs.length > 0 && takenCount === drugs.length
                      ? "all"
                      : takenCount > 0
                        ? "partial"
                        : "none";
                  const ScheduleIcon =
                    schedule.id === "lunch"
                      ? Coffee
                      : schedule.id === "dinner"
                        ? Moon
                        : Sun;
                  // 라벨/이름은 표시 전용이라 저장된 값(저장 당시 언어로 동결됨)을
                  // 믿지 말고 slot id 로 현재 언어에서 재해석한다. (id 가 슬롯이 아니면 원문 유지)
                  const hasSlotKey = i18n.exists(`medication.slot.${schedule.id}`);
                  const slotLabel = hasSlotKey
                    ? t(`medication.slot.${schedule.id}`)
                    : schedule.label;
                  const slotName = hasSlotKey
                    ? t("medication.slotDoseName", { slot: slotLabel })
                    : schedule.name;
                  return (
                    <div
                      key={schedule.id}
                      className={`rounded-xl p-4 ${
                        status === "none"
                          ? "border-2 border-gray-900"
                          : "border border-gray-100"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 text-xs mb-3 ${
                          status === "none"
                            ? "text-gray-900 font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        <ScheduleIcon size={13} /> {slotLabel}
                        {schedule.time ? ` (${schedule.time})` : ""}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 mb-0.5">
                        {slotName}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {drugs.length > 0
                          ? drugs.map((d) => d.name).join(", ")
                          : schedule.note}
                      </p>
                      {status === "all" ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Check size={14} /> {t("recordSummary.medication.statusAll")}
                        </div>
                      ) : status === "partial" ? (
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          {t("recordSummary.medication.statusPartial", {
                            taken: takenCount,
                            total: drugs.length,
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          {t("recordSummary.medication.statusNone")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {meals.length === 0 ? (
            <div className="mb-9 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-16 px-6">
              <div
                className="mb-5 flex h-[64px] w-[64px] items-center justify-center rounded-2xl"
                style={{ background: "#F1F5F9", color: "#94A3B8" }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11h18" />
                  <path d="M12 11V3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M9 21h6" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <h3 className="mb-2 text-[16px] font-semibold text-[#0F172A]">
                {t("recordSummary.mealEmpty.title")}
              </h3>
              <p className="text-center text-[13px] leading-relaxed text-[#64748B]">
                <span className="font-semibold text-[#475569]">
                  {t("recordSummary.mealEmpty.linkLabel")}
                </span>{" "}
                {t("recordSummary.mealEmpty.descPart1")}
                <br />
                {t("recordSummary.mealEmpty.descPart2")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mb-9 sm:grid-cols-2 lg:grid-cols-4">
              {meals.map((meal) => (
                <MealRecordCard
                  key={meal.id}
                  time={meal.time}
                  label={meal.label}
                  items={meal.items}
                  image={meal.image}
                  onClick={() => setSelectedMeal(meal)}
                  className="w-full cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                />
              ))}
            </div>
          )}
          </div>
        </main>

        {/* <MealRegisterModal isOpen={isMealModalOpen} onClose={() => setMealModalOpen(false)} /> */}
        <DailyTimelineModal
          isOpen={isTimeLineModalOpen}
          onClose={() => setTimeLineModelOpen(false)}
        />
        <MealDetailModal
          isOpen={!!selectedMeal}
          mealData={buildMealData(selectedMeal)}
          onClose={() => setSelectedMeal(null)}
        />
      </div>
    </div>
  );
}
