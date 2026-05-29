import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Clock, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "../api/exerciseApi";
import {
  CARDIO_OPTIONS,
  STRENGTH_OPTIONS,
  STAIR_INTENSITY_HINT,
  aerobicMet,
  anaerobicMetByVolume,
  anaerobicVolume,
  buildCreatePayload,
  createAerobicRow,
  createAnaerobicRow,
  parseDurationToSeconds,
  recordToRow,
} from "../utils/exerciseRecords";
import { USER_KEY } from "../api/api";

const resolveUserId = (user) => {
  const fromContext = user?.userId ?? user?.id ?? user?.memberId;
  if (fromContext != null) return fromContext;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem("user") ||
      localStorage.getItem("loginUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? parsed?.id ?? parsed?.memberId ?? null;
  } catch {
    return null;
  }
};

let nextId = 1;

const pad2 = (n) => String(n).padStart(2, "0");
const nowHHmm = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const isoToHHmm = (iso) => {
  const m = String(iso || "").match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : nowHHmm();
};
const todayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

function ExerciseModal({ isOpen, onClose, onSaved, editingRecord, recordDate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("anaerobic");
  const [anaerobicRows, setAnaerobicRows] = useState([]);
  const [aerobicRows, setAerobicRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exerciseTime, setExerciseTime] = useState("");
  const [timeEditing, setTimeEditing] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const timeInputRef = useRef(null);
  const isEditMode = !!editingRecord;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingRecord) {
      const { kind, row } = recordToRow(editingRecord, nextId++);
      // 모달이 열릴 때 편집 대상 기록으로 폼을 초기화하는 의도된 동기화
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(kind);
      setExerciseTime(isoToHHmm(editingRecord.dateIso));
      if (kind === "aerobic") {
        setAerobicRows([row]);
        setAnaerobicRows([createAnaerobicRow(nextId++)]);
      } else {
        setAnaerobicRows([row]);
        setAerobicRows([createAerobicRow(nextId++)]);
      }
      return;
    }

    setActiveTab("anaerobic");
    setExerciseTime(nowHHmm());
    setAnaerobicRows([createAnaerobicRow(nextId++)]);
    setAerobicRows([createAerobicRow(nextId++)]);
  }, [isOpen, editingRecord]);

  const startTimeEdit = () => {
    setTimeInput(exerciseTime || nowHHmm());
    setTimeEditing(true);
  };

  const commitTimeEdit = () => {
    const raw = timeInput.trim();
    let hours = -1;
    let minutes = -1;

    if (/^\d{1,2}:\d{1,2}$/.test(raw)) {
      const [h, m] = raw.split(":").map(Number);
      hours = h;
      minutes = m;
    } else if (/^\d{4}$/.test(raw)) {
      hours = parseInt(raw.slice(0, 2));
      minutes = parseInt(raw.slice(2));
    } else if (/^\d{3}$/.test(raw)) {
      hours = parseInt(raw.slice(0, 1));
      minutes = parseInt(raw.slice(1));
    } else if (/^\d{1,2}$/.test(raw)) {
      hours = parseInt(raw);
      minutes = 0;
    }

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const formatted = `${String(hours).padStart(2, "0")}:${String(
        minutes,
      ).padStart(2, "0")}`;
      setExerciseTime(formatted);
    }
    setTimeEditing(false);
  };

  useEffect(() => {
    if (timeEditing && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [timeEditing]);

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

  const calculateExpectedCalorie = () => {
    const rows = activeTab === "anaerobic" ? anaerobicRows : aerobicRows;
    if (rows.length === 0) return 0;

    const userWeight = user?.weight;
    if (!userWeight || userWeight <= 0) {
      console.warn("사용자 체중 없음:", userWeight);
      return 0;
    }

    const totalCalories = rows.reduce((sum, row) => {
      // 무산소: 볼륨(중량×횟수×세트)으로 MET 결정 / 유산소: 운동 종류×강도 MET
      const met =
        activeTab === "anaerobic"
          ? anaerobicMetByVolume(anaerobicVolume(row))
          : aerobicMet(row.exerciseTypeId, row.intensity);

      if (!met || met <= 0) {
        return sum;
      }

      // 저장값과 동일하게: buildCreatePayload 가 보내는 exerciseMin(올림 분)으로 시간 계산
      const durationSec = parseDurationToSeconds(row.durationText);
      if (durationSec <= 0) {
        return sum;
      }
      const exerciseMin = Math.max(1, Math.ceil(durationSec / 60));
      const hours = exerciseMin / 60.0;

      return sum + Math.round(met * userWeight * hours);
    }, 0);

    return totalCalories;
  };

  const handleDelete = async () => {
    if (!isEditMode || !editingRecord) return;
    if (!window.confirm("이 운동 기록을 삭제할까요?")) return;
    const userId = resolveUserId(user);
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const targetId = editingRecord.serverId ?? editingRecord.id;
    setIsDeleting(true);
    try {
      await deleteExercise(userId, targetId);
      window.dispatchEvent(
        new CustomEvent("exercise-records-updated", { detail: { userId } }),
      );
      onSaved?.();
      toast.success("운동 기록이 삭제되었습니다.");
      onClose();
    } catch (error) {
      toast.error(error.message || "운동 기록 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const userId = resolveUserId(user);
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const validationMessage = validateRows();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode) {
        const row = currentRows[0];
        // 기존 기록의 날짜는 유지하고, 사용자가 입력한 운동 시각을 반영
        const datePart = editingRecord.dateIso
          ? String(editingRecord.dateIso).slice(0, 10)
          : todayDateStr();
        const recordedAt = new Date(
          `${datePart}T${exerciseTime || nowHHmm()}:00`,
        );
        const payload = buildCreatePayload(activeTab, row, recordedAt);
        await updateExercise(
          userId,
          editingRecord.serverId ?? editingRecord.id,
          payload,
        );
        window.dispatchEvent(
          new CustomEvent("exercise-records-updated", { detail: { userId } }),
        );
        onSaved?.();
        toast.success("운동 기록이 수정되었습니다.");
        onClose();
        return;
      }

      // 선택한 날짜(없으면 오늘) + 사용자가 입력한 운동 시각
      const datePart = recordDate || todayDateStr();
      const baseDate = new Date(`${datePart}T${exerciseTime || nowHHmm()}:00`);

      await Promise.all(
        currentRows.map(async (row, index) => {
          const recordedAt = new Date(baseDate);
          recordedAt.setSeconds(recordedAt.getSeconds() + index);
          await createExercise(
            userId,
            buildCreatePayload(activeTab, row, recordedAt),
          );
        }),
      );

      onSaved?.();
      toast.success("운동 기록이 저장되었습니다.");
      onClose();
    } catch (error) {
      toast.error(
        error.message ||
          (isEditMode
            ? "운동 기록 수정에 실패했습니다."
            : "운동 기록 저장에 실패했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[785px] max-h-[calc(100vh-32px)] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] xl:h-[840px] xl:max-w-[760px] 2xl:h-[880px] 2xl:max-w-[820px]"
      >
        {/* 고정 상단 영역 */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="px-6 pb-5 pt-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">
                  {isEditMode ? "운동 기록 수정" : "운동 기록하기"}
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                  {isEditMode
                    ? "선택한 운동 기록을 수정합니다."
                    : "오늘의 노력을 정밀하게 기록하세요."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className="border-b border-[#F1F5F9] px-6 pb-4">
            <div className="grid grid-cols-2 rounded-2xl bg-[#F1F5F9] p-1.5">
              <button
                onClick={() => !isEditMode && setActiveTab("anaerobic")}
                disabled={isEditMode && activeTab !== "anaerobic"}
                className={`rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all ${
                  activeTab === "anaerobic"
                    ? "bg-white text-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
                    : "text-[#64748B]"
                } ${isEditMode ? "cursor-not-allowed opacity-60" : ""}`}
              >
                무산소
              </button>

              <button
                onClick={() => !isEditMode && setActiveTab("aerobic")}
                disabled={isEditMode && activeTab !== "aerobic"}
                className={`rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all ${
                  activeTab === "aerobic"
                    ? "bg-white text-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
                    : "text-[#64748B]"
                } ${isEditMode ? "cursor-not-allowed opacity-60" : ""}`}
              >
                유산소
              </button>
            </div>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 xl:px-8 xl:py-5">
          <div className="space-y-4">
            {/* 예상 소모 칼로리 카드 */}
            <div className="flex items-center gap-4 rounded-2xl border-l-4 border-blue-500 bg-gray-100/80 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-xl">🔥</span>
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-500">
                  예상 소모 칼로리
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {calculateExpectedCalorie()}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}kcal
                  </span>
                </p>
              </div>
            </div>

            {/* 운동 시각 */}
            <div className="flex gap-3 items-center">
              {timeEditing ? (
                <input
                  ref={timeInputRef}
                  type="text"
                  inputMode="numeric"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  onBlur={commitTimeEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitTimeEdit();
                    }
                    if (e.key === "Escape") setTimeEditing(false);
                  }}
                  placeholder="HH:MM"
                  className="rounded-[16px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1E293B] border-2 border-[#2563EB] shadow-sm outline-none w-[130px] tracking-wider"
                />
              ) : (
                <button
                  type="button"
                  onClick={startTimeEdit}
                  className="flex items-center gap-2 rounded-[16px] bg-[#F1F5F9] px-4 py-2.5 text-[13px] font-semibold text-[#64748B] border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-colors"
                >
                  <Clock className="h-4 w-4 text-[#2563EB]" />
                  {exerciseTime}
                </button>
              )}
            </div>

            {/* 세트별 상세 기록 */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">
                  세트별 상세 기록
                </label>

                <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-600">
                  기록 중
                </span>
              </div>

              <div className="space-y-3">
                {currentRows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="flex items-end gap-2">
                      {activeTab === "anaerobic" ? (
                        <>
                          <div className="flex-[2] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              운동 종류
                            </span>
                            <select
                              value={row.exerciseTypeId}
                              onChange={(event) =>
                                handleRowChange("anaerobic", row.id, {
                                  exerciseTypeId: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            >
                              {STRENGTH_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] text-gray-400">
                              세트
                            </span>
                            <select
                              value={row.exerciseSet}
                              onChange={(event) =>
                                handleRowChange("anaerobic", row.id, {
                                  exerciseSet: Number(event.target.value),
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-center"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-[2] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              중량 (KG)
                            </span>
                            <input
                              type="number"
                              placeholder="60"
                              value={row.weightKg}
                              onChange={(event) =>
                                handleRowChange("anaerobic", row.id, {
                                  weightKg: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            />
                          </div>

                          <div className="flex-[2] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              횟수 (REPS)
                            </span>
                            <input
                              type="number"
                              placeholder="12"
                              value={row.exerciseReps}
                              onChange={(event) =>
                                handleRowChange("anaerobic", row.id, {
                                  exerciseReps: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            />
                          </div>

                          <div className="flex-[3] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              시간
                            </span>
                            <input
                              type="text"
                              placeholder="13분30초"
                              value={row.durationText}
                              onChange={(event) =>
                                handleRowChange("anaerobic", row.id, {
                                  durationText: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-[2] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              운동 종류
                            </span>
                            <select
                              value={row.exerciseTypeId}
                              onChange={(event) =>
                                handleRowChange("aerobic", row.id, {
                                  exerciseTypeId: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            >
                              {CARDIO_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-[3] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              킬로미터
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="3KM"
                              value={row.distanceKm}
                              onChange={(event) =>
                                handleRowChange("aerobic", row.id, {
                                  distanceKm: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            />
                          </div>

                          <div className="flex-[3] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              시간
                            </span>
                            <input
                              type="text"
                              placeholder="13분30초"
                              value={row.durationText}
                              onChange={(event) =>
                                handleRowChange("aerobic", row.id, {
                                  durationText: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            />
                          </div>

                          <div className="flex-[2] space-y-1">
                            <span className="text-[10px] text-gray-400">
                              강도
                            </span>
                            <select
                              value={row.intensity}
                              onChange={(event) =>
                                handleRowChange("aerobic", row.id, {
                                  intensity: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                            >
                              <option value="낮음">낮음</option>
                              <option value="보통">보통</option>
                              <option value="높음">높음</option>
                            </select>
                          </div>
                        </>
                      )}

                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(activeTab, row.id)}
                          className="mb-0.5 p-2 text-red-400 transition-colors hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    {activeTab === "aerobic" &&
                      row.exerciseTypeId === "stair" && (
                        <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                          {STAIR_INTENSITY_HINT}
                        </p>
                      )}
                  </div>
                ))}
              </div>

              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => handleAddRow(activeTab)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-100 py-4 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
                >
                  <Plus size={18} />
                  추가하기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          {isEditMode ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="flex-1 rounded-[20px] border border-[#FCA5A5] bg-white py-5 text-lg font-bold text-[#DC2626] transition hover:bg-[#FEF2F2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || isDeleting || currentRows.length === 0}
                className="flex-1 rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "저장 중..." : "수정 완료"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || currentRows.length === 0}
              className="w-full rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "저장 중..."
                : `기록 저장 및 확인${currentRows.length > 0 ? ` (${currentRows.length})` : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;
