import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ExerciseModalHeader from "./ExerciseModalHeader";
import ExerciseModalTabs from "./ExerciseModalTabs";
import ExerciseDetailSection from "./ExerciseDetailSection";
import ExpectedCalorieCard from "./ExpectedCalorieCard";
import ExerciseSubmitButton from "./ExerciseSubmitButton";
import { useAuth } from "../contexts/AuthContext";
import { createExercise } from "../api/exerciseApi";
import {
  appendExerciseRecords,
  buildCreatePayload,
  buildStoredExerciseRecord,
  createAerobicRow,
  createAnaerobicRow,
  parseDurationToSeconds,
} from "../utils/exerciseRecords";

let nextId = 1;

function ExerciseModal({ isOpen, onClose, onSaved }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("anaerobic");
  const [anaerobicRows, setAnaerobicRows] = useState([]);
  const [aerobicRows, setAerobicRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("anaerobic");
    setAnaerobicRows([createAnaerobicRow(nextId++)]);
    setAerobicRows([createAerobicRow(nextId++)]);
  }, [isOpen]);

  const currentRows = activeTab === "anaerobic" ? anaerobicRows : aerobicRows;

  const handleAddRow = (tab) => {
    if (tab === "anaerobic") {
      setAnaerobicRows((prev) => [...prev, createAnaerobicRow(nextId++)]);
      return;
    }

    setAerobicRows((prev) => [...prev, createAerobicRow(nextId++)]);
  };

  const handleRemoveRow = (tab, rowId) => {
    if (tab === "anaerobic") {
      setAnaerobicRows((prev) => prev.filter((row) => row.id !== rowId));
      return;
    }

    setAerobicRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleRowChange = (tab, rowId, changes) => {
    const setter = tab === "anaerobic" ? setAnaerobicRows : setAerobicRows;
    setter((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...changes } : row)),
    );
  };

  const validateRows = () => {
    if (currentRows.length === 0) {
      return "운동 항목을 하나 이상 추가해 주세요.";
    }

    if (activeTab === "aerobic") {
      const hasInvalidDuration = currentRows.some(
        (row) => parseDurationToSeconds(row.durationText) <= 0,
      );
      if (hasInvalidDuration) {
        return "유산소 운동 시간은 13분30초 또는 13:30 형식으로 입력해 주세요.";
      }
      return null;
    }

    const hasInvalidStrength = currentRows.some(
      (row) => !(Number(row.exerciseSet) > 0 && Number(row.exerciseReps) > 0),
    );
    if (hasInvalidStrength) {
      return "무산소 운동은 세트와 횟수를 모두 입력해 주세요.";
    }

    const hasInvalidStrengthDuration = currentRows.some(
      (row) => parseDurationToSeconds(row.durationText) <= 0,
    );
    if (hasInvalidStrengthDuration) {
      return "무산소 운동 시간은 13분30초 또는 13:30 형식으로 입력해 주세요.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationMessage = validateRows();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const userId = user?.userId ?? user?.id ?? 1;
    setIsSaving(true);

    try {
      const savedRecords = await Promise.all(
        currentRows.map(async (row, index) => {
          const recordedAt = new Date();
          recordedAt.setSeconds(recordedAt.getSeconds() + index);

          const response = await createExercise(
            userId,
            buildCreatePayload(activeTab, row, recordedAt),
          );

          return buildStoredExerciseRecord(
            response,
            activeTab,
            row,
            recordedAt,
          );
        }),
      );

      onSaved?.();
      toast.success("운동 기록이 저장되었습니다.");
      onClose();
    } catch (error) {
      toast.error(error.message || "운동 기록 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[785px] max-h-[calc(100vh-32px)] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 xl:h-[840px] xl:max-w-[760px] 2xl:h-[880px] 2xl:max-w-[820px]"
      >
        {/* 고정 상단 영역 */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
            <ExerciseDetailSection
              activeTab={activeTab}
              anaerobicRows={anaerobicRows}
              aerobicRows={aerobicRows}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
              onRowChange={handleRowChange}
            />
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          <ExerciseSubmitButton
            onClick={handleSubmit}
            disabled={isSaving || currentRows.length === 0}
            loading={isSaving}
            count={currentRows.length}
          />
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;
