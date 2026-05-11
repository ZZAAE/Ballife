import React, { useRef, useState } from "react";
import Header from "../components/Header";
import ExerciseSection from "./exercise/components/ExerciseSection";
import ExerciseRecordTable from "./exercise/components/ExerciseRecordTable";
import HealthIndicatorMenu from "../components/HealthMenu";
import Pagination from "./exercise/components/Pagination";
import ExerciseModal from "../modals/ExerciseModal";
import { useExercise } from "./exercise/hooks/useExercise";

function ExercisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const dateInputRef = useRef(null);
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

  const strengthCards = anaerobicCards.map((card) => ({
    icon: "🏋️",
    name: card.name,
    type: "strength",
    sets: card.sets,
    reps: card.reps,
    intensity: card.intensity,
    kcal: card.calories,
  }));

  const cardioCards = aerobicCards.map((card) => ({
    icon: "🚴",
    name: card.name,
    type: "cardio",
    time: card.duration,
    intensity: card.intensity,
    kcal: card.calories,
  }));

  return (
    <div className="min-h-screen bg-[#efefef]">
      <Header />

      <div className="flex min-h-screen w-full bg-[#efefef] pt-[55px]">
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-[150px] lg:py-8">
          <div className="mb-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-[32px] font-extrabold leading-none tracking-[-1.2px] text-[#252A31]">
              운동 기록 확인
            </h2>
            <div className="relative sm:w-auto">
              <input
                type="date"
                ref={dateInputRef}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="pointer-events-none absolute opacity-0"
              />
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm sm:w-auto"
              >
                {selectedDate}
                <span className="ml-1 text-[10px] text-slate-300">▼</span>
              </button>
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

      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default ExercisePage;
