import { useState, useRef } from "react";
import MealRecordCard from "../components/MealRecordCard";
import MealDetailModal from "../modals/MealDetailModal";

// ── 데이터 ─────────────────────────────────────────────────────────────────
// MealRecordCard가 기대하는 필드명: na (나트륨), chol (콜레스테롤)
const meals = [
  {
    id: "breakfast",
    label: "아침",
    time: "08:30",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop",
    items: [
      { name: "그릭 요거트와 블루베리", kcal: 245, carb: 18, protein: 12, fat: 8,  sugar: 4,  chol: 5,  na: 80  },
      { name: "아몬드 한 줌",           kcal: 160, carb: 6,  protein: 6,  fat: 14, sugar: 1,  chol: 0,  na: 0   },
    ],
  },
  {
    id: "lunch",
    label: "점심",
    time: "12:45",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    items: [
      { name: "연어 샐러드",      kcal: 480, carb: 12, protein: 34, fat: 28, sugar: 3, chol: 45, na: 60  },
      { name: "현미밥 반 공기",   kcal: 150, carb: 32, protein: 3,  fat: 1,  sugar: 0, chol: 0,  na: 10  },
    ],
  },
  {
    id: "dinner",
    label: "저녁",
    time: "19:15",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    items: [
      { name: "닭가슴살 구이",        kcal: 310, carb: 0,  protein: 42, fat: 12, sugar: 0, chol: 75, na: 120 },
      { name: "구운 고구마와 야채",   kcal: 220, carb: 45, protein: 4,  fat: 1,  sugar: 8, chol: 0,  na: 30  },
    ],
  },
  {
    id: "snack",
    label: "간식",
    time: "16:00",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop",
    items: [
      { name: "사과와 땅콩버터", kcal: 190, carb: 22, protein: 4,  fat: 11, sugar: 15, chol: 0,  na: 70 },
      { name: "단백질 쉐이크",   kcal: 120, carb: 3,  protein: 24, fat: 1,  sugar: 1,  chol: 15, na: 50 },
    ],
  },
];

const nutritionSummary = [
  { label: "탄수화물",    current: 125,  target: 260,  unit: "g",  over: false },
  { label: "단백질",     current: 65,   target: 120,  unit: "g",  over: false },
  { label: "지방",       current: 132,  target: 70,   unit: "g",  over: true  },
  { label: "당류",       current: 24,   target: 50,   unit: "g",  over: false },
  { label: "나트륨",     current: 1120, target: 2000, unit: "mg", over: false },
  { label: "콜레스테롤", current: 150,  target: 300,  unit: "mg", over: false },
];

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
function ProgressBar({ current, target, over }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="h-[6px] rounded-[3px] bg-[#ebeef0] overflow-hidden w-full">
      <div
        className={`h-full rounded-[3px] transition-[width] duration-[800ms] ease-in-out ${
          over ? "bg-[#bc2e16]" : "bg-[#111]"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── MealPage ──────────────────────────────────────────────────────────────
export default function MealPage() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null);

  const totalCal    = 1420;
  const targetCal   = 2100;
  const burned      = 350;
  const remaining   = targetCal - totalCal;
  const achievement = Math.round((totalCal / targetCal) * 100);

  return (
    <div
      className="min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto">
      <div className="flex pt-[55px]">
        <main className="flex-1 p-8">

          {/* ── 페이지 타이틀 ─────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h1 className="tmb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  오늘의 식단 기록 확인
                </h1>
                <p className="text-sm text-gray-400">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-white border border-[#e2e5e8] text-sm font-semibold text-[#414753] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  {selectedDate}
                  <span className="text-[10px] text-[#b0b8c1]">▼</span>
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
                  <span className="text-[36px] font-semibold text-[#040d1b]">1,420</span>
                  <span className="text-[12px] font-semibold text-slate-400 uppercase">
                    / 2,100 kcal
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
          <div className="flex gap-4 mb-9 flex-wrap">
            {meals.map((meal) => (
              <MealRecordCard
                key={meal.id}
                time={meal.time}
                label={meal.label}
                items={meal.items}
                image={meal.image}
                onClick={() => setSelectedMeal(meal)}
                className="min-w-[260px] flex-[1_1_260px] cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
              />
            ))}
          </div>

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
                  <ProgressBar current={n.current} target={n.target} over={n.over} />
                </div>
              ))}
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