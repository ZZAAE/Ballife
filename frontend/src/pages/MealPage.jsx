import { useState, useRef, useEffect } from "react";
import MealRecordCard from "../components/MealRecordCard";
import MealDetailModal from "../modals/MealDetailModal";
import mealApi from "../api/mealApi";
import { useAuth } from "../contexts/AuthContext";

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};
const MEAL_CATEGORY_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

// 영양소 권장 기준치 (디스플레이용)
const NUTRITION_TARGETS = {
  carb: 260,
  protein: 120,
  fat: 70,
  sugar: 50,
  na: 2000,
  chol: 300,
};

const mapItemToCardFormat = (item) => ({
  name: item.foodName,
  kcal: item.calorie ?? 0,
  carb: item.carbohydrate ?? 0,
  protein: item.protein ?? 0,
  fat: item.saturatedFat ?? 0,
  sugar: item.sugar ?? 0,
  chol: item.cholesterol ?? 0,
  na: item.sodium ?? 0,
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
      image: meal.image,
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

// ── MealPage ──────────────────────────────────────────────────────────────
export default function MealPage() {
  const { user } = useAuth();

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null);

  const [meals, setMeals] = useState([]);

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
  const targetCal = 2100;
  const burned = 0;
  const remaining = Math.max(targetCal - totalCal, 0);
  const achievement = targetCal > 0 ? Math.round((totalCal / targetCal) * 100) : 0;

  const nutritionSummary = [
    { label: "탄수화물",    current: Math.round(sumKey("carb")),    target: NUTRITION_TARGETS.carb,    unit: "g",  over: sumKey("carb")    > NUTRITION_TARGETS.carb },
    { label: "단백질",      current: Math.round(sumKey("protein")), target: NUTRITION_TARGETS.protein, unit: "g",  over: sumKey("protein") > NUTRITION_TARGETS.protein },
    { label: "지방",        current: Math.round(sumKey("fat")),     target: NUTRITION_TARGETS.fat,     unit: "g",  over: sumKey("fat")     > NUTRITION_TARGETS.fat },
    { label: "당류",        current: Math.round(sumKey("sugar")),   target: NUTRITION_TARGETS.sugar,   unit: "g",  over: sumKey("sugar")   > NUTRITION_TARGETS.sugar },
    { label: "나트륨",      current: Math.round(sumKey("na")),      target: NUTRITION_TARGETS.na,      unit: "mg", over: sumKey("na")      > NUTRITION_TARGETS.na },
    { label: "콜레스테롤",  current: Math.round(sumKey("chol")),    target: NUTRITION_TARGETS.chol,    unit: "mg", over: sumKey("chol")    > NUTRITION_TARGETS.chol },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-6 py-8">

          {/* ── 페이지 타이틀 ─────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
                  오늘의 식단 기록 확인
                </h1>
                <p className="mb-8 text-sm text-gray-500">
                  지난 신체 변화를 분석한 결과입니다.
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
                  { label: "소모",   value: burned,            color: "#171c1f" },
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
            <div className="bg-white rounded-2xl p-7 flex-[1_1_320px] flex gap-7 items-center min-w-0 flex-wrap">
              <div className="relative w-40 h-40 shrink-0">
                <DonutChart value={85} max={100} size={160} strokeWidth={10} color="#10B981" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-medium text-[#45474c]">오늘의 식단 점수</span>
                  <span className="text-[40px] font-semibold text-[#040d1b]">85</span>
                  <span className="text-[13px] font-medium text-emerald-500">훌륭한 균형</span>
                </div>
              </div>
              <div className="flex-[1_1_280px] min-w-0">
                <h3 className="text-lg font-medium text-[#040d1b] mt-0 mb-2.5">
                  영양 성분이 아주 조화롭습니다.
                </h3>
                <p className="text-[13px] font-medium text-[#45474c] leading-relaxed mt-0 mb-3.5">
                  현재까지 섭취한 영양소 비율이 권장 가이드라인에 매우 근접해
                  있습니다. 특히 단백질과 지방의 비율이 안정적이며, 남은 하루
                  동안 식이섬유 보충에만 신경 쓰시면 완벽한 하루가 될 것 같습니다.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {["#단백질_충분", "#저당_식단"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-xs font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 식단 카드 (MealRecordCard 사용) ───────────────────────── */}
          <h2 className="text-xl font-medium text-[#040d1b] mt-0 mb-4">
            오늘의 식단 기록 확인
          </h2>
          {meals.length > 0 ? (
            <div className="flex gap-4 mb-9 flex-wrap">
              {meals.map((meal) => (
                <MealRecordCard
                  key={meal.id}
                  time={meal.time}
                  label={meal.label}
                  items={meal.items}
                  image={meal.image}
                  onClick={() => setSelectedMeal(meal)}
                  className="w-[300px] shrink-0 cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
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
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
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