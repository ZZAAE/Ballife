const AEROBIC_OPTIONS = ["사이클", "러닝", "줄넘기", "걷기", "천국의 계단"];
function AerobicFields() {
  return (
    <>
      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">운동 종류</span>
        <select className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm">
          {AEROBIC_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex-[3] space-y-1">
        <span className="text-[10px] text-gray-400">킬로미터</span>
        <input
          type="text"
          placeholder="3KM"
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[3] space-y-1">
        <span className="text-[10px] text-gray-400">시간</span>
        <input
          type="text"
          placeholder="13분30초"
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">강도</span>
        <select className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm">
          <option value="낮음">낮음</option>
          <option value="보통">보통</option>
          <option value="높음">높음</option>
        </select>
      </div>
    </>
  );
}

export default AerobicFields;
