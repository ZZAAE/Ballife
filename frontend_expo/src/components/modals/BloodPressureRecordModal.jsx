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
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

// 백엔드 BioValueRecord.category 의 혈압 접두어
const BLOOD_PRESSURE = "BloodPressure";

const TABS = ["아침", "점심", "저녁", "취침전"];

const resolveUserId = (user) =>
  user?.userId ?? user?.id ?? user?.memberId ?? null;

const pad = (n) => String(n).padStart(2, "0");

/**
 * 혈압 기록 모달.
 * props: { visible, onClose, onSaved, date }
 *  - visible: 모달 표시 여부
 *  - onClose: 닫기 콜백
 *  - onSaved: 저장 성공 콜백
 *  - date: 'YYYY-MM-DD' 기록 날짜 (없으면 오늘)
 */
export default function BloodPressureRecordModal({
  visible,
  onClose,
  onSaved,
  date,
}) {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [activeTab, setActiveTab] = useState("아침");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNumberChange = (setter) => (text) => {
    const onlyNumber = text.replace(/[^0-9]/g, "").slice(0, 3);
    setter(onlyNumber);
  };

  const reset = () => {
    setActiveTab("아침");
    setSystolic("");
    setDiastolic("");
  };

  const handleClose = () => {
    reset();
    onClose && onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    if (!s || !d || s <= 0 || d <= 0) {
      toast.error("수축기와 이완기 혈압을 모두 입력해주세요.");
      return;
    }
    if (s <= d) {
      toast.error("수축기 혈압은 이완기 혈압보다 커야 합니다.");
      return;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    const targetDate = date || todayStr;
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`;
    const category = `${BLOOD_PRESSURE}-${activeTab}`;
    const payload = {
      recordDate: targetDate,
      recordTime,
      category,
      systolicBP: s,
      diastolicBP: d,
    };

    setSubmitting(true);
    try {
      await bioValueRecordApi.createBioValueRecord(userId, payload);
      toast.success("혈압이 기록되었습니다.");
      onSaved && onSaved();
      reset();
      onClose && onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "저장에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const bpInfo = useMemo(() => {
    const s = Number(systolic);
    const d = Number(diastolic);

    if (!systolic && !diastolic) {
      return {
        label: "값 입력 전",
        badgeBg: "#F1F5F9",
        badgeText: "#64748B",
        comment:
          "수축기와 이완기 값을 입력하면 현재 혈압 상태를 확인할 수 있어요.",
      };
    }
    if ((systolic && s <= 90) || (diastolic && d <= 60)) {
      return {
        label: "저혈압",
        badgeBg: "#EFF6FF",
        badgeText: "#2563EB",
        comment: "현재 혈압은 낮은 편으로 보여요.",
      };
    }
    if ((systolic && s >= 140) || (diastolic && d >= 90)) {
      return {
        label: "고혈압",
        badgeBg: "#FEF2F2",
        badgeText: "#DC2626",
        comment: "현재 혈압은 높은 편으로 보여요.",
      };
    }
    if ((systolic && s >= 120) || (diastolic && d >= 80)) {
      return {
        label: "주의 수치",
        badgeBg: "#FFF7ED",
        badgeText: "#EA580C",
        comment: "정상 범위보다 조금 높게 측정됐어요.",
      };
    }
    return {
      label: "정상 수치",
      badgeBg: "#ECFDF3",
      badgeText: "#16A34A",
      comment: "현재 혈압 흐름은 안정적인 편이에요.",
    };
  }, [systolic, diastolic]);

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
                혈압 기록하기
              </Text>
              <Text className="mt-1 text-[13px] text-[#94A3B8]">
                오늘의 혈압 상태를 간단하게 확인하고 기록해보세요.
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
            {/* 안내 박스 */}
            <View className="mb-4 rounded-2xl bg-[#F8FAFC] px-4 py-4">
              <Text className="mb-1 text-[12px] text-[#64748B]">
                정상 혈압: 수축기 120mmHg 미만, 이완기 80mmHg 미만
              </Text>
              <Text className="mb-1 text-[12px] text-[#64748B]">
                고혈압: 수축기 140mmHg 이상 또는 이완기 90mmHg 이상
              </Text>
              <Text className="text-[12px] text-[#64748B]">
                저혈압: 수축기 90mmHg 이하 또는 이완기 60mmHg 이하
              </Text>
            </View>

            {/* 탭 */}
            <View className="mb-5 flex-row rounded-2xl bg-[#F1F5F9] p-1.5">
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`flex-1 items-center rounded-xl px-1 py-2.5 ${
                      active ? "bg-white" : ""
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        active ? "text-[#2563EB]" : "text-[#64748B]"
                      }`}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 입력 카드 */}
            <View className="mb-5 flex-row gap-4">
              <View className="flex-1 rounded-[24px] border border-[#E2E8F0] bg-[#FCFDFE] px-3 py-5">
                <Text className="text-center text-[14px] font-semibold text-[#94A3B8]">
                  수축기
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={systolic}
                  onChangeText={handleNumberChange(setSystolic)}
                  placeholder="00"
                  placeholderTextColor="#CBD5E1"
                  maxLength={3}
                  className="mt-2 text-center text-[44px] font-bold text-[#0F172A]"
                />
                <Text className="mt-1 text-center text-[12px] font-medium text-[#94A3B8]">
                  mmHg
                </Text>
              </View>

              <View className="flex-1 rounded-[24px] border border-[#E2E8F0] bg-[#FCFDFE] px-3 py-5">
                <Text className="text-center text-[14px] font-semibold text-[#94A3B8]">
                  이완기
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={diastolic}
                  onChangeText={handleNumberChange(setDiastolic)}
                  placeholder="00"
                  placeholderTextColor="#CBD5E1"
                  maxLength={3}
                  className="mt-2 text-center text-[44px] font-bold text-[#0F172A]"
                />
                <Text className="mt-1 text-center text-[12px] font-medium text-[#94A3B8]">
                  mmHg
                </Text>
              </View>
            </View>

            {/* 혈압 상태 */}
            <View className="mb-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-[#1E293B]">
                  혈압 상태
                </Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: bpInfo.badgeBg }}
                >
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: bpInfo.badgeText }}
                  >
                    {bpInfo.label}
                  </Text>
                </View>
              </View>

              <View className="h-[10px] w-full flex-row overflow-hidden rounded-full">
                <View className="flex-1 bg-[#60A5FA]" />
                <View className="flex-1 bg-[#22C55E]" />
                <View className="flex-1 bg-[#FB923C]" />
                <View className="flex-1 bg-[#F87171]" />
              </View>

              <View className="mt-2 flex-row justify-between">
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  저혈압
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  정상
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  주의
                </Text>
                <Text className="text-[11px] font-medium text-[#94A3B8]">
                  고혈압
                </Text>
              </View>
            </View>

            {/* 조언 카드 */}
            <View className="mb-2 rounded-[20px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-4">
              <Text className="text-[13px] leading-5 text-[#475569]">
                {bpInfo.comment}
              </Text>
            </View>
          </ScrollView>

          {/* 버튼 */}
          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              disabled={submitting}
              className="flex-1 items-center rounded-[18px] border border-[#E5E7EB] bg-white py-4"
            >
              <Text className="text-[16px] font-bold text-[#64748B]">취소</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`flex-[2] items-center rounded-[18px] bg-[#1a1a2e] py-4 ${
                submitting ? "opacity-60" : ""
              }`}
            >
              <Text className="text-[16px] font-bold text-white">
                {submitting ? "저장 중..." : "기록 저장 및 확인"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
