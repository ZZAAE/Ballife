import { useState } from "react";
import { Check, X, Sun, Moon, ChevronRight, Plus, AlertTriangle, Bold, Italic, Underline, MessageSquare, Droplets, Activity, Weight, Heart, Dumbbell, Pill, UtensilsCrossed, Menu } from "lucide-react";

const checkIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#2563EB" />
    <path d="M6 10.5L9 13.5L14 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const xIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#E11D48" />
    <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const emptyCircle = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#D1D5DB" strokeWidth="1.5" />
  </svg>
);

const weekData = [
  { day: "MON", date: 23, morning: "done", lunch: "done", dinner: "done" },
  { day: "TUE", date: 24, morning: "done", lunch: "miss", dinner: "done" },
  { day: "WED", date: 25, morning: "done", lunch: "done", dinner: "done", today: true },
  { day: "THU", date: 26, morning: "done", lunch: "done", dinner: "miss" },
  { day: "FRI", date: 27, morning: "done", lunch: "done", dinner: "done" },
  { day: "SAT", date: 28, morning: null, lunch: null, dinner: null, weekend: true },
  { day: "SUN", date: 29, morning: null, lunch: null, dinner: null, weekend: true },
];

export default function MedicationPage() {
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("1정");
  const [time, setTime] = useState("");

  return (
    <div className="w-[1920px] min-h-screen bg-gray-100" style={{ fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" }}>
      {/* ── Header ── */}
      <header className="w-full h-[64px] bg-[#1B1F2A] flex items-center justify-between px-12">
        <span className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ballife
        </span>
        <nav className="flex items-center gap-16">
          {["기록", "확인", "커뮤니티", "회원정보", "소개"].map((item) => (
            <span key={item} className="text-gray-300 text-[15px] cursor-pointer hover:text-white transition-colors">
              {item}
            </span>
          ))}
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </nav>
      </header>

      {/* ── Body ── */}
      <div className="flex">
        {/* ── Main Content ── */}
        <main className="flex-1 px-12 py-10">
          {/* Title */}
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">약 복용 관리</h1>
          <p className="text-[14px] text-gray-400 mb-8">지난 한 달간의 신체 변화를 분석한 결과입니다.</p>

          <div className="flex gap-6">
            {/* ── Left Column ── */}
            <div className="w-[340px] flex flex-col gap-6">
              {/* 복용 이행률 Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-[13px] text-gray-400 mb-3">오늘의 복용 이행률</p>
                <p className="text-[48px] font-extrabold text-gray-900 leading-none mb-4">75 %</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[8px] bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "75%" }} />
                  </div>
                  <span className="text-[12px] text-[#2563EB] font-semibold bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                    3/4 복용 완료
                  </span>
                </div>
              </div>

              {/* 직접 기록하기 Card */}
              <div className="bg-[#1B1F2A] rounded-2xl p-6 text-white flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📝</span>
                  <span className="text-[16px] font-bold">직접 기록하기</span>
                </div>
                <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
                  상비약 복용 시 기록해주세요.<br />체계적인 이행 관리에 도움이 됩니다.
                </p>

                <label className="text-[12px] text-gray-400 mb-1.5">약 이름</label>
                <input
                  type="text"
                  placeholder="예: 비타민 C, 타이레놀"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  className="w-full h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[13px] text-white placeholder-gray-500 outline-none mb-5"
                />

                <div className="flex gap-4 mb-8">
                  <div className="flex-1">
                    <label className="text-[12px] text-gray-400 mb-1.5 block">복용량</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[13px] text-white outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] text-gray-400 mb-1.5 block">복용 시간</label>
                    <input
                      type="text"
                      placeholder="--:-- --"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[13px] text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <button className="w-full h-[48px] bg-white text-[#1B1F2A] rounded-xl text-[14px] font-bold hover:bg-gray-100 transition-colors">
                  약 추가하기
                </button>
              </div>
            </div>

            {/* ── Center Column ── */}
            <div className="flex-1 flex flex-col gap-6">
              {/* 오늘의 복용 일정 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[18px] font-bold text-gray-900">오늘의 복용 일정</h2>
                    <span className="text-[12px] text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full font-medium">
                      2025년 5월 22일
                    </span>
                  </div>
                  <span className="text-[13px] text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1">
                    알림 설정 변경 <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex gap-4">
                  {/* 아침 */}
                  <div className="flex-1 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
                      <Sun className="w-3.5 h-3.5" /> 아침 (08:00)
                    </div>
                    <p className="text-[16px] font-bold text-gray-900 mb-1">아침약</p>
                    <p className="text-[12px] text-gray-400 mb-4">식후 30분 복용</p>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#2563EB] font-medium">
                      <Check className="w-4 h-4" /> 복용 완료
                    </div>
                  </div>

                  {/* 점심 */}
                  <div className="flex-1 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
                      <Sun className="w-3.5 h-3.5" /> 점심 (13:00)
                    </div>
                    <p className="text-[16px] font-bold text-gray-900 mb-1">점심약</p>
                    <p className="text-[12px] text-gray-400 mb-4">식사 중 복용</p>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#2563EB] font-medium">
                      <Check className="w-4 h-4" /> 복용 완료
                    </div>
                  </div>

                  {/* 저녁 */}
                  <div className="flex-1 border-2 border-[#1B1F2A] rounded-xl p-5">
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

              {/* 메모장 + 주간 캘린더 */}
              <div className="flex gap-6">
                {/* 메모장 */}
                <div className="w-[360px] bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#2563EB]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📋</span>
                    <span className="text-[16px] font-bold text-gray-900">메모장</span>
                  </div>
                  <div className="text-[13px] text-gray-700 leading-relaxed space-y-3">
                    <p className="font-bold">아스피린 :</p>
                    <p>출혈,근육통,간 이상,졸림/기억장애</p>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-amber-700 leading-relaxed">
                        술을 자주 많이 마시는 것도 간과 근육 부작용 위험을 높일 수 있음.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                    <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                      <Bold className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                      <Italic className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                      <Underline className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <span className="text-[12px] text-gray-400 ml-auto self-center">ab</span>
                  </div>
                </div>

                {/* 주간 캘린더 */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 text-center mb-4">
                    {weekData.map((d) => (
                      <div key={d.day} className="flex flex-col items-center">
                        <span className="text-[11px] text-gray-400 mb-1">{d.day}</span>
                        <span
                          className={`text-[14px] font-semibold w-8 h-8 flex items-center justify-center rounded-full ${
                            d.today
                              ? "bg-[#2563EB] text-white"
                              : d.weekend
                              ? "text-red-500"
                              : "text-gray-700"
                          }`}
                        >
                          {d.date}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 아침 row */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
                      <Sun className="w-3 h-3" /> 아침 (08:00)
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekData.map((d, i) => (
                        <div key={i} className="flex justify-center">
                          {d.morning === "done" ? checkIcon : d.morning === "miss" ? xIcon : emptyCircle}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 점심 row */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
                      <Sun className="w-3 h-3" /> 점심 (13:00)
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekData.map((d, i) => (
                        <div key={i} className="flex justify-center">
                          {d.lunch === "done"
                            ? checkIcon
                            : d.lunch === "miss"
                            ? xIcon
                            : emptyCircle}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 저녁 row */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
                      <Moon className="w-3 h-3" /> 저녁 (21:00)
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekData.map((d, i) => (
                        <div key={i} className="flex justify-center">
                          {d.dinner === "done"
                            ? checkIcon
                            : d.dinner === "miss"
                            ? xIcon
                            : emptyCircle}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 범례 */}
                  <div className="flex items-center gap-6 text-[11px] text-gray-400 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">{checkIcon} 복용 완료</div>
                    <div className="flex items-center gap-1.5">{xIcon} 미복용</div>
                    <div className="flex items-center gap-1.5">{emptyCircle} 예정됨</div>
                  </div>
                </div>
              </div>

              {/* 나의 처방 약 목록 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-gray-900 mb-5">나의 처방 약 목록</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-[13px] font-semibold text-gray-500 text-left pb-3 pl-4 w-1/3">약 그룹</th>
                      <th className="text-[13px] font-semibold text-gray-500 text-center pb-3 w-1/3">복용량</th>
                      <th className="text-[13px] font-semibold text-gray-500 text-right pb-3 pr-4 w-1/3">복용시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4 text-[#2563EB]" />
                          </div>
                          <span className="text-[14px] font-semibold text-gray-900">혈압약</span>
                        </div>
                      </td>
                      <td className="text-center text-[14px] text-gray-600">5정</td>
                      <td className="text-right pr-4 text-[14px] font-semibold text-gray-900">오늘 12:30</td>
                    </tr>
                    <tr>
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4 text-[#2563EB]" />
                          </div>
                          <span className="text-[14px] font-semibold text-gray-900">당뇨약</span>
                        </div>
                      </td>
                      <td className="text-center text-[14px] text-gray-600">3정</td>
                      <td className="text-right pr-4 text-[14px] font-semibold text-gray-900">오늘 12:30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="w-[280px] bg-white border-l border-gray-200 px-6 py-10 flex flex-col">
          <h3 className="text-[16px] font-bold text-gray-900 mb-5">건강 지표</h3>
          <nav className="flex flex-col gap-1 mb-6">
            {[
              { icon: <Heart className="w-4 h-4" />, label: "혈압" },
              { icon: <Weight className="w-4 h-4" />, label: "체중" },
              { icon: <Activity className="w-4 h-4" />, label: "혈당" },
              { icon: <Dumbbell className="w-4 h-4" />, label: "운동" },
              { icon: <Pill className="w-4 h-4" />, label: "약 복용", active: true },
              { icon: <UtensilsCrossed className="w-4 h-4" />, label: "식단" },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors ${
                  item.active
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button className="w-full h-[48px] bg-[#1B1F2A] text-white rounded-xl text-[14px] font-bold mb-8 hover:bg-[#2A2F3F] transition-colors">
            등록 하기
          </button>

          {/* AI 추천 카드 */}
          <div className="bg-[#1B1F2A] rounded-2xl p-5 text-white mb-4">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-[15px] font-bold mb-2">매우 훌륭한 추세입니다!</h4>
            <p className="text-[12px] text-gray-400 leading-relaxed mb-4">
              이번 주 체중이 꾸준히 안정세를 보이고 있습니다. 현재의 식단과 수면 패턴이 신진대사에 긍정적인 영향을 주고 있는 것으로 분석됩니다.
            </p>
            <div className="border-t border-white/10 pt-3 mb-4">
              <p className="text-[11px] text-gray-500 mb-1">전문가 추천 팁:</p>
              <p className="text-[12px] text-gray-300 leading-relaxed">
                목표 체중까지 약 4.4kg 남았습니다. 근력 운동 횟수를 주 1회 더 늘리면 기초대사량이 높아져 정체기를 예방할 수 있습니다.
              </p>
            </div>
            <button className="w-full h-[40px] border border-[#E11D48] text-[#E11D48] rounded-xl text-[13px] font-semibold hover:bg-[#E11D48]/10 transition-colors">
              맞춤형 식단 계획 보기
            </button>
          </div>

          {/* 수분 섭취 카드 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-[14px] font-bold text-gray-900">수분 섭취 권장</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              체중 감량 중에는 하루 2L 이상의 물을 마시는 것이 지방 연소에 효과적입니다.
            </p>
          </div>
        </aside>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 w-14 h-14 bg-[#1B1F2A] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
        <MessageSquare className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
