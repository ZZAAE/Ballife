import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import mealApi from "../../api/mealApi";
import userConfigApi from "../../api/userConfigApi";
import { useAuth } from "../../context/AuthContext";
import MealRegisterModal from "../../components/modals/MealRegisterModal";

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
function computeNutritionTargets(targetCal) {
  const cal = targetCal > 0 ? targetCal : DEFAULT_TARGET_CAL;
  return {
    carb: Math.round((cal * 0.57) / 4),
    protein: Math.round((cal * 0.15) / 4),
    fat: Math.round((cal * 0.25) / 9),
    sugar: Math.round((cal * 0.1) / 4),
    na: 2000,
    chol: 300,
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
  image: item.mealPhoto ?? null,
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
        carbs: item.carb,
        protein: item.protein,
        fat: item.fat,
        sugar: item.sugar,
        cholesterol: item.chol,
        sodium: item.na,
      },
      image: item.image || meal.image,
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

// ── DonutChart (react-native-svg) ──────────────────────────────────────────
function DonutChart({ value, max, size = 160, strokeWidth = 10, color = "#000" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value / max, 1));
  const center = size / 2;

  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: "-90deg" }] }}
    >
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#E5E9EB"
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </Svg>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────
function ProgressBar({ current, target, over, barColor = "#111" }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <View className="h-[6px] rounded-[3px] bg-[#ebeef0] overflow-hidden w-full">
      <View
        className="h-full rounded-[3px]"
        style={{ width: `${pct}%`, backgroundColor: over ? "#bc2e16" : barColor }}
      />
    </View>
  );
}

const NUTRIENT_DEFS = [
  { key: "kcal", label: "칼로리", type: "balance", weight: 1.2 },
  { key: "carb", label: "탄수화물", type: "balance", weight: 1.0 },
  { key: "protein", label: "단백질", type: "balance", weight: 1.0 },
  { key: "fat", label: "지방", type: "balance", weight: 0.8 },
  { key: "sugar", label: "당류", type: "limit", weight: 1.0 },
  { key: "na", label: "나트륨", type: "limit", weight: 1.0 },
  { key: "chol", label: "콜레스테롤", type: "limit", weight: 0.8 },
];

const ADVICE_TEXT = {
  kcal: { low: "총 섭취 열량이 권장량보다 부족해요. 균형 잡힌 한 끼를 더 챙겨보세요.", high: "총 섭취 열량이 권장량을 넘었어요. 다음 끼니의 양을 조절해보세요." },
  carb: { low: "탄수화물이 부족해요. 현미밥이나 통곡물로 보충해보세요.", high: "탄수화물을 다소 많이 드셨어요. 정제 탄수화물을 줄여보세요." },
  protein: { low: "단백질이 부족해요. 닭가슴살·계란·두부 등으로 보충해보세요.", high: "단백질이 권장량을 넘었어요. 신장에 부담이 없도록 조절해보세요." },
  fat: { low: "지방이 부족해요. 견과류·올리브유 등 건강한 지방을 더해보세요.", high: "지방을 다소 많이 드셨어요. 튀김·기름진 음식을 줄여보세요." },
  sugar: { high: "당류를 권장량보다 많이 드셨어요. 단 음료와 디저트를 줄여보세요." },
  na: { high: "나트륨 섭취가 많아요. 국물·가공식품·짠 음식을 줄여보세요." },
  chol: { high: "콜레스테롤 섭취가 많아요. 기름진 육류·내장류를 조절해보세요." },
};

function analyzeDailyNutrition(sums, targets) {
  const hasData = (sums.kcal || 0) > 0;

  const issues = [];
  let weightSum = 0;
  let penaltySum = 0;
  let maxPenalty = 0;

  NUTRIENT_DEFS.forEach((def) => {
    const target = targets[def.key];
    if (!target) return;
    const current = sums[def.key] || 0;
    const ratio = current / target;
    let penalty = 0;
    let kind = null;

    if (def.type === "balance") {
      if (ratio < 0.85) {
        kind = "low";
        penalty = Math.min(((0.85 - ratio) / 0.85) * 100, 100);
      } else if (ratio > 1.15) {
        kind = "high";
        penalty = Math.min(((ratio - 1.15) / 0.85) * 100, 100);
      }
    } else {
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

  const avgPenalty = weightSum > 0 ? penaltySum / weightSum : 0;
  let cap = 100;
  if (maxPenalty >= 90) cap = 35;
  else if (maxPenalty >= 70) cap = 50;
  else if (maxPenalty >= 50) cap = 65;
  else if (maxPenalty >= 30) cap = 80;
  const score = hasData
    ? Math.max(0, Math.round(Math.min(100 - avgPenalty, cap)))
    : 0;

  issues.sort((a, b) => b.severity - a.severity);

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

  const tags = [];
  if (hasData) {
    const ratioOf = (key) => (sums[key] || 0) / (targets[key] || 1);
    const issueKeys = new Set(issues.map((i) => i.key));

    if (!issueKeys.has("protein") && ratioOf("protein") >= 0.85) {
      tags.push({ text: "#단백질_충분", tone: "good" });
    }
    if (ratioOf("sugar") <= 0.7) tags.push({ text: "#저당_식단", tone: "good" });
    if (ratioOf("na") <= 0.7) tags.push({ text: "#저염_식단", tone: "good" });

    const WARN_TAG = {
      sugar: "#당_주의",
      na: "#나트륨_주의",
      chol: "#콜레스테롤_주의",
      kcal: "#열량_관리",
      carb: "#탄수화물_관리",
      fat: "#지방_관리",
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

// ── 식단 카드 (MealRecordCard 대체 — 인라인) ───────────────────────────────
function MealRecordCard({ time, label, items, image, onPress }) {
  const totalKcal = items.reduce((s, i) => s + (i.kcal || 0), 0);
  return (
    <Pressable
      onPress={onPress}
      className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[15px] font-bold text-[#0F172A]">{label}</Text>
        <Text className="text-[12px] text-[#94A3B8]">{time}</Text>
      </View>
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-full h-[120px] rounded-xl mb-3"
          resizeMode="cover"
        />
      ) : null}
      <View className="gap-1">
        {items.slice(0, 4).map((it, idx) => (
          <View key={idx} className="flex-row justify-between">
            <Text className="text-[13px] text-[#475569]" numberOfLines={1}>
              {it.name}
            </Text>
            <Text className="text-[13px] text-[#94A3B8]">{it.kcal}kcal</Text>
          </View>
        ))}
      </View>
      <View className="mt-3 pt-2 border-t border-[#F1F5F9] flex-row justify-between">
        <Text className="text-[12px] text-[#64748B]">합계</Text>
        <Text className="text-[13px] font-bold text-[#0F172A]">
          {totalKcal.toLocaleString()}kcal
        </Text>
      </View>
    </Pressable>
  );
}

// ── MealDetailModal (인라인 RN Modal) ──────────────────────────────────────
function MealDetailModal({ mealData, onClose }) {
  if (!mealData) return null;
  const NUT = [
    { key: "carbs", label: "탄수화물", unit: "g" },
    { key: "protein", label: "단백질", unit: "g" },
    { key: "fat", label: "지방", unit: "g" },
    { key: "sugar", label: "당류", unit: "g" },
    { key: "cholesterol", label: "콜레스테롤", unit: "mg" },
    { key: "sodium", label: "나트륨", unit: "mg" },
  ];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-[20px] max-h-[80%]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <Text className="text-[18px] font-bold text-[#0F172A]">
              {mealData.mealType}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text className="text-[16px] text-[#64748B]">닫기</Text>
            </Pressable>
          </View>
          <ScrollView className="px-6 py-4">
            <View className="flex-row justify-between mb-4">
              <Text className="text-[14px] text-[#64748B]">총 칼로리</Text>
              <Text className="text-[16px] font-bold text-[#0F172A]">
                {mealData.totalCalories.toLocaleString()} kcal
              </Text>
            </View>
            {mealData.foods.map((f) => (
              <View
                key={f.id}
                className="mb-3 rounded-xl border border-[#E5E7EB] p-3"
              >
                <View className="flex-row justify-between">
                  <Text className="text-[14px] font-semibold text-[#0F172A]">
                    {f.name}
                  </Text>
                  <Text className="text-[13px] text-[#64748B]">
                    {f.calories}kcal
                  </Text>
                </View>
              </View>
            ))}
            <View className="mt-2 rounded-xl bg-[#F8FAFC] p-4">
              <Text className="text-[14px] font-bold text-[#0F172A] mb-3">
                영양 성분 합계
              </Text>
              {NUT.map((n) => (
                <View key={n.key} className="flex-row justify-between mb-1.5">
                  <Text className="text-[13px] text-[#64748B]">{n.label}</Text>
                  <Text className="text-[13px] font-semibold text-[#0F172A]">
                    {Math.round(mealData.totalNutrition[n.key] || 0)}
                    {n.unit}
                  </Text>
                </View>
              ))}
            </View>
            <View className="h-8" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const todayKey = () => new Date().toISOString().split("T")[0];

// ── MealPage ──────────────────────────────────────────────────────────────
export default function MealPage() {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(todayKey());

  // 식단 등록/수정 모달 (allRecord.jsx 패턴)
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [editMeal, setEditMeal] = useState(null); // null = 신규
  const [mealModalCategory, setMealModalCategory] = useState("BREAKFAST");

  const openAddMeal = () => {
    setEditMeal(null);
    setMealModalCategory("BREAKFAST");
    setMealModalOpen(true);
  };

  // 기존 식단 카드 → 수정 모드. rawItems 는 fetchMeals 가 보존한 원본 항목 사용.
  const openEditMeal = (meal) => {
    setEditMeal({
      mealId: meal.mealId,
      category: meal.category,
      image: meal.image,
      rawItems: meal.rawItems || [],
    });
    setMealModalCategory(meal.category);
    setMealModalOpen(true);
  };

  const closeMealModal = () => {
    setMealModalOpen(false);
    setEditMeal(null);
  };

  const [meals, setMeals] = useState([]);
  const [targetCal, setTargetCal] = useState(DEFAULT_TARGET_CAL);

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

  const fetchMeals = useCallback(async () => {
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

      const groupedByCategory = {};
        mealsData.forEach((m, idx) => {
          const cat = m.mealCategory;
          if (!groupedByCategory[cat]) {
            groupedByCategory[cat] = {
              id: cat,
              category: cat, // 백엔드 원본 카테고리 (수정 모달 전달용)
              mealId: m.mealId, // 수정 모달 전달용
              label: MEAL_CATEGORY_LABEL[cat] || cat,
              time: (m.mealTime || "").slice(0, 5),
              image: m.mealPhoto || null,
              items: [],
              rawItems: [], // MealRegisterModal 수정 모드용 원본 항목
            };
          }
          groupedByCategory[cat].items = groupedByCategory[cat].items.concat(
            itemsPerMeal[idx].map(mapItemToCardFormat)
          );
          groupedByCategory[cat].rawItems =
            groupedByCategory[cat].rawItems.concat(itemsPerMeal[idx]);
        });

      const ordered = MEAL_CATEGORY_ORDER.map((c) => groupedByCategory[c]).filter(
        Boolean
      );
      setMeals(ordered);
    } catch (err) {
      console.error("식단 조회 실패:", err);
      setMeals([]);
    }
  }, [user?.id, selectedDate]);

  useEffect(() => {
    void fetchMeals();
  }, [fetchMeals]);

  const sumKey = (key) =>
    meals.reduce(
      (acc, m) => acc + m.items.reduce((a, i) => a + (i[key] || 0), 0),
      0
    );
  const totalCal = sumKey("kcal");
  const nutritionTargets = computeNutritionTargets(targetCal);
  const remaining = Math.max(targetCal - totalCal, 0);
  const achievement = targetCal > 0 ? Math.round((totalCal / targetCal) * 100) : 0;

  const nutritionSummary = [
    { label: "탄수화물", current: Math.round(sumKey("carb")), target: nutritionTargets.carb, unit: "g", over: sumKey("carb") > nutritionTargets.carb, barColor: "#94A3B8" },
    { label: "단백질", current: Math.round(sumKey("protein")), target: nutritionTargets.protein, unit: "g", over: sumKey("protein") > nutritionTargets.protein, barColor: "#06B6D4" },
    { label: "지방", current: Math.round(sumKey("fat")), target: nutritionTargets.fat, unit: "g", over: sumKey("fat") > nutritionTargets.fat, barColor: "#FB923C" },
    { label: "당류", current: Math.round(sumKey("sugar")), target: nutritionTargets.sugar, unit: "g", over: sumKey("sugar") > nutritionTargets.sugar, barColor: "#F472B6" },
    { label: "나트륨", current: Math.round(sumKey("na")), target: nutritionTargets.na, unit: "mg", over: sumKey("na") > nutritionTargets.na, barColor: "#EAB308" },
    { label: "콜레스테롤", current: Math.round(sumKey("chol")), target: nutritionTargets.chol, unit: "mg", over: sumKey("chol") > nutritionTargets.chol, barColor: "#818CF8" },
  ];

  const scoreTargets = { ...nutritionTargets, kcal: targetCal };
  const analysis = analyzeDailyNutrition(
    {
      kcal: totalCal,
      carb: sumKey("carb"),
      protein: sumKey("protein"),
      fat: sumKey("fat"),
      sugar: sumKey("sugar"),
      na: sumKey("na"),
      chol: sumKey("chol"),
    },
    scoreTargets
  );

  // 날짜 이동 (웹의 date input 대체)
  const shiftDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="px-4 sm:px-6 py-8">
          {/* ── 페이지 타이틀 ── */}
          <View className="mb-8">
            <Text className="text-[26px] font-extrabold text-[#0F172A]">
              식단 기록 확인
            </Text>
            <Text className="mt-1 mb-4 text-[14px] text-[#64748B]">
              지난 식단 기록을 분석한 결과입니다.
            </Text>

            {/* 날짜 선택 (이전/다음 버튼) */}
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => shiftDate(-1)}
                className="h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white"
              >
                <Text className="text-[16px] text-[#64748B]">{"<"}</Text>
              </Pressable>
              <View className="flex-1 items-center rounded-[10px] border border-[#E5E7EB] bg-white py-2.5">
                <Text className="text-[14px] font-semibold text-[#64748B]">
                  {selectedDate}
                </Text>
              </View>
              <Pressable
                onPress={() => shiftDate(1)}
                className="h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white"
              >
                <Text className="text-[16px] text-[#64748B]">{">"}</Text>
              </Pressable>
            </View>
          </View>

          {/* ── 요약 카드 ── */}
          <View className="gap-5 mb-8">
            {/* 칼로리 도넛 */}
            <View className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 items-center">
              <View className="relative w-40 h-40 mb-4 items-center justify-center">
                <DonutChart value={totalCal} max={targetCal} size={160} strokeWidth={10} color="#111" />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-[36px] font-semibold text-[#040d1b]">
                    {totalCal.toLocaleString()}
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#64748B]">
                    / {targetCal.toLocaleString()} kcal
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-6">
                {[
                  { label: "잔여", value: `${remaining}`, color: "#171c1f" },
                  { label: "달성률", value: `${achievement}%`, color: "#004bca" },
                ].map((s) => (
                  <View key={s.label} className="items-center">
                    <Text className="text-[12px] font-medium text-[#64748B]">
                      {s.label}
                    </Text>
                    <Text className="text-[17px] font-semibold mt-0.5" style={{ color: s.color }}>
                      {s.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 점수 카드 */}
            <View className="bg-white rounded-[18px] border border-[#E5E7EB] p-6 gap-5">
              <View className="items-center">
                <View className="relative w-40 h-40 items-center justify-center">
                  <DonutChart value={analysis.score} max={100} size={160} strokeWidth={10} color={analysis.scoreColor} />
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-[12px] font-medium text-[#45474c]">
                      오늘의 식단 점수
                    </Text>
                    <Text className="text-[40px] font-semibold text-[#040d1b]">
                      {analysis.hasData ? analysis.score : "–"}
                    </Text>
                    <Text className="text-[13px] font-medium" style={{ color: analysis.scoreColor }}>
                      {analysis.statusLabel}
                    </Text>
                  </View>
                </View>
                {analysis.tags.length > 0 && (
                  <View className="flex-row gap-2 flex-wrap mt-4 justify-center">
                    {analysis.tags.map((tag) => (
                      <View
                        key={tag.text}
                        className={`px-3 py-1 rounded-full border ${
                          tag.tone === "warn"
                            ? "bg-[#fef2f2] border-[#fecaca]"
                            : "bg-[#ecfdf5] border-[#d1fae5]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-medium ${
                            tag.tone === "warn" ? "text-red-700" : "text-emerald-700"
                          }`}
                        >
                          {tag.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <View>
                <Text className="text-[18px] font-medium text-[#040d1b] mb-2">
                  {analysis.headline}
                </Text>
                <Text className="text-[13px] font-medium text-[#45474c] leading-relaxed">
                  {analysis.advice}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 식단 카드 ── */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[20px] font-medium text-[#040d1b]">
              오늘의 식단 기록 확인
            </Text>
            <Pressable
              onPress={openAddMeal}
              className="flex-row items-center gap-1 rounded-full bg-[#1A1F2E] px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-white">+ 식단 추가</Text>
            </Pressable>
          </View>
          {meals.length > 0 ? (
            <View className="gap-4 mb-9">
              {meals.map((meal) => (
                <MealRecordCard
                  key={meal.id}
                  time={meal.time}
                  label={meal.label}
                  items={meal.items}
                  image={meal.image}
                  onPress={() => openEditMeal(meal)}
                />
              ))}
            </View>
          ) : (
            <Pressable
              onPress={openAddMeal}
              className="mb-9 items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-16 px-6"
            >
              <View
                className="mb-5 h-[64px] w-[64px] items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#F1F5F9" }}
              >
                <Text style={{ fontSize: 28, color: "#94A3B8" }}>🍽️</Text>
              </View>
              <Text className="mb-2 text-[16px] font-semibold text-[#0F172A]">
                기록된 식단이 없습니다
              </Text>
              <Text className="text-center text-[13px] leading-relaxed text-[#64748B]">
                + 식단 추가를 눌러{"\n"}오늘의 식단을 등록해보세요.
              </Text>
            </Pressable>
          )}

          {/* ── 영양 성분 분석 ── */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-4">
            <Text className="text-[20px] font-medium text-[#040d1b] mb-6">
              오늘의 영양 성분 분석
            </Text>
            <View className="gap-y-6">
              {nutritionSummary.map((n) => (
                <View key={n.label} className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[13px] font-medium text-[#040d1b]">
                      {n.label}
                    </Text>
                    <Text className="text-[13px]">
                      <Text className="text-[#040d1b] font-bold">
                        {n.current.toLocaleString()}
                        {n.unit}
                      </Text>
                      <Text className="text-[#45474c]">
                        {" "}/ {n.target.toLocaleString()}
                        {n.unit}
                      </Text>
                    </Text>
                  </View>
                  <ProgressBar current={n.current} target={n.target} over={n.over} barColor={n.barColor} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <MealRegisterModal
        visible={mealModalOpen}
        onClose={closeMealModal}
        onSaved={() => fetchMeals()}
        date={selectedDate}
        category={mealModalCategory}
        meal={editMeal}
      />
    </SafeAreaView>
  );
}
