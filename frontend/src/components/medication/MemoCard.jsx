import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

export default function MemoCard({ memoList = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasMemo = memoList.length > 0;
  const safeIndex = hasMemo ? currentIndex % memoList.length : 0;
  const currentMemo = hasMemo ? memoList[safeIndex] : null;

  const handlePrev = () => {
    if (!hasMemo) return;
    setCurrentIndex((prev) => (prev === 0 ? memoList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!hasMemo) return;
    setCurrentIndex((prev) => (prev === memoList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full xl:w-[300px] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* 상단 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          <span className="text-[16px] font-bold text-gray-900">메모장</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#D8E8FF]">
        <div className="min-h-[320px] bg-[#EAF3FF] px-5 py-7">
          {currentMemo ? (
            <p className="text-[14px] leading-[1.9] text-gray-700 whitespace-pre-line">
              {currentMemo.content}
            </p>
          ) : (
            <p className="text-[14px] text-gray-400">등록된 메모가 없습니다.</p>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <div className="h-[44px] bg-[#EAF3FF] border-t border-[#C9DCF7] flex items-center justify-between px-3">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/70 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[13px] font-medium text-gray-700">
            {currentMemo?.groupName}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/70 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}