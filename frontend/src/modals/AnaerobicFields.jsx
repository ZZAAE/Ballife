import { STRENGTH_OPTIONS } from "../utils/exerciseRecords";

function AnaerobicFields({ row, onChange }) {
  return (
    <>
      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">운동 종류</span>
        <select
          value={row.exerciseTypeId}
          onChange={(event) => onChange({ exerciseTypeId: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        >
          {STRENGTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-1">
        <span className="text-[10px] text-gray-400">세트</span>
        <select
          value={row.exerciseSet}
          onChange={(event) =>
            onChange({ exerciseSet: Number(event.target.value) })
          }
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-center"
        >
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
          type="number"
          placeholder="60"
          value={row.weightKg}
          onChange={(event) => onChange({ weightKg: event.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex-[2] space-y-1">
        <span className="text-[10px] text-gray-400">횟수 (REPS)</span>
        <input
          type="number"
          placeholder="12"
          value={row.exerciseReps}
          onChange={(event) => onChange({ exerciseReps: event.target.value })}
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
    </>
  );
}

export default AnaerobicFields;
