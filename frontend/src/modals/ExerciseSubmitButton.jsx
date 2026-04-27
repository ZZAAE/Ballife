import { CheckCircle } from "lucide-react";

function ExerciseSubmitButton() {
  return (
    <div className="px-0 pb-0">
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a1c1e] py-5 font-bold text-white transition-all hover:bg-black">
        운동 저장하기 <CheckCircle size={20} />
      </button>
    </div>
  );
}

export default ExerciseSubmitButton;
