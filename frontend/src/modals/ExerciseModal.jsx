import { useState } from "react";
import ExerciseModalHeader from "./ExerciseModalHeader";
import ExerciseModalTabs from "./ExerciseModalTabs";
import ExerciseDetailSection from "./ExerciseDetailSection";
import ExpectedCalorieCard from "./ExpectedCalorieCard";
import ExerciseSubmitButton from "./ExerciseSubmitButton";

function ExerciseModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("anaerobic");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[785px] max-h-[calc(100vh-32px)] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 xl:h-[840px] xl:max-w-[760px] 2xl:h-[880px] 2xl:max-w-[820px]">
        {/* 고정 상단 영역 */}
        <div className="flex-shrink-0">
          <ExerciseModalHeader onClose={onClose} />
          <ExerciseModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 xl:px-8 xl:py-5">
          <div className="space-y-4">
            <ExpectedCalorieCard />
            <ExerciseDetailSection activeTab={activeTab} />
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="flex-shrink-0 p-6 pt-0 xl:px-8 xl:pb-8">
          <ExerciseSubmitButton />
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;
