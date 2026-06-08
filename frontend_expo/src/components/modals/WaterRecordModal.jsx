import React, { useId, useState, useEffect } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Svg, {
  Path,
  Rect,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userConfigApi from "../../api/userConfigApi";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

// 백엔드 BioValueRecord.category 값 (web: constants/bioCategory.js)
const WATER_INTAKE_CATEGORY = "WaterIntake";

const DEFAULT_TARGET_CUPS = 10;

const pad = (n) => String(n).padStart(2, "0");
const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const resolveUserId = (user) =>
  user?.userId ?? user?.id ?? user?.memberId ?? null;

const getProgressMessage = (progress) => {
  if (progress >= 100) {
    return "오늘 목표를 달성했습니다. 몸 상태도 함께 체크해보세요.";
  }
  if (progress >= 70) {
    return "현재 페이스를 유지하시면 오늘 목표에 무리 없이 도달할 수 있습니다.";
  }
  if (progress >= 40) {
    return "좋은 흐름입니다. 계속해서 천천히 마시면 목표에 가까워집니다.";
  }
  return "아직 여유가 있습니다. 조금씩 나눠 마시면 부담 없이 목표를 채울 수 있습니다.";
};

const DROP_PATH =
  "M50 1C52.5 1 79 35.5 89.2 58.7C94.7 71.3 96.6 81 95 92.8C91.6 116 73.2 131 50 131C26.8 131 8.4 116 5 92.8C3.4 81 5.3 71.3 10.8 58.7C21 35.5 47.5 1 50 1Z";

const WaterRecordModal = ({ visible, onClose, onSaved, date }) => {
  const clipPathId = useId();
  const { user } = useAuth();
  const [inputAmount, setInputAmount] = useState("0");
  const [existingRecordId, setExistingRecordId] = useState(null);
  const [targetCups, setTargetCups] = useState(DEFAULT_TARGET_CUPS);

  const userId = resolveUserId(user);

  // 모달 열릴 때 선택한 날짜(date, 없으면 오늘)의 물 기록 조회 → 있으면 recordId + 컵 수 로드
  useEffect(() => {
    if (!visible || !userId) return;
    // API 응답 전 이전 날짜 데이터가 잠깐 표시되는 것을 방지
    setInputAmount("0");
    setExistingRecordId(null);
    const targetDate = date || getTodayStr();
    bioValueRecordApi
      .searchByDate(userId, WATER_INTAKE_CATEGORY, targetDate)
      .then((res) => {
        const list = res.data ?? [];
        if (list.length > 0) {
          const rec = list[0];
          setExistingRecordId(rec.recordId);
          setInputAmount(String(rec.waterIntakeCup ?? 0));
        } else {
          setExistingRecordId(null);
          setInputAmount("0");
        }
      })
      .catch(() => {});
  }, [visible, userId, date]);

  // 모달 열릴 때 user_config에서 목표 수분 섭취량 조회
  useEffect(() => {
    if (!visible || !userId) return;
    userConfigApi
      .getTargetDailyWaterIntake(userId)
      .then((res) => {
        const val = res.data;
        setTargetCups(val != null && val > 0 ? val : DEFAULT_TARGET_CUPS);
      })
      .catch(() => {
        setTargetCups(DEFAULT_TARGET_CUPS);
      });
  }, [visible, userId]);

  const parsedCurrentCups = Number(inputAmount) || 0;
  const parsedCurrentMl = parsedCurrentCups * 200;
  const targetAmountMl = targetCups * 200;
  const safeTargetAmount = targetAmountMl > 0 ? targetAmountMl : 1;
  const progress = Math.max(
    0,
    Math.min(Math.round((parsedCurrentMl / safeTargetAmount) * 100)),
  );
  const fillHeight = Math.max(0, Math.min(132, (progress / 100) * 132));
  const fillY = 132 - fillHeight;
  const feedbackMessage = getProgressMessage(progress);

  const handleSave = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const now = new Date();
    const targetDate = date || getTodayStr(); // 부모가 날짜 안 주면 오늘
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const payload = {
      recordDate: targetDate,
      recordTime,
      category: WATER_INTAKE_CATEGORY,
      waterIntakeCup: parsedCurrentCups,
    };

    try {
      // 선택한 날짜에 기록이 있으면 UPDATE, 없으면 CREATE
      let existingId = existingRecordId;
      if (!existingId) {
        const check = await bioValueRecordApi.searchByDate(
          userId,
          WATER_INTAKE_CATEGORY,
          targetDate,
        );
        const list = check.data ?? [];
        if (list.length > 0) existingId = list[0].recordId;
      }

      if (existingId) {
        await bioValueRecordApi.updateBioValueRecord(existingId, payload);
      } else {
        await bioValueRecordApi.createBioValueRecord(userId, payload);
      }

      toast.success(`${targetDate} 수분 섭취량이 기록되었습니다.`);
      onSaved && onSaved(parsedCurrentCups);
      onClose && onClose();
    } catch (error) {
      console.error("수분 섭취 기록 실패:", error);
      toast.error(error?.response?.data?.message || "저장에 실패했습니다.");
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
          className="w-full max-w-[672px] overflow-hidden rounded-[18px] bg-white"
        >
          {/* 헤더 */}
          <View className="border-b border-[#F1F5F9] px-6 pb-5 pt-7">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[24px] font-bold leading-tight text-[#0F172A]">
                  수분 섭취 기록하기
                </Text>
                <Text className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                  오늘의 수분 섭취량을 기록하세요.
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
          </View>

          {/* 본문 */}
          <View className="px-6 py-6">
            {/* 컵 수 카운터 */}
            <View className="flex-row items-center justify-end gap-4">
              <View className="items-center gap-3">
                <Pressable
                  onPress={() => setInputAmount(String(parsedCurrentCups + 1))}
                  accessibilityLabel="컵 수 증가"
                  className="h-12 w-12 items-center justify-center rounded-full bg-slate-100"
                >
                  <Text className="text-[20px] font-bold text-slate-500">▲</Text>
                </Pressable>
                <Text className="w-[160px] text-center text-[80px] font-bold tracking-tighter text-slate-900">
                  {parsedCurrentCups}
                </Text>
                <Pressable
                  onPress={() =>
                    setInputAmount(String(Math.max(0, parsedCurrentCups - 1)))
                  }
                  accessibilityLabel="컵 수 감소"
                  className="h-12 w-12 items-center justify-center rounded-full bg-slate-100"
                >
                  <Text className="text-[20px] font-bold text-slate-500">▼</Text>
                </Pressable>
              </View>
              <Text className="self-center text-[36px] font-bold text-slate-300">
                컵
              </Text>
            </View>

            <View className="mt-2 items-end gap-1">
              <Text className="text-[12px] font-semibold text-slate-500">
                현재 수분 섭취량
              </Text>
              <Text className="text-[26px] font-extrabold text-[#3454ff]">
                {progress}%
              </Text>
              <Text className="text-[13px] font-semibold text-slate-400">
                = {parsedCurrentMl}ml
              </Text>
            </View>

            {/* 물방울 SVG */}
            <View className="items-center pt-6">
              <Svg width={240} height={336} viewBox="0 0 100 132">
                <Defs>
                  <ClipPath id={clipPathId}>
                    <Path d={DROP_PATH} />
                  </ClipPath>
                  <LinearGradient
                    id="waterDropBackground"
                    x1="50"
                    y1="1"
                    x2="50"
                    y2="131"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop stopColor="#f8fbff" />
                    <Stop offset="1" stopColor="#eef3ff" />
                  </LinearGradient>
                  <LinearGradient
                    id="waterDropFill"
                    x1="50"
                    y1="34"
                    x2="50"
                    y2="132"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop stopColor="#5872ff" />
                    <Stop offset="1" stopColor="#4760dd" />
                  </LinearGradient>
                </Defs>
                <Path d={DROP_PATH} fill="url(#waterDropBackground)" />
                <G clipPath={`url(#${clipPathId})`}>
                  <Rect
                    x="0"
                    y={fillY}
                    width="100"
                    height={fillHeight}
                    fill="url(#waterDropFill)"
                  />
                </G>
              </Svg>
            </View>

            {/* 목표 수분 섭취량 */}
            <View className="mt-4">
              <Text className="text-[12px] font-semibold text-slate-400">
                목표 수분 섭취량
              </Text>
              <Text className="mt-1 text-[34px] font-extrabold tracking-[-0.04em] text-[#2447ea]">
                {targetCups}컵
              </Text>
            </View>

            {/* AI 조언 카드 */}
            <View className="mt-6 overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-[#EFF6FF]">
              <View className="flex-row items-start gap-3 px-4 py-4">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE]">
                  <Text className="text-[16px] text-[#2563EB]">✦</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-[13px] leading-relaxed text-[#475569]">
                    목표 수분 섭취량 대비 약{" "}
                    <Text className="font-bold text-[#2563EB]">{progress}%</Text>
                    를 달성했습니다.
                  </Text>
                  <Text className="text-[12px] text-[#94A3B8]">
                    {feedbackMessage}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 저장 버튼 */}
          <View className="border-t border-[#F1F5F9] px-6 py-5">
            <Pressable
              onPress={handleSave}
              className="w-full rounded-[20px] bg-[#1a1a2e] py-5"
            >
              <Text className="text-center text-lg font-bold text-white">
                기록 저장 및 확인
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
};

export default WaterRecordModal;
