import RecordTabs from "./RecordTabs";

function ExerciseRecordTable({ activeTab, logs, onTabChange }) {
  const isAnaerobic = activeTab === "anaerobic";

  return (
    <section className="w-full overflow-hidden rounded-[12px] border border-[#E7E7E7] bg-white">
      <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <h3 className="text-lg font-semibold text-[#252A31]">운동 기록</h3>
      </div>

      <RecordTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="bg-[#EEF3F9]">
            <div className="grid grid-cols-5 px-4 py-4 text-center text-xs font-medium text-[#3F4650] sm:px-6 sm:text-sm lg:px-10">
              <div>일시</div>
              <div>{isAnaerobic ? "세트 수" : "운동 시간"}</div>
              <div>{isAnaerobic ? "횟수" : "운동 종류"}</div>
              <div>강도</div>
              <div>소모 칼로리</div>
            </div>
          </div>

          <div className="divide-y divide-[#F1F4F8]">
            {logs.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-5 items-center px-4 py-4 text-center text-xs text-[#252A31] sm:px-6 sm:text-sm lg:px-10 lg:py-5"
              >
                <div>{item.date}</div>
                <div>
                  {isAnaerobic ? (item.sets ?? "-") : (item.duration ?? "-")}
                </div>
                <div>
                  {isAnaerobic ? (item.reps ?? "-") : (item.name ?? "유산소")}
                </div>
                <div>
                  <span className="rounded-full bg-[#FCE7DF] px-3 py-1 text-xs font-medium text-[#C26B47]">
                    {item.intensity}
                  </span>
                </div>
                <div>{item.calories}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExerciseRecordTable;
