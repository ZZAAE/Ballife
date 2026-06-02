import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

const PAGE_SIZE = 3;

export default function PrescriptionListCard({
  prescriptions = [],
  onSelectGroup,
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(prescriptions.length / PAGE_SIZE));
  // 목록이 줄어 현재 페이지가 범위를 벗어나면 마지막 페이지로 보정
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = prescriptions.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 md:px-8 pt-7 pb-5">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
          나의 처방 약 목록
        </h2>
      </div>

      <div className="bg-[#EAF3FF] border-y border-[#D6E6FF]">
        <div className="grid grid-cols-3 items-center py-4">
          <div className="pl-4 md:pl-10 text-[14px] font-semibold text-gray-600">약 그룹</div>
          <div className="px-2 md:px-6 text-[14px] font-semibold text-gray-600 text-center">
            복용량
          </div>
          <div className="pr-4 md:pr-10 text-[14px] font-semibold text-gray-600 text-right">
            복용일정
          </div>
        </div>
      </div>

      <div className="py-2">
        {prescriptions.length === 0 && (
          <div className="py-10 text-center text-[15px] text-gray-400">
            처방된 약이 없습니다.
          </div>
        )}
        {pageItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectGroup(item)}
            className={`w-full grid grid-cols-3 items-center py-7 text-left hover:bg-gray-50 transition ${
              index !== pageItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="pl-4 md:pl-10 pr-4 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[10px] bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-[15px] font-semibold text-gray-900 truncate">
                {item.groupName}
              </span>
            </div>

            <div className="px-2 md:px-6 text-center text-[15px] text-gray-700">
              {item.dosage}
            </div>

            <div className="pr-4 md:pr-10 pl-4 text-right text-[15px] font-semibold text-gray-900">
              {item.scheduleLabel ?? "-"}
            </div>
          </button>
        ))}
      </div>

      {/* 페이징 (3개 초과일 때만) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-100 py-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, Math.min(p, totalPages - 1) - 1))}
            disabled={safePage === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold transition ${
                i === safePage
                  ? "bg-[#EAF3FF] text-[#2563EB] border border-[#D6E6FF]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, Math.min(p, totalPages - 1) + 1))
            }
            disabled={safePage === totalPages - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
