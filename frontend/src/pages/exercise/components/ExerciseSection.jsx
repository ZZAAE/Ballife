// 운동 종류별 대표 이모지 (메인 일러스트 자리)
const ICON_BY_TYPE = {
  // 유산소
  cycling: "🚴",
  running: "🏃",
  stair: "🪜",
  walking: "🚶",
  swimming: "🏊",
  jumprope: "🤸",
  // 무산소
  dumbbellpress: "🏋️",
  bumbellpress: "🏋️",
  barbelllow: "🏋️",
  latpulldown: "🏋️",
  squat: "🦵",
  deadlift: "💪",
  pullup: "🧗",
};

// 강도별 배지 색
const INTENSITY_BADGE = {
  강함: "bg-rose-100 text-rose-600",
  보통: "bg-amber-100 text-amber-700",
  약함: "bg-emerald-100 text-emerald-700",
};

function Badge({ icon, text, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${className}`}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function ExerciseSection({ icon, title, cards }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-lg font-bold text-[#1f2937] sm:text-[20px]">
          {title}
        </h3>
        <span className="ml-1 text-sm text-gray-400">({cards.length})</span>
      </div>

      <div className="w-full rounded-[24px] bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        {cards.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            기록된 운동이 없습니다.
          </div>
        ) : (
          <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {cards.map((card, index) => {
              const emoji =
                ICON_BY_TYPE[card.iconType] ??
                (card.type === "cardio" ? "🚴" : "🏋️");
              const intensityBadge =
                INTENSITY_BADGE[card.intensity] ?? "bg-gray-100 text-gray-600";

              return (
                <div
                  key={`${card.name}-${index}`}
                  className="flex flex-col items-center rounded-2xl border border-[#e5e7eb] bg-[#fcfcfc] p-3 shadow-sm transition hover:shadow-md"
                >
                  {/* 메인 운동 일러스트 */}
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2ff] text-4xl">
                    {emoji}
                  </div>

                  {/* 운동명 */}
                  <div className="mb-2 w-full truncate text-center text-sm font-bold text-[#1f2937]">
                    {card.name}
                  </div>

                  {/* 배지 묶음 */}
                  <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
                    {card.type === "strength" ? (
                      <Badge
                        icon="🔁"
                        text={`${card.sets} · ${card.reps}`}
                        className="bg-sky-100 text-sky-700"
                      />
                    ) : (
                      <Badge
                        icon="⏱"
                        text={card.time}
                        className="bg-sky-100 text-sky-700"
                      />
                    )}
                    <Badge
                      icon="❤️"
                      text={card.intensity}
                      className={intensityBadge}
                    />
                    <Badge
                      icon="🔥"
                      text={card.kcal}
                      className="bg-orange-100 text-orange-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ExerciseSection;
