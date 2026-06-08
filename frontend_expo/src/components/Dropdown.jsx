import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

/**
 * 크로스플랫폼 셀렉트.
 * @react-native-picker/picker 는 iOS 에서 인라인 휠(약 216px)이라 좁은 박스에
 * 갇히면 사용 불가 → Pressable + Modal 목록 방식으로 대체.
 *
 * props:
 *  - value: 현재 선택 값
 *  - onChange(value): 선택 시 호출
 *  - options: [{ label, value }]
 *  - placeholder: 미선택 시 표시 문구
 *  - error: true 면 빨간 테두리
 *  - disabled
 *  - heightClass: 트리거 높이 (기본 h-12)
 */
export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = "선택",
  error = false,
  disabled = false,
  heightClass = "h-12",
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`${heightClass} flex-row items-center justify-between rounded-lg border bg-gray-100 px-4 ${
          error ? "border-red-400 bg-red-50" : "border-transparent"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <Text
          className={`text-sm ${selected ? "text-gray-800" : "text-gray-400"}`}
          numberOfLines={1}
        >
          {display}
        </Text>
        <ChevronDown size={18} color="#94A3B8" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="max-h-[60%] rounded-t-[20px] bg-white pb-6 pt-2"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-1 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
            </View>
            <ScrollView>
              {options.map((opt) => {
                const isSel = opt.value === value;
                return (
                  <Pressable
                    key={String(opt.value)}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between px-6 py-4"
                  >
                    <Text
                      className={`text-[15px] ${
                        isSel
                          ? "font-semibold text-[#0F172A]"
                          : "text-[#475569]"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {isSel && <Check size={18} color="#0F172A" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
