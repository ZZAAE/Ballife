function ExerciseHeader() {
  return (
    <header className="flex h-[80px] w-full items-center justify-between bg-[#0f1c33] px-10 text-white">
      <h1 className="text-[28px] font-semibold">Ballife</h1>

      <nav className="hidden items-center gap-20 md:flex">
        <button className="text-base font-medium">기록</button>
        <button className="text-base font-medium">확인</button>
        <button className="text-base font-medium">커뮤니티</button>
        <button className="text-base font-medium">회원정보</button>
        <button className="text-base font-medium">소개</button>
      </nav>

      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <span className="text-base">☰</span>
      </button>
    </header>
  );
}

export default ExerciseHeader;
