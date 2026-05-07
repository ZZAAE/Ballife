function HealthSidebar({ onRegisterClick }) {
  return (
    <aside className="w-[280px] shrink-0 bg-[#f7f8fa] px-6 py-10">
      <h3 className="mb-6 text-base font-bold text-gray-800">건강 지표</h3>

      <div className="mb-8 space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-3 px-3 py-2">
          <span>🩺</span> <span>혈압</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <span>⚖️</span> <span>체중</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <span>🩸</span> <span>혈당</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm font-medium text-gray-900">
          <span>🏋️</span> <span>운동</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <span>💊</span> <span>약 복용</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <span>🍽️</span> <span>식단</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRegisterClick}
        className="mb-8 h-[46px] w-full rounded-xl bg-[#0f1b33] text-sm font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
      >
        등록 하기
      </button>

      {/* 동기부여 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-lg">
        <div className="mb-3 text-sm font-bold">매우 훌륭한 주세입니다!</div>
        <p className="text-xs leading-5 text-blue-100">
          이번 주 체중이 꾸준히 안정대를 보이고 있습니다. 현재의 식단과 수면
          패턴이 긍정적으로 작용하고 있어요.
        </p>
        <button className="mt-4 w-full rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors">
          맞춤형 식단 계획 보기 →
        </button>
      </div>

      {/* 수면 상태 카드 */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span>🌙</span>
          <span className="text-sm font-bold text-gray-800">
            수면 상태 정상
          </span>
        </div>
        <p className="text-xs leading-5 text-gray-500">
          최근 수면 패턴이 5시간 이상을 유지 하고 있습니다. 양질의 수면은 운동
          효과를 극대화합니다.
        </p>
      </div>
    </aside>
  );
}

export default HealthSidebar;
