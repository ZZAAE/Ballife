import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Trash2, X } from "lucide-react-native";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";
import medicineApi from "../../api/medicineApi";

// 처방전 상세 — 같은 group/id 의 약 목록을 동일 fetch API(getUserMedicine)로 불러온다.
// props: { visible, onClose, onSaved, group }
//   group: { id|prescriptionId, groupName, medicines? }  (medicine.jsx 의 처방 그룹)
export default function PrescriptionDetailModal({
  visible,
  onClose,
  onSaved,
  group,
}) {
  const prescriptionId = group?.prescriptionId ?? group?.id ?? null;

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 모달이 열리고 처방전 id 가 있으면 약 목록을 fetch (group.medicines 가 있으면 우선 표시)
  useEffect(() => {
    if (!visible || prescriptionId == null) {
      setMedicines([]);
      return;
    }
    let cancelled = false;
    (async () => {
      // 부모가 이미 가지고 있는 약 목록을 먼저 보여준다
      if (Array.isArray(group?.medicines) && group.medicines.length > 0) {
        setMedicines(group.medicines);
      }
      setLoading(true);
      try {
        const { data } = await medicineApi.getUserMedicine(prescriptionId);
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setMedicines(
            list.map((m) => ({
              id: m.userMedicationId ?? m.id,
              name: m.medicineName || m.name || "이름 없음",
              purpose: m.purpose || "",
              dosageText: m.dosageText || m.dosage || "",
            }))
          );
        }
      } catch {
        // 실패 시 부모가 준 목록 유지
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, prescriptionId]);

  // 처방전 전체 삭제 (window.confirm → Alert.alert)
  const handleDeletePrescription = () => {
    if (prescriptionId == null) return;
    Alert.alert(
      "처방전 삭제",
      `[${group?.groupName ?? ""}] 처방전을 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await medicineApi.deletePrescription(prescriptionId);
              toast.success("처방전이 삭제되었습니다.");
              onSaved?.();
              onClose?.();
            } catch (err) {
              toast.error(
                err.response?.data?.message || "삭제 중 오류가 발생했습니다."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/30 items-center justify-center px-4 py-6"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[900px] max-h-[90%] rounded-2xl bg-[#F3F4F6] overflow-hidden"
        >
          {/* 헤더 */}
          <View className="flex-row items-start justify-between px-6 pt-7 pb-5">
            <View className="flex-1 pr-3">
              <Text className="text-[24px] font-semibold text-gray-700">
                나의 [{group?.groupName ?? ""}] 처방 목록
              </Text>
              <Text className="mt-2 text-[14px] text-gray-400">
                총 {medicines.length}개의 약이 처방되어 있습니다.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
            >
              <X size={20} color="#4B5563" />
            </Pressable>
          </View>

          {/* 본문 */}
          <ScrollView className="px-6 pb-4">
            {loading && medicines.length === 0 ? (
              <View className="bg-white rounded-2xl px-5 py-12 items-center">
                <ActivityIndicator color="#2563EB" />
              </View>
            ) : medicines.length === 0 ? (
              <View className="bg-white rounded-2xl px-5 py-12">
                <Text className="text-center text-[15px] text-gray-400">
                  처방된 약이 없습니다.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {medicines.map((medicine) => (
                  <View
                    key={String(medicine.id)}
                    className="bg-white rounded-2xl px-5 py-5 gap-2"
                  >
                    <Text className="text-[18px] font-semibold text-gray-800">
                      {medicine.name}
                    </Text>
                    {medicine.purpose ? (
                      <Text className="text-[15px] text-gray-700">
                        {medicine.purpose}
                      </Text>
                    ) : null}
                    {medicine.dosageText ? (
                      <Text className="text-[15px] text-gray-700">
                        {medicine.dosageText}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* 푸터 - 처방전 삭제 */}
          <View className="px-6 py-4 flex-row justify-end border-t border-gray-200 bg-[#F3F4F6]">
            <Pressable
              onPress={handleDeletePrescription}
              disabled={deleting || prescriptionId == null}
              className={`h-10 px-5 rounded-xl bg-white border border-red-200 flex-row items-center gap-1.5 ${
                deleting || prescriptionId == null ? "opacity-50" : ""
              }`}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text className="text-[13px] font-medium text-red-500">
                {deleting ? "삭제 중..." : "처방전 삭제"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
