import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Plus, Trash2, X, Camera, ImagePlus } from "lucide-react-native";
import Dropdown from "../Dropdown";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";
import medicineApi from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";
import { pickFromGallery, takePhoto, toFormFile } from "../../lib/pickImage";
import SearchMedicineModal from "./SearchMedicineModal";

// 복용 시간대 옵션 (medicine.jsx SCHEDULE_SLOTS 와 동일한 키워드)
const INTERVAL_OPTIONS = [
  { label: "아침", value: "아침" },
  { label: "점심", value: "점심" },
  { label: "저녁", value: "저녁" },
  { label: "취침전", value: "취침전" },
  { label: "아침 · 저녁", value: "아침,저녁" },
  { label: "아침 · 점심 · 저녁", value: "아침,점심,저녁" },
];

// 오늘 날짜 YYYY-MM-DD
const todayDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ──────────────────────────────────────────────────────────────────────────
 * 처방전 등록 모달 (OCR/파일 업로드 부분은 RN 포팅에서 제외 — 수동 입력만 유지)
 *  props: { visible, onClose, onSaved }
 * ──────────────────────────────────────────────────────────────────────── */
export default function PrescriptionRegisterModal({ visible, onClose, onSaved }) {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const [groupName, setGroupName] = useState("");
  const [memo, setMemo] = useState("");
  const [intakeIntervals, setIntakeIntervals] = useState("아침");
  const [dosage, setDosage] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  // 처방전 사진(촬영/갤러리) → OCR → 약 이름 추출 → 목록에 추가
  const handleOcr = async (source) => {
    if (ocrLoading) return;
    try {
      const img =
        source === "camera" ? await takePhoto() : await pickFromGallery();
      if (!img) return;
      setOcrLoading(true);
      const formData = toFormFile(img, "image");
      const res = await medicineApi.ocrScan(formData);
      const data = res?.data;
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.medicines)
          ? data.medicines
          : [];
      const names = arr
        .map((it) => (typeof it === "string" ? it : it?.medicineName))
        .filter(Boolean);
      if (names.length === 0) {
        toast.error("사진에서 약 이름을 찾지 못했어요. 직접 추가해주세요.");
        return;
      }
      setMedicines((prev) => {
        const existing = new Set(prev.map((m) => m.name));
        const added = names
          .filter((n) => !existing.has(n))
          .map((n, i) => ({
            id: `ocr-${Date.now()}-${i}`,
            name: n,
            category: "",
            dosage: "",
          }));
        return [...prev, ...added];
      });
      toast.success(`처방전에서 약 ${names.length}건 인식됨`);
    } catch (err) {
      toast.error(err.message || "OCR 처리 중 오류가 발생했습니다.");
    } finally {
      setOcrLoading(false);
    }
  };

  const resetAndClose = () => {
    setGroupName("");
    setMemo("");
    setIntakeIntervals("아침");
    setDosage("");
    setMedicines([]);
    setSubmitting(false);
    onClose?.();
  };

  const handleDeleteRow = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // SearchMedicineModal 에서 약 선택 → 목록에 추가
  const handleSelectMedicine = (item) => {
    setMedicines((prev) => [
      ...prev,
      {
        id: item.id ?? Date.now(),
        name: item.name || "",
        category: item.subText || "",
        dosage: item.dosage && item.dosage !== "-" ? item.dosage : "",
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast.error("처방 그룹 이름을 입력해주세요.");
      return;
    }
    if (medicines.length === 0) {
      toast.error("약을 1개 이상 추가해주세요.");
      return;
    }

    setSubmitting(true);

    // medicineApi.registerMedicine payload 형태:
    // { userId, prescriptionName, prescriptionDate, memo, intakeIntervals, dosage, medicines: [{ medicineName }] }
    const payload = {
      userId,
      prescriptionName: groupName.trim(),
      prescriptionDate: todayDate(),
      memo: memo.trim(),
      intakeIntervals,
      dosage: dosage.trim(),
      medicines: medicines.map((m) => ({ medicineName: m.name })),
    };

    try {
      const { data } = await medicineApi.registerMedicine(payload);
      toast.success("처방전이 등록되었습니다.");
      onSaved?.(data);
      resetAndClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "저장 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/30 items-center justify-center px-4"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] max-h-[92%] bg-white rounded-2xl overflow-hidden"
        >
          {/* 헤더 */}
          <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
            <Text className="text-[17px] font-semibold text-gray-800">
              처방전 등록
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <X size={16} color="#6B7280" />
            </Pressable>
          </View>

          {/* 본문 (스크롤) */}
          <ScrollView className="px-6 pb-4" keyboardShouldPersistTaps="handled">
            <View className="gap-5 pb-2">
              {/* 처방전 사진으로 약 자동 추가 (OCR) */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  처방전 사진으로 약 추가
                </Text>
                {ocrLoading ? (
                  <View className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#EEF2FF]">
                    <ActivityIndicator size="small" color="#4338CA" />
                    <Text className="text-[13px] font-semibold text-[#4338CA]">
                      처방전 분석 중...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleOcr("camera")}
                      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#EEF2FF]"
                    >
                      <Camera size={16} color="#4338CA" />
                      <Text className="text-[13px] font-semibold text-[#4338CA]">
                        촬영
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleOcr("gallery")}
                      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#EEF2FF]"
                    >
                      <ImagePlus size={16} color="#4338CA" />
                      <Text className="text-[13px] font-semibold text-[#4338CA]">
                        갤러리
                      </Text>
                    </Pressable>
                  </View>
                )}
                <Text className="mt-1 text-[11px] text-[#94A3B8]">
                  처방전을 찍거나 올리면 약 이름이 자동 추가됩니다.
                </Text>
              </View>

              {/* 처방 그룹 이름 */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  처방 그룹 이름
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="예: 혈압약"
                  placeholderTextColor="#9CA3AF"
                  className="h-11 px-4 rounded-xl bg-gray-100 text-[14px] font-medium text-gray-800"
                />
              </View>

              {/* 복용 시간대 */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  복용 시간대
                </Text>
                <Dropdown
                  value={intakeIntervals}
                  onChange={setIntakeIntervals}
                  options={INTERVAL_OPTIONS}
                  placeholder="복용 시간대 선택"
                  heightClass="h-11"
                />
              </View>

              {/* 복용량 */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  복용량
                </Text>
                <TextInput
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="예: 1정"
                  placeholderTextColor="#9CA3AF"
                  className="h-11 px-4 rounded-xl bg-gray-100 text-[14px] text-gray-700"
                />
              </View>

              {/* 메모 */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  메모
                </Text>
                <TextInput
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="메모 입력..."
                  placeholderTextColor="#9CA3AF"
                  className="h-11 px-4 rounded-xl bg-gray-100 text-[14px] text-gray-700"
                />
              </View>

              {/* 복약 상세 정보 */}
              <View>
                <Text className="text-[13px] font-medium text-gray-700 mb-2">
                  복약 상세 정보
                </Text>
                <View className="rounded-xl border border-gray-100 overflow-hidden">
                  {/* 테이블 헤더 */}
                  <View className="flex-row px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <Text className="flex-1 text-[11px] font-medium text-gray-400">
                      이름
                    </Text>
                    <Text className="w-[110px] text-[11px] font-medium text-gray-400 text-right">
                      용량 (MG/PILL)
                    </Text>
                    <Text className="w-[40px] text-[11px] font-medium text-gray-400 text-center">
                      관리
                    </Text>
                  </View>

                  {/* 약품 행 */}
                  {medicines.length === 0 ? (
                    <View className="px-4 py-8 items-center">
                      <Text className="text-[13px] text-gray-400">
                        아직 등록된 약품이 없습니다.
                      </Text>
                    </View>
                  ) : (
                    medicines.map((medicine, idx) => (
                      <View
                        key={String(medicine.id)}
                        className={`flex-row items-center px-4 py-3 ${
                          idx !== medicines.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <View className="flex-1 min-w-0 pr-2">
                          <Text
                            className="text-[14px] font-semibold text-gray-800"
                            numberOfLines={1}
                          >
                            {medicine.name}
                          </Text>
                          {medicine.category ? (
                            <Text
                              className="text-[11px] text-gray-400"
                              numberOfLines={1}
                            >
                              {medicine.category}
                            </Text>
                          ) : null}
                        </View>

                        <Text
                          className="w-[110px] text-[13px] text-gray-700 text-right"
                          numberOfLines={1}
                        >
                          {medicine.dosage || "-"}
                        </Text>

                        <Pressable
                          onPress={() => handleDeleteRow(medicine.id)}
                          hitSlop={6}
                          className="w-[40px] items-center"
                        >
                          <Trash2 size={16} color="#F87171" />
                        </Pressable>
                      </View>
                    ))
                  )}

                  {/* 약 추가하기 (검색 모달) */}
                  <Pressable
                    onPress={() => setSearchOpen(true)}
                    className="py-3 flex-row items-center justify-center gap-1.5 border-t border-gray-100"
                  >
                    <Plus size={14} color="#2563EB" />
                    <Text className="text-[13px] text-[#2563EB]">
                      약 추가하기
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 푸터 */}
          <View className="px-6 py-4 flex-row justify-end border-t border-gray-100">
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`h-10 px-6 rounded-xl bg-gray-900 items-center justify-center ${
                submitting ? "opacity-50" : ""
              }`}
            >
              <Text className="text-white text-[13px] font-medium">
                {submitting ? "저장 중..." : "저장하기"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      {/* 약 검색 모달 */}
      <SearchMedicineModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectMedicine}
      />
          <Toast />
    </Modal>
  );
}
