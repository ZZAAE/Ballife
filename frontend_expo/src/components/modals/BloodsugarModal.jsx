import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import Dropdown from "../Dropdown";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

// 백엔드 BioValueRecord.category 의 혈당 접두어
const BLOOD_SUGAR = "BloodSugar";

const resolveUserId = (user) =>
  user?.userId ?? user?.id ?? user?.memberId ?? null;

const pad = (n) => String(n).padStart(2, "0");

const MEALS = [
  { id: "공복", label: "공복", hasTiming: false },
  { id: "아침", label: "아침", hasTiming: true },
  { id: "점심", label: "점심", hasTiming: true },
  { id: "저녁", label: "저녁", hasTiming: true },
  { id: "취침전", label: "취침전", hasTiming: false },
];

const TIMINGS = ["식전", "식후"];

// 저혈당은 임상 표준에 따라 70mg/dL 미만으로 통일
const HYPO_CUT = 70;

// 당뇨 유형 · 측정 시점별 혈당 기준 (mg/dL)
//   warn   : 정상 → 경고 경계 (이 값부터 경고)
//   danger : 경고 → 위험 경계 (이 값부터 위험)
const BLOOD_SUGAR_RANGES = {
  NONE: {
    공복: { warn: 100, danger: 126 },
    식전: { warn: 100, danger: 140 },
    식후: { warn: 140, danger: 180 },
    취침전: { warn: 121, danger: 140 },
  },
  type1: {
    공복: { warn: 131, danger: 181 },
    식전: { warn: 131, danger: 181 },
    식후: { warn: 181, danger: 251 },
    취침전: { warn: 151, danger: 201 },
  },
  type2: {
    공복: { warn: 131, danger: 181 },
    식전: { warn: 131, danger: 181 },
    식후: { warn: 181, danger: 251 },
    취침전: { warn: 141, danger: 201 },
  },
  GESTATIONAL: {
    공복: { warn: 96, danger: 106 },
    식전: { warn: 96, danger: 106 },
    식후: { warn: 121, danger: 141 },
    취침전: { warn: 121, danger: 141 },
  },
};

const DIABETES_LABEL = {
  NONE: "당뇨 없음",
  type1: "1형 당뇨",
  type2: "2형 당뇨",
  GESTATIONAL: "임신성 당뇨",
};

// 식사 탭/식전·식후 토글을 기준표의 행(공복/식전/식후/취침전)으로 매핑
const resolveBsContext = (meal, timing) => {
  if (meal === "공복") return "공복";
  if (meal === "취침전") return "취침전";
  return timing === "식후" ? "식후" : "식전";
};

const getRange = (diabetesType, meal, timing) => {
  const byType = BLOOD_SUGAR_RANGES[diabetesType] || BLOOD_SUGAR_RANGES.NONE;
  return byType[resolveBsContext(meal, timing)];
};

const getStatusInfo = (value, range) => {
  const { warn, danger } = range;
  if (value < HYPO_CUT)
    return {
      statusText: "저혈당",
      label: "저혈당 상태입니다",
      description: "혈당이 낮습니다. 당분이 포함된 음식을 섭취해주세요.",
      badgeBg: "#EFF6FF",
      badgeText: "#2563EB",
    };
  if (value < warn)
    return {
      statusText: "정상",
      label: "이상적인 혈당입니다",
      description:
        "현재 혈당 수치는 정상 범위입니다. 꾸준한 관리를 유지해주세요.",
      badgeBg: "#ECFDF3",
      badgeText: "#16A34A",
    };
  if (value < danger)
    return {
      statusText: "경고",
      label: "혈당 관리가 필요합니다",
      description: "혈당이 높습니다. 식단과 운동을 통한 관리가 필요합니다.",
      badgeBg: "#FFF7ED",
      badgeText: "#EA580C",
    };
  return {
    statusText: "위험",
    label: "매우 높은 혈당입니다",
    description: "위험 수준의 혈당입니다. 의료진과 상담하시기 바랍니다.",
    badgeBg: "#FEF2F2",
    badgeText: "#DC2626",
  };
};

const getCurrentTime = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/**
 * 혈당 기록 모달.
 * props: { visible, onClose, onSaved, date }
 *  - visible: 모달 표시 여부
 *  - onClose: 닫기 콜백
 *  - onSaved: 저장 성공 콜백
 *  - date: 'YYYY-MM-DD' 기록 날짜 (없으면 오늘)
 *  - diabetesType: 선택. 당뇨 유형(NONE/type1/type2/GESTATIONAL). 기본 NONE.
 */
export default function BloodsugarModal({
  visible,
  onClose,
  onSaved,
  date,
  diabetesType = "NONE",
}) {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [activeMeal, setActiveMeal] = useState("공복");
  const [activeTiming, setActiveTiming] = useState("식전");
  const [value, setValue] = useState(""); // mg/dL 문자열
  const [isSaving, setIsSaving] = useState(false);

  const meal = MEALS.find((m) => m.id === activeMeal);

  // 입력값을 숫자로 (소수 1자리까지 허용)
  const handleValueChange = (text) => {
    if (/^\d{0,3}(\.\d{0,1})?$/.test(text) || text === "") {
      setValue(text);
    }
  };

  const numericVal = parseFloat(value) || 0;

  const currentRange = getRange(diabetesType, activeMeal, activeTiming);
  const bsContext = resolveBsContext(activeMeal, activeTiming);
  const status = getStatusInfo(numericVal, currentRange);

  const guideRows = useMemo(
    () => [
      { label: "저혈당", text: `< ${HYPO_CUT}mg/dL` },
      { label: "정상", text: `${HYPO_CUT} ~ ${currentRange.warn - 1}mg/dL` },
      {
        label: "경고",
        text: `${currentRange.warn} ~ ${currentRange.danger - 1}mg/dL`,
      },
      { label: "위험", text: `≥ ${currentRange.danger}mg/dL` },
    ],
    [currentRange]
  );

  const reset = () => {
    setActiveMeal("공복");
    setActiveTiming("식전");
    setValue("");
  };

  const handleClose = () => {
    reset();
    onClose && onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (numericVal <= 0) {
      toast.error("혈당 수치를 입력해주세요");
      return;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    const selectedDate = date || todayStr;
    const timeValue = getCurrentTime();
    const suffix = meal.hasTiming ? `${activeMeal}${activeTiming}` : activeMeal;

    const payload = {
      recordDate: selectedDate,
      recordTime: `${timeValue}:00`,
      category: `${BLOOD_SUGAR}-${suffix}`,
      bloodSugar: Math.round(numericVal),
    };

    setIsSaving(true);
    try {
      await bioValueRecordApi.createBioValueRecord(userId, payload);
      toast.success("혈당이 저장되었습니다");
      onSaved && onSaved();
      reset();
      onClose && onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const mealOptions = MEALS.map((m) => ({ label: m.label, value: m.id }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-[#0f172a]/40 px-4"
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[420px] rounded-[18px] border border-[#E5E7EB] bg-white p-6"
        >
          {/* 헤더 */}
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[20px] font-bold text-[#0F172A]">
                혈당 기록하기
              </Text>
              <Text className="mt-1 text-[13px] text-[#94A3B8]">
                오늘의 혈당을 기록하세요.
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              accessibilityLabel="닫기"
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <X size={18} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 안내 박스 — 당뇨 유형 · 측정 시점별 기준 */}
            <View className="mb-4 rounded-2xl bg-[#F8FAFC] px-4 py-4">
              <Text className="mb-2 text-[12px] font-bold text-[#475569]">
                {DIABETES_LABEL[diabetesType] ?? "당뇨 없음"} · {bsContext} 기준
              </Text>
              <View className="flex-row flex-wrap">
                {guideRows.map((row) => (
                  <View key={row.label} className="w-1/2 py-0.5 pr-2">
                    <Text className="text-[12px] text-[#64748B]">
                      {row.label}: {row.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 식사 시점 선택 (Dropdown) */}
            <Text className="mb-1.5 text-[13px] font-semibold text-[#475569]">
              식사 시점
            </Text>
            <View className="mb-4">
              <Dropdown
                value={activeMeal}
                onChange={setActiveMeal}
                options={mealOptions}
                placeholder="식사 시점 선택"
              />
            </View>

            {/* 식전/식후 토글 */}
            {meal.hasTiming && (
              <View className="mb-4 flex-row justify-center gap-3">
                {TIMINGS.map((t) => {
                  const active = activeTiming === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setActiveTiming(t)}
                      className={`rounded-[14px] px-6 py-2.5 ${
                        active
                          ? "bg-[#1a1a2e]"
                          : "border border-[#E2E8F0] bg-white"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${
                          active ? "text-white" : "text-[#64748B]"
                        }`}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* 수치 입력 */}
            <View className="mb-5 flex-row items-baseline justify-center">
              <TextInput
                keyboardType="decimal-pad"
                value={value}
                onChangeText={handleValueChange}
                placeholder="00.0"
                placeholderTextColor="#CBD5E1"
                maxLength={5}
                className="text-center text-[56px] font-bold text-[#0F172A]"
                style={{ minWidth: 140 }}
              />
              <Text className="ml-1 text-[18px] font-semibold text-[#94A3B8]">
                mg/dL
              </Text>
            </View>

            {/* 혈당 상태 */}
            <View className="mb-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-[#1E293B]">
                  혈당 상태
                </Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: status.badgeBg }}
                >
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: status.badgeText }}
                  >
                    {status.statusText}
                  </Text>
                </View>
              </View>

              <View className="h-[12px] w-full flex-row overflow-hidden rounded-full">
                <View className="flex-1 bg-[#60A5FA]" />
                <View className="flex-1 bg-[#22C55E]" />
                <View className="flex-1 bg-[#FB923C]" />
                <View className="flex-1 bg-[#F87171]" />
              </View>

              <View className="mt-2 flex-row justify-between">
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  저혈당
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  정상
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  경고
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  위험
                </Text>
              </View>
            </View>

            {/* 조언 카드 */}
            <View className="mb-2 rounded-[20px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-4">
              <Text className="text-[13px] leading-5 text-[#475569]">
                {status.label}
              </Text>
              <Text className="mt-1 text-[12px] text-[#94A3B8]">
                {status.description}
              </Text>
            </View>
          </ScrollView>

          {/* 버튼 */}
          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              disabled={isSaving}
              className="flex-1 items-center rounded-[18px] border border-[#E5E7EB] bg-white py-4"
            >
              <Text className="text-[16px] font-bold text-[#64748B]">취소</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              className={`flex-[2] items-center rounded-[18px] bg-[#1a1a2e] py-4 ${
                isSaving ? "opacity-60" : ""
              }`}
            >
              <Text className="text-[16px] font-bold text-white">
                {isSaving ? "저장 중..." : "기록 저장 및 확인"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
