import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import bioValueRecordApi from "../api/bioValueRecordApi";
import mealApi from "../api/mealApi";
import { getMockExercisesByDate } from "../api/exerciseApi";
import { BIO_CATEGORY } from "../constants/bioCategory";

import Blood from "../assets/Record/Blood.svg";
import Bp from "../assets/Record/Bp.svg";
import Excercise from "../assets/Record/Excercise.svg";
import Meal from "../assets/Record/Meal.svg";
import Meal2 from "../assets/Record/Meal2.svg";
import Water from "../assets/Record/Water.svg";
import Weight from "../assets/Record/Weight.svg";
import Plus from "../assets/Record/Plus.svg";

import BloodsugarModal from "../modals/bloodsugarModal";
import BloodPressureRecordModal from "../modals/BloodPressureRecordModal";
import MealRegisterModal from "../modals/MealRegisterModal";
import WaterRecordModal from "../modals/WaterRecordModal";
import WeightRecordModal from "../modals/WeightRecordModal";
import ExerciseModal from "../modals/ExerciseModal";
import MealRecordCard from "../components/MealRecordCard";
import {
  BloodPressureRecordItem,
  BloodSugarRecordItem,
  ExerciseRecordItem,
  WaterRecordCard,
  WeightRecordCard,
} from "../components/record/RecordResultCards";

function PlusButton({ size = 52, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] transition hover:bg-[#E2E8F0]"
      style={{ width: size, height: size }}
      aria-label="기록 추가"
    >
      <img src={Plus} alt="" className="h-[20px] w-[20px] object-contain" />
    </button>
  );
}

function AddRecordBar({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[36px] w-full items-center justify-center rounded-[10px] bg-[#F1F5F9] transition hover:bg-[#E2E8F0]"
      aria-label="기록 추가"
    >
      <img
        src={Plus}
        alt=""
        className="h-[18px] w-[18px] object-contain opacity-60"
      />
    </button>
  );
}

function EmptyRecordArea({ recordTitle, onAddClick }) {
  return (
    <>
      <PlusButton size={50} onClick={onAddClick} />

      <p className="mt-[15px] text-[14px] font-semibold leading-none text-[#0F172A]">
        {recordTitle}
      </p>

      <p className="mt-[9px] text-[12px] font-medium leading-none text-[#64748B]">
        아직 기록되지 않았습니다.
      </p>
    </>
  );
}

function LargeRecordCard({
  icon,
  title,
  subText,
  recordTitle,
  color,
  onAddClick,
  children,
  hasRecords = false,
}) {
  return (
    <section className="relative flex h-[250px] min-w-0 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[185px] shrink-0 items-center justify-center gap-[16px] pl-[16px]">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />

        <div>
          <p className="text-[14px] font-semibold leading-none text-[#0F172A]">
            {title}
          </p>
          <p className="mt-[7px] whitespace-nowrap text-[11px] font-medium leading-none text-[#94A3B8]">
            {subText}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center pr-[20px] md:pr-[34px]">
        <div
          className={
            hasRecords
              ? "flex h-[215px] w-full min-w-0 flex-col justify-start overflow-y-auto"
              : "flex h-[215px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-[14px]"
          }
        >
          {children ?? (
            <EmptyRecordArea
              recordTitle={recordTitle}
              onAddClick={onAddClick}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function SmallRecordCard({
  icon,
  title,
  recordTitle,
  color,
  onAddClick,
  children,
  hasRecords = false,
}) {
  return (
    <section className="relative flex h-[250px] min-w-0 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[98px] shrink-0 flex-col items-center justify-center">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />

        <p className="mt-[17px] text-[14px] font-semibold leading-none text-[#0F172A]">
          {title}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center pr-[10px]">
        <div
          className={
            hasRecords
              ? "flex h-[215px] w-full flex-col justify-start overflow-hidden"
              : "flex h-[215px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC]"
          }
        >
          {children ?? (
            <EmptyRecordArea
              recordTitle={recordTitle}
              onAddClick={onAddClick}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function MealPlaceholderIcon() {
  return (
    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] bg-[#E2E8F0]">
      <img src={Meal2} alt="" className="h-[20px] w-[20px] object-contain" />
    </div>
  );
}

function MealBox({ title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[380px] w-full items-center justify-center rounded-[18px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] transition hover:bg-[#F1F5F9]"
    >
      <div className="flex flex-col items-center justify-center">
        <MealPlaceholderIcon />

        <p className="mt-[22px] text-[16px] font-semibold leading-none text-[#0F172A]">
          {title}
        </p>

        <p className="mt-[10px] text-[12px] font-medium leading-none text-[#64748B]">
          아직 기록되지 않았습니다.
        </p>
      </div>
    </button>
  );
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── 백엔드 응답 → 카드 컴포넌트 키 매퍼 ───
const mapBpRecord = (r) => ({
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  systolicBp: r.systolicBP,
  diastolicBp: r.diastolicBP,
  mealTiming: null,
});

const mapBsRecord = (r) => ({
  recordDate: r.recordDate,
  recordTime: r.recordTime,
  bloodsugar: r.bloodSugar,
  mealTiming: null,
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

const mapExerciseRecord = (r) => ({
  exerciseDate: r.exerciseDate,
  exerciseTypeId: r.exerciseTypeId,
  exerciseName: r.exerciseTypeId,
  kcal: r.burnedCalorie,
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
  },
});

const EMPTY_MEAL_RECORDS = {
  breakfast: null,
  lunch: null,
  dinner: null,
  snack: null,
};

function AllRecordPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateInputValue(new Date()),
  );
  const dateInputRef = useRef(null);

  const [modalType, setModalType] = useState(null);

  // DB에서 불러오는 실제 기록들. 더미 세팅은 디자인 확인용으로 아래 주석에 보관.
  const [bloodPressureRecords, setBloodPressureRecords] = useState([]);
  const [bloodSugarRecords, setBloodSugarRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [waterRecords, setWaterRecords] = useState([]);
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [mealRecords, setMealRecords] = useState(EMPTY_MEAL_RECORDS);

  // ─── 더미 세팅 보관 (디자인 확인용, 사용 안 함) ───
  // const DUMMY_BLOOD_PRESSURE = [
  //   { recordDate: "2026-05-09", recordTime: "08:30:00", mealTiming: "아침", systolicBp: 160, diastolicBp: 96 },
  //   { recordDate: "2026-05-09", recordTime: "12:11:00", mealTiming: "점심", systolicBp: 120, diastolicBp: 80 },
  //   { recordDate: "2026-05-09", recordTime: "20:42:00", mealTiming: "저녁", systolicBp: 123, diastolicBp: 88 },
  // ];
  // const DUMMY_BLOOD_SUGAR = [
  //   { recordDate: "2026-05-09", recordTime: "08:30:00", mealTiming: "아침 식전", bloodsugar: 100 },
  //   { recordDate: "2026-05-09", recordTime: "09:30:00", mealTiming: "아침 식후", bloodsugar: 150 },
  //   { recordDate: "2026-05-09", recordTime: "12:30:00", mealTiming: "점심 식전", bloodsugar: 95 },
  //   { recordDate: "2026-05-09", recordTime: "13:30:00", mealTiming: "점심 식후", bloodsugar: 128 },
  //   { recordDate: "2026-05-09", recordTime: "18:30:00", mealTiming: "저녁 식전", bloodsugar: 89 },
  // ];
  // const DUMMY_WEIGHT = [{ recordDate: "2026-05-09", recordTime: "13:33:00", weight: 78.2 }];
  // const DUMMY_WATER = [{ recordDate: "2026-05-09", recordTime: "13:33:00", amount: 1400 }];
  // const DUMMY_MEALS = {
  //   breakfast: {
  //     time: "08:30",
  //     label: "아침 식사",
  //     image: "https://i.pinimg.com/736x/b8/62/b7/b862b74a0a1c6971155427c60c85405a.jpg",
  //     items: [
  //       { name: "닭가슴살 샐러드 🥗", kcal: 320, carb: 22, protein: 35, fat: 8, sugar: 5, chol: 40, na: 300 },
  //       { name: "고구마 🍠", kcal: 180, carb: 38, protein: 2, fat: 0, sugar: 9, chol: 0, na: 20 },
  //     ],
  //   },
  //   lunch: null,
  //   dinner: {
  //     time: "18:40",
  //     label: "저녁 식사",
  //     image: "https://recipe1.ezmember.co.kr/cache/recipe/2023/01/04/4b577bb2d8e62cbf4513769a394848461.jpg",
  //     items: [
  //       { name: "현미밥 🍚", kcal: 250, carb: 52, protein: 5, fat: 2, sugar: 1, chol: 0, na: 10 },
  //       { name: "된장찌개 🍲", kcal: 180, carb: 12, protein: 14, fat: 8, sugar: 3, chol: 25, na: 720 },
  //     ],
  //   },
  //   snack: null,
  // };

  const closeModal = () => {
    setModalType(null);
    // 모달이 닫힐 때마다 refetch (저장 후 화면 자동 갱신)
    fetchAll();
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.userId ?? user?.id ?? 1;

  const fetchAll = useCallback(async () => {
    if (!userId || !selectedDate) return;

    const [bpRes, bsRes, wtRes, watRes, exRes, mealRes] =
      await Promise.allSettled([
        bioValueRecordApi.searchByDate(
          userId,
          BIO_CATEGORY.BLOOD_PRESSURE,
          selectedDate,
        ),
        bioValueRecordApi.searchByDate(
          userId,
          BIO_CATEGORY.BLOOD_SUGAR,
          selectedDate,
        ),
        bioValueRecordApi.searchByDate(
          userId,
          BIO_CATEGORY.WEIGHT,
          selectedDate,
        ),
        bioValueRecordApi.searchByDate(
          userId,
          BIO_CATEGORY.WATER_INTAKE,
          selectedDate,
        ),
        getMockExercisesByDate(userId, selectedDate),
        mealApi.getTodayMeals(userId, selectedDate),
      ]);

    setBloodPressureRecords(
      bpRes.status === "fulfilled"
        ? (bpRes.value?.data ?? []).map(mapBpRecord)
        : [],
    );
    setBloodSugarRecords(
      bsRes.status === "fulfilled"
        ? (bsRes.value?.data ?? []).map(mapBsRecord)
        : [],
    );
    setWeightRecords(
      wtRes.status === "fulfilled"
        ? (wtRes.value?.data ?? []).map(mapWeightRecord)
        : [],
    );
    setWaterRecords(
      watRes.status === "fulfilled"
        ? (watRes.value?.data ?? []).map(mapWaterRecord)
        : [],
    );
    setExerciseRecords(
      exRes.status === "fulfilled" ? (exRes.value ?? []).map(mapExerciseRecord) : [],
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
            // 한 끼 음식 조회 실패는 무시 (해당 슬롯은 비어있음 처리)
          }
        }),
      );
      setMealRecords(slots);
    } else {
      setMealRecords(EMPTY_MEAL_RECORDS);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    // selectedDate / userId 가 바뀔 때마다 6개 카테고리 페치
    fetchAll();
  }, [fetchAll]);

  //토큰 인증 테스트용
  // useEffect(() => {
  //   if (authLoading) return;
  //   if (!isAuthenticated || !user?.id) {
  //           toast.error('로그인이 필요합니다.');
  //           navigate('/login', { replace: true, state: { from: `/allRecord` } });
  //           return;
  //       }
  // },  [authLoading, isAuthenticated, user?.id, navigate]);

  return (
    <>
      <main className="min-h-[calc(100vh-70px)] w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
        <div className="mx-auto box-border w-full max-w-[1280px] px-6 pt-[87px] pb-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-extrabold leading-none tracking-tight text-[#0F172A]">
                전체 기록 관리
              </h1>
              <p className="mt-2 text-sm text-[#64748B]">
                오늘 하루의 건강 기록을 한눈에 확인하세요.
              </p>
            </div>

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
                className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:bg-[#F9FAFB]"
              >
                {selectedDate}
                <span className="ml-1 text-[10px] text-[#94A3B8]">▼</span>
              </button>
            </div>
          </div>

          <div className="grid w-full max-w-full grid-cols-1 gap-x-[30px] gap-y-[22px] xl:grid-cols-2">
            <LargeRecordCard
              icon={Bp}
              title="혈압"
              subText={
                bloodPressureRecords.length > 0
                  ? "최근 기록 있음"
                  : "최근 기록 없음"
              }
              recordTitle="혈압 기록"
              color="#FF3B5F"
              onAddClick={() => setModalType("bp")}
              hasRecords={bloodPressureRecords.length > 0}
            >
              {bloodPressureRecords.length > 0 ? (
                <div className="flex w-full flex-col gap-[8px]">
                  <AddRecordBar onClick={() => setModalType("bp")} />

                  {bloodPressureRecords.map((record, index) => (
                    <BloodPressureRecordItem key={index} record={record} />
                  ))}
                </div>
              ) : null}
            </LargeRecordCard>

            <LargeRecordCard
              icon={Blood}
              title="혈당"
              subText={
                bloodSugarRecords.length > 0
                  ? "최근 기록 있음"
                  : "최근 기록 없음"
              }
              recordTitle="혈당 기록"
              color="#FF8A2A"
              onAddClick={() => setModalType("blood")}
              hasRecords={bloodSugarRecords.length > 0}
            >
              {bloodSugarRecords.length > 0 ? (
                <div className="flex w-full flex-col gap-[8px]">
                  <AddRecordBar onClick={() => setModalType("blood")} />

                  {bloodSugarRecords.map((record, index) => (
                    <BloodSugarRecordItem key={index} record={record} />
                  ))}
                </div>
              ) : null}
            </LargeRecordCard>

            <div className="grid min-w-0 grid-cols-1 gap-[18px] md:grid-cols-2">
              <SmallRecordCard
                icon={Weight}
                title="체중"
                recordTitle="체중 기록"
                color="#2E86FF"
                onAddClick={() => setModalType("weight")}
                hasRecords={weightRecords.length > 0}
              >
                {weightRecords.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setModalType("weight")}
                    className="h-full w-full p-[10px]"
                  >
                    <WeightRecordCard
                      record={weightRecords[weightRecords.length - 1]}
                    />
                  </button>
                ) : null}
              </SmallRecordCard>

              <SmallRecordCard
                icon={Water}
                title="수분 섭취"
                recordTitle="섭취 기록"
                color="#55D7DF"
                onAddClick={() => setModalType("water")}
                hasRecords={waterRecords.length > 0}
              >
                {waterRecords.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setModalType("water")}
                    className="h-full w-full p-[10px]"
                  >
                    <WaterRecordCard
                      record={waterRecords[waterRecords.length - 1]}
                    />
                  </button>
                ) : null}
              </SmallRecordCard>
            </div>

            <LargeRecordCard
              icon={Excercise}
              title="활동량 요약"
              subText={
                exerciseRecords.length > 0
                  ? "오늘의 활동 있음"
                  : "오늘의 활동 없음"
              }
              recordTitle="운동 기록"
              color="#20D36B"
              onAddClick={() => setModalType("exercise")}
              hasRecords={exerciseRecords.length > 0}
            >
              {exerciseRecords.length > 0 ? (
                <div className="flex w-full flex-col gap-[8px]">
                  <AddRecordBar onClick={() => setModalType("exercise")} />

                  {exerciseRecords.map((record, index) => (
                    <ExerciseRecordItem key={index} record={record} />
                  ))}
                </div>
              ) : null}
            </LargeRecordCard>
          </div>

          <section className="relative mt-[22px] overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white px-6 pt-[43px] pb-[32px] shadow-[0_4px_16px_rgba(15,23,42,0.04)] md:px-[74px]">
            <div className="absolute left-0 top-0 h-full w-[4px] bg-[#A142FF]" />

            <div className="mb-[34px] flex items-center justify-center gap-[15px]">
              <img
                src={Meal}
                alt=""
                className="h-[34px] w-[34px] object-contain"
              />

              <div>
                <p className="text-[14px] font-extrabold leading-none text-[#0F172A]">
                  오늘의 식단
                </p>

                <p className="mt-[8px] text-[11px] font-medium leading-none text-[#94A3B8]">
                  식단 기록 대기 중
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[34px] md:grid-cols-2">
              {mealRecords.breakfast ? (
                <MealRecordCard
                  time={mealRecords.breakfast.time}
                  label={mealRecords.breakfast.label}
                  image={mealRecords.breakfast.image}
                  items={mealRecords.breakfast.items}
                  className="h-[380px]"
                  onClick={() => setModalType("meal")}
                />
              ) : (
                <MealBox
                  title="아침 식사"
                  onClick={() => setModalType("meal")}
                />
              )}

              {mealRecords.lunch ? (
                <MealRecordCard
                  time={mealRecords.lunch.time}
                  label={mealRecords.lunch.label}
                  image={mealRecords.lunch.image}
                  items={mealRecords.lunch.items}
                  className="h-[380px]"
                  onClick={() => setModalType("meal")}
                />
              ) : (
                <MealBox
                  title="점심 식사"
                  onClick={() => setModalType("meal")}
                />
              )}

              {mealRecords.dinner ? (
                <MealRecordCard
                  time={mealRecords.dinner.time}
                  label={mealRecords.dinner.label}
                  image={mealRecords.dinner.image}
                  items={mealRecords.dinner.items}
                  className="h-[380px]"
                  onClick={() => setModalType("meal")}
                />
              ) : (
                <MealBox
                  title="저녁 식사"
                  onClick={() => setModalType("meal")}
                />
              )}

              {mealRecords.snack ? (
                <MealRecordCard
                  time={mealRecords.snack.time}
                  label={mealRecords.snack.label}
                  image={mealRecords.snack.image}
                  items={mealRecords.snack.items}
                  className="h-[380px]"
                  onClick={() => setModalType("meal")}
                />
              ) : (
                <MealBox title="간식" onClick={() => setModalType("meal")} />
              )}
            </div>
          </section>
        </div>
      </main>

      <BloodPressureRecordModal
        isOpen={modalType === "bp"}
        onClose={closeModal}
      />

      <BloodsugarModal isOpen={modalType === "blood"} onClose={closeModal} />

      <MealRegisterModal isOpen={modalType === "meal"} onClose={closeModal} />

      <WaterRecordModal isOpen={modalType === "water"} onClose={closeModal} />

      <WeightRecordModal isOpen={modalType === "weight"} onClose={closeModal} />

      <ExerciseModal
        isOpen={modalType === "exercise"}
        onClose={closeModal}
        onSaved={fetchAll}
      />
    </>
  );
}

export default AllRecordPage;
