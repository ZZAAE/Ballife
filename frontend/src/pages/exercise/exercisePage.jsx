import React, { useState } from "react";
import { Calendar } from "lucide-react";
import ExerciseHeader from "./components/ExerciseHeader";
import ExerciseSection from "./components/ExerciseSection";
import ExerciseRecordTable from "./components/ExerciseRecordTable";
import HealthSidebar from "./components/HealthSidebar";
import Pagination from "./components/Pagination";
import ExerciseModal from "./ExerciseModal";
import { useExercise } from "./hooks/useExercise";

function ExercisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const {
    anaerobicCards,
    aerobicCards,
    logs,
    currentPage,
    totalPages,
    handlePageChange,
  } = useExercise();

  const strengthCards = anaerobicCards.map((c) => ({
    icon: "🏋️",
    name: c.name,
    type: "strength",
    sets: c.sets,
    reps: c.reps,
    intensity: c.intensity,
    kcal: c.calories,
  }));

  const cardioCards = aerobicCards.map((c) => ({
    icon: "🚴",
    name: c.name,
    type: "cardio",
    time: c.duration,
    intensity: c.intensity,
    kcal: c.calories,
  }));

  return (
    <div className="min-h-screen bg-[#d9d9d9]">
      <ExerciseHeader />

      <div className="mx-auto flex min-h-screen w-[1280px] bg-[#efefef]">
        {/* 메인 콘텐츠 */}
        <main className="flex-1 px-10 py-10">
          {/* 제목 + 날짜 선택 */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-[#1f2937]">
              운동 기록 확인
            </h2>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-gray-600 outline-none"
              />
            </div>
          </div>

          <ExerciseSection
            icon="🏋️"
            title="무산소 운동 목록"
            cards={strengthCards}
            progressWidth="w-1/3"
          />

          <ExerciseSection
            icon="🚴"
            title="유산소 운동"
            cards={cardioCards}
            progressWidth="w-2/3"
          />

          <ExerciseRecordTable logs={logs} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>

        {/* 사이드바 (오른쪽) */}
        <HealthSidebar onRegisterClick={() => setIsModalOpen(true)} />
      </div>

      {/* 모달 */}
      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default ExercisePage;
