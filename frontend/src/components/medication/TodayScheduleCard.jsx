import { Check, ChevronRight, Sun } from "lucide-react";

export default function TodayScheduleCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[18px] font-bold text-gray-900">오늘의 복용 일정</h2>
          <span className="text-[12px] text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full font-medium">
            2025년 5월 22일
          </span>
        </div>

        
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
            <Sun className="w-3.5 h-3.5" /> 아침 (08:00)
          </div>
          <p className="text-[16px] font-bold text-gray-900 mb-1">아침약</p>
          <p className="text-[12px] text-gray-400 mb-4">식후 30분 복용</p>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-900 font-medium">
            <Check className="w-4 h-4" /> 복용 완료
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
            <Sun className="w-3.5 h-3.5" /> 점심 (13:00)
          </div>
          <p className="text-[16px] font-bold text-gray-900 mb-1">점심약</p>
          <p className="text-[12px] text-gray-400 mb-4">식사 중 복용</p>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-900 font-medium">
            <Check className="w-4 h-4" /> 복용 완료
          </div>
        </div>

        <div className="border-2 border-[#1B1F2A] rounded-xl p-5">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
            저녁 (19:00)
          </div>
          <p className="text-[16px] font-bold text-gray-900 mb-1">저녁약</p>
          <p className="text-[12px] text-gray-400 mb-4">식후 30분 복용</p>
          <button className="w-full h-[40px] bg-[#1B1F2A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#2A2F3F] transition-colors">
            복용 확인
          </button>
        </div>
      </div>
    </div>
  );
}