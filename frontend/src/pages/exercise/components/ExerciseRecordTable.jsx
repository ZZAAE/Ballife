import RecordTabs from "./RecordTabs";

function ExerciseRecordTable({ logs }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="px-8 py-5">
        <h3 className="text-lg font-semibold text-[#1f2937]">운동 기록</h3>
      </div>

      <RecordTabs />

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
        {logs.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-5 items-center px-10 py-5 text-center text-sm text-[#111827]"
          >
            <div>{item.date}</div>
            <div>{item.sets ?? "-"}</div>
            <div>{item.reps ?? item.duration ?? "-"}</div>
            <div>
              <span className="rounded-full bg-[#fce7df] px-3 py-1 text-xs text-[#c26b47]">
                {item.intensity}
              </span>
            </div>
            <div>{item.calories}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExerciseRecordTable;
