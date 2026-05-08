const ANAEROBIC_OPTIONS = [
  "벤치 프레스 (Bench Press)",
  "스쿼트 (Squat)",
  "데드리프트 (Deadlift)",
  "숄더 프레스 (Shoulder Press)",
  "바벨 로우 (Barbell Row)",
];

const AEROBIC_OPTIONS = [
  "러닝 (Running)",
  "사이클링 (Cycling)",
  "수영 (Swimming)",
  "줄넘기 (Jump Rope)",
  "걷기 (Walking)",
];

function ExerciseTypeSelect({ activeTab, selectedExercise, onSelectExercise }) {
  const options =
    activeTab === "anaerobic" ? ANAEROBIC_OPTIONS : AEROBIC_OPTIONS;

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-500">
        운동 종류 선택
      </label>

      <select
        value={selectedExercise || options[0]}
        onChange={(e) => onSelectExercise(e.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ExerciseTypeSelect;
