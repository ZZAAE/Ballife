import { useState } from "react";
import ExerciseModalHeader from "../../modals/ExerciseModalHeader";
import ExerciseModalTabs from "../../modals/ExerciseModalTabs";
import ExerciseDetailSection from "../../modals/ExerciseDetailSection";
import ExpectedCalorieCard from "../../modals/ExpectedCalorieCard";
import ExerciseSubmitButton from "../../modals/ExerciseSubmitButton";

function ExerciseModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("anaerobic");

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[785px] w-[672px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* 고정 상단 영역 */}
        <div className="flex-shrink-0">
          <ExerciseModalHeader onClose={onClose} />
          <ExerciseModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <ExpectedCalorieCard />
            <ExerciseDetailSection activeTab={activeTab} />
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="flex-shrink-0 p-6 pt-0">
          <ExerciseSubmitButton />
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;
