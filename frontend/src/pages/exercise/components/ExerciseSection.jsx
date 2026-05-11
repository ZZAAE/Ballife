function ExerciseSection({ icon, title, cards }) {
  const useScrollLayout = cards.length > 3;

  return (
    <section className="mb-10">
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-lg font-bold text-[#1f2937] sm:text-[20px]">
          {title}
        </h3>
      </div>

      <div className="w-full rounded-[24px] bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
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
                    ? "w-full rounded-[18px] border border-[#e5e7eb] bg-[#fcfcfc] px-5 py-5 shadow-sm"
                    : "w-full rounded-[18px] border border-[#e5e7eb] bg-[#fcfcfc] px-5 py-5 shadow-sm"
                }
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eef2ff] text-[18px]">
                    {card.icon}
                  </div>
                  <span className="text-lg font-semibold text-[#1f2937] sm:text-[20px]">
                    {card.name}
                  </span>
                </div>

                <div className="space-y-3">
                  {card.type === "strength" ? (
                    <>
                      <div className="flex items-center justify-between rounded-md bg-[#f3f4f6] px-3 py-3 text-sm text-gray-600 sm:px-4 sm:text-[15px]">
                        <span>세트 수</span>
                        <span className="font-medium text-[#1f2937]">
                          {card.sets}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-md bg-[#f3f4f6] px-3 py-3 text-sm text-gray-600 sm:px-4 sm:text-[15px]">
                        <span>횟 수</span>
                        <span className="font-medium text-[#1f2937]">
                          {card.reps}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between rounded-md bg-[#f3f4f6] px-3 py-3 text-sm text-gray-600 sm:px-4 sm:text-[15px]">
                      <span>시간</span>
                      <span className="font-medium text-[#1f2937]">
                        {card.time}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-md bg-[#f3f4f6] px-3 py-3 text-sm text-gray-600 sm:px-4 sm:text-[15px]">
                    <span>강도</span>
                    <span className="font-medium text-[#1f2937]">
                      {card.intensity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-[#f3f4f6] px-3 py-3 text-sm text-gray-600 sm:px-4 sm:text-[15px]">
                    <span>소모칼로리</span>
                    <span className="font-medium text-[#1f2937]">
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
