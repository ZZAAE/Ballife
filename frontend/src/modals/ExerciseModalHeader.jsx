import { X } from "lucide-react";

function ExerciseModalHeader({ onClose }) {
  return (
    <div className="relative px-8 pb-4 pt-8">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold text-gray-900">운동 기록하기</h2>
      <p className="mt-1 text-sm text-gray-500">
        오늘의 노력을 정밀하게 기록하세요.
      </p>
    </div>
  );
}

export default ExerciseModalHeader;
