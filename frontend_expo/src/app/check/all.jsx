import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import mealApi from "../../api/mealApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userConfigApi from "../../api/userConfigApi";
import { getExercisesInRange } from "../../api/exerciseApi";
import { useAuth } from "../../context/AuthContext";

// 백엔드 BioValueRecord.category 값 (web: constants/bioCategory)
const BIO_CATEGORY = {
  BLOOD_SUGAR: "BloodSugar",
  BLOOD_PRESSURE: "BloodPressure",
  WEIGHT: "Weight",
  WATER_INTAKE: "WaterIntake",
};

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};
const MEAL_CATEGORY_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const ML_PER_CUP = 200;

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

const formatNumber = (n) => (n == null ? "—" : Number(n).toLocaleString());

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

// 요약 카드 (web SummaryCard 대체)
function SummaryCard({ labelName, description, record, unit, bottomLabel }) {
  return (
    <View className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <Text className="text-[13px] font-semibold text-[#0F172A]">{labelName}</Text>
      <Text className="mt-1 text-[12px] text-[#64748B]">{description}</Text>
      <View className="mt-3 flex-row items-end gap-1">
        <Text className="text-[28px] font-extrabold leading-none text-[#0F172A]">
          {record}
        </Text>
        <Text className="pb-1 text-[12px] text-[#64748B]">{unit}</Text>
      </View>
      <Text className="mt-2 text-[12px] font-medium text-[#64748B]">{bottomLabel}</Text>
    </View>
  );
}

// 끼니 카드 (web MealRecordCard 대체)
function MealRecordCard({ time, label, items }) {
  const totalKcal = (items || []).reduce((s, i) => s + (i.kcal || 0), 0);
  return (
    <View className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-[14px] font-bold text-[#0F172A]">{label}</Text>
        {time ? <Text className="text-[12px] text-[#64748B]">{time}</Text> : null}
      </View>
      <Text className="mt-1 text-[12px] font-semibold text-[#64748B]">
        {formatNumber(Math.round(totalKcal))} kcal
      </Text>
      <View className="mt-2 gap-1">
        {(items || []).map((it, idx) => (
          <View key={idx} className="flex-row items-center justify-between">
            <Text className="flex-1 text-[12px] text-[#0F172A]" numberOfLines={1}>
              {it.name}
            </Text>
            <Text className="text-[12px] text-[#64748B]">
              {formatNumber(Math.round(it.kcal || 0))} kcal
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// 간단한 막대 차트 (recharts BarChart 대체 — react-native-svg 없이 View 바)
function SimpleBars({ data, keys, max }) {
  return (
    <View className="gap-3">
      {data.map((row) => (
        <View key={row.time}>
          <Text className="mb-1 text-[12px] font-semibold text-[#0F172A]">{row.time}</Text>
          <View className="gap-1.5">
            {keys.map((k) => {
              const v = row[k.key];
              const pct = v == null ? 0 : Math.min(100, (v / max) * 100);
              return (
                <View key={k.key} className="flex-row items-center gap-2">
                  <Text className="w-[64px] text-[11px] text-[#64748B]">{k.label}</Text>
                  <View className="h-3 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                    <View
                      style={{ width: `${pct}%`, backgroundColor: k.color }}
                      className="h-full rounded-full"
                    />
                  </View>
                  <Text className="w-[40px] text-right text-[11px] font-semibold text-[#0F172A]">
                    {v == null ? "—" : v}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

export default function RecordSummary() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => toDateStr(new Date()));

  const [meals, setMeals] = useState([]);

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
  // 복약 일정은 web에서 localStorage 기반 → RN 미지원, 빈 상태 유지
  const [medSchedules] = useState([]);

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
    ]).then(([mealRes, exRes, wtRes, waterRes, bsRes, bpRes, cfgRes]) => {
      if (cancelled) return;

      const intakeKcal =
        mealRes.status === "fulfilled" && Array.isArray(mealRes.value?.data)
          ? Number(mealRes.value.data[0]) || 0
          : 0;

      let exerciseMin = 0;
      let burnedKcal = 0;
      if (exRes.status === "fulfilled" && Array.isArray(exRes.value)) {
        exRes.value.forEach((e) => {
          exerciseMin += Number(e.exerciseMin) || 0;
          burnedKcal += Number(e.burnedCalorie) || 0;
        });
      }

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

      let waterMl = 0;
      if (waterRes.status === "fulfilled" && Array.isArray(waterRes.value?.data)) {
        const cups = waterRes.value.data.reduce(
          (s, r) => s + (r.waterIntakeCup || 0),
          0,
        );
        waterMl = cups * ML_PER_CUP;
      }

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

      // 혈당 (끼니별 식전/식후 평균)
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

      // 혈압 (시간대별 수축기/이완기 평균)
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
    });

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

        const ordered = MEAL_CATEGORY_ORDER.map((c) => groupedByCategory[c]).filter(
          Boolean,
        );
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

  // ── 요약 카드 표시값 ──
  const intakeRemaining =
    summary.targetIntakeKcal != null && summary.intakeKcal != null
      ? summary.targetIntakeKcal - summary.intakeKcal
      : null;
  const mealUnit =
    summary.targetIntakeKcal != null
      ? `/ ${formatNumber(summary.targetIntakeKcal)} kcal`
      : "kcal";
  const mealBottom =
    intakeRemaining != null
      ? intakeRemaining >= 0
        ? `남은 섭취 칼로리 ${formatNumber(intakeRemaining)}kcal`
        : `목표 초과 ${formatNumber(Math.abs(intakeRemaining))}kcal`
      : "목표 미설정";

  const exerciseBottom =
    summary.burnedKcal != null
      ? `총 소모칼로리 ${formatNumber(Math.round(summary.burnedKcal))} kcal`
      : "기록 없음";

  const weightBottom =
    summary.weightDelta != null
      ? `지난주 대비 ${summary.weightDelta > 0 ? "+" : ""}${summary.weightDelta}kg`
      : "지난주 기록 없음";

  const waterL = summary.waterMl != null ? +(summary.waterMl / 1000).toFixed(1) : null;
  const targetWaterL =
    summary.targetWaterMl != null ? +(summary.targetWaterMl / 1000).toFixed(1) : null;
  const waterRemainingL =
    targetWaterL != null && waterL != null
      ? Math.max(0, +(targetWaterL - waterL).toFixed(1))
      : null;
  const waterUnit = targetWaterL != null ? `/ ${targetWaterL} L` : "L";
  const waterBottom =
    waterRemainingL != null
      ? waterRemainingL === 0
        ? "목표량 달성"
        : `남은 수분 섭취량 ${waterRemainingL}L`
      : "목표 미설정";

  const medDateLabel = (() => {
    const d = new Date(selectedDate);
    if (Number.isNaN(d.getTime())) return selectedDate;
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  })();

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <Text className="text-[26px] font-extrabold text-[#0F172A]">하루 기록</Text>
        <Text className="mt-1 text-[14px] text-[#64748B]">
          하루의 신체 변화를 분석한 결과입니다.
        </Text>

        {/* 날짜 선택 */}
        <View className="mt-4 flex-row items-center gap-2">
          <Pressable
            onPress={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="h-[40px] w-[40px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
          >
            <Text className="text-[16px] text-[#64748B]">‹</Text>
          </Pressable>
          <TextInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-[14px] font-semibold text-[#0F172A]"
          />
          <Pressable
            onPress={() => setSelectedDate((d) => shiftDate(d, 1))}
            className="h-[40px] w-[40px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
          >
            <Text className="text-[16px] text-[#64748B]">›</Text>
          </Pressable>
        </View>

        {/* Summary Cards */}
        <View className="mt-6 gap-4">
          <SummaryCard
            labelName="식단"
            description="오늘의 섭취 kcal"
            record={formatNumber(
              summary.intakeKcal != null ? Math.round(summary.intakeKcal) : null,
            )}
            unit={mealUnit}
            bottomLabel={mealBottom}
          />
          <SummaryCard
            labelName="운동"
            description="오늘의 활동 시간"
            record={summary.exerciseMin != null ? formatNumber(summary.exerciseMin) : "—"}
            unit="분"
            bottomLabel={exerciseBottom}
          />
          <SummaryCard
            labelName="체중"
            description="현재 체중 및 추세"
            record={summary.weightKg != null ? summary.weightKg : "—"}
            unit="kg"
            bottomLabel={weightBottom}
          />
          <SummaryCard
            labelName="수분"
            description="오늘의 수분 섭취량"
            record={waterL != null ? waterL : "—"}
            unit={waterUnit}
            bottomLabel={waterBottom}
          />
        </View>

        {/* 혈당 */}
        <View className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-[16px] font-bold text-[#0F172A]">오늘의 혈당 변화</Text>
          <View className="mt-1 flex-row gap-4">
            <Text className="text-[11px] text-[#64748B]">● 식전 (Fasting)</Text>
            <Text className="text-[11px] text-[#64748B]">● 식후 (Post-meal)</Text>
          </View>
          <View className="mt-4">
            {bloodSugarData.length === 0 ? (
              <Text className="py-8 text-center text-[13px] text-[#94A3B8]">
                이 날의 혈당 기록이 없습니다.
              </Text>
            ) : (
              <SimpleBars
                data={bloodSugarData}
                max={180}
                keys={[
                  { key: "fasting", label: "식전", color: "#6ea8fe" },
                  { key: "postMeal", label: "식후", color: "#fca5a5" },
                ]}
              />
            )}
          </View>
        </View>

        {/* 혈압 */}
        <View className="mt-4 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-[16px] font-bold text-[#0F172A]">오늘의 혈압 변화</Text>
          <View className="mt-1 flex-row gap-4">
            <Text className="text-[11px] text-[#64748B]">● 수축기 (Systolic)</Text>
            <Text className="text-[11px] text-[#64748B]">● 이완기 (Diastolic)</Text>
          </View>
          <View className="mt-4">
            {bloodPressureData.length === 0 ? (
              <Text className="py-8 text-center text-[13px] text-[#94A3B8]">
                이 날의 혈압 기록이 없습니다.
              </Text>
            ) : (
              <SimpleBars
                data={bloodPressureData}
                max={200}
                keys={[
                  { key: "systolic", label: "수축기", color: "#f87171" },
                  { key: "diastolic", label: "이완기", color: "#818cf8" },
                ]}
              />
            )}
          </View>
        </View>

        {/* 복용 일정 */}
        <View className="mt-4 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <View className="flex-row items-center gap-3">
            <Text className="text-[16px] font-bold text-[#0F172A]">오늘의 복용 일정</Text>
            <Text className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[12px] text-[#64748B]">
              {medDateLabel}
            </Text>
          </View>
          {medSchedules.length === 0 ? (
            <Text className="py-8 text-center text-[13px] text-[#94A3B8]">
              해당 날짜의 복용 일정이 없습니다.
            </Text>
          ) : null}
        </View>

        {/* 식단 */}
        {meals.length === 0 ? (
          <View className="mt-6 items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-16">
            <Text className="mb-2 text-[16px] font-semibold text-[#0F172A]">
              기록된 식단이 없습니다
            </Text>
            <Text className="text-center text-[13px] leading-relaxed text-[#64748B]">
              전체 기록 관리 페이지에서{"\n"}오늘의 식단을 등록해보세요.
            </Text>
          </View>
        ) : (
          <View className="mt-6 gap-4">
            {meals.map((meal) => (
              <MealRecordCard
                key={meal.id}
                time={meal.time}
                label={meal.label}
                items={meal.items}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
