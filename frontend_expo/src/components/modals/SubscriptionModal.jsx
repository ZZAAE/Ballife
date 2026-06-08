import { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Check, Crown, Users } from "lucide-react-native";
import subscriptionApi from "../../api/subscriptionApi";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

/* ──────────────────────────────────────────────────────────────────────────
 * 구독 플랜 선택 + 모의 결제 모달
 *  props:
 *   - visible:     모달 열림 여부
 *   - onClose:     닫기 핸들러
 *   - onSaved:     활성화/해지 성공 시 콜백 (갱신된 구독 정보 전달)
 *   - currentPlan: 현재 플랜 ("NONE" | "INDIVIDUAL" | "FAMILY")
 * ──────────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    key: "INDIVIDUAL",
    name: "개인 플랜",
    price: 4900,
    icon: Crown,
    accent: "#3B82F6",
    bg: "#EFF6FF",
    tagline: "나의 건강을 더 깊이",
    features: [
      { label: "건강 리포트", ready: true },
      { label: "혈당·혈압·체중 요약", ready: true },
    ],
  },
  {
    key: "FAMILY",
    name: "가족 플랜",
    price: 9900,
    icon: Users,
    accent: "#0F172A",
    bg: "#F1F5F9",
    tagline: "가족과 함께 건강 관리",
    features: [
      { label: "건강 리포트", ready: true },
      { label: "부모님 혈당/혈압 확인", ready: true },
      { label: "가족 구성원 초대", ready: true },
      { label: "복약 알림 공유", ready: true },
      { label: "운동 현황 공유", ready: true },
    ],
  },
];

const won = (n) => `₩${Number(n).toLocaleString()}`;

export default function SubscriptionModal({
  visible,
  onClose,
  onSaved,
  currentPlan = "NONE",
}) {
  const [selected, setSelected] = useState(
    currentPlan === "INDIVIDUAL" ? "FAMILY" : "INDIVIDUAL",
  );
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setSelected(currentPlan === "INDIVIDUAL" ? "FAMILY" : "INDIVIDUAL");
      setConfirmCancel(false);
    }
  }

  const hasSubscription = currentPlan && currentPlan !== "NONE";
  const isSamePlan = selected === currentPlan;
  const selectedName = PLANS.find((p) => p.key === selected)?.name;
  const primaryLabel = submitting
    ? "처리 중..."
    : hasSubscription
      ? isSamePlan
        ? "현재 이용 중인 플랜"
        : `${selectedName}(으)로 변경`
      : `${selectedName} 결제하기`;

  const handleSubmit = async () => {
    if (submitting || isSamePlan) return;
    setSubmitting(true);
    try {
      const { data } = await subscriptionApi.activate(selected);
      toast.success("구독이 활성화되었습니다.");
      onSaved && onSaved(data);
      onClose && onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "구독 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    // RN 에는 window.confirm 이 없으므로 2단계 확인 토글로 대체
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    if (cancelling) return;
    setCancelling(true);
    try {
      const { data } = await subscriptionApi.cancel();
      toast.success("구독을 해지했습니다.");
      onSaved && onSaved(data);
      onClose && onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "구독 해지에 실패했습니다.");
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
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
                <Crown size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-[#0F172A]">
                  가족 건강 관리 구독
                </Text>
                <Text className="mt-0.5 text-[12px] text-[#64748B]">
                  플랜을 선택하고 시작하세요.
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

          {/* 본문 */}
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View className="gap-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selected === plan.key;
                const isCurrent = currentPlan === plan.key;
                return (
                  <Pressable
                    key={plan.key}
                    onPress={() => setSelected(plan.key)}
                    className={`rounded-[18px] border-2 bg-white p-5 ${
                      isSelected ? "border-[#0F172A]" : "border-[#E5E7EB]"
                    }`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: plan.bg }}
                      >
                        <Icon size={20} color={plan.accent} />
                      </View>
                      {isCurrent && (
                        <View className="rounded-full bg-[#ECFDF5] px-2 py-0.5">
                          <Text className="text-[11px] font-semibold text-[#10B981]">
                            현재 플랜
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="mt-4 text-[15px] font-bold text-[#0F172A]">
                      {plan.name}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-[#94A3B8]">
                      {plan.tagline}
                    </Text>

                    <View className="mt-3 flex-row items-end gap-1">
                      <Text className="text-[26px] font-extrabold text-[#0F172A]">
                        {won(plan.price)}
                      </Text>
                      <Text className="pb-1.5 text-[12px] text-[#64748B]">/ 월</Text>
                    </View>

                    <View className="mt-4 gap-2">
                      {plan.features.map((f) => (
                        <View key={f.label} className="flex-row items-center gap-2">
                          <Check size={16} color={f.ready ? plan.accent : "#CBD5E1"} />
                          <Text
                            className={`text-[12.5px] ${
                              f.ready ? "text-[#475569]" : "text-[#94A3B8]"
                            }`}
                          >
                            {f.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* 푸터 */}
          <View className="flex-row items-center justify-between gap-2 border-t border-[#E5E7EB] bg-white px-6 py-5">
            <View>
              {hasSubscription && (
                <Pressable disabled={cancelling} onPress={handleCancel}>
                  <Text className="text-[13px] font-semibold text-[#c24141]">
                    {cancelling
                      ? "해지 중..."
                      : confirmCancel
                        ? "정말 해지할까요?"
                        : "구독 해지"}
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onClose}
                className="h-11 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-5"
              >
                <Text className="text-[13px] font-medium text-[#0F172A]">취소</Text>
              </Pressable>
              <Pressable
                disabled={submitting || isSamePlan}
                onPress={handleSubmit}
                className={`h-11 items-center justify-center rounded-[12px] bg-[#0F172A] px-7 ${
                  submitting || isSamePlan ? "opacity-50" : ""
                }`}
              >
                <Text className="text-[13px] font-semibold text-white">{primaryLabel}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
