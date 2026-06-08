import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Search, X, Pill, PlusSquare } from "lucide-react-native";
import medicineApi from "../../api/medicineApi";

// 용법용량(dosage)에 섞여 오는 HTML/표 마크업을 제거하고 공백 정리
function stripHtml(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ") // 태그 제거
    .replace(/&[a-z]+;/gi, " ") // &nbsp; 등 엔티티 제거
    .replace(/\s+/g, " ")
    .trim();
}

// 식약처 의약품 API 응답(Medicine)을 모달 리스트 형태로 변환
function toMedicineItem(m) {
  const isOtc = m.etcOtcCode?.includes("일반"); // 일반의약품 = 상비약
  const cleanDosage = stripHtml(m.dosage);
  return {
    id: m.itemSeq,
    name: m.itemName,
    subText: m.etcOtcCode || m.efficacy?.slice(0, 20) || "",
    // 표 형태 용법용량은 너무 길어서 앞부분만 노출
    dosage: cleanDosage ? cleanDosage.slice(0, 40) : "-",
    type: isOtc ? "blue" : "orange",
  };
}

function MedicineIcon({ type }) {
  if (type === "blue") {
    return (
      <View className="w-10 h-10 rounded-xl bg-[#EEF4FF] items-center justify-center">
        <Pill size={16} color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="w-10 h-10 rounded-xl bg-[#FFF3E8] items-center justify-center">
      <PlusSquare size={16} color="#C2410C" />
    </View>
  );
}

export default function SearchMedicineModal({
  visible,
  onClose,
  onSelect,
}) {
  const [keyword, setKeyword] = useState("");
  const [medicineList, setMedicineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 모달이 닫히면 검색 결과를 초기 상태로 되돌린다
  useEffect(() => {
    if (!visible) {
      setKeyword("");
      setMedicineList([]);
      setError("");
      setLoading(false);
    }
  }, [visible]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await medicineApi.search(keyword.trim());
      // 백엔드가 단건을 반환하므로 배열로 감싼다
      const list = Array.isArray(data) ? data : [data];
      setMedicineList(list.map(toMedicineItem));
    } catch (e) {
      setError(
        e.response?.status === 404
          ? "해당 의약품을 찾을 수 없습니다."
          : "조회 중 오류가 발생했습니다."
      );
      setMedicineList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    onClose?.();
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
          className="w-full max-w-[760px] max-h-[85%] rounded-2xl bg-white overflow-hidden"
        >
          {/* 상단 */}
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-100">
            <View className="flex-row items-center gap-3">
              <Search size={20} color="#2563EB" />
              <Text className="text-[22px] font-semibold text-gray-800">
                검색
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <X size={20} color="#4B5563" />
            </Pressable>
          </View>

          <View className="px-6 py-6">
            {/* 검색 영역 */}
            <View className="mb-6">
              <Text className="text-[14px] font-semibold text-gray-600 mb-3">
                약물 이름 검색
              </Text>

              <View className="flex-row gap-2">
                <View className="relative flex-1 justify-center">
                  <View className="absolute left-4 z-10">
                    <Search size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    value={keyword}
                    onChangeText={setKeyword}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    placeholder="약물 이름을 입력하거나 선택하세요"
                    placeholderTextColor="#9CA3AF"
                    className="w-full h-[52px] rounded-xl bg-[#F6F7FB] border border-transparent pl-11 pr-4 text-[14px] text-gray-700"
                  />
                </View>
                <Pressable
                  onPress={handleSearch}
                  disabled={loading}
                  className={`h-[52px] px-6 rounded-xl bg-[#2563EB] items-center justify-center ${
                    loading ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-white text-[14px] font-semibold">
                    {loading ? "조회중..." : "검색"}
                  </Text>
                </Pressable>
              </View>

              {error ? (
                <Text className="mt-3 text-[13px] text-red-500">{error}</Text>
              ) : null}

              {/* 식약처 검색이 실패(키 미설정 등)하거나 결과가 없어도, 입력한 이름을 그대로 추가할 수 있게 한다 */}
              {keyword.trim() && !loading ? (
                <Pressable
                  onPress={() =>
                    handleSelect({
                      id: `manual-${keyword.trim()}`,
                      name: keyword.trim(),
                    })
                  }
                  className="mt-3"
                >
                  <Text className="text-[13px] font-semibold text-[#2563EB]">
                    검색 결과에 없나요? '{keyword.trim()}' 직접 추가하기
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* 복용 상세 정보 */}
            <View>
              <Text className="text-[14px] font-semibold text-gray-600 mb-3">
                복용 상세 정보
              </Text>

              <View className="rounded-2xl border border-gray-200 overflow-hidden">
                {/* 헤더 */}
                <View className="flex-row bg-[#F8FAFC] px-6 py-4 border-b border-gray-200">
                  <Text className="flex-[1.6] text-[12px] font-semibold text-gray-400">
                    이름
                  </Text>
                  <Text className="flex-[0.8] text-[12px] font-semibold text-gray-400 text-right">
                    용량 (MG/PILL)
                  </Text>
                </View>

                {/* 리스트 */}
                {medicineList.length === 0 ? (
                  <View className="px-6 py-10 items-center">
                    {loading ? (
                      <ActivityIndicator color="#2563EB" />
                    ) : (
                      <Text className="text-[14px] text-gray-400">
                        약물 이름을 검색해 주세요.
                      </Text>
                    )}
                  </View>
                ) : (
                  <FlatList
                    data={medicineList}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }) => (
                      <Pressable
                        onPress={() => handleSelect(item)}
                        className={`flex-row items-center px-6 py-5 ${
                          index !== medicineList.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <View className="flex-[1.6] flex-row items-center gap-4 min-w-0">
                          <MedicineIcon type={item.type} />
                          <View className="flex-1 min-w-0">
                            <Text
                              className="text-[16px] font-semibold text-gray-900"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text className="text-[13px] text-gray-500 mt-1">
                              {item.subText}
                            </Text>
                          </View>
                        </View>

                        <Text className="flex-[0.8] text-right text-[13px] font-semibold text-gray-700">
                          {item.dosage}
                        </Text>
                      </Pressable>
                    )}
                  />
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
