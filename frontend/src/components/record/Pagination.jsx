import { ChevronLeft, ChevronRight } from "lucide-react";
// 표 아래 번호 컴포넌트 
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 px-4 py-5">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
            currentPage === page ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}