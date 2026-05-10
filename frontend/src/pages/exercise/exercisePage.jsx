import React, { useState } from "react";
import { Calendar } from "lucide-react";
import Header from "../../components/Header";
import ExerciseSection from "./components/ExerciseSection";
import ExerciseRecordTable from "./components/ExerciseRecordTable";
import HealthIndicatorMenu from "../../components/HealthMenu";
import Pagination from "./components/Pagination";
import ExerciseModal from "../../modals/ExerciseModal";
import { useExercise } from "./hooks/useExercise";

function ExercisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const {
    activeTab,
    anaerobicCards,
    aerobicCards,
    logs,
    currentPage,
    totalPages,
    handleTabChange,
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
    <div className="min-h-screen bg-[#efefef]">
      <Header />

      <div className="flex min-h-screen w-full bg-[#efefef] pt-[55px]">
        <main className="min-w-0 flex-1 p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[24px] font-bold text-[#1f2937]">
              운동 기록 확인
            </h2>
            <div className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:w-auto">
              <Calendar size={16} className="shrink-0 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="min-w-0 flex-1 text-sm text-gray-600 outline-none"
              />
            </div>
          </div>

          <ExerciseSection
            icon="🏋️"
            title="무산소 운동 목록"
            cards={strengthCards}
          />

          <ExerciseSection icon="🚴" title="유산소 운동" cards={cardioCards} />

          <ExerciseRecordTable
            activeTab={activeTab}
            logs={logs}
            onTabChange={handleTabChange}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
        <HealthIndicatorMenu onRegisterClick={() => setIsModalOpen(true)} />
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
