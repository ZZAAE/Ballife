import Header from "../exercise/components/Header";
import HealthIndicatorMenu from "../exercise/components/HealthMenu";

const dummy = {
  name: "천지수",
  username: "ballife-wkjgpho2enj",
  email: "jisoo.chun@vitalis.core",
  phone: "010-9493-3323",
  birth: "08.02.2004",
  gender: "여성",
  disease: "고혈압",
  bloodSugar: {
    fasting: "100 mg/dL",
    after1h: "100 mg/dL",
    after2h: "100 mg/dL",
  },
  bloodPressure: {
    systolic: "<120 mmHg",
    diastolic: "<80 mmHg",
  },
  goalWeight: {
    value: 78.2,
    unit: "kg",
    progress: 80,
    prev: "현재 체중 50.0kg (지난 28일간)",
  },
  goalWater: {
    value: 9,
    unit: "잔",
    progress: 75,
    prev: "1,400 ml / 1,900 ml",
  },
  goalCalorieIn: {
    value: "2,000",
    unit: "kcal",
    prev: "현재 섭취 칼로리 1,071kcal / 1,725kcal 달성",
  },
  goalCalorieOut: {
    value: "1,240",
    unit: "kcal",
    prev: "현재 소모 칼로리 520kcal / 640kcal 달성",
  },
  routine: [
    { label: "기상", time: "—" },
    { label: "아침", time: "07:30" },
    { label: "점심", time: "12:30" },
    { label: "저녁", time: "18:30" },
    { label: "취침", time: "23:30" },
  ],
  reports: [
    {
      icon: "📊",
      title: "주간 건강 종합 리포트",
      date: "2026.05.06 ~ 2026.05.12",
    },
    { icon: "🩸", title: "심혈관 정밀 분석 결과", date: "2026.05.06" },
  ],
};

function ProgressBar({ progress }) {
  return (
    <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-[#0f1c33]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function MetricCard({ label, badge, value, unit, progress, sub, bgColor }) {
  return (
    <div
      className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-gray-100 p-7 shadow-sm"
      style={{ backgroundColor: bgColor || "#ffffff" }}
    >
      <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
        <span>{label}</span>
        {badge && (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-500">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="mb-1.5 text-base text-gray-500">{unit}</span>
      </div>
      {progress !== undefined && <ProgressBar progress={progress} />}
      {sub && <p className="mt-3 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function UserInformation() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] w-full">
      <Header />

      <div className="min-h-screen w-full pt-[70px]">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-8">
          {/* 메인 콘텐츠 */}
          <main className="min-w-0 xl:w-full xl:max-w-[1248px] xl:justify-self-end">
            {/* 프로필 헤더 */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-300 text-4xl text-gray-500">
                👤
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {dummy.name}
                </h2>
                <p className="text-sm text-gray-400">{dummy.username}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors">
                    프로필 수정
                  </button>
                  <button className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors">
                    보유 질환 수정
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    ↩ 로그아웃
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
              {/* 좌측 패널 */}
              <div className="flex flex-col gap-5 pr-8">
                {/* 회원 정보 카드 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <h3 className="mb-4 text-sm font-bold text-gray-800">
                    회원 정보
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400">이메일 주소</dt>
                      <dd className="mt-0.5 font-medium text-gray-700">
                        {dummy.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">휴대폰 번호</dt>
                      <dd className="mt-0.5 font-medium text-gray-700">
                        {dummy.phone}
                      </dd>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <dt className="text-xs text-gray-400">생년월일</dt>
                        <dd className="mt-0.5 font-medium text-gray-700">
                          {dummy.birth}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400">성별</dt>
                        <dd className="mt-0.5 font-medium text-gray-700">
                          {dummy.gender}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">질환</dt>
                      <dd className="mt-0.5 font-medium text-gray-700">
                        {dummy.disease}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">정상 혈당</dt>
                      <dd className="space-y-0.5 text-gray-700">
                        <p>공복: {dummy.bloodSugar.fasting}</p>
                        <p>식사 1시간: {dummy.bloodSugar.after1h}</p>
                        <p>식사 2시간: {dummy.bloodSugar.after2h}</p>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">정상 혈압</dt>
                      <dd className="space-y-0.5 text-gray-700">
                        <p>수축기: {dummy.bloodPressure.systolic}</p>
                        <p>이완기: {dummy.bloodPressure.diastolic}</p>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 최근 데이터 리포트 */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">
                    최근 데이터 리포트
                  </h3>
                  <div className="space-y-2">
                    {dummy.reports.map((r) => (
                      <button
                        key={r.title}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-base">
                            {r.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-gray-800">
                              {r.title}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {r.date}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-300">›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 우측 콘텐츠 */}
              <div className="flex flex-col gap-5">
                {/* 목표 지표 2×2 */}
                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                  <MetricCard
                    label="목표 체중"
                    badge="수정"
                    value={dummy.goalWeight.value}
                    unit={dummy.goalWeight.unit}
                    progress={dummy.goalWeight.progress}
                    sub={dummy.goalWeight.prev}
                    bgColor="#DAE4F3"
                  />
                  <MetricCard
                    label="목표 음수량"
                    badge="수정"
                    value={dummy.goalWater.value}
                    unit={dummy.goalWater.unit}
                    progress={dummy.goalWater.progress}
                    sub={dummy.goalWater.prev}
                    bgColor="#E4E9ED"
                  />
                  <MetricCard
                    label="목표 섭취 칼로리"
                    badge="수정"
                    value={dummy.goalCalorieIn.value}
                    unit={dummy.goalCalorieIn.unit}
                    sub={dummy.goalCalorieIn.prev}
                    bgColor="#E4E9ED"
                  />
                  <MetricCard
                    label="목표 소모 칼로리"
                    badge="수정"
                    value={dummy.goalCalorieOut.value}
                    unit={dummy.goalCalorieOut.unit}
                    sub={dummy.goalCalorieOut.prev}
                    bgColor="#DAE4F3"
                  />
                </div>

                {/* 약 등록 + 하루 생활 루틴 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
                  {/* 약 등록 */}
                  <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:min-h-[600px]">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        💊 약 등록
                      </h3>
                      <button className="text-xs text-blue-500 hover:underline">
                        편집 ...
                      </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center rounded-xl bg-gray-100 py-6">
                      <div className="text-center text-gray-400">
                        <div className="mb-2 text-4xl">💊</div>
                        <p className="text-xs">처방전 이미지</p>
                        <p className="text-[10px] mt-0.5 text-gray-300">RX</p>
                      </div>
                    </div>
                    <button className="mt-3 h-10 w-full rounded-xl bg-[#0f1c33] text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors">
                      사진 업로드
                    </button>
                  </div>

                  {/* 하루 생활 루틴 */}
                  <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:min-h-[600px]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        하루 생활 루틴
                      </h3>
                      <button className="text-xs text-blue-500 hover:underline">
                        루틴 수정
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      {dummy.routine.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
                        >
                          <span className="text-sm text-gray-600">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* 우측 사이드바 */}
          <HealthIndicatorMenu />
        </div>
      </div>
    </div>
  );
}

export default UserInformation;
