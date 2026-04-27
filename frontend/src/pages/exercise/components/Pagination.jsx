function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
      <button
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="disabled:opacity-30"
      >
        {"<"}
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={
            page === currentPage
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-white"
              : "flex h-7 w-7 items-center justify-center"
          }
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="disabled:opacity-30"
      >
        {">"}
      </button>
    </div>
  );
}

export default Pagination;
