import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { Clock, Plus, Trash2, X } from "lucide-react-native";
import Dropdown from "../Dropdown";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "../../api/exerciseApi";
import {
  CARDIO_OPTIONS,
  STRENGTH_OPTIONS,
  INTENSITY_OPTIONS,
  STAIR_INTENSITY_HINT,
  aerobicMet,
  anaerobicMetByVolume,
  anaerobicVolume,
  buildCreatePayload,
  createAerobicRow,
  createAnaerobicRow,
  parseDurationToSeconds,
  recordToRow,
} from "../../lib/exerciseRecords";

const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

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

const SET_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  value: n,
  label: String(n),
}));

const INTENSITY_DROPDOWN = INTENSITY_OPTIONS.map((v) => ({
  value: v,
  label: v,
}));

const TYPE_LABEL = "text-[10px] text-gray-400";
const FIELD_INPUT =
  "w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-[#0F172A]";

function ExerciseModal({
  visible,
  onClose,
  onSaved,
  date,
  session,
  editTarget,
}) {
  const editingRecord = editTarget ?? session ?? null;
  const recordDate = date;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("anaerobic");
  const [anaerobicRows, setAnaerobicRows] = useState([]);
  const [aerobicRows, setAerobicRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exerciseTime, setExerciseTime] = useState("");
  const [timeEditing, setTimeEditing] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const isEditMode = !!editingRecord;

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (editingRecord) {
      const { kind, row } = recordToRow(editingRecord, nextId++);
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
  }, [visible, editingRecord]);

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
      return 0;
    }

    const totalCalories = rows.reduce((sum, row) => {
      const met =
        activeTab === "anaerobic"
          ? anaerobicMetByVolume(anaerobicVolume(row))
          : aerobicMet(row.exerciseTypeId, row.intensity);

      if (!met || met <= 0) {
        return sum;
      }

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
    const userId = resolveUserId(user);
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const targetId = editingRecord.serverId ?? editingRecord.id;
    setIsDeleting(true);
    try {
      await deleteExercise(userId, targetId);
      onSaved?.();
      toast.success("운동 기록이 삭제되었습니다.");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "운동 기록 삭제에 실패했습니다.",
      );
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
        onSaved?.();
        toast.success("운동 기록이 수정되었습니다.");
        onClose();
        return;
      }

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
        error?.response?.data?.message ||
          error?.message ||
          (isEditMode
            ? "운동 기록 수정에 실패했습니다."
            : "운동 기록 저장에 실패했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderRow = (row) => (
    <View
      key={row.id}
      className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
    >
      <View className="flex-row flex-wrap items-end gap-2">
        {activeTab === "anaerobic" ? (
          <>
            <View className="flex-[2] gap-1">
              <Text className={TYPE_LABEL}>운동 종류</Text>
              <Dropdown
                value={row.exerciseTypeId}
                onChange={(value) =>
                  handleRowChange("anaerobic", row.id, {
                    exerciseTypeId: value,
                  })
                }
                options={STRENGTH_OPTIONS}
                heightClass="h-10"
              />
            </View>

            <View className="flex-1 gap-1">
              <Text className={TYPE_LABEL}>세트</Text>
              <Dropdown
                value={row.exerciseSet}
                onChange={(value) =>
                  handleRowChange("anaerobic", row.id, {
                    exerciseSet: Number(value),
                  })
                }
                options={SET_OPTIONS}
                heightClass="h-10"
              />
            </View>

            <View className="flex-[2] gap-1">
              <Text className={TYPE_LABEL}>중량 (KG)</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="#94A3B8"
                value={String(row.weightKg ?? "")}
                onChangeText={(value) =>
                  handleRowChange("anaerobic", row.id, { weightKg: value })
                }
                className={FIELD_INPUT}
              />
            </View>

            <View className="flex-[2] gap-1">
              <Text className={TYPE_LABEL}>횟수 (REPS)</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="12"
                placeholderTextColor="#94A3B8"
                value={String(row.exerciseReps ?? "")}
                onChangeText={(value) =>
                  handleRowChange("anaerobic", row.id, { exerciseReps: value })
                }
                className={FIELD_INPUT}
              />
            </View>

            <View className="flex-[3] gap-1">
              <Text className={TYPE_LABEL}>시간</Text>
              <TextInput
                placeholder="13분30초"
                placeholderTextColor="#94A3B8"
                value={String(row.durationText ?? "")}
                onChangeText={(value) =>
                  handleRowChange("anaerobic", row.id, { durationText: value })
                }
                className={FIELD_INPUT}
              />
            </View>
          </>
        ) : (
          <>
            <View className="flex-[2] gap-1">
              <Text className={TYPE_LABEL}>운동 종류</Text>
              <Dropdown
                value={row.exerciseTypeId}
                onChange={(value) =>
                  handleRowChange("aerobic", row.id, { exerciseTypeId: value })
                }
                options={CARDIO_OPTIONS}
                heightClass="h-10"
              />
            </View>

            <View className="flex-[3] gap-1">
              <Text className={TYPE_LABEL}>킬로미터</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="3KM"
                placeholderTextColor="#94A3B8"
                value={String(row.distanceKm ?? "")}
                onChangeText={(value) =>
                  handleRowChange("aerobic", row.id, { distanceKm: value })
                }
                className={FIELD_INPUT}
              />
            </View>

            <View className="flex-[3] gap-1">
              <Text className={TYPE_LABEL}>시간</Text>
              <TextInput
                placeholder="13분30초"
                placeholderTextColor="#94A3B8"
                value={String(row.durationText ?? "")}
                onChangeText={(value) =>
                  handleRowChange("aerobic", row.id, { durationText: value })
                }
                className={FIELD_INPUT}
              />
            </View>

            <View className="flex-[2] gap-1">
              <Text className={TYPE_LABEL}>강도</Text>
              <Dropdown
                value={row.intensity}
                onChange={(value) =>
                  handleRowChange("aerobic", row.id, { intensity: value })
                }
                options={INTENSITY_DROPDOWN}
                heightClass="h-10"
              />
            </View>
          </>
        )}

        {!isEditMode && (
          <Pressable
            onPress={() => handleRemoveRow(activeTab, row.id)}
            className="mb-0.5 p-2"
          >
            <Trash2 size={20} color="#F87171" />
          </Pressable>
        )}
      </View>
      {activeTab === "aerobic" && row.exerciseTypeId === "stair" && (
        <Text className="mt-2 text-[11px] leading-relaxed text-gray-400">
          {STAIR_INTENSITY_HINT}
        </Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#0f172a]/40 px-4 py-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="flex max-h-[90%] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white"
        >
          {/* 고정 상단 영역 */}
          <View className="shrink-0">
            {/* 헤더 */}
            <View className="px-6 pb-5 pt-7">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-[24px] font-bold leading-tight text-[#0F172A]">
                    {isEditMode ? "운동 기록 수정" : "운동 기록하기"}
                  </Text>
                  <Text className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                    {isEditMode
                      ? "선택한 운동 기록을 수정합니다."
                      : "오늘의 노력을 정밀하게 기록하세요."}
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  accessibilityLabel="닫기"
                  className="h-9 w-9 shrink-0 items-center justify-center rounded-full"
                >
                  <X size={18} color="#94A3B8" strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>

            {/* 탭 */}
            <View className="border-b border-[#F1F5F9] px-6 pb-4">
              <View className="flex-row rounded-2xl bg-[#F1F5F9] p-1.5">
                <Pressable
                  onPress={() => !isEditMode && setActiveTab("anaerobic")}
                  disabled={isEditMode && activeTab !== "anaerobic"}
                  className={`flex-1 items-center rounded-xl px-2 py-2.5 ${
                    activeTab === "anaerobic" ? "bg-white" : ""
                  } ${isEditMode ? "opacity-60" : ""}`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      activeTab === "anaerobic"
                        ? "text-[#2563EB]"
                        : "text-[#64748B]"
                    }`}
                  >
                    무산소
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => !isEditMode && setActiveTab("aerobic")}
                  disabled={isEditMode && activeTab !== "aerobic"}
                  className={`flex-1 items-center rounded-xl px-2 py-2.5 ${
                    activeTab === "aerobic" ? "bg-white" : ""
                  } ${isEditMode ? "opacity-60" : ""}`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      activeTab === "aerobic"
                        ? "text-[#2563EB]"
                        : "text-[#64748B]"
                    }`}
                  >
                    유산소
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 스크롤 영역 */}
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 py-4"
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-4">
              {/* 예상 소모 칼로리 카드 */}
              <View className="flex-row items-center gap-4 rounded-2xl border-l-4 border-blue-500 bg-gray-100/80 p-5">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-xl">🔥</Text>
                </View>

                <View>
                  <Text className="text-[11px] font-medium text-gray-500">
                    예상 소모 칼로리
                  </Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {calculateExpectedCalorie()}
                    <Text className="text-sm font-normal text-gray-500">
                      {" "}
                      kcal
                    </Text>
                  </Text>
                </View>
              </View>

              {/* 운동 시각 */}
              <View className="flex-row items-center gap-3">
                {timeEditing ? (
                  <TextInput
                    autoFocus
                    keyboardType="numeric"
                    value={timeInput}
                    onChangeText={setTimeInput}
                    onBlur={commitTimeEdit}
                    onSubmitEditing={commitTimeEdit}
                    placeholder="HH:MM"
                    placeholderTextColor="#94A3B8"
                    className="w-[130px] rounded-[16px] border-2 border-[#2563EB] bg-white px-4 py-2.5 text-[13px] font-semibold tracking-wider text-[#1E293B]"
                  />
                ) : (
                  <Pressable
                    onPress={startTimeEdit}
                    className="flex-row items-center gap-2 rounded-[16px] border border-[#E2E8F0] bg-[#F1F5F9] px-4 py-2.5"
                  >
                    <Clock size={16} color="#2563EB" />
                    <Text className="text-[13px] font-semibold text-[#64748B]">
                      {exerciseTime}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* 세트별 상세 기록 */}
              <View>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-gray-500">
                    세트별 상세 기록
                  </Text>

                  <View className="rounded-md bg-blue-100 px-2 py-1">
                    <Text className="text-[10px] font-bold text-blue-600">
                      기록 중
                    </Text>
                  </View>
                </View>

                <View className="gap-3">{currentRows.map(renderRow)}</View>

                {!isEditMode && (
                  <Pressable
                    onPress={() => handleAddRow(activeTab)}
                    className="mt-4 w-full flex-row items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4"
                  >
                    <Plus size={18} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-500">
                      추가하기
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>

          {/* 고정 하단 버튼 */}
          <View className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
            {isEditMode ? (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleDelete}
                  disabled={isDeleting || isSaving}
                  className={`flex-1 items-center rounded-[20px] border border-[#FCA5A5] bg-white py-5 ${
                    isDeleting || isSaving ? "opacity-60" : ""
                  }`}
                >
                  <Text className="text-lg font-bold text-[#DC2626]">
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={isSaving || isDeleting || currentRows.length === 0}
                  className={`flex-1 items-center rounded-[20px] bg-[#1a1a2e] py-5 ${
                    isSaving || isDeleting || currentRows.length === 0
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <Text className="text-lg font-bold text-white">
                    {isSaving ? "저장 중..." : "수정 완료"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleSubmit}
                disabled={isSaving || currentRows.length === 0}
                className={`w-full items-center rounded-[20px] bg-[#1a1a2e] py-5 ${
                  isSaving || currentRows.length === 0 ? "opacity-60" : ""
                }`}
              >
                <Text className="text-lg font-bold text-white">
                  {isSaving
                    ? "저장 중..."
                    : `기록 저장 및 확인${
                        currentRows.length > 0 ? ` (${currentRows.length})` : ""
                      }`}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}

export default ExerciseModal;
