import React, { useRef, useState } from "react";

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
      className="flex shrink-0 items-center justify-center rounded-full bg-[#E8EDF2]"
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
      className="flex h-[36px] w-full items-center justify-center rounded-[6px] bg-[#F3F4F6]"
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

      <p className="mt-[15px] text-[14px] font-[600] leading-none text-[#303740]">
        {recordTitle}
      </p>

      <p className="mt-[9px] text-[11px] font-medium leading-none text-[#3F4650]">
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
    <section className="relative flex h-[250px] rounded-[12px] border border-[#E7E7E7] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px] rounded-l-[12px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[185px] shrink-0 items-center justify-center gap-[16px] pl-[16px]">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />

        <div>
          <p className="text-[14px] font-[600] leading-none text-[#252A31]">
            {title}
          </p>
          <p className="mt-[7px] whitespace-nowrap text-[10px] font-medium leading-none text-[#8D949E]">
            {subText}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center pr-[34px]">
        <div
          className={
            hasRecords
              ? "flex h-[215px] w-full flex-col justify-start overflow-y-auto"
              : "flex h-[215px] w-full flex-col items-center justify-center rounded-[7px] border border-dashed border-[#D2D9E3] bg-[#EEF3F9] p-[14px]"
          }
        >
          {children ?? (
            <EmptyRecordArea recordTitle={recordTitle} onAddClick={onAddClick} />
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
    <section className="relative flex h-[250px] rounded-[12px] border border-[#E7E7E7] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px] rounded-l-[12px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[98px] shrink-0 flex-col items-center justify-center">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />

        <p className="mt-[17px] text-[14px] font-[600] leading-none text-[#252A31]">
          {title}
        </p>
      </div>

      <div className="flex flex-1 items-center pr-[10px]">
        <div
          className={
            hasRecords
              ? "flex h-[215px] w-full flex-col justify-start overflow-hidden"
              : "flex h-[215px] w-full flex-col items-center justify-center rounded-[7px] border border-dashed border-[#D2D9E3] bg-[#EEF3F9]"
          }
        >
          {children ?? (
            <EmptyRecordArea recordTitle={recordTitle} onAddClick={onAddClick} />
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
      className="flex h-[285px] w-full items-center justify-center rounded-[7px] border border-dashed border-[#D2D9E3] bg-[#EEF3F9]"
    >
      <div className="flex flex-col items-center justify-center">
        <MealPlaceholderIcon />

        <p className="mt-[22px] text-[16px] font-[600] leading-none text-[#303740]">
          {title}
        </p>

        <p className="mt-[10px] text-[11px] font-medium leading-none text-[#3F4650]">
          아직 기록되지 않았습니다.
        </p>
      </div>
    </button>
  );
}

function AllRecordPage() {
  const [selectedDate, setSelectedDate] = useState("2026-04-30");
  const dateInputRef = useRef(null);

  const [modalType, setModalType] = useState(null);

  // 더미데이터: 기록 컴포넌트 디자인 확인용
const [bloodPressureRecords] = useState([
  {
    recordDate: "2026-05-09",
    recordTime: "08:30:00",
    mealTiming: "아침 식전",
    systolicBp: 120,
    diastolicBp: 80,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "09:30:00",
    mealTiming: "아침 식후",
    systolicBp: 120,
    diastolicBp: 80,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "12:30:00",
    mealTiming: "점심 식전",
    systolicBp: 120,
    diastolicBp: 80,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "13:30:00",
    mealTiming: "점심 식후",
    systolicBp: 120,
    diastolicBp: 80,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "18:30:00",
    mealTiming: "저녁 식전",
    systolicBp: 120,
    diastolicBp: 80,
  },
]);

const [bloodSugarRecords] = useState([
  {
    recordDate: "2026-05-09",
    recordTime: "08:30:00",
    mealTiming: "아침 식전",
    bloodsugar: 120,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "09:30:00",
    mealTiming: "아침 식후",
    bloodsugar: 120,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "12:30:00",
    mealTiming: "점심 식전",
    bloodsugar: 120,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "13:30:00",
    mealTiming: "점심 식후",
    bloodsugar: 120,
  },
  {
    recordDate: "2026-05-09",
    recordTime: "18:30:00",
    mealTiming: "저녁 식전",
    bloodsugar: 120,
  },
]);

const [exerciseRecords] = useState([
  {
    exerciseDate: "2026-05-09",
    exerciseTypeId: 3,
    exerciseName: "러닝",
    kcal: 120,
  },
  {
    exerciseDate: "2026-05-09",
    exerciseTypeId: 3,
    exerciseName: "스쿼트",
    kcal: 120,
  },
]);

const [weightRecords] = useState([
  {
    recordDate: "2026-05-09",
    recordTime: "13:33:00",
    weight: 78.2,
  },
]);

const [waterRecords] = useState([
  {
    recordDate: "2026-05-09",
    recordTime: "13:33:00",
    amount: 1400,
  },
]);
  const closeModal = () => {
    setModalType(null);
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  return (
    <>
      <main className="min-h-[calc(100vh-70px)] bg-[#F3F3F3] font-['Noto_Sans_KR'] text-[#222222]">
        <div className="ml-[150px] mr-[150px] pt-[104px] pb-[40px]">
          <div className="mb-[50px] flex items-center justify-between">
            <h1 className="text-[32px] font-extrabold leading-none tracking-[-1.2px] text-[#252A31]">
              전체 기록 관리
            </h1>

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
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm"
              >
                {selectedDate}
                <span className="ml-1 text-[10px] text-slate-300">▼</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-[30px] gap-y-[22px]">
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
                  {bloodPressureRecords.map((record, index) => (
                    <BloodPressureRecordItem key={index} record={record} />
                  ))}

                  <AddRecordBar onClick={() => setModalType("bp")} />
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
                  {bloodSugarRecords.map((record, index) => (
                    <BloodSugarRecordItem key={index} record={record} />
                  ))}

                  <AddRecordBar onClick={() => setModalType("blood")} />
                </div>
              ) : null}
            </LargeRecordCard>

            <div className="grid grid-cols-2 gap-[18px]">
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
                  {exerciseRecords.map((record, index) => (
                    <ExerciseRecordItem key={index} record={record} />
                  ))}

                  <AddRecordBar onClick={() => setModalType("exercise")} />
                </div>
              ) : null}
            </LargeRecordCard>
          </div>

          <section className="relative mt-[22px] rounded-[12px] border border-[#E5E5E5] bg-white px-[74px] pt-[43px] pb-[32px] shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
            <div className="absolute left-0 top-0 h-full w-[4px] rounded-l-[12px] bg-[#A142FF]" />

            <div className="mb-[34px] flex items-center justify-center gap-[15px]">
              <img
                src={Meal}
                alt=""
                className="h-[34px] w-[34px] object-contain"
              />

              <div>
                <p className="text-[14px] font-extrabold leading-none text-[#252A31]">
                  오늘의 식단
                </p>

                <p className="mt-[8px] text-[10px] font-medium leading-none text-[#8D949E]">
                  식단 기록 대기 중
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[34px]">
              <MealBox
                title="아침 식사"
                onClick={() => setModalType("meal")}
              />

              <MealBox
                title="점심 식사"
                onClick={() => setModalType("meal")}
              />

              <MealBox
                title="저녁 식사"
                onClick={() => setModalType("meal")}
              />

              <MealBox title="간식" onClick={() => setModalType("meal")} />
            </div>
          </section>
        </div>
      </main>

      <BloodPressureRecordModal
        isOpen={modalType === "bp"}
        onClose={closeModal}
      />

      <BloodsugarModal
        isOpen={modalType === "blood"}
        onClose={closeModal}
      />

      <MealRegisterModal
        isOpen={modalType === "meal"}
        onClose={closeModal}
      />

      <WaterRecordModal
        isOpen={modalType === "water"}
        onClose={closeModal}
      />

      <WeightRecordModal
        isOpen={modalType === "weight"}
        onClose={closeModal}
      />

      <ExerciseModal
        isOpen={modalType === "exercise"}
        onClose={closeModal}
      />
    </>
  );
}

export default AllRecordPage;