import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable } from "react-native";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userApi from "../../api/userApi";
import userConfigApi from "../../api/userConfigApi";
import { useAuth } from "../../context/AuthContext";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

// 백엔드 BioValueRecord.category 값 (web: constants/bioCategory.js)
const WEIGHT_CATEGORY = "Weight";

const resolveUserId = (user) =>
  user?.userId ?? user?.id ?? user?.memberId ?? null;

const pad = (n) => String(n).padStart(2, "0");
const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// 달성률: 목표와의 절대 거리를 10kg 스케일로 환산 (1kg ≈ 10%)
const PROGRESS_SCALE_KG = 10;

const WeightRecordModal = ({ visible, onClose, onSaved, date }) => {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [targetWeight, setTargetWeight] = useState(null);

  useEffect(() => {
    if (!visible || !userId) return;

    let cancelled = false;
    const targetDate = date || getTodayStr(); // 부모가 날짜 안 주면 오늘

    Promise.allSettled([
      userConfigApi.getTargetWeight(userId),
      bioValueRecordApi.searchByDate(userId, WEIGHT_CATEGORY, targetDate),
    ]).then(([targetRes, dayRes]) => {
      if (cancelled) return;

      if (targetRes.status === "fulfilled" && targetRes.value?.data != null) {
        setTargetWeight(Number(targetRes.value.data));
      }

      // 선택한 날짜의 체중 기록을 표시 (없으면 빈 값 → 새 기록 입력)
      if (dayRes.status === "fulfilled") {
        const list = Array.isArray(dayRes.value?.data) ? dayRes.value.data : [];
        const rec = list[0];
        setWeight(rec?.weight != null ? String(Number(rec.weight)) : "");
      } else {
        setWeight("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [visible, userId, date]);

  const calculateProgress = () => {
    if (targetWeight == null) return 0;
    const current = parseFloat(weight) || 0;
    if (!current) return 0;
    const diff = Math.abs(current - targetWeight);
    const percentage = 100 - (diff / PROGRESS_SCALE_KG) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };

  const progress = calculateProgress();
  const weightDiff =
    targetWeight == null
      ? null
      : (parseFloat(weight || 0) - targetWeight).toFixed(1);

  // 체중입력에 숫자 외 다른거 걸러줌
  const handleWeightChange = (value) => {
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setWeight(value);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      toast.error("체중을 정확히 입력해주세요.");
      return;
    }

    const now = new Date();
    const targetDate = date || getTodayStr(); // 부모가 날짜 안 주면 오늘
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const payload = {
      recordDate: targetDate,
      recordTime,
      category: WEIGHT_CATEGORY,
      weight: weightValue,
    };

    setSubmitting(true);
    try {
      // 1. 선택한 날짜에 같은 카테고리 기록이 이미 있는지 조회 (하루 1개만 유지)
      const dayRes = await bioValueRecordApi.searchByDate(
        userId,
        WEIGHT_CATEGORY,
        targetDate,
      );
      const existing = Array.isArray(dayRes.data) ? dayRes.data[0] : null;

      let res;
      if (existing?.recordId != null) {
        // 2-a. 있으면 update
        res = await bioValueRecordApi.updateBioValueRecord(
          existing.recordId,
          payload,
        );
        toast.success(`${targetDate} 체중 기록이 수정되었습니다.`);
      } else {
        // 2-b. 없으면 insert
        res = await bioValueRecordApi.createBioValueRecord(userId, payload);
        toast.success(`${targetDate} 체중이 기록되었습니다.`);
      }

      // 3. 회원정보의 현재 체중(member.weight)도 동기화
      try {
        await userApi.updateMember(userId, { weight: weightValue });
      } catch (memberErr) {
        console.error("회원 체중 동기화 실패:", memberErr);
      }

      onSaved && onSaved(res.data);
      onClose && onClose();
    } catch (error) {
      console.error("체중 기록 실패:", error);
      toast.error(error?.response?.data?.message || "저장에 실패했습니다.");
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
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#0f172a]/40 px-4 py-6"
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[672px] rounded-[18px] bg-white p-6"
        >
          {/* Header */}
          <View className="mb-8 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[24px] font-bold leading-tight text-[#0F172A]">
                체중 기록하기
              </Text>
              <Text className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                오늘의 체중을 기록하세요.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityLabel="닫기"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Text className="text-[18px] font-bold text-[#94A3B8]">✕</Text>
            </Pressable>
          </View>

          {/* Weight Input */}
          <View className="items-center justify-center py-2">
            <View className="flex-row items-baseline gap-4">
              <TextInput
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="numeric"
                autoFocus
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                className="max-w-[260px] text-center text-[80px] font-bold tracking-tighter text-slate-900"
              />
              <Text className="text-[36px] font-bold text-slate-300">kg</Text>
            </View>
            <View className="mt-4 h-1.5 w-40 rounded-full bg-slate-50" />
          </View>

          {/* Progress Section */}
          <View className="space-y-5">
            <View className="flex-row items-end justify-between px-1">
              <View>
                <Text className="mb-1 text-[13px] font-bold uppercase tracking-wider text-slate-400">
                  목표 체중
                </Text>
                <Text className="text-2xl font-extrabold text-slate-800">
                  {targetWeight != null
                    ? `${targetWeight.toFixed(1)} kg`
                    : "— kg"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="mb-1 text-[13px] font-bold uppercase tracking-wider text-slate-400">
                  현재와의 차이
                </Text>
                <Text
                  className={`text-2xl font-extrabold ${
                    weightDiff != null && parseFloat(weightDiff) <= 0
                      ? "text-green-500"
                      : "text-blue-600"
                  }`}
                >
                  {weightDiff == null
                    ? "— kg"
                    : `${parseFloat(weightDiff) > 0 ? "+ " : ""}${weightDiff} kg`}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-5 h-[14px] w-full overflow-hidden rounded-full bg-slate-100">
              <View
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progress}%` }}
              />
            </View>

            <View className="mt-2 flex-row items-center justify-between px-1">
              <Text className="text-[13px] font-bold text-slate-400">
                현재 {weight || "0"}kg
              </Text>
              <Text className="text-[13px] font-bold text-blue-600">
                목표까지 {progress}% 달성
              </Text>
            </View>
          </View>

          {/* AI 조언 카드 */}
          <View className="mt-6 overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-[#EFF6FF]">
            <View className="flex-row items-start gap-3 px-4 py-4">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE]">
                <Text className="text-[16px] text-[#2563EB]">✦</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[13px] leading-relaxed text-[#475569]">
                  {targetWeight == null
                    ? "목표 체중을 설정하면 달성률과 맞춤 조언을 확인할 수 있어요."
                    : progress >= 100
                      ? "축하합니다! 목표 체중에 도달했습니다. 유지 관리에 집중해보세요."
                      : `목표까지 ${weightDiff}kg 남았습니다. 조금만 더 힘내세요!`}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Button */}
          <View className="pt-4">
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`w-full rounded-[20px] bg-[#1a1a2e] py-5 ${
                submitting ? "opacity-60" : ""
              }`}
            >
              <Text className="text-center text-lg font-bold text-white">
                {submitting ? "저장 중..." : "기록 저장 및 확인"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
};

export default WeightRecordModal;
