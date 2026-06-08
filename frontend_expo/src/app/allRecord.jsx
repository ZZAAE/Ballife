import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import bioValueRecordApi from "../api/bioValueRecordApi";
import mealApi from "../api/mealApi";
import { getExercisesInRange } from "../api/exerciseApi";
import toast from "../lib/toast";
import BloodPressureRecordModal from "../components/modals/BloodPressureRecordModal";
import BloodsugarModal from "../components/modals/BloodsugarModal";
import WeightRecordModal from "../components/modals/WeightRecordModal";
import WaterRecordModal from "../components/modals/WaterRecordModal";
import ExerciseModal from "../components/modals/ExerciseModal";
import MealRegisterModal from "../components/modals/MealRegisterModal";
import DateField from "../components/DateField";

// 백엔드 BioValueRecord.category 값 (web: constants/bioCategory)
const BIO_CATEGORY = {
  BLOOD_SUGAR: "BloodSugar",
  BLOOD_PRESSURE: "BloodPressure",
  WEIGHT: "Weight",
  WATER_INTAKE: "WaterIntake",
};

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const shiftDate = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateInputValue(d);
};

// ─── 백엔드 응답 → 카드 키 매퍼 ───
const extractMealTiming = (category) =>
  typeof category === "string" && category.includes("-")
    ? category.split("-")[1]
    : "";

const mapBpRecord = (r) => ({
  recordId: r.recordId,
  category: r.category,
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  systolicBp: r.systolicBP,
  diastolicBp: r.diastolicBP,
  mealTiming: extractMealTiming(r.category),
});

const mapBsRecord = (r) => ({
  recordId: r.recordId,
  category: r.category,
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  bloodsugar: r.bloodSugar,
  mealTiming: extractMealTiming(r.category),
});

const mapWeightRecord = (r) => ({
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  weight: r.weight,
});

const mapWaterRecord = (r) => ({
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  amount: (r.waterIntakeCup ?? 0) * 200,
});

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침 식사",
  LUNCH: "점심 식사",
  DINNER: "저녁 식사",
  SNACK: "간식",
};

const MEAL_CATEGORY_SLOT = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack",
};

const mapMealToCard = (meal, items) => ({
  slot: MEAL_CATEGORY_SLOT[meal.mealCategory],
  card: {
    mealId: meal.mealId,
    category: meal.mealCategory,
    time: meal.mealTime ? String(meal.mealTime).slice(0, 5) : "",
    label: MEAL_CATEGORY_LABEL[meal.mealCategory] ?? "식사",
    image: meal.mealPhoto,
    items: (items ?? []).map((it) => ({
      name: it.foodName,
      kcal: it.calorie ?? 0,
      carb: it.carbohydrate ?? 0,
      protein: it.protein ?? 0,
      fat: it.saturatedFat ?? 0,
      sugar: it.sugar ?? 0,
      chol: it.cholesterol ?? 0,
      na: it.sodium ?? 0,
    })),
    rawItems: items ?? [],
  },
});

const EMPTY_MEAL_RECORDS = {
  breakfast: null,
  lunch: null,
  dinner: null,
  snack: null,
};

// ── 공용 카드 컨테이너 ──
function RecordCard({ color, icon, title, subText, children, hasRecords, onLink, onAdd }) {
  return (
    <View className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
      <View style={{ backgroundColor: color }} className="h-[4px] w-full" />
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-[#0F172A]">
              {icon} {title}
            </Text>
            <Text className="mt-1 text-[11px] font-medium text-[#94A3B8]">{subText}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {onLink ? (
              <Pressable onPress={onLink} className="rounded-lg bg-[#F1F5F9] px-3 py-1.5">
                <Text className="text-[12px] font-semibold text-[#64748B]">상세 ›</Text>
              </Pressable>
            ) : null}
            {onAdd ? (
              <Pressable onPress={onAdd} className="rounded-lg bg-[#0F172A] px-3 py-1.5">
                <Text className="text-[12px] font-semibold text-white">+ 기록</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <View className="mt-3">
          {hasRecords ? (
            children
          ) : (
            <View className="items-center justify-center rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] py-8">
              <Text className="text-[13px] font-medium text-[#64748B]">
                아직 기록되지 않았습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function AllRecordPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateInputValue(new Date()),
  );

  const [bloodPressureRecords, setBloodPressureRecords] = useState([]);
  const [bloodSugarRecords, setBloodSugarRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [waterRecords, setWaterRecords] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [mealRecords, setMealRecords] = useState(EMPTY_MEAL_RECORDS);

  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? user?.memberId ?? null;

  // 기록 등록 모달 (web: setModalType)
  const [modalType, setModalType] = useState(null);
  const [mealModalCategory, setMealModalCategory] = useState("BREAKFAST");
  const [editMeal, setEditMeal] = useState(null); // 식단 수정 대상 (null = 신규)
  const closeModal = () => {
    setModalType(null);
    setEditMeal(null);
  };

  // 선택 날짜 혈압 기록 폴링 (web: 5초 간격 + visibility)
  useEffect(() => {
    if (!userId || !selectedDate) {
      setBloodPressureRecords([]);
      return;
    }

    const fetchBp = () => {
      bioValueRecordApi
        .getAllBioValueRecords(userId)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          const filtered = list
            .filter(
              (r) =>
                r &&
                r.systolicBP != null &&
                typeof r.category === "string" &&
                r.category.startsWith("BloodPressure") &&
                String(r.recordDate).slice(0, 10) === selectedDate,
            )
            .sort((a, b) => (a.recordTime || "").localeCompare(b.recordTime || ""))
            .map(mapBpRecord);
          setBloodPressureRecords(filtered);
        })
        .catch((err) => console.error("혈압 기록 조회 실패:", err));
    };

    fetchBp();
    const id = setInterval(() => {
      if (AppState.currentState === "active") fetchBp();
    }, 5000);
    return () => clearInterval(id);
  }, [userId, selectedDate]);

  const fetchAll = useCallback(async () => {
    if (!userId || !selectedDate) return;

    const [bpRes, bsRes, wtRes, watRes, mealRes] = await Promise.allSettled([
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.BLOOD_PRESSURE, selectedDate),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.BLOOD_SUGAR, selectedDate),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.WEIGHT, selectedDate),
      bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.WATER_INTAKE, selectedDate),
      mealApi.getTodayMeals(userId, selectedDate),
    ]);

    setBloodPressureRecords(
      bpRes.status === "fulfilled" ? (bpRes.value?.data ?? []).map(mapBpRecord) : [],
    );
    setBloodSugarRecords(
      bsRes.status === "fulfilled" ? (bsRes.value?.data ?? []).map(mapBsRecord) : [],
    );
    setWeightRecords(
      wtRes.status === "fulfilled" ? (wtRes.value?.data ?? []).map(mapWeightRecord) : [],
    );
    setWaterRecords(
      watRes.status === "fulfilled" ? (watRes.value?.data ?? []).map(mapWaterRecord) : [],
    );

    if (mealRes.status === "fulfilled") {
      const meals = mealRes.value?.data ?? [];
      const slots = { ...EMPTY_MEAL_RECORDS };
      await Promise.all(
        meals.map(async (meal) => {
          try {
            const itemsRes = await mealApi.getMealItemsByMealId(meal.mealId);
            const { slot, card } = mapMealToCard(meal, itemsRes?.data ?? []);
            if (slot) slots[slot] = card;
          } catch {
            // 한 끼 음식 조회 실패는 무시
          }
        }),
      );
      setMealRecords(slots);
    } else {
      setMealRecords(EMPTY_MEAL_RECORDS);
    }
  }, [userId, selectedDate]);

  // 운동 기록 조회 (web의 exerciseRecords 유틸은 RN 미지원 → API 리스트 직접 사용)
  const fetchExercisesForDate = useCallback(async () => {
    if (!userId || !selectedDate) return;
    try {
      const list = await getExercisesInRange(userId, selectedDate, selectedDate);
      setExerciseList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("[AllRecordPage] fetchExercisesForDate failed:", error);
      toast.error(`운동 기록 조회 실패: ${error.message || error}`);
      setExerciseList([]);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    void fetchExercisesForDate();
  }, [fetchExercisesForDate]);

  const hasAnyMeal = Object.values(mealRecords).some((slot) => slot != null);

  const mealOrder = [
    ["breakfast", "아침 식사"],
    ["lunch", "점심 식사"],
    ["dinner", "저녁 식사"],
    ["snack", "간식"],
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-[30px] font-extrabold text-[#0F172A]">전체 기록 관리</Text>
        <Text className="mt-2 text-[14px] text-[#64748B]">
          오늘 하루의 건강 기록을 한눈에 확인하세요.
        </Text>

        {/* 날짜 선택 */}
        <View className="mt-4 flex-row items-center gap-2">
          <Pressable
            onPress={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white"
          >
            <Text className="text-[16px] text-[#64748B]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <DateField
              value={selectedDate}
              onChange={(v) => {
                const today = new Date().toISOString().split("T")[0];
                setSelectedDate(v > today ? today : v);
              }}
              maximumDate={new Date()}
            />
          </View>
          <Pressable
            onPress={() => {
              const today = new Date().toISOString().split("T")[0];
              setSelectedDate((d) => {
                const next = shiftDate(d, 1);
                return next > today ? today : next;
              });
            }}
            className="h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white"
          >
            <Text className="text-[16px] text-[#64748B]">›</Text>
          </Pressable>
        </View>

        <View className="mt-6 gap-[18px]">
          {/* 혈압 */}
          <RecordCard
            color="#FF3B5F"
            icon="🩺"
            title="혈압"
            subText={bloodPressureRecords.length > 0 ? "최근 기록 있음" : "최근 기록 없음"}
            hasRecords={bloodPressureRecords.length > 0}
            onLink={() => router.push("/check/blood-pressure")}
            onAdd={() => setModalType("bp")}
          >
            <View className="gap-2">
              {bloodPressureRecords.map((r, idx) => (
                <View
                  key={r.recordId ?? idx}
                  className="flex-row items-center justify-between rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                >
                  <Text className="text-[12px] text-[#64748B]">
                    {(r.recordTime || "").slice(0, 5)} {r.mealTiming}
                  </Text>
                  <Text className="text-[13px] font-semibold text-[#0F172A]">
                    {r.systolicBp} / {r.diastolicBp} mmHg
                  </Text>
                </View>
              ))}
            </View>
          </RecordCard>

          {/* 혈당 */}
          <RecordCard
            color="#FF8A2A"
            icon="🩸"
            title="혈당"
            subText={bloodSugarRecords.length > 0 ? "최근 기록 있음" : "최근 기록 없음"}
            hasRecords={bloodSugarRecords.length > 0}
            onLink={() => router.push("/check/blood-sugar")}
            onAdd={() => setModalType("blood")}
          >
            <View className="gap-2">
              {bloodSugarRecords.map((r, idx) => (
                <View
                  key={r.recordId ?? idx}
                  className="flex-row items-center justify-between rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                >
                  <Text className="text-[12px] text-[#64748B]">
                    {(r.recordTime || "").slice(0, 5)} {r.mealTiming}
                  </Text>
                  <Text className="text-[13px] font-semibold text-[#0F172A]">
                    {r.bloodsugar} mg/dL
                  </Text>
                </View>
              ))}
            </View>
          </RecordCard>

          {/* 체중 */}
          <RecordCard
            color="#2E86FF"
            icon="⚖️"
            title="체중"
            subText={weightRecords.length > 0 ? "최근 기록 있음" : "최근 기록 없음"}
            hasRecords={weightRecords.length > 0}
            onLink={() => router.push("/check/weight")}
            onAdd={() => setModalType("weight")}
          >
            {weightRecords.length > 0 ? (
              <View className="flex-row items-end gap-1 rounded-[10px] bg-[#F8FAFC] px-3 py-3">
                <Text className="text-[24px] font-bold text-[#0F172A]">
                  {weightRecords[weightRecords.length - 1].weight}
                </Text>
                <Text className="pb-1 text-[13px] text-[#64748B]">kg</Text>
              </View>
            ) : null}
          </RecordCard>

          {/* 수분 섭취 */}
          <RecordCard
            color="#55D7DF"
            icon="💧"
            title="수분 섭취"
            subText={waterRecords.length > 0 ? "최근 기록 있음" : "최근 기록 없음"}
            hasRecords={waterRecords.length > 0}
            onAdd={() => setModalType("water")}
          >
            {waterRecords.length > 0 ? (
              <View className="flex-row items-end gap-1 rounded-[10px] bg-[#F8FAFC] px-3 py-3">
                <Text className="text-[24px] font-bold text-[#0F172A]">
                  {waterRecords[waterRecords.length - 1].amount}
                </Text>
                <Text className="pb-1 text-[13px] text-[#64748B]">ml</Text>
              </View>
            ) : null}
          </RecordCard>

          {/* 활동량 요약 */}
          <RecordCard
            color="#20D36B"
            icon="🏃"
            title="활동량 요약"
            subText={exerciseList.length > 0 ? "오늘의 활동 있음" : "오늘의 활동 없음"}
            hasRecords={exerciseList.length > 0}
            onAdd={() => setModalType("exercise")}
          >
            <View className="gap-2">
              {exerciseList.map((e, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                >
                  <Text className="flex-1 text-[13px] text-[#0F172A]" numberOfLines={1}>
                    {e.exerciseName ?? e.name ?? "운동"}
                  </Text>
                  <Text className="text-[12px] text-[#64748B]">
                    {e.exerciseMin != null ? `${e.exerciseMin}분 · ` : ""}
                    {e.burnedCalorie != null ? `${Math.round(e.burnedCalorie)} kcal` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </RecordCard>
        </View>

        {/* 오늘의 식단 */}
        <View className="mt-[22px] overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
          <View className="h-[4px] w-full bg-[#A142FF]" />
          <View className="p-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[14px] font-extrabold text-[#0F172A]">🍽️ 오늘의 식단</Text>
                <Text className="mt-2 text-[11px] font-medium text-[#94A3B8]">
                  {hasAnyMeal ? "최근 기록 있음" : "식단 기록 대기 중"}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => router.push("/check/all")}
                  className="rounded-lg bg-[#F1F5F9] px-3 py-1.5"
                >
                  <Text className="text-[12px] font-semibold text-[#64748B]">하루 기록 ›</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEditMeal(null);
                    setMealModalCategory("BREAKFAST");
                    setModalType("meal");
                  }}
                  className="rounded-lg bg-[#0F172A] px-3 py-1.5"
                >
                  <Text className="text-[12px] font-semibold text-white">+ 기록</Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {mealOrder.map(([slot, fallbackLabel]) => {
                const meal = mealRecords[slot];
                if (!meal) {
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => {
                        setEditMeal(null);
                        setMealModalCategory(slot.toUpperCase());
                        setModalType("meal");
                      }}
                      className="items-center justify-center rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] py-8"
                    >
                      <Text className="text-[14px] font-semibold text-[#0F172A]">
                        {fallbackLabel}
                      </Text>
                      <Text className="mt-1 text-[12px] font-medium text-[#64748B]">
                        + 눌러서 기록하기
                      </Text>
                    </Pressable>
                  );
                }
                const totalKcal = (meal.items || []).reduce(
                  (s, i) => s + (i.kcal || 0),
                  0,
                );
                return (
                  <Pressable
                    key={slot}
                    onPress={() => {
                      setEditMeal(meal);
                      setMealModalCategory(meal.category);
                      setModalType("meal");
                    }}
                    className="rounded-[12px] border border-[#E5E7EB] p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[14px] font-bold text-[#0F172A]">{meal.label}</Text>
                      <View className="flex-row items-center gap-2">
                        {meal.time ? (
                          <Text className="text-[11px] text-[#94A3B8]">{meal.time}</Text>
                        ) : null}
                        <Text className="text-[11px] font-semibold text-[#4338CA]">수정 ›</Text>
                      </View>
                    </View>
                    <Text className="mt-1 text-[12px] font-semibold text-[#64748B]">
                      {Math.round(totalKcal).toLocaleString()} kcal
                    </Text>
                    <View className="mt-2 gap-1">
                      {(meal.items || []).map((it, i) => (
                        <View key={i} className="flex-row items-center justify-between">
                          <Text className="flex-1 text-[12px] text-[#0F172A]" numberOfLines={1}>
                            {it.name}
                          </Text>
                          <Text className="text-[11px] text-[#94A3B8]">
                            {Math.round(it.kcal || 0).toLocaleString()} kcal
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 기록 등록 모달들 — 저장 시 onSaved 로 전체 갱신 */}
      <BloodPressureRecordModal
        visible={modalType === "bp"}
        onClose={closeModal}
        onSaved={() => {
          fetchAll();
          fetchExercisesForDate();
        }}
        date={selectedDate}
      />
      <BloodsugarModal
        visible={modalType === "blood"}
        onClose={closeModal}
        onSaved={() => fetchAll()}
        date={selectedDate}
      />
      <WeightRecordModal
        visible={modalType === "weight"}
        onClose={closeModal}
        onSaved={() => fetchAll()}
        date={selectedDate}
      />
      <WaterRecordModal
        visible={modalType === "water"}
        onClose={closeModal}
        onSaved={() => fetchAll()}
        date={selectedDate}
      />
      <ExerciseModal
        visible={modalType === "exercise"}
        onClose={closeModal}
        onSaved={() => fetchExercisesForDate()}
        date={selectedDate}
      />
      <MealRegisterModal
        visible={modalType === "meal"}
        onClose={closeModal}
        onSaved={() => fetchAll()}
        date={selectedDate}
        category={mealModalCategory}
        meal={editMeal}
      />
    </SafeAreaView>
  );
}
