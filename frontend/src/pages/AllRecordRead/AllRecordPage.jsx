import React, { useRef, useState } from "react";

import Blood from "../assets/Record/Blood.svg";
import Bp from "../assets/Record/Bp.svg";
import Excercise from "../assets/Record/Excercise.svg";
import Meal from "../assets/Record/Meal.svg";
import Meal2 from "../assets/Record/Meal2.svg"
import Water from "../assets/Record/Water.svg";
import Weight from "../assets/Record/Weight.svg";
import Plus from "../assets/Record/Plus.svg";

import WaterRecordModal from "../modals/waterRecordModal";

function formatKoreanDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function OpenModal(name){
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(true);
  if(name == "water"){
    <WaterRecordModal isOpen={isWaterModalOpen} onClose={() => setIsWaterModalOpen(false)} />
  }
  
}

function PlusButton({ size = 52, name }) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center justify-center rounded-full bg-[#E8EDF2]"
      style={{ width: size, height: size }}
      aria-label="기록 추가"
      onClick={() => OpenModal(name)}
    >
      <img src={Plus} alt="" className="h-[20px] w-[20px] object-contain" />
    </button>
  );
}

function LargeRecordCard({
  icon,
  title,
  subText,
  recordTitle,
  color,
  name,
  wide = false,
}) {
  return (
    <section className="relative flex h-[235px] rounded-[12px] border border-[#E7E7E7] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px] rounded-l-[12px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[185px] shrink-0 items-center justify-center gap-[16px] pl-[16px]">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />

        <div>
          <p className="text-[14px] font-bold leading-none text-[#252A31]">
            {title}
          </p>
          <p className="mt-[7px] whitespace-nowrap text-[10px] font-medium leading-none text-[#8D949E]">
            {subText}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center pr-[40px]">
        <div
          className={[
            "flex h-[215px] w-full flex-col items-center justify-center rounded-[7px]",
            "border border-dashed border-[#D2D9E3] bg-[#EEF3F9]",
          ].join(" ")}
        >
          <PlusButton size={50} name={name} />

          <p className="mt-[15px] text-[14px] font-bold leading-none text-[#303740]">
            {recordTitle}
          </p>
          <p className="mt-[9px] text-[11px] font-medium leading-none text-[#3F4650]">
            아직 기록되지 않았습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function SmallRecordCard({ icon, title, recordTitle, color, name }) {
  return (
    <section className="relative flex h-[235px] rounded-[12px] border border-[#E7E7E7] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]">
      <div
        className="absolute left-0 top-0 h-full w-[4px] rounded-l-[12px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex w-[98px] shrink-0 flex-col items-center justify-center">
        <img src={icon} alt="" className="h-[34px] w-[34px] object-contain" />
        <p className="mt-[17px] text-[14px] font-bold leading-none text-[#252A31]">
          {title}
        </p>
      </div>

      <div className="flex flex-1 items-center pr-[10px]">
        <div className="flex h-[215px] w-full flex-col items-center justify-center rounded-[7px] border border-dashed border-[#D2D9E3] bg-[#EEF3F9]">
          <PlusButton size={50} name={name} />

          <p className="mt-[15px] text-[14px] font-bold leading-none text-[#303740]">
            {recordTitle}
          </p>
          <p className="mt-[9px] text-[11px] font-medium leading-none text-[#3F4650]">
            아직 기록되지 않았습니다.
          </p>
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

function MealBox({ title }) {
  return (
    <div className="flex h-[285px] items-center justify-center rounded-[7px] border border-dashed border-[#D2D9E3] bg-[#EEF3F9]">
      <div className="flex flex-col items-center justify-center">
        <MealPlaceholderIcon />

        <p className="mt-[22px] text-[16px] font-bold leading-none text-[#303740]">
          {title}
        </p>
        <p className="mt-[10px] text-[11px] font-medium leading-none text-[#3F4650]">
          아직 기록되지 않았습니다.
        </p>
      </div>
    </div>
  );
}

function AllRecordPage() {
  const [selectedDate, setSelectedDate] = useState("2026-04-30");
  const dateInputRef = useRef(null);



  return (
    <main className="min-h-[calc(100vh-70px)] w-[calc(100vw-360px)] bg-[#F3F3F3] font-['Noto_Sans_KR'] text-[#222222]">
      <div className="ml-[150px] w-[1270px] pt-[104px] pb-[40px]">
        <div className="mb-[50px] flex items-center justify-between">
          <h1 className="text-[32px] font-extrabold leading-none tracking-[-1.2px] text-[#252A31]">
            전체 기록 관리
          </h1>

          {/* 날짜 들어가야함 */}
          <div className="relative">
            <input
              type="date"
              ref={dateInputRef}
              className="absolute opacity-0 pointer-events-none"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={() => dateInputRef.current.showPicker()}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 text-[14px] font-semibold text-slate-600 border border-slate-100 shadow-sm"
            >
              {/* <Calendar className="h-4 w-4 text-blue-500" /> */}
              {selectedDate}
              <span className="ml-1 text-[10px] text-slate-300">▼</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-[30px] gap-y-[22px]">
          <LargeRecordCard
            icon={Bp}
            title="혈압"
            subText="최근 기록 없음"
            recordTitle="혈압 기록"
            color="#FF3B5F"
          />

          <LargeRecordCard
            icon={Blood}
            title="혈당"
            subText="최근 기록 없음"
            recordTitle="혈당 기록"
            color="#FF8A2A"
          />

          <div className="grid grid-cols-2 gap-[18px]">
            <SmallRecordCard
              icon={Weight}
              title="체중"
              recordTitle="체중 기록"
              color="#2E86FF"
            />

            <SmallRecordCard
              icon={Water}
              title="수분 섭취"
              recordTitle="섭취 기록"
              color="#55D7DF"
              name="water"
            />
          </div>

          <LargeRecordCard
            icon={Excercise}
            title="활동량 요약"
            subText="오늘의 활동 없음"
            recordTitle="운동 기록"
            color="#20D36B"
          />
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
            <MealBox title="아침 식사" />
            <MealBox title="점심 식사" />
            <MealBox title="저녁 식사" />
            <MealBox title="간식" />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AllRecordPage;
