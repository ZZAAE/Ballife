import PersonWeight from "../../assets/Record/PersonWeight.svg";
import WaterDrop from "../../assets/Record/WaterDrop.svg";

function formatTime(timeString) {
  if (!timeString) return "";

  const [hour, minute] = timeString.split(":");
  const hourNum = Number(hour);

  if (Number.isNaN(hourNum)) return "";

  const period = hourNum < 12 ? "오전" : "오후";
  const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

  return `${period} ${String(displayHour).padStart(2, "0")}:${minute}`;
}

const exerciseTypeMap = {
  1: "걷기",
  2: "러닝",
  3: "유산소",
  4: "근력 운동",
  5: "스트레칭",
};

export function SimpleRecordItem({ leftText, centerText, value, unit }) {
  return (
    <div className="flex h-[36px] w-full items-center rounded-[6px] bg-[#F3F4F6] px-[14px] font-['Noto_Sans_KR'] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="w-[88px] text-[11px] font-[600] leading-none text-[#6B7C93]">
        {leftText}
      </span>

      <span className="flex-1 text-[11px] font-[600] leading-none text-[#6B7C93]">
        {centerText}
      </span>

      <div className="flex min-w-[76px] items-baseline justify-end gap-[4px]">
        <span className="text-[12px] font-[800] leading-none text-[#1F2933]">
          {value}
        </span>
        <span className="text-[9px] font-[600] leading-none text-[#A1B1C4]">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function BloodPressureRecordItem({ record }) {
  return (
    <SimpleRecordItem
      leftText={formatTime(record.recordTime)}
      centerText={record.mealTiming ?? "점심 식전"}
      value={`${record.systolicBp}/${record.diastolicBp}`}
      unit="mmHg"
    />
  );
}

export function BloodSugarRecordItem({ record }) {
  return (
    <SimpleRecordItem
      leftText={formatTime(record.recordTime)}
      centerText={record.mealTiming ?? "아침 식전"}
      value={record.bloodsugar}
      unit="mg / dL"
    />
  );
}

export function ExerciseRecordItem({ record }) {
  return (
    <SimpleRecordItem
      leftText={exerciseTypeMap[record.exerciseTypeId] ?? "운동"}
      centerText={record.exerciseName ?? "러닝"}
      value={record.kcal ?? 120}
      unit="Kcal"
    />
  );
}

export function WaterRecordCard({ record }) {
  return (
    <div className="relative h-full w-full rounded-[8px] bg-white font-['Noto_Sans_KR']">
      <div className="absolute left-1/2 top-[42px] -translate-x-1/2">
        <div className="flex h-[90px] w-[90px] items-center justify-center">
          <img
            src={WaterDrop}
            alt="수분 섭취 아이콘"
            className="h-[70px] w-[70px] object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[20px] left-1/2 flex h-[40px] min-w-[140px] -translate-x-1/2 items-center justify-center rounded-[6px] bg-[#F4F6F8] px-[14px]">
        <span className="text-[11px] font-[700] text-[#6B7C93]">
          수분 섭취량
        </span>
        <span className="ml-[8px] text-[11px] font-[800]">
          {record?.amount ?? 1400}
          <span className="ml-[2px] text-[11px] font-[700] text-[#6B7C93]">
            ml
          </span>
        </span>
      </div>
    </div>
  );
}

export function WeightRecordCard({ record }) {
  return (
    <div className="relative h-full w-full rounded-[8px] bg-white font-['Noto_Sans_KR']">
      <div className="absolute left-1/2 top-[38px] -translate-x-1/2">
        <div className="flex h-[100px] w-[100px] items-center justify-center">
          <img
            src={PersonWeight}
            alt="체중 아이콘"
            className="h-[115px] w-[115px] object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[20px] left-1/2 flex h-[40px] min-w-[140px] -translate-x-1/2 items-center justify-center rounded-[6px] bg-[#F4F6F8] px-[14px]">
        <span className="text-[11px] font-[700] text-[#6B7C93]">
          오늘의 체중
        </span>
        <span className="ml-[8px] text-[11px] font-[800]">
          {record?.weight ?? 78.2}
          <span className="ml-[2px] text-[11px] font-[700] text-[#6B7C93]">
            kg
          </span>
        </span>
      </div>
    </div>
  );
}