function ExercisePage() {
  const strengthCards = [
    {
      name: "벤치 프레스",
      sets: "5 Sets",
      reps: "12회",
      intensity: "중간",
      kcal: "180 kcal",
    },
    {
      name: "스쿼트",
      sets: "5 Sets",
      reps: "15회",
      intensity: "중간",
      kcal: "220 kcal",
    },
    {
      name: "스쿼트",
      sets: "5 Sets",
      reps: "15회",
      intensity: "중간",
      kcal: "220 kcal",
    },
  ];

  const cardioCards = [
    { name: "사이클링", time: "25분", intensity: "중간", kcal: "150 kcal" },
    { name: "사이클링", time: "25분", intensity: "중간", kcal: "150 kcal" },
    { name: "사이클링", time: "25분", intensity: "중간", kcal: "150 kcal" },
  ];

  const records = [1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-[#d9d9d9]">
      <div className="w-full min-h-screen bg-[#efefef]">
        <header className="flex h-[80px] items-center justify-between bg-[#0f1c33] px-10 text-white">
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

        <div className="flex">
          <main className="flex-1 px-20 py-12">
            <div className="mb-10 flex items-start justify-between">
              <h2 className="text-[40px] font-bold text-[#1f2937]">
                운동 기록 확인
              </h2>

              <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                <div className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700">
                  2026.4.01
                </div>
                <span className="text-sm text-gray-500">~</span>
                <div className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700">
                  2026.4.14
                </div>
                <button className="rounded-md bg-[#111827] px-4 py-2 text-xs text-white">
                  적용
                </button>
              </div>
            </div>

            <section className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base">🏋️</span>
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  무산소 운동 목록
                </h3>
              </div>

              <div className="rounded-2xl bg-white px-5 py-5 shadow-sm">
                <div className="grid grid-cols-3 gap-5">
                  {strengthCards.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-[#fcfcfc] p-5 shadow-sm"
                    >
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-sm">
                          🏋️
                        </div>
                        <p className="text-base font-semibold text-[#1f2937]">
                          {item.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <CardRow label="세트 수" value={item.sets} />
                        <CardRow label="횟 수" value={item.reps} />
                        <CardRow label="강도" value={item.intensity} />
                        <CardRow label="소모칼로리" value={item.kcal} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 h-1 w-[240px] rounded-full bg-gray-400" />
              </div>
            </section>

            <section className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base">🚴</span>
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  유산소 운동
                </h3>
              </div>

              <div className="rounded-2xl bg-white px-5 py-5 shadow-sm">
                <div className="grid grid-cols-3 gap-5">
                  {cardioCards.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-[#fcfcfc] p-5 shadow-sm"
                    >
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-sm">
                          🚲
                        </div>
                        <p className="text-base font-semibold text-[#1f2937]">
                          {item.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <CardRow label="시간" value={item.time} />
                        <CardRow label="강도" value={item.intensity} />
                        <CardRow label="소모칼로리" value={item.kcal} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 h-1 w-[320px] rounded-full bg-gray-400" />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="px-8 py-5">
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  운동 기록
                </h3>
              </div>

              <div className="border-b border-gray-200">
                <div className="grid grid-cols-2 text-center text-xs">
                  <button className="border-b-2 border-[#2563eb] py-4 font-semibold text-[#2563eb]">
                    무산소 (Anaerobic)
                  </button>
                  <button className="py-4 text-gray-500">
                    유산소 (Aerobic)
                  </button>
                </div>
              </div>

              <div className="bg-[#dbeafe]">
                <div className="grid grid-cols-5 px-10 py-4 text-center text-sm font-medium text-[#475569]">
                  <div>일시</div>
                  <div>세트 수</div>
                  <div>횟수</div>
                  <div>강도</div>
                  <div>소모 칼로리</div>
                </div>
              </div>

              <div>
                {records.map((item) => (
                  <div
                    key={item}
                    className="grid grid-cols-5 items-center px-10 py-5 text-center text-sm text-[#111827]"
                  >
                    <div>오늘 12:30</div>
                    <div>3</div>
                    <div>3</div>
                    <div>
                      <span className="rounded-full bg-[#fce7df] px-3 py-1 text-xs text-[#c26b47]">
                        보통
                      </span>
                    </div>
                    <div>300 kcal</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
              <button>{"<"}</button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-white">
                1
              </button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>{">"}</button>
            </div>
          </main>

          {/* <aside className="w-[320px] bg-[#d3d3d3] px-7 py-12">
            <h3 className="mb-6 text-lg font-semibold text-[#1f2937]">
              건강 지표
            </h3>

            <div className="space-y-3 text-sm">
              <SideItem label="혈압" />
              <SideItem label="체중" />
              <SideItem label="혈당" />
              <SideItem label="운동" active />
              <SideItem label="약 복용" />
              <SideItem label="식단" />
            </div>

            <button className="mt-6 w-full rounded-full bg-[#0f1c33] py-3 text-sm font-semibold text-white">
              등록 하기
            </button>

            <div className="mt-10 rounded-xl bg-gradient-to-br from-[#0f4fd6] to-[#1d4ed8] p-4 text-white shadow-lg">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/20">
                💬
              </div>
              <p className="mb-3 text-sm font-bold">매우 훌륭한 추세입니다!</p>
              <p className="text-[11px] leading-5 text-white/85">
                이번 주 체중이 꾸준히 안정세를 보이고 있습니다. 현재의 식단과
                수면 패턴이 신체 밸런스에 긍정적인 영향을 주고 있는 것으로
                분석됩니다.
              </p>

              <div className="mt-4 border-t border-white/20 pt-3">
                <p className="mb-2 text-[11px] text-white/70">전문가 추천 팁</p>
                <p className="text-[11px] leading-5 text-white/90">
                  목표 체중까지 약 4.4kg 남았습니다. 근력 운동을 주 1회 더
                  추가하면 기초대사량 향상에 도움이 됩니다.
                </p>
              </div>

              <button className="mt-4 w-full rounded-lg bg-white py-2 text-xs font-semibold text-[#1d4ed8]">
                맞춤형 식단 계획 보기
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-[#eef2f7] p-3">
              <p className="mb-1 text-xs font-semibold text-[#374151]">
                수분 섭취 권장
              </p>
              <p className="text-[11px] leading-4 text-[#6b7280]">
                체중 감량 중에는 하루 2L 이상의 물을 마시는 것이 좋습니다.
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1c33] text-white shadow-lg">
                💬
              </button>
            </div>
          </aside> */}
        </div>
      </div>
    </div>
  );
}

function CardRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[#f3f6f9] px-3 py-2 text-xs">
      <span className="text-[#4b5563]">{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}

function SideItem({ label, active = false }) {
  return (
    <button
      className={`flex w-full items-center rounded-full px-3 py-2 text-left ${
        active ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <span className="text-sm text-[#111827]">{label}</span>
    </button>
  );
}

export default ExercisePage;
