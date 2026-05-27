import { useRef, useState, useEffect } from "react";
import mealApi from "../../api/mealApi";
import { useAuth } from "../../contexts/AuthContext";

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};
const MEAL_CATEGORY_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

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

// MealDetailModal용 데이터 변환 (MealPage와 동일)
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
        carbs: item.carb,
        protein: item.protein,
        fat: item.fat,
        sugar: item.sugar,
        cholesterol: item.chol,
        sodium: item.na,
      },
      image: meal.image,
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
  Cell,
  LabelList,
} from "recharts";
import {
  Droplets,
  Activity,
  Scale,
  Utensils,
  Pill,
  Dumbbell,
  Heart,
  Menu,
  ChevronRight,
  Check,
  TrendingDown,
  Bot,
  Clock,
  Sun,
  Coffee,
  Moon,
  Apple,
  TrendingUp,
} from "lucide-react";

import SummaryCard from "../../components/SummaryCard";
import MealRecordCard from "../../components/MealRecordCard";
import MealRegisterModal from "../../modals/MealRegisterModal";
import DailyTimelineModal from "../../modals/DailyTimelineModal";
import MealDetailModal from "../../modals/MealDetailModal";

const bloodSugarData = [
  { time: "아침", fasting: 95, postMeal: 120 },
  { time: "점심", fasting: 88, postMeal: 135 },
  { time: "저녁", fasting: 100, postMeal: 147 },
];

const bloodPressureData = [
  { time: "아침", systolic: 185, diastolic: 130 },
  { time: "점심", systolic: 195, diastolic: 140 },
  { time: "저녁", systolic: 190, diastolic: 135 },
];

const MacroBadge = ({ label, value, unit = "g" }) => (
  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-50 rounded px-1.5 py-0.5">
    <span className="text-slate-500 font-medium">{label}</span> {value}
    {unit}
  </span>
);

export default function RecordSummary() {
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
              label: MEAL_CATEGORY_LABEL[cat] || cat,
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
  }, [user?.id, selectedDate]);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-noto-sans max-w-[1920px] mx-auto">
      <div className="flex pt-[55px]">
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
                하루 기록
              </h1>
              <p className="mb-8 text-sm text-gray-500">
                하루의 신체 변화를 분석한 결과입니다.
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
              labelName="식단"
              description="오늘의 섭취 kcal"
              record="1,450"
              unit="/ 2,100 kcal"
              bottomLabel="남은 섭취 칼로리 650kcal"
              bottomeLabelColor="text-red-600"
            />

            {/* 운동 Card */}
            <SummaryCard
              Icon={Dumbbell}
              colorText="text-orange-600"
              colorBackgorund="bg-orange-50"
              labelName="운동"
              description="오늘의 활동 시간"
              record="45"
              unit="분"
              bottomLabel="총 소모칼로리 500 kcal"
              //BottomIcon = {TrendingUp}
              bottomeLabelColor="text-orange-600"
            />

            {/* 체중 Card */}
            <SummaryCard
              Icon={Scale}
              colorText="text-yellow-600"
              colorBackgorund="bg-yellow-50"
              labelName="체중"
              description="현재 체중 및 추세"
              record="72.4"
              unit="kg"
              bottomLabel="지난주 대비 -0.8kg"
              BottomIcon={TrendingDown}
              bottomeLabelColor="text-emerald-600"
            />

            {/* 수분 Card */}
            <SummaryCard
              Icon={Droplets}
              colorText="text-sky-600"
              colorBackgorund="bg-sky-50"
              labelName="수분"
              description="오늘의 수분 섭취량"
              record="1.6"
              unit="/ 2.5 L"
              bottomLabel="남은 수분 섭취량 0.9L"
              bottomeLabelColor="text-sky-600"
            />
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* 혈당 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 혈당 변화
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    식전 (Fasting)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    식후 (Post-meal)
                  </span>
                </div>
              </div>
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
            </div>

            {/* 혈압 Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 혈압 변화
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    수축기 (Systolic)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    이완기 (Diastolic)
                  </span>
                </div>
              </div>
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
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    stroke="#f87171"
                    fill="#fee2e2"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#818cf8"
                    fill="#e0e7ff"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 복용 일정 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-900">
                  오늘의 복용 일정
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                  2025년 5월 22일
                </span>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                알림 설정 변경 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* 아침약 */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Sun size={13} /> 아침 (08:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  아침약
                </p>
                <p className="text-xs text-gray-400 mb-3">식후 30분 복용</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={14} /> 복용 완료
                </div>
              </div>

              {/* 점심약 */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Coffee size={13} /> 점심 (13:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  점심약
                </p>
                <p className="text-xs text-gray-400 mb-3">식사 중 복용</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={14} /> 복용 완료
                </div>
              </div>

              {/* 저녁약 */}
              <div className="border-2 border-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-3">
                  <Moon size={13} /> 저녁 (19:00)
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-0.5">
                  저녁약
                </p>
                <p className="text-xs text-gray-400 mb-3">식후 30분 복용</p>
                <button className="w-full bg-gray-900 text-white text-xs font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  복용 확인
                </button>
              </div>
            </div>
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
                기록된 식단이 없습니다
              </h3>
              <p className="text-center text-[13px] leading-relaxed text-[#64748B]">
                <span className="font-semibold text-[#475569]">전체 기록 관리</span> 페이지에서<br />
                오늘의 식단을 등록해보세요.
              </p>
            </div>
          ) : (
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
