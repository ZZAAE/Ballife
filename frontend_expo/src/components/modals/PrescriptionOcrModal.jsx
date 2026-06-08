import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { X, ImagePlus, Trash2, Plus } from "lucide-react-native";
import medicineApi from "../../api/medicineApi";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { pickFromGallery, takePhoto, toFormFile } from "../../lib/pickImage";
import SearchMedicineModal from "./SearchMedicineModal";

/*
 * 처방전 OCR 등록 모달 (RN 포팅 — web prescriptionOcrTestModal.jsx).
 *
 * 흐름 (웹과 동일):
 *  1) 이미지 선택(갤러리/촬영) → toFormFile(img, "image") 로 FormData 구성
 *  2) medicineApi.ocrScan(formData) → POST /api/ocr (multipart "image")
 *     응답: [{ medicineName }, ...] 또는 { medicines: [...] } → 약 이름 목록 추출
 *  3) 사용자가 약 목록 확인/수정(약 추가·삭제) + 처방전 이름/메모/복용시간대 입력
 *  4) medicineApi.registerMedicine(payload) 로 처방전 등록
 *     payload: { userId, prescriptionName, prescriptionDate, memo,
 *                intakeIntervals, medicines: [{ medicineName }], pCategory: "MEDICINE" }
 *
 * 단순화: 수정 모드(isEdit/updateMedicine)는 제외 — 신규 등록 전용.
 */

// 복용 시간대 옵션 (이 순서대로 intakeIntervals 문자열 구성)
const INTAKE_OPTIONS = ["아침", "점심", "저녁", "취침전"];
const DEFAULT_INTAKE_INTERVALS = ["아침", "점심", "저녁"];

const todayDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function PrescriptionOcrModal({ visible, onClose, onSaved }) {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const [preview, setPreview] = useState(null); // 선택한 이미지 미리보기 URI
  const [medicineNames, setMedicineNames] = useState([]); // OCR 추출 약이름 목록
  const [loading, setLoading] = useState(false); // OCR 진행 중
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false); // 약 수동 추가 검색 모달
  const [prescriptionName, setPrescriptionName] = useState("");
  const [memo, setMemo] = useState("");
  const [intakeIntervals, setIntakeIntervals] = useState(DEFAULT_INTAKE_INTERVALS);
  const [submitting, setSubmitting] = useState(false);

  // 닫으면서 입력 초기화 (다시 열 때 깨끗한 상태)
  const handleClose = () => {
    setPreview(null);
    setMedicineNames([]);
    setLoading(false);
    setError("");
    setSearchOpen(false);
    setPrescriptionName("");
    setMemo("");
    setIntakeIntervals(DEFAULT_INTAKE_INTERVALS);
    setSubmitting(false);
    onClose?.();
  };

  // 이미지에서 약 이름 추출 (웹 handleFileChange 대응)
  const runOcr = async (img) => {
    setPreview(img.uri);
    setError("");
    setMedicineNames([]);
    setLoading(true);
    try {
      // toFormFile(img, "image") → 백엔드 @RequestParam("image") MultipartFile 와 동일
      const formData = toFormFile(img, "image");
      const res = await medicineApi.ocrScan(formData);
      const data = res.data;
      // 응답: [{ medicineName }, ...] 또는 { medicines: [...] }
      const list = Array.isArray(data) ? data : data?.medicines ?? [];
      const names = list
        .map((item) => (typeof item === "string" ? item : item.medicineName))
        .filter(Boolean);
      setMedicineNames(names);
    } catch (err) {
      console.error("OCR 요청 실패", err);
      setError("약이름을 가져오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickGallery = async () => {
    try {
      const img = await pickFromGallery();
      if (img) await runOcr(img);
    } catch (err) {
      toast.error(err.message || "사진을 불러오지 못했습니다.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const img = await takePhoto();
      if (img) await runOcr(img);
    } catch (err) {
      toast.error(err.message || "사진을 촬영하지 못했습니다.");
    }
  };

  const handleRemoveMedicine = (targetIdx) => {
    setMedicineNames((prev) => prev.filter((_, idx) => idx !== targetIdx));
  };

  // 복용 시간대 토글 (INTAKE_OPTIONS 순서 유지)
  const handleToggleInterval = (option) => {
    setIntakeIntervals((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : INTAKE_OPTIONS.filter((o) => prev.includes(o) || o === option),
    );
  };

  // SearchMedicineModal 에서 선택한 약을 목록 맨 앞에 추가 (중복 무시)
  const handleAddMedicine = (item) => {
    const name = typeof item === "string" ? item : item?.name;
    if (!name) {
      toast.error("약 이름을 가져오지 못했습니다.");
      return;
    }
    const exists = medicineNames.includes(name);
    setMedicineNames((prev) => (prev.includes(name) ? prev : [name, ...prev]));
    setSearchOpen(false);
    if (exists) toast.error("이미 추가된 약입니다.");
    else toast.success(`'${name}' 추가됨`);
  };

  // 등록
  const handleRegister = async () => {
    if (!prescriptionName.trim()) {
      toast.error("처방전 이름을 비워둘 수 없습니다.");
      return;
    }
    if (medicineNames.length === 0) {
      toast.error("등록할 약이 없습니다.");
      return;
    }

    setSubmitting(true);
    // 백엔드 intakeIntervals 는 "아침,점심,저녁" 콤마 문자열
    const payload = {
      userId,
      prescriptionName: prescriptionName.trim(),
      prescriptionDate: todayDate(),
      memo: memo.trim(),
      intakeIntervals: intakeIntervals.join(","),
      medicines: medicineNames.map((name) => ({ medicineName: name })),
      pCategory: "MEDICINE",
    };

    try {
      const { data } = await medicineApi.registerMedicine(payload);
      toast.success("처방전이 등록되었습니다.");
      onSaved?.(data);
      handleClose();
    } catch (err) {
      console.error("처방전 등록 실패", err);
      toast.error(
        err.response?.data?.message || "처방전 등록에 실패했습니다.",
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
      onRequestClose={handleClose}
    >
      {/* 백드롭 — 누르면 닫힘 */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/45 px-4"
        onPress={handleClose}
      >
        {/* 카드 — 내부 터치는 전파 차단 */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[520px] rounded-3xl bg-white"
          style={{ maxHeight: "92%" }}
        >
          {/* 헤더 */}
          <View className="flex-row items-start justify-between px-6 pt-6 pb-2">
            <View className="flex-1 pr-2">
              <Text className="text-[22px] font-bold text-[#1B1F2A]">
                처방전 등록
              </Text>
              <Text className="mt-1.5 text-[14px] text-[#94A3B8]">
                처방전 이미지를 올리면 약 이름을 자동으로 추출해드려요.
              </Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={8} className="p-1">
              <X size={20} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView
            className="px-6"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* 이미지 영역 */}
            <View
              className="mt-2 h-[140px] items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[#D5DCE6] bg-[#F6F8FB]"
            >
              {preview ? (
                <Image
                  source={{ uri: preview }}
                  className="h-full w-full"
                  resizeMode="contain"
                />
              ) : (
                <>
                  <ImagePlus size={36} color="#94A3B8" />
                  <Text className="mt-2 text-[15px] font-medium text-[#64748B]">
                    처방전 이미지를 선택하세요
                  </Text>
                </>
              )}
            </View>

            {/* 이미지 선택 버튼 (갤러리 / 촬영) */}
            <View className="mt-3 flex-row gap-2.5">
              <Pressable
                onPress={handlePickGallery}
                disabled={loading}
                className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#EFF6FF] ${
                  loading ? "opacity-60" : ""
                }`}
              >
                <ImagePlus size={16} color="#2563EB" />
                <Text className="text-[13px] font-semibold text-[#2563EB]">
                  갤러리
                </Text>
              </Pressable>
              <Pressable
                onPress={handleTakePhoto}
                disabled={loading}
                className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#EFF6FF] ${
                  loading ? "opacity-60" : ""
                }`}
              >
                <ImagePlus size={16} color="#2563EB" />
                <Text className="text-[13px] font-semibold text-[#2563EB]">
                  촬영
                </Text>
              </Pressable>
            </View>

            {/* 처방전 이름 */}
            <View className="mt-4">
              <Text className="mb-1.5 text-[14px] font-semibold text-[#1B1F2A]">
                처방전 이름
              </Text>
              <TextInput
                value={prescriptionName}
                onChangeText={setPrescriptionName}
                placeholder="예: 5월 정기 처방"
                placeholderTextColor="#94A3B8"
                className="h-11 rounded-xl border border-[#E8ECF1] bg-[#F6F8FB] px-3.5 text-[14px] text-[#1B1F2A]"
              />
            </View>

            {/* 메모 */}
            <View className="mt-4">
              <Text className="mb-1.5 text-[14px] font-semibold text-[#1B1F2A]">
                메모
              </Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="처방전에 대한 간단한 메모를 남겨보세요."
                placeholderTextColor="#94A3B8"
                multiline
                className="min-h-[56px] rounded-xl border border-[#E8ECF1] bg-[#F6F8FB] px-3.5 py-2.5 text-[14px] text-[#1B1F2A]"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* 복용 시간대 */}
            <View className="mt-4">
              <Text className="mb-1.5 text-[14px] font-semibold text-[#1B1F2A]">
                복용 시간대
              </Text>
              <View className="flex-row gap-2">
                {INTAKE_OPTIONS.map((option) => {
                  const checked = intakeIntervals.includes(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleToggleInterval(option)}
                      className={`flex-1 items-center rounded-xl border py-2.5 ${
                        checked
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#E8ECF1] bg-[#F6F8FB]"
                      }`}
                    >
                      <Text
                        className={`text-[14px] font-semibold ${
                          checked ? "text-[#2563EB]" : "text-[#64748B]"
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 약이름 목록 */}
            <View className="mt-4 rounded-[20px] border border-[#E8ECF1] bg-[#F6F8FB] p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-semibold text-[#1B1F2A]">
                  약이름 목록
                </Text>
                <Pressable
                  onPress={() => setSearchOpen(true)}
                  className="flex-row items-center gap-1 rounded-full border border-[#2563EB] bg-white px-2.5 py-1"
                >
                  <Plus size={14} color="#2563EB" />
                  <Text className="text-[12px] font-semibold text-[#2563EB]">
                    약 추가
                  </Text>
                </Pressable>
              </View>

              {loading ? (
                <View className="flex-row items-center justify-center gap-2 py-8">
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text className="text-[14px] text-[#94A3B8]">
                    약이름 추출 중...
                  </Text>
                </View>
              ) : error ? (
                <View className="py-8">
                  <Text className="text-center text-[14px] text-[#EF4444]">
                    {error}
                  </Text>
                </View>
              ) : medicineNames.length > 0 ? (
                <View className="mt-3 gap-2">
                  {medicineNames.map((name, idx) => (
                    <View
                      key={`${name}-${idx}`}
                      className="flex-row items-center justify-between rounded-xl border border-[#ECEFF3] bg-white px-3.5 py-3"
                    >
                      <Text
                        className="flex-1 pr-2 text-[14px] font-medium text-[#1B1F2A]"
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <Pressable
                        onPress={() => handleRemoveMedicine(idx)}
                        hitSlop={6}
                        className="p-1"
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8">
                  <Text className="text-center text-[14px] text-[#A5B0C0]">
                    이미지를 넣으면 약이름이 표시됩니다.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 등록 버튼 */}
          <View className="px-6 py-4">
            <Pressable
              onPress={handleRegister}
              disabled={submitting}
              className={`h-12 flex-row items-center justify-center rounded-xl bg-[#2563EB] ${
                submitting ? "opacity-60" : ""
              }`}
            >
              {submitting && (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-[15px] font-bold text-white">
                {submitting ? "등록 중..." : "등록"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      {/* 약 수동 추가 검색 모달 */}
      <SearchMedicineModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddMedicine}
      />
          <Toast />
    </Modal>
  );
}
