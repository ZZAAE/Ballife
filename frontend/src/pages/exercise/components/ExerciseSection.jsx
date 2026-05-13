function ExerciseSection({ icon, title, cards }) {
  const useScrollLayout = cards.length > 3;

  return (
    <section className="mb-10">
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-lg font-bold text-[#252A31] sm:text-[20px]">
          {title}
        </h3>
      </div>

      <div className="w-full rounded-[12px] border border-[#E7E7E7] bg-white px-4 py-5 sm:px-5 sm:py-6">
        <div
          className={useScrollLayout ? "w-full overflow-x-auto pb-2" : "w-full"}
        >
          <div
            className={
              useScrollLayout
                ? "grid min-w-full grid-flow-col auto-cols-[calc((100%-2.5rem)/3)] gap-5"
                : "grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3"
            }
          >
            {cards.map((card, index) => (
              <div
                key={`${card.name}-${index}`}
                className={
                  useScrollLayout
                    ? "w-full rounded-[12px] border border-[#E7E7E7] bg-white px-5 py-5"
                    : "w-full rounded-[12px] border border-[#E7E7E7] bg-white px-5 py-5"
                }
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#E8EDF2] text-[18px]">
                    {card.icon}
                  </div>
                  <span className="text-lg font-semibold text-[#252A31] sm:text-[20px]">
                    {card.name}
                  </span>
                </div>

                <div className="space-y-3">
                  {card.type === "strength" ? (
                    <>
                      <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-3 py-3 text-sm text-[#3F4650] sm:px-4 sm:text-[15px]">
                        <span>세트 수</span>
                        <span className="font-medium text-[#252A31]">
                          {card.sets}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-3 py-3 text-sm text-[#3F4650] sm:px-4 sm:text-[15px]">
                        <span>횟 수</span>
                        <span className="font-medium text-[#252A31]">
                          {card.reps}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-3 py-3 text-sm text-[#3F4650] sm:px-4 sm:text-[15px]">
                      <span>시간</span>
                      <span className="font-medium text-[#252A31]">
                        {card.time}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-3 py-3 text-sm text-[#3F4650] sm:px-4 sm:text-[15px]">
                    <span>강도</span>
                    <span className="font-medium text-[#252A31]">
                      {card.intensity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-3 py-3 text-sm text-[#3F4650] sm:px-4 sm:text-[15px]">
                    <span>소모칼로리</span>
                    <span className="font-medium text-[#252A31]">
                      {card.kcal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExerciseSection;
