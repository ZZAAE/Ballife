import { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Dumbbell, Flame, Scale, Target, Droplet } from "lucide-react-native";
import userConfigApi from "../../api/userConfigApi";
import { useAuth } from "../../context/AuthContext";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

/* ──────────────────────────────────────────────────────────────────────────
 * 목표 지표 일괄 수정 모달 (체중 / 음수량 / 섭취 칼로리 / 소모 칼로리)
 *  props:
 *   - visible:        모달 열림 여부
 *   - onClose:        닫기 핸들러
 *   - onSaved:        저장 성공 시 콜백 (갱신된 userConfig 전달)
 *   - initialTargets: { weight, water, calorieIn, calorieOut }
 *   - title:          상단 타이틀
 * ──────────────────────────────────────────────────────────────────────── */
const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

const DEFAULT_TARGETS = {
  weight: "",
  water: "",
  calorieIn: "",
  calorieOut: "",
};

const FIELDS = [
  {
    key: "weight",
    label: "목표 체중",
    description: "달성하고 싶은 체중을 입력해 주세요.",
    unit: "kg",
    placeholder: "70.0",
    accent: "#3B82F6",
    bg: "#EFF6FF",
    icon: Scale,
  },
  {
    key: "water",
    label: "목표 음수량",
    description: "하루 동안 마실 물의 양 (1잔 = 약 200ml).",
    unit: "잔",
    placeholder: "8",
    accent: "#0EA5E9",
    bg: "#F0F9FF",
    icon: Droplet,
  },
  {
    key: "calorieIn",
    label: "목표 섭취 칼로리",
    description: "하루 권장 섭취 열량을 입력해 주세요.",
    unit: "kcal",
    placeholder: "2000",
    accent: "#F97316",
    bg: "#FFF7ED",
    icon: Flame,
  },
  {
    key: "calorieOut",
    label: "목표 소모 칼로리",
    description: "운동 및 활동으로 소모할 목표 열량.",
    unit: "kcal",
    placeholder: "1200",
    accent: "#10B981",
    bg: "#ECFDF5",
    icon: Dumbbell,
  },
];

const sanitize = (source) => ({
  weight: source?.weight != null && source.weight !== "" ? String(source.weight) : "",
  water: source?.water != null && source.water !== "" ? String(source.water) : "",
  calorieIn:
    source?.calorieIn != null && source.calorieIn !== "" ? String(source.calorieIn) : "",
  calorieOut:
    source?.calorieOut != null && source.calorieOut !== "" ? String(source.calorieOut) : "",
});

export default function TargetModal({
  visible,
  onClose,
  onSaved,
  initialTargets,
  title = "목표 지표 수정",
}) {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [targets, setTargets] = useState(() =>
    initialTargets ? sanitize(initialTargets) : DEFAULT_TARGETS,
  );
  const [submitting, setSubmitting] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setTargets(initialTargets ? sanitize(initialTargets) : DEFAULT_TARGETS);
    }
  }

  const handleChange = (key, value) => {
    setTargets((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTargets(DEFAULT_TARGETS);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setSubmitting(true);

    const weight = targets.weight === "" ? null : Number(targets.weight);
    const water = targets.water === "" ? null : Number(targets.water);
    const calorieIn = targets.calorieIn === "" ? null : Number(targets.calorieIn);
    const calorieOut = targets.calorieOut === "" ? null : Number(targets.calorieOut);

    const body = {
      targetWeight: weight,
      targetDailyWaterIntake: water == null ? null : Math.round(water),
      targetDailyCaloriesIntake: calorieIn == null ? null : Math.round(calorieIn),
      targetDailyCaloriesBurned: calorieOut == null ? null : Math.round(calorieOut),
    };

    try {
      const { data } = await userConfigApi.updateUserConfig(userId, body);
      toast.success("목표가 저장되었습니다.");
      onSaved && onSaved(data);
      onClose && onClose();
    } catch (error) {
      console.error("목표 지표 저장 실패:", error);
      toast.error(error?.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#0f172a]/40 px-4 py-6"
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[760px] max-h-[92%] overflow-hidden rounded-[20px] bg-[#F9FAFB]"
        >
          {/* 헤더 */}
          <View className="flex-row items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A]">
                <Target size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-[#0F172A]">{title}</Text>
                <Text className="mt-0.5 text-[12px] text-[#64748B]">
                  매일의 목표 수치를 한 번에 설정할 수 있어요.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityLabel="닫기"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Text className="text-[18px] font-bold text-[#94A3B8]">✕</Text>
            </Pressable>
          </View>

          {/* 본문 (스크롤) */}
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View className="gap-4">
              {FIELDS.map((field) => {
                const Icon = field.icon;
                return (
                  <View
                    key={field.key}
                    className="rounded-[18px] border border-[#E5E7EB] bg-white p-5"
                  >
                    <View className="mb-4 flex-row items-start gap-3">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: field.bg }}
                      >
                        <Icon size={20} color={field.accent} />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="text-[14px] font-semibold text-[#0F172A]">
                          {field.label}
                        </Text>
                        <Text className="mt-0.5 text-[11px] leading-snug text-[#94A3B8]">
                          {field.description}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="flex-row items-end gap-2 rounded-[12px] border border-[#E5E7EB] px-4 py-3"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <TextInput
                        keyboardType="decimal-pad"
                        value={targets[field.key]}
                        onChangeText={(v) => handleChange(field.key, v)}
                        placeholder={field.placeholder}
                        placeholderTextColor="#CBD5E1"
                        className="min-w-0 flex-1 text-[26px] font-bold text-[#0F172A]"
                      />
                      <Text className="pb-1.5 text-[13px] font-medium text-[#64748B]">
                        {field.unit}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* 푸터 */}
          <View className="flex-row items-center justify-between border-t border-[#E5E7EB] bg-white px-6 py-5">
            <Pressable onPress={handleReset}>
              <Text className="text-[13px] font-medium text-[#64748B]">초기화</Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onClose}
                className="h-11 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-5"
              >
                <Text className="text-[13px] font-medium text-[#0F172A]">취소</Text>
              </Pressable>
              <Pressable
                disabled={submitting}
                onPress={handleSubmit}
                className={`h-11 items-center justify-center rounded-[12px] bg-[#0F172A] px-7 ${
                  submitting ? "opacity-50" : ""
                }`}
              >
                <Text className="text-[13px] font-semibold text-white">
                  {submitting ? "저장 중..." : "저장하기"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
