
function MainPage(){

  // 더미데이터
    const userStats = {
    ageGender: "45세 / 남성",
    height: "175cm",
    weight: "78kg",
    bmi: "25.5 (과체중)",
    bmiColor: "text-red-500",
  };

  const statusCards = [
    { type: '혈당', value: '112 mg/dL', label: '안정 범위', labelColor: 'text-green-500', icon: 'tint' },
    { type: '혈압', value: '118 / 70', label: '수축기 / 이완기', icon: 'heart' },
    { type: '체중', value: '58kg', label: '정상', labelColor: 'text-green-500', icon: 'chart-line' },
    { type: '복약 알림', value: '2건 확인 필요', label: '오전 복용 요망', icon: 'pill' },
  ];

  const actionCards = [
    { type: '식단', title: '오늘 식단 등록', value: '총 섭취 칼로리 1300kcal', color: 'bg-green-100', icon: '🍽️' },
    { type: '운동', title: '오늘 운동 등록', value: '소모 칼로리 300kcal', color: 'bg-yellow-100', icon: '💪' },
    { type: '수분 섭취', value: '총 400ml', label: '목표량까지 3컵', color: 'bg-blue-100', icon: '💧' },
    { type: '영양제', title: '영양제', value: '2건 확인 필요', label: '오전 복용 요망', color: 'bg-gray-800', textColor: 'text-white', icon: '💊' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // HTML 엔티티 또는 유니코드로 대체 아이콘 표시
  const renderIcon = (type) => {
    switch (type) {
      case 'tint': return <span className="text-red-500 text-3xl">&#128167;</span>; // 물방울 (혈당)
      case 'heart': return <span className="text-red-700 text-3xl">&#9829;</span>;   // 하트 (혈압)
      case 'chart-line': return <div className="w-16 h-8 bg-blue-100 rounded flex items-center justify-center"><div className="w-12 h-0.5 bg-blue-500 rotate-[-15deg]"></div></div>; // 선 차트 모양 (체중)
      case 'pill': return <div className="w-12 h-6 bg-red-400 rounded-full flex p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>; // 알약 모양 (복약)
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="w-full space-y-10">
        
        {/* Header & User Stats */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h1 className="text-3xl font-bold">김지수님 안녕하세요.</h1>
          <div className="flex gap-6 text-sm text-slate-500">
            <div><p className="text-xs opacity-60">나이 / 성별</p><p className="font-semibold text-slate-800">{userStats.ageGender}</p></div>
            <div><p className="text-xs opacity-60">키</p><p className="font-semibold text-slate-800">{userStats.height}</p></div>
            <div><p className="text-xs opacity-60">몸무게</p><p className="font-semibold text-slate-800">{userStats.weight}</p></div>
            <div><p className="text-xs opacity-60">BMI</p><p className={`font-semibold ${userStats.bmiColor}`}>{userStats.bmi}</p></div>
          </div>
        </header>

        {/* Status Cards (Top Row) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusCards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{card.type}</p>
                <p className="text-xl font-bold">{card.value}</p>
                <p className={`text-xs mt-1 ${card.labelColor || 'text-slate-400'}`}>{card.label}</p>
              </div>
              <div className="flex-shrink-0">
                {renderIcon(card.icon)}
              </div>
            </div>
          ))}
        </section>

        {/* Action Cards (Second Row) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card, idx) => (
            <div key={idx} className={`${card.color} ${card.textColor || 'text-slate-900'} p-6 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity`}>
              <div>
                <p className="text-xs opacity-70 mb-1">{card.type}</p>
                {card.title && <p className="text-lg font-bold mb-1">{card.title}</p>}
                <p className="text-xs opacity-70">{card.value}</p>
                {card.label && <p className="text-xs opacity-70 mt-1">{card.label}</p>}
              </div>
              <div className="text-4xl flex-shrink-0">
                {card.icon}
              </div>
            </div>
          ))}
        </section>

        {/* Calendar & Chart Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-3xl">&#128197;</span> {/* 달력 이모지 */}
              <h2 className="text-xl font-bold">3월</h2>
            </div>
            <div className="grid grid-cols-7 gap-x-2 gap-y-6 text-center text-sm">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <div key={idx} className={`font-bold ${idx === 0 ? 'text-red-500' : 'text-slate-400'}`}>{day}</div>
              ))}
              {/* 3월 1일 시작 위치 맞추기 (예: 수요일 시작) */}
              {[...Array(3)].map((_, i) => <div key={`empty-${i}`}></div>)} 
              {days.map(day => (
                <div key={day} className="flex flex-col items-center gap-1 group">
                  <span className="text-xs text-slate-500 font-medium">{day}</span>
                  {/* 여러 지표 원형 모양 (간단 버전) */}
                  <div className="w-10 h-10 rounded-full border border-slate-100 grid grid-cols-2 grid-rows-2 gap-0.5 p-1 transition-transform group-hover:scale-110">
                    <div className="bg-red-400 rounded-full"></div>
                    <div className="bg-indigo-400 rounded-full"></div>
                    <div className="bg-blue-400 rounded-full"></div>
                    <div className="bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-xl">&#128200;</span> {/* 차트 이모지 */}
                <h2 className="text-xl font-bold">주간 건강 추이</h2>
              </div>
              <div className="flex gap-1 text-xs text-slate-500">
                {['체중', '혈당', '혈압'].map((item, idx) => (
                  <button key={idx} className={`px-3 py-1.5 rounded-full ${idx === 0 ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50'}`}>{item}</button>
                ))}
              </div>
            </div>
            {/* 차트 영역 (플레이스홀더) */}
            <div className="flex-grow flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-slate-400 text-sm">여기에 차트 컴포넌트(예: Recharts)가 들어갑니다.</p>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-4 px-4">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </section>

        {/* 건강 뉴스 섹션 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">건강 뉴스</h2>
            <p className="text-slate-500 text-sm mt-1">전문가가 큐레이션한 건강 정보를 만나보세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { category: 'MEDICAL', title: 'Regular blood pressure control reduces stroke risk', color: 'bg-blue-50 text-blue-700', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop' },
              { category: 'PREVENTION', title: 'Guide to regular checkups for complication prevention', color: 'bg-red-50 text-red-700', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop' },
              { category: 'NUTRITION', title: 'Diet trends for blood sugar management', color: 'bg-green-50 text-green-700', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop' },
            ].map((news, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer">
                <img src={news.img} alt={news.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-6">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${news.color}`}>{news.category}</span>
                  <p className="mt-3 text-sm font-semibold text-slate-800 leading-snug">{news.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
export default MainPage;