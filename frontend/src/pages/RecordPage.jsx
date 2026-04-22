import React, { useRef, useState } from "react";
import Blood from "../assets/Record/Blood.svg";
import Bp from "../assets/Record/Bp.svg";
import Excercise from "../assets/Record/Excercise.svg";
import Meal from "../assets/Record/Meal.svg";
import Water from "../assets/Record/Water.svg";
import Weight from "../assets/Record/Weight.svg";
import { Calendar } from 'lucide-react';

function RecordPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null)

  return (
    /* .ballife-dashboard-container */
    <div className="max-w-[1280px] mx-auto p-[40px_20px] flex flex-col gap-[40px] font-sans text-[#333333] bg-white">
      {/* .main-content */}
      <div className="w-full">
        {/* .section-title */}
        <h1 className="text-[28px] font-bold mb-[30px] text-[#111111]">
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

        {/* .card-row (Row 1: 혈압, 혈당) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px] mb-[20px] w-full">
          {/* 혈압 카드 */}
          <div className="relative flex-1 bg-white rounded-[12px] pl-1 p-[20px] flex min-h-[180px] overflow-hidden border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
            <div className="absolute left-0 top-0 w-[6px] h-full bg-[#FF4D4F]"></div>
            <div className="flex flex-end justify-start self-center m-[30px] gap-[20px]">
              <div className="flex items-center mb-[8px]">
                <img src={Bp} alt="혈압 아이콘" className="w-[40px] h-[40px]" />
              </div>
              <div className="items-center mb-[8px]">
                <div className="text-[15px] font-semibold">혈압</div>
                <div className="text-[11px] text-[#888888] whitespace-nowrap">
                  최근 기록 없음
                </div>
              </div>
            </div>
            {/* .record-area */}
            <div className="flex-1 border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#444444] mb-[2px]">
                  혈압 기록
                </p>
                <p className="text-[12px] text-[#999999]">
                  아직 기록되지 않았습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 혈당 카드 */}
          <div className="relative flex-1 bg-white rounded-[12px] pl-1 p-[20px] flex min-h-[180px] overflow-hidden border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
            <div className="absolute left-0 top-0 w-[6px] h-full bg-[#FF9C27]"></div>
            <div className="flex flex-end justify-start self-center m-[30px] gap-[20px]">
              <div className="flex items-center mb-[8px]">
                <img
                  src={Blood}
                  alt="혈당 아이콘"
                  className="w-[40px] h-[40px]"
                />
              </div>
              <div className="items-center mb-[8px]">
                <div className="text-[15px] font-semibold">혈당</div>
                <div className="text-[11px] text-[#888888] whitespace-nowrap">
                  최근 기록 없음
                </div>
              </div>
            </div>
            <div className="flex-1 border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#444444] mb-[2px]">
                  혈당 기록
                </p>
                <p className="text-[12px] text-[#999999]">
                  아직 기록되지 않았습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: (체중 + 수분) | 활동량 요약 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px] mb-[20px] w-full">
          {/* .double-sub-wrapper */}
          <div className="flex flex-col xl:flex-row gap-[20px] w-full">
            {/* 체중 (small-card) */}
            <div className="relative flex-1 bg-white rounded-[12px] p-[20px] flex min-h-[180px] overflow-hidden border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
              <div className="absolute left-0 top-0 w-[6px] h-full bg-[#1890FF]"></div>
              <div className="w-[80px] flex flex-col justify-start self-center m-[10px]">
                <div className="flex items-center gap-[20px] mb-[8px]">
                  <img
                    src={Weight}
                    alt="체중 아이콘"
                    className="w-[40px] h-[40px]"
                  />
                  <span className="text-[15px] font-semibold">체중</span>
                </div>
              </div>
              <div className="flex-1 border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center cursor-pointer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-[#444444]">
                  체중 기록
                </p>
              </div>
            </div>

            {/* 수분 (small-card) */}
            <div className="relative flex-1 bg-white rounded-[12px] p-[20px] flex min-h-[180px] overflow-hidden border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
              <div className="absolute left-0 top-0 w-[6px] h-full bg-[#13C2C2]"></div>
              <div className="w-[80px] flex flex-col justify-start self-center m-[10px]">
                <div className="flex items-center gap-[20px] mb-[8px]">
                  <img
                    src={Water}
                    alt="수분 아이콘"
                    className="w-[40px] h-[40px]"
                  />
                  <span className="text-[15px] font-semibold">수분</span>
                </div>
              </div>
              <div className="flex-1 border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center cursor-pointer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-[#444444]">
                  섭취 기록
                </p>
              </div>
            </div>
          </div>

          {/* 활동 요약 */}
          <div className="relative flex-1 bg-white rounded-[12px] pl-1 p-[20px] flex min-h-[180px] overflow-hidden border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
            <div className="absolute left-0 top-0 w-[6px] h-full bg-[#52C41A]"></div>
            <div className="flex flex-end justify-start self-center m-[30px] gap-[20px]">
              <div className="flex items-center mb-[8px]">
                <img
                  src={Excercise}
                  alt="활동 아이콘"
                  className="w-[40px] h-[40px]"
                />
              </div>
              <div className="items-center mb-[8px]">
                <div className="text-[15px] font-semibold">활동 요약</div>
                <div className="text-[11px] text-[#888888] whitespace-nowrap">
                  최근 기록 없음
                </div>
              </div>
            </div>
            <div className="flex-1 border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#F9FAFB] flex flex-col items-center justify-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center cursor-pointer">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#444444] mb-[2px]">
                  운동 기록
                </p>
                <p className="text-[12px] text-[#999999]">
                  아직 기록되지 않았습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* .meal-section */}
        <div className="relative bg-white border border-[#EEEEEE] rounded-[12px] p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] w-full">
          {/* 보라색 인디케이터 (Indicator.purple) */}
          <div className="absolute left-0 top-0 w-[4px] h-full bg-[#722ED1] rounded-[12px_0_0_12px]"></div>

          <div className="flex items-center gap-[20px] mb-[30px] pl-[10px]">
            <img src={Meal} alt="식사 아이콘" className="w-[40px] h-[40px]" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold">오늘의 식단</span>
              <span className="text-[12px] text-[#999999]">
                식단 기록 대기 중
              </span>
            </div>
          </div>

          {/* .meal-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            {["아침 식사", "점심 식사", "저녁 식사", "간식"].map(
              (meal, idx) => (
                /* .meal-box */
                <div
                  key={idx}
                  className="bg-[#F5F6F8] rounded-[12px] h-[220px] flex items-center justify-center"
                >
                  {/* .meal-dashed-inner */}
                  <div className="w-[90%] h-[85%] border border-dashed border-[#D1D5DB] rounded-[8px] flex flex-col items-center justify-center gap-[10px]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#CCCCCC"
                    >
                      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-10.03C11.34 11.84 13 10.12 13 8V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"></path>
                    </svg>
                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#444444]">
                        {meal}
                      </p>
                      <p className="text-[12px] text-[#999999]">
                        아직 기록되지 않았습니다.
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordPage;
