const ANAEROBIC_OPTIONS = [
  "벤치프레스",
  "스쿼트",
  "데드리프트",
  "숄더프레스",
  "바벨로우",
];

function AnaerobicFields() {
  return (
    <>
      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">운동 종류</span>
        <select className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm">
          {ANAEROBIC_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-1">
        <span className="text-[10px] text-gray-400">세트</span>
        <select className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">중량 (KG)</span>
        <input
          type="text"
          placeholder="60"
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">횟수 (REPS)</span>
        <input
          type="text"
          placeholder="12"
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>
    </>
  );
}

export default AnaerobicFields;
