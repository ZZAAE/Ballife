import { CARDIO_OPTIONS } from "../utils/exerciseRecords";

function AerobicFields({ row, onChange }) {
  return (
    <>
      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">운동 종류</span>
        <select
          value={row.exerciseTypeId}
          onChange={(event) => onChange({ exerciseTypeId: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        >
          {CARDIO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-[3] space-y-1">
        <span className="text-[10px] text-gray-400">킬로미터</span>
        <input
          type="number"
          step="0.1"
          placeholder="3KM"
          value={row.distanceKm}
          onChange={(event) => onChange({ distanceKm: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[3] space-y-1">
        <span className="text-[10px] text-gray-400">시간</span>
        <input
          type="text"
          placeholder="13분30초"
          value={row.durationText}
          onChange={(event) => onChange({ durationText: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">강도</span>
        <select
          value={row.intensity}
          onChange={(event) => onChange({ intensity: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        >
          <option value="낮음">낮음</option>
          <option value="보통">보통</option>
          <option value="높음">높음</option>
        </select>
      </div>
    </>
  );
}

export default AerobicFields;
