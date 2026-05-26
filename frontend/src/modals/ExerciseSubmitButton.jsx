function ExerciseSubmitButton({ onClick, disabled, loading, count }) {
  return (
    <div className="px-0 pb-0">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full rounded-[24px] bg-[#1a1a2e] py-5 text-xl font-bold text-white shadow-xl transition-all hover:bg-[#25253d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {loading
          ? "저장 중..."
          : `기록 저장 및 확인${count > 0 ? ` (${count})` : ""}`}
      </button>
    </div>
  );
}

export default ExerciseSubmitButton;
