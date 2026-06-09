import { useState, useRef, useEffect } from "react";
import MealRecordCard from "../components/MealRecordCard";
import MealDetailModal from "../modals/MealDetailModal";
import mealApi from "../api/mealApi";
import userConfigApi from "../api/userConfigApi";
import { useAuth } from "../contexts/AuthContext";

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};
const MEAL_CATEGORY_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

// 목표 섭취 칼로리 기본값 (사용자 목표가 설정되지 않았을 때 사용)
const DEFAULT_TARGET_CAL = 2100;

// 목표 섭취 칼로리를 기준으로 영양소 권장 기준치를 계산한다.
//  탄수화물 ~57% / 단백질 ~15% / 지방 ~25% / 당류 <10% (열량 비율)
//  나트륨·콜레스테롤은 칼로리와 무관한 1일 상한이므로 고정값 사용
function computeNutritionTargets(targetCal) {
  const cal = targetCal > 0 ? targetCal : DEFAULT_TARGET_CAL;
  return {
    carb: Math.round((cal * 0.57) / 4),  // 1g = 4kcal
    protein: Math.round((cal * 0.15) / 4),
    fat: Math.round((cal * 0.25) / 9),    // 1g = 9kcal
    sugar: Math.round((cal * 0.1) / 4),
    na: 2000,   // WHO 권장 1일 상한
    chol: 300,  // 1일 상한
  };
}

const mapItemToCardFormat = (item) => ({
  name: item.foodName,
  kcal: item.calorie ?? 0,
  carb: item.carbohydrate ?? 0,
  protein: item.protein ?? 0,
  fat: item.saturatedFat ?? 0,
  sugar: item.sugar ?? 0,
  chol: item.cholesterol ?? 0,
  na: item.sodium ?? 0,
  image: item.mealPhoto ?? null, // 음식별 고유 사진 (MealItem.mealPhoto)
});

// ── MealDetailModal용 데이터 변환 ─────────────────────────────────────────
function buildMealData(meal) {
  if (!meal) return null;
  const sum = (key) => meal.items.reduce((s, i) => s + (i[key] || 0), 0);
  return {
    mealType: `${meal.label} 식사`,
    foods: meal.items.map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      calories: item.kcal,
      nutrition: {
        carbs:       item.carb,
        protein:     item.protein,
        fat:         item.fat,
        sugar:       item.sugar,
        cholesterol: item.chol,
        sodium:      item.na,
      },
      image: item.image || meal.image, // 음식 고유 사진 우선, 없으면 Meal 사진 fallback
    })),
    totalNutrition: {
      carbs:       sum("carb"),
      protein:     sum("protein"),
      fat:         sum("fat"),
      sugar:       sum("sugar"),
      cholesterol: sum("chol"),
      sodium:      sum("na"),
    },
    totalCalories: sum("kcal"),
  };
}

// ── DonutChart ────────────────────────────────────────────────────────────
function DonutChart({ value, max, size = 160, strokeWidth = 10, color = "#000" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value / max, 1));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E9EB" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────
function ProgressBar({ current, target, over, barClass = "bg-[#111]" }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="h-[6px] rounded-[3px] bg-[#ebeef0] overflow-hidden w-full">
      <div
        className={`h-full rounded-[3px] transition-[width] duration-[800ms] ease-in-out ${
          over ? "bg-[#bc2e16]" : barClass
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── 식단 점수 분석 ──────────────────────────────────────────────────────────
// 하루 동안 섭취한 영양소를 권장 기준치와 비교해 점수(0~100)와 조언을 만든다.
//  - balance(균형형: 칼로리/탄/단/지): 부족해도, 과해도 감점
//  - limit(제한형: 당류/나트륨/콜레스테롤): 권장량을 넘을 때만 감점
const NUTRIENT_DEFS = [
  { key: "kcal",    label: "칼로리",     type: "balance", weight: 1.2 },
  { key: "carb",    label: "탄수화물",   type: "balance", weight: 1.0 },
  { key: "protein", label: "단백질",     type: "balance", weight: 1.0 },
  { key: "fat",     label: "지방",       type: "balance", weight: 0.8 },
  { key: "sugar",   label: "당류",       type: "limit",   weight: 1.0 },
  { key: "na",      label: "나트륨",     type: "limit",   weight: 1.0 },
  { key: "chol",    label: "콜레스테롤", type: "limit",   weight: 0.8 },
];

const ADVICE_TEXT = {
  kcal:    { low: "총 섭취 열량이 권장량보다 부족해요. 균형 잡힌 한 끼를 더 챙겨보세요.",      high: "총 섭취 열량이 권장량을 넘었어요. 다음 끼니의 양을 조절해보세요." },
  carb:    { low: "탄수화물이 부족해요. 현미밥이나 통곡물로 보충해보세요.",                    high: "탄수화물을 다소 많이 드셨어요. 정제 탄수화물을 줄여보세요." },
  protein: { low: "단백질이 부족해요. 닭가슴살·계란·두부 등으로 보충해보세요.",               high: "단백질이 권장량을 넘었어요. 신장에 부담이 없도록 조절해보세요." },
  fat:     { low: "지방이 부족해요. 견과류·올리브유 등 건강한 지방을 더해보세요.",            high: "지방을 다소 많이 드셨어요. 튀김·기름진 음식을 줄여보세요." },
  sugar:   { high: "당류를 권장량보다 많이 드셨어요. 단 음료와 디저트를 줄여보세요." },
  na:      { high: "나트륨 섭취가 많아요. 국물·가공식품·짠 음식을 줄여보세요." },
  chol:    { high: "콜레스테롤 섭취가 많아요. 기름진 육류·내장류를 조절해보세요." },
};

function analyzeDailyNutrition(sums, targets) {
  const hasData = (sums.kcal || 0) > 0;

  const issues = [];   // { key, label, kind: "low" | "high", severity, penalty }
  let weightSum = 0;
  let penaltySum = 0;
  let maxPenalty = 0;  // 가장 심각한 단일 영양소 감점

  NUTRIENT_DEFS.forEach((def) => {
    const target = targets[def.key];
    if (!target) return;
    const current = sums[def.key] || 0;
    const ratio = current / target;
    let penalty = 0;
    let kind = null;

    if (def.type === "balance") {
      // 권장량의 85~115% 구간은 이상적, 벗어나면 비례 감점
      if (ratio < 0.85) {
        kind = "low";
        penalty = Math.min(((0.85 - ratio) / 0.85) * 100, 100);
      } else if (ratio > 1.15) {
        kind = "high";
        penalty = Math.min(((ratio - 1.15) / 0.85) * 100, 100);
      }
    } else {
      // limit형: 권장량 이하는 무감점, 초과 시 50% 초과하면 만점 감점
      if (ratio > 1) {
        kind = "high";
        penalty = Math.min(((ratio - 1) / 0.5) * 100, 100);
      }
    }

    weightSum += def.weight;
    penaltySum += penalty * def.weight;
    if (penalty > maxPenalty) maxPenalty = penalty;

    if (penalty >= 12) {
      issues.push({ key: def.key, label: def.label, kind, severity: penalty });
    }
  });

  // 가중평균 감점만 쓰면 단일 영양소 과다 섭취가 다른 정상 영양소에 희석되어
  // 점수가 거의 안 떨어진다. 따라서 가장 심각한 단일 영양소(maxPenalty)가 클수록
  // 점수의 "상한"을 강제로 낮춘다 → 한 가지만 크게 어긋나도 좋은 점수가 불가능.
  const avgPenalty = weightSum > 0 ? penaltySum / weightSum : 0;
  let cap = 100;
  if (maxPenalty >= 90) cap = 35;        // 권장량 1.5배↑ 등 심각한 과다/부족
  else if (maxPenalty >= 70) cap = 50;
  else if (maxPenalty >= 50) cap = 65;
  else if (maxPenalty >= 30) cap = 80;
  const score = hasData
    ? Math.max(0, Math.round(Math.min(100 - avgPenalty, cap)))
    : 0;

  // 심각한 순으로 정렬
  issues.sort((a, b) => b.severity - a.severity);

  // ── 등급 ───────────────────────────────────────────────────────────────
  let statusLabel, scoreColor, headline;
  if (!hasData) {
    statusLabel = "기록 없음";
    scoreColor = "#94A3B8";
    headline = "아직 기록된 식단이 없어요.";
  } else if (score >= 85) {
    statusLabel = "훌륭한 균형";
    scoreColor = "#10B981";
    headline = "영양 성분이 아주 조화롭습니다.";
  } else if (score >= 70) {
    statusLabel = "양호한 균형";
    scoreColor = "#22C55E";
    headline = "전반적으로 균형 잡힌 식단이에요.";
  } else if (score >= 50) {
    statusLabel = "보완 필요";
    scoreColor = "#F59E0B";
    headline = "영양 균형에 약간의 보완이 필요해요.";
  } else {
    statusLabel = "불균형 주의";
    scoreColor = "#EF4444";
    headline = "영양 불균형이 감지되었어요.";
  }

  // ── 조언 문장 ───────────────────────────────────────────────────────────
  let advice;
  if (!hasData) {
    advice = "전체 기록 관리 페이지에서 오늘의 식단을 등록하면 섭취 영양소를 분석해 점수와 맞춤 조언을 알려드려요.";
  } else if (issues.length === 0) {
    advice = "현재까지 섭취한 영양소 비율이 권장 가이드라인에 매우 근접해 있어요. 남은 하루도 지금처럼 균형 잡힌 식사를 이어가 보세요.";
  } else {
    advice = issues
      .slice(0, 2)
      .map((i) => ADVICE_TEXT[i.key]?.[i.kind])
      .filter(Boolean)
      .join(" ");
  }

  // ── 태그 ────────────────────────────────────────────────────────────────
  const tags = [];
  if (hasData) {
    const ratioOf = (key) => (sums[key] || 0) / (targets[key] || 1);
    const issueKeys = new Set(issues.map((i) => i.key));

    // 칭찬 태그
    if (!issueKeys.has("protein") && ratioOf("protein") >= 0.85) {
      tags.push({ text: "#단백질_충분", tone: "good" });
    }
    if (ratioOf("sugar") <= 0.7) tags.push({ text: "#저당_식단", tone: "good" });
    if (ratioOf("na") <= 0.7)    tags.push({ text: "#저염_식단", tone: "good" });

    // 주의 태그 (문제 위주)
    const WARN_TAG = {
      sugar:   "#당_주의",
      na:      "#나트륨_주의",
      chol:    "#콜레스테롤_주의",
      kcal:    "#열량_관리",
      carb:    "#탄수화물_관리",
      fat:     "#지방_관리",
      protein: "#단백질_부족",
    };
    issues.forEach((i) => {
      const text = WARN_TAG[i.key];
      if (text) tags.push({ text, tone: "warn" });
    });
  }

  return {
    hasData,
    score,
    statusLabel,
    scoreColor,
    headline,
    advice,
    tags: tags.slice(0, 3),
  };
}

// ── MealPage ──────────────────────────────────────────────────────────────
export default function MealPage() {
  const { user } = useAuth();

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null);

  const [meals, setMeals] = useState([]);
  // 사용자 목표 섭취 칼로리 (TargetModal에서 설정한 값)
  const [targetCal, setTargetCal] = useState(DEFAULT_TARGET_CAL);

  // 목표 섭취 칼로리 조회
  useEffect(() => {
    let cancelled = false;
    const userId = user?.userId ?? user?.id;
    (async () => {
      if (!userId) {
        if (!cancelled) setTargetCal(DEFAULT_TARGET_CAL);
        return;
      }
      try {
        const { data } = await userConfigApi.getUserConfig(userId);
        if (cancelled) return;
        const goal = Number(data?.targetDailyCaloriesIntake);
        setTargetCal(goal > 0 ? goal : DEFAULT_TARGET_CAL);
      } catch (err) {
        console.error("목표 칼로리 조회 실패:", err);
        if (!cancelled) setTargetCal(DEFAULT_TARGET_CAL);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.userId, user?.id]);

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
            mealApi.getMealItemsByMealId(m.mealId).then((r) => r.data || [])
          )
        );
        if (cancelled) return;

        const groupedByCategory = {};
        mealsData.forEach((m, idx) => {
          const cat = m.mealCategory;
          if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = {
              id: cat,
              label: MEAL_CATEGORY_LABEL[cat] || cat,
              time: (m.mealTime || "").slice(0, 5),
              image: m.mealPhoto || null,
              items: [],
            };
          }
          groupedByCategory[cat].items = groupedByCategory[cat].items.concat(
            itemsPerMeal[idx].map(mapItemToCardFormat)
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
  }, [user?.id, selectedDate]);

  // 합계 계산
  const sumKey = (key) =>
    meals.reduce(
      (acc, m) => acc + m.items.reduce((a, i) => a + (i[key] || 0), 0),
      0
    );
  const totalCal = sumKey("kcal");
  // 목표 섭취 칼로리에 맞춰 영양소 권장 기준치를 계산
  const nutritionTargets = computeNutritionTargets(targetCal);
  const remaining = Math.max(targetCal - totalCal, 0);
  const achievement = targetCal > 0 ? Math.round((totalCal / targetCal) * 100) : 0;

  const nutritionSummary = [
    { label: "탄수화물",    current: Math.round(sumKey("carb")),    target: nutritionTargets.carb,    unit: "g",  over: sumKey("carb")    > nutritionTargets.carb,    barClass: "bg-slate-400" },
    { label: "단백질",      current: Math.round(sumKey("protein")), target: nutritionTargets.protein, unit: "g",  over: sumKey("protein") > nutritionTargets.protein, barClass: "bg-cyan-500" },
    { label: "지방",        current: Math.round(sumKey("fat")),     target: nutritionTargets.fat,     unit: "g",  over: sumKey("fat")     > nutritionTargets.fat,     barClass: "bg-orange-400" },
    { label: "당류",        current: Math.round(sumKey("sugar")),   target: nutritionTargets.sugar,   unit: "g",  over: sumKey("sugar")   > nutritionTargets.sugar,   barClass: "bg-pink-400" },
    { label: "나트륨",      current: Math.round(sumKey("na")),      target: nutritionTargets.na,      unit: "mg", over: sumKey("na")      > nutritionTargets.na,      barClass: "bg-yellow-500" },
    { label: "콜레스테롤",  current: Math.round(sumKey("chol")),    target: nutritionTargets.chol,    unit: "mg", over: sumKey("chol")    > nutritionTargets.chol,    barClass: "bg-indigo-400" },
  ];

  // 오늘 섭취한 영양소를 분석해 점수·조언·태그를 계산
  const scoreTargets = { ...nutritionTargets, kcal: targetCal };
  const analysis = analyzeDailyNutrition(
    {
      kcal:    totalCal,
      carb:    sumKey("carb"),
      protein: sumKey("protein"),
      fat:     sumKey("fat"),
      sugar:   sumKey("sugar"),
      na:      sumKey("na"),
      chol:    sumKey("chol"),
    },
    scoreTargets,
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-4 sm:px-6 py-8">

          {/* ── 페이지 타이틀 ─────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
                  식단 기록 확인
                </h1>
                <p className="mb-8 text-sm text-gray-500">
                  지난 식단 기록을 분석한 결과입니다.
                </p>
              </div>

              {/* 날짜 선택 */}
              <div className="relative">
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute pointer-events-none opacity-0"
                />
                <button
                  type="button"
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:bg-[#F9FAFB]"
                >
                  {selectedDate}
                  <span className="ml-1 text-[10px] text-[#94A3B8]">▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 요약 카드 ──────────────────────────────────────────────── */}
          <div className="flex gap-5 mb-8 flex-wrap">

            {/* 칼로리 도넛 */}
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center min-w-[240px] flex-none">
              <div className="relative w-40 h-40 mb-4">
                <DonutChart value={totalCal} max={targetCal} size={160} strokeWidth={10} color="#111" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[36px] font-semibold text-[#040d1b]">
                    {totalCal.toLocaleString()}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-400 uppercase">
                    / {targetCal.toLocaleString()} kcal
                  </span>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                {[
                  { label: "잔여",   value: remaining,         color: "#171c1f" },
                  { label: "달성률", value: `${achievement}%`, color: "#004bca" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] font-medium text-slate-400 m-0">{s.label}</p>
                    <p className="text-[17px] font-semibold mt-0.5 mb-0" style={{ color: s.color }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 점수 카드 */}
            <div className="bg-white rounded-2xl p-6 flex-[1_1_320px] flex gap-7 items-stretch min-w-0 flex-wrap">
              <div className="flex flex-col items-start shrink-0">
                <div className="relative w-40 h-40">
                  <DonutChart value={analysis.score} max={100} size={160} strokeWidth={10} color={analysis.scoreColor} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-medium text-[#45474c]">오늘의 식단 점수</span>
                    <span className="text-[40px] font-semibold text-[#040d1b]">
                      {analysis.hasData ? analysis.score : "–"}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: analysis.scoreColor }}>
                      {analysis.statusLabel}
                    </span>
                  </div>
                </div>
                {analysis.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-auto pt-4">
                    {analysis.tags.map((tag) => (
                      <span
                        key={tag.text}
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${
                          tag.tone === "warn"
                            ? "bg-[#fef2f2] border-[#fecaca] text-red-700"
                            : "bg-[#ecfdf5] border-[#d1fae5] text-emerald-700"
                        }`}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-[1_1_280px] min-w-0 flex-col justify-center">
                <h3 className="text-lg font-medium text-[#040d1b] mt-0 mb-2.5">
                  {analysis.headline}
                </h3>
                <p className="text-[13px] font-medium text-[#45474c] leading-relaxed mt-0 mb-0">
                  {analysis.advice}
                </p>
              </div>
            </div>
          </div>

          {/* ── 식단 카드 (MealRecordCard 사용) ───────────────────────── */}
          <h2 className="text-xl font-medium text-[#040d1b] mt-0 mb-4">
            오늘의 식단 기록 확인
          </h2>
          {meals.length > 0 ? (
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
          ) : (
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
                기록된 식단이 없습니다
              </h3>
              <p className="text-center text-[13px] leading-relaxed text-[#64748B]">
                <span className="font-semibold text-[#475569]">전체 기록 관리</span> 페이지에서<br />
                오늘의 식단을 등록해보세요.
              </p>
            </div>
          )}

          {/* ── 영양 성분 분석 ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-7">
            <h3 className="text-xl font-medium text-[#040d1b] mt-0 mb-6">
              오늘의 영양 성분 분석
            </h3>
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
              {nutritionSummary.map((n) => (
                <div key={n.label} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-[#040d1b]">{n.label}</span>
                    <span className="text-[13px]">
                      <strong className="text-[#040d1b]">
                        {n.current.toLocaleString()}{n.unit}
                      </strong>
                      <span className="text-[#45474c]">
                        {" "}/ {n.target.toLocaleString()}{n.unit}
                      </span>
                    </span>
                  </div>
                  <ProgressBar current={n.current} target={n.target} over={n.over} barClass={n.barClass} />
                </div>
              ))}
            </div>
          </div>

          </div>
        </main>
      </div>

      <MealDetailModal
        isOpen={!!selectedMeal}
        mealData={buildMealData(selectedMeal)}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
}