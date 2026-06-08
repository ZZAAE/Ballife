import { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Clock } from "lucide-react-native";
import Dropdown from "../Dropdown";
import userConfigApi from "../../api/userConfigApi";
import { useAuth } from "../../context/AuthContext";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

/* ──────────────────────────────────────────────────────────────────────────
 * 하루 생활 루틴 수정 모달
 *  props:
 *   - visible:        모달 열림 여부
 *   - onClose:        닫기 핸들러
 *   - onSaved:        저장 성공 시 콜백 (갱신된 userConfig 전달)
 *   - initialRoutine: 초기 루틴 배열 [{ label, time }]
 *   - title:          상단 타이틀
 * ──────────────────────────────────────────────────────────────────────── */
const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

const HOUR12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")); // "01" ~ "12"
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const MERIDIEM_OPTIONS = [
  { label: "오전", value: "AM" },
  { label: "오후", value: "PM" },
];
const HOUR_OPTIONS = HOUR12.map((h) => ({ label: `${h}시`, value: h }));
const MINUTE_OPTIONS = MINUTES.map((m) => ({ label: `${m}분`, value: m }));

// 루틴 라벨 → userConfig 키
const ROUTINE_LABEL_TO_KEY = {
  기상: "wakeupTime",
  아침: "breakfastTime",
  점심: "lunchTime",
  저녁: "dinnerTime",
  취침: "bedTime",
};

// "HH:mm" (24h) → { meridiem, hour12, minute }
const parseTime = (time) => {
  if (!time || typeof time !== "string" || !time.includes(":")) {
    return { meridiem: "", hour12: "", minute: "" };
  }
  const [hStr, mStr] = time.split(":");
  const h24 = Number(hStr);
  if (Number.isNaN(h24)) return { meridiem: "", hour12: "", minute: "" };
  const meridiem = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    meridiem,
    hour12: String(h12).padStart(2, "0"),
    minute: mStr ?? "",
  };
};

// { meridiem, hour12, minute } → "HH:mm" (24h)
const composeTime = (meridiem, hour12, minute) => {
  if (!meridiem && !hour12 && !minute) return "";
  const m = meridiem || "AM";
  const h12 = Number(hour12 || "12");
  let h24 = h12 % 12;
  if (m === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${minute || "00"}`;
};

function TimeSelect({ value, onChange }) {
  const { meridiem, hour12, minute } = parseTime(value);

  return (
    <View className="flex-row items-center justify-end gap-1.5">
      <View className="w-[88px]">
        <Dropdown
          value={meridiem}
          onChange={(v) => onChange(composeTime(v, hour12, minute))}
          options={MERIDIEM_OPTIONS}
          placeholder="오전/오후"
          heightClass="h-9"
        />
      </View>
      <View className="w-[72px]">
        <Dropdown
          value={hour12}
          onChange={(v) => onChange(composeTime(meridiem, v, minute))}
          options={HOUR_OPTIONS}
          placeholder="시"
          heightClass="h-9"
        />
      </View>
      <Text className="text-[13px] text-gray-400">:</Text>
      <View className="w-[72px]">
        <Dropdown
          value={minute}
          onChange={(v) => onChange(composeTime(meridiem, hour12, v))}
          options={MINUTE_OPTIONS}
          placeholder="분"
          heightClass="h-9"
        />
      </View>
    </View>
  );
}

const DEFAULT_ROUTINE = [
  { label: "기상", time: "" },
  { label: "아침", time: "07:30" },
  { label: "점심", time: "12:30" },
  { label: "저녁", time: "18:30" },
  { label: "취침", time: "23:30" },
];

export default function RoutineModal({
  visible,
  onClose,
  onSaved,
  initialRoutine,
  title = "하루 생활 루틴 수정",
}) {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const buildRoutine = (source) =>
    source && source.length > 0
      ? source.map((r) => ({
          label: r.label,
          time: r.time && r.time !== "—" ? r.time : "",
        }))
      : DEFAULT_ROUTINE;

  const [routine, setRoutine] = useState(() => buildRoutine(initialRoutine));
  const [submitting, setSubmitting] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setRoutine(buildRoutine(initialRoutine));
    }
  }

  const handleTimeChange = (label, value) => {
    setRoutine((prev) =>
      prev.map((item) => (item.label === label ? { ...item, time: value } : item)),
    );
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setSubmitting(true);

    const body = {};
    routine.forEach((item) => {
      const key = ROUTINE_LABEL_TO_KEY[item.label];
      if (key) body[key] = item.time || null;
    });

    try {
      const { data } = await userConfigApi.updateUserConfig(userId, body);
      toast.success("루틴이 저장되었습니다.");
      onSaved && onSaved(data);
      onClose && onClose();
    } catch (error) {
      console.error("루틴 저장 실패:", error);
      toast.error(error?.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#0f172a]/30 px-4 py-6"
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[560px] max-h-[92%] overflow-hidden rounded-2xl bg-white"
        >
          {/* 헤더 */}
          <View className="flex-row items-center justify-between px-7 pb-4 pt-6">
            <View className="flex-row items-center gap-2">
              <Clock size={20} color="#2563EB" />
              <Text className="text-[17px] font-semibold text-gray-800">{title}</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityLabel="닫기"
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <Text className="text-[16px] font-bold text-gray-500">✕</Text>
            </Pressable>
          </View>

          {/* 본문 (스크롤) */}
          <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24 }}>
            <Text className="text-[13px] leading-relaxed text-[#64748B]">
              매일의 생활 시간을 입력해 주세요. 입력한 시간을 기준으로 알림과 추천 시점이
              조정됩니다.
            </Text>

            <View className="mt-5">
              <Text className="mb-2 text-[13px] font-medium text-gray-700">
                생활 시간 설정
              </Text>
              <View className="overflow-hidden rounded-xl border border-gray-100">
                {routine.map((item, idx) => (
                  <View
                    key={item.label}
                    className={`flex-row items-center justify-between gap-3 bg-white px-4 py-3 ${
                      idx !== routine.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <Text className="text-[14px] font-medium text-gray-800">
                      {item.label}
                    </Text>
                    <TimeSelect
                      value={item.time}
                      onChange={(v) => handleTimeChange(item.label, v)}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* 푸터 */}
          <View className="flex-row justify-end border-t border-gray-100 bg-white px-7 py-4">
            <Pressable
              disabled={submitting}
              onPress={handleSubmit}
              className={`h-10 items-center justify-center rounded-xl bg-gray-900 px-6 ${
                submitting ? "opacity-50" : ""
              }`}
            >
              <Text className="text-[13px] font-medium text-white">
                {submitting ? "저장 중..." : "저장하기"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
