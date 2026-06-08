import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";

// 'YYYY-MM-DD' 문자열 <-> Date 변환
const toDate = (s) => {
  if (!s) return new Date();
  const [y, m, d] = String(s).split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};
const toStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * 날짜 선택 필드. 텍스트 입력 대신 네이티브 DateTimePicker 사용.
 * props: value('YYYY-MM-DD'), onChange(str), maximumDate(Date), placeholder, error
 */
export default function DateField({
  value,
  onChange,
  maximumDate,
  minimumDate,
  placeholder = "날짜 선택",
  error = false,
}) {
  const [show, setShow] = useState(false);

  const handleChange = (event, selected) => {
    // Android: 선택/취소 시 자동 닫힘. iOS: 스피너 유지 → 확인 후 닫음.
    if (Platform.OS !== "ios") setShow(false);
    if (event?.type === "dismissed") return;
    if (selected) onChange(toStr(selected));
  };

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        className={`h-12 flex-row items-center justify-between rounded-lg border bg-gray-100 px-4 ${
          error ? "border-red-400 bg-red-50" : "border-transparent"
        }`}
      >
        <Text className={`text-sm ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || placeholder}
        </Text>
        <Calendar size={18} color="#94A3B8" />
      </Pressable>

      {show && (
        <View>
          <DateTimePicker
            value={toDate(value)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onChange={handleChange}
          />
          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => setShow(false)}
              className="mt-1 h-10 items-center justify-center rounded-lg bg-gray-900"
            >
              <Text className="text-sm font-semibold text-white">확인</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
