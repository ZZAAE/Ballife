import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import PersonWeight from "../../assets/Record/PersonWeight.svg";
import WaterDrop from "../../assets/Record/WaterDrop.svg";

function formatTime(timeString) {
  if (!timeString) return "";

  const [hour, minute] = timeString.split(":");
  const hourNum = Number(hour);

  if (Number.isNaN(hourNum)) return "";

  const period =
    hourNum < 12
      ? i18n.t("recordResultCards.am")
      : i18n.t("recordResultCards.pm");
  const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

  return `${period} ${String(displayHour).padStart(2, "0")}:${minute}`;
}

// record.mealTiming 은 백엔드 카테고리 접미사(한글 그대로: "공복", "아침식후", "점심식전", "취침전" 등).
// 끼니 + 식전/식후를 분리해 현재 언어로 번역한다. (bloodsugarModal 의 끼니/시점 키 재사용)
// 매핑에 없으면 원본 문자열을 그대로 둔다.
const MEAL_LABEL_KEY = {
  공복: "bloodsugarModal.meal.fasting",
  아침: "bloodsugarModal.meal.breakfast",
  점심: "bloodsugarModal.meal.lunch",
  저녁: "bloodsugarModal.meal.dinner",
  취침전: "bloodsugarModal.meal.beforeBed",
};
const TIMING_LABEL_KEY = {
  식전: "bloodsugarModal.timing.beforeMeal",
  식후: "bloodsugarModal.timing.afterMeal",
};

function translateMealTiming(raw) {
  if (!raw || typeof raw !== "string") return raw ?? "";
  const s = raw.replace(/\s/g, "");
  // 식전/식후가 붙은 끼니 (아침식후, 점심식전 등)
  for (const when of ["식전", "식후"]) {
    if (s.endsWith(when) && s.length > when.length) {
      const meal = s.slice(0, -when.length);
      const mealKey = MEAL_LABEL_KEY[meal];
      const whenLabel = i18n.t(TIMING_LABEL_KEY[when]);
      return mealKey ? `${i18n.t(mealKey)} ${whenLabel}` : `${meal} ${whenLabel}`;
    }
  }
  // 시점이 없는 끼니 (공복, 취침전, 공복혈당)
  if (MEAL_LABEL_KEY[s]) return i18n.t(MEAL_LABEL_KEY[s]);
  if (s.startsWith("공복")) return i18n.t(MEAL_LABEL_KEY["공복"]);
  return raw;
}

const exerciseTypeMap = {
  1: "recordResultCards.exerciseType.walking",
  2: "recordResultCards.exerciseType.running",
  3: "recordResultCards.exerciseType.cardio",
  4: "recordResultCards.exerciseType.strength",
  5: "recordResultCards.exerciseType.stretching",
};

export function SimpleRecordItem({ leftText, centerText, value, unit, onClick }) {
  const baseClass =
    "flex h-[36px] w-full items-center rounded-[6px] bg-[#F3F4F6] px-[14px] font-['Noto_Sans_KR'] shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

  const content = (
    <>
      <span className="w-[70px] shrink-0 truncate text-left text-[11px] font-[600] leading-none text-[#6B7C93] md:w-[88px]">
        {leftText}
      </span>

      <span className="min-w-0 flex-1 truncate text-left text-[11px] font-[600] leading-none text-[#6B7C93]">
        {centerText}
      </span>

      <div className="flex min-w-[70px] shrink-0 items-baseline justify-end gap-[4px]">
        <span className="text-[12px] font-[800] leading-none text-[#1F2933]">
          {value}
        </span>
        <span className="text-[9px] font-[600] leading-none text-[#A1B1C4]">
          {unit}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} cursor-pointer transition hover:bg-[#E5E7EB] active:scale-[0.99]`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

export function BloodPressureRecordItem({ record, onClick }) {
  return (
    <SimpleRecordItem
      leftText={formatTime(record.recordTime)}
      centerText={translateMealTiming(record.mealTiming ?? "점심식전")}
      value={`${record.systolicBp}/${record.diastolicBp}`}
      unit="mmHg"
      onClick={onClick}
    />
  );
}

export function BloodSugarRecordItem({ record, onClick }) {
  return (
    <SimpleRecordItem
      leftText={formatTime(record.recordTime)}
      centerText={translateMealTiming(record.mealTiming ?? "아침식전")}
      value={record.bloodsugar}
      unit="mg / dL"
      onClick={onClick}
    />
  );
}

export function ExerciseRecordItem({ record, onClick }) {
  const { t } = useTranslation();
  const exerciseTypeKey = exerciseTypeMap[record.exerciseTypeId];
  const content = (
    <SimpleRecordItem
      leftText={
        exerciseTypeKey ? t(exerciseTypeKey) : t("recordResultCards.exercise")
      }
      centerText={record.exerciseName ?? t("recordResultCards.runningDefault")}
      value={record.kcal ?? 120}
      unit="Kcal"
    />
  );
  if (!onClick) return content;
  return (
    <button
      type="button"
      onClick={() => onClick(record)}
      className="block w-full text-left transition hover:brightness-95"
      aria-label={t("recordResultCards.editExerciseRecord")}
    >
      {content}
    </button>
  );
}

export function WaterRecordCard({ record }) {
  const { t } = useTranslation();
  return (
    <div className="relative h-full w-full rounded-[8px] bg-white font-['Noto_Sans_KR']">
      <div className="absolute left-1/2 top-[42px] -translate-x-1/2">
        <div className="flex h-[50px] w-[90px] items-center justify-center">
          <img
            src={WaterDrop}
            alt={t("recordResultCards.waterIcon")}
            className="h-[90px] w-[90px] object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[20px] left-1/2 flex h-[40px] min-w-[150px] -translate-x-1/2 items-center justify-center rounded-[6px] bg-[#F4F6F8] px-[14px]">
        <span className="text-[12px] font-[700] text-[#6B7C93]">
          {t("recordResultCards.waterIntake")}
        </span>
        <span className="ml-[8px] text-[12px] font-[800]">
          {record?.amount ?? 1400}
          <span className="ml-[2px] text-[12px] font-[700] text-[#6B7C93]">
            ml
          </span>
        </span>
      </div>
    </div>
  );
}

export function WeightRecordCard({ record }) {
  const { t } = useTranslation();
  return (
    <div className="relative h-full w-full rounded-[8px] bg-white font-['Noto_Sans_KR']">
      <div className="absolute left-1/2 top-[38px] -translate-x-1/2">
        <div className="flex h-[60px] w-[110px] items-center justify-center">
          <img
            src={PersonWeight}
            alt={t("recordResultCards.weightIcon")}
            className="h-[110px] w-[110px] object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[20px] left-1/2 flex h-[40px] min-w-[150px] -translate-x-1/2 items-center justify-center rounded-[6px] bg-[#F4F6F8] px-[14px]">
        <span className="text-[12px] font-[700] text-[#6B7C93]">
          {t("recordResultCards.todayWeight")}
        </span>
        <span className="ml-[8px] text-[12px] font-[800]">
          {record?.weight ?? 78.2}
          <span className="ml-[2px] text-[12px] font-[700] text-[#6B7C93]">
            kg
          </span>
        </span>
      </div>
    </div>
  );
}