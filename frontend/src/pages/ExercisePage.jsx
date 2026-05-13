import React from "react";
import { CalendarDays } from "lucide-react";
import ExerciseSection from "./exercise/components/ExerciseSection";
import ExerciseRecordTable from "./exercise/components/ExerciseRecordTable";
import Pagination from "./exercise/components/Pagination";
import ExerciseModal from "../modals/ExerciseModal";
import { useExercise } from "./exercise/hooks/useExercise";

function ExercisePage({ isModalOpen, onCloseModal }) {
  const {
    activeTab,
    anaerobicCards,
    aerobicCards,
    logs,
    startDate,
    endDate,
    currentPage,
    totalPages,
    handleTabChange,
    handleStartDateChange,
    handleEndDateChange,
    handleApplyDateRange,
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
    <div className="min-h-[calc(100vh-70px)] w-full bg-[#F3F3F3] text-gray-900">
      <div className="w-full max-w-full px-[24px] pb-[40px] pt-[87px] md:px-[60px] xl:px-[150px]">
        <main className="min-w-0 flex-1">
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              운동 기록 확인
            </h1>
            <p className="text-sm text-gray-400">
              지난 한 달간의 신체 변화를 분석한 결과입니다.
            </p>
          </div>

          <ExerciseSection
            icon="🏋️"
            title="무산소 운동 목록"
            cards={strengthCards}
          />

          <ExerciseSection icon="🚴" title="유산소 운동" cards={cardioCards} />

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#E7E7E7] bg-white px-3 py-2 text-sm text-[#3F4650]">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-[#8D949E]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    handleStartDateChange(event.target.value)
                  }
                  className="bg-transparent text-sm text-[#3F4650] outline-none"
                />
              </div>
              <span className="text-[#C7CDD6]">~</span>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-[#8D949E]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                  className="bg-transparent text-sm text-[#3F4650] outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyDateRange}
              className="rounded-[10px] bg-[#252A31] px-4 py-2 text-sm font-semibold text-white"
            >
              적용
            </button>
          </div>

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
      </div>

      <ExerciseModal isOpen={isModalOpen} onClose={onCloseModal} />
    </div>
  );
}

export default ExercisePage;
