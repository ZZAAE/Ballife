import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Crown, Pencil, Trash2, ChevronDown } from "lucide-react-native";
import toast from "../lib/toast";
import { useAuth } from "../context/AuthContext";
import userApi from "../api/userApi";
import subscriptionApi from "../api/subscriptionApi";
import userConfigApi from "../api/userConfigApi";
import bioValueRecordApi from "../api/bioValueRecordApi";
import mealApi from "../api/mealApi";
import medalApi from "../api/medalApi";
import medicineApi from "../api/medicineApi";
import reportApi from "../api/reportApi";
import { getBurnedCalorieByDate } from "../api/exerciseApi";
import TargetModal from "../components/modals/TargetModal";
import RoutineModal from "../components/modals/RoutineModal";
import SubscriptionModal from "../components/modals/SubscriptionModal";
import MissionModal from "../components/modals/MissionModal";
import UserMedalModal from "../components/modals/UserMedalModal";
import PrescriptionRegisterModal from "../components/modals/PrescriptionRegisterModal";
import PrescriptionDetailModal from "../components/modals/PrescriptionDetailModal";

const ML_PER_CUP = 200;

const formatTodayDate = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ROUTINE_FIELDS = [
  { label: "기상", key: "wakeupTime" },
  { label: "아침", key: "breakfastTime" },
  { label: "점심", key: "lunchTime" },
  { label: "저녁", key: "dinnerTime" },
  { label: "취침", key: "bedTime" },
];

// ── userProfile 유틸 인라인 포팅 (웹 utils 는 localStorage/window 의존이라 미포팅) ──
// 질환 요약은 순수 함수라 그대로 가져온다. localStorage 캐시 로직은 RN 에서 제거.
const DISEASE_FIELDS = [
  {
    name: "hyperlipidemia",
    summary: "고지혈증",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고콜레스테롤혈증" },
      { value: "type2", label: "고LDL콜레스테롤혈증" },
      { value: "type3", label: "고중성지방혈증" },
      { value: "type4", label: "저HDL콜레스테롤혈증" },
    ],
  },
  {
    name: "hypertension",
    summary: "고혈압",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고혈압 전단계" },
      { value: "type2", label: "1기" },
      { value: "type3", label: "2기" },
    ],
  },
  {
    name: "osteoporosis",
    summary: "골다공증",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "osteopenia", label: "골감소증" },
      { value: "osteoporosis", label: "골다공증" },
    ],
  },
  {
    name: "diabetes",
    summary: "당뇨",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "1형" },
      { value: "type2", label: "2형" },
      { value: "GESTATIONAL", label: "임신성" },
    ],
  },
  {
    name: "gout",
    summary: "통풍",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "ASYMPTOMATIC", label: "고요산혈증" },
      { value: "ACUTE", label: "급성" },
      { value: "INTERMITTENT", label: "간헐기" },
      { value: "CHRONIC", label: "만성" },
    ],
  },
];

function parseDiseaseIndex(diseaseIndex) {
  const next = DISEASE_FIELDS.reduce((acc, f) => {
    acc[f.name] = "NONE";
    return acc;
  }, {});
  if (!diseaseIndex) return next;
  for (const entry of String(diseaseIndex).split(",")) {
    const [rawKey, rawValue] = entry.split(":");
    const key = rawKey?.trim();
    const value = rawValue?.trim();
    if (!key || !value || !(key in next)) continue;
    next[key] = value;
  }
  return next;
}

function formatDiseaseSummary(diseaseIndex) {
  const parsed = parseDiseaseIndex(diseaseIndex);
  const selected = DISEASE_FIELDS.flatMap((field) => {
    const selectedValue = parsed[field.name];
    if (!selectedValue || selectedValue === "NONE") return [];
    const option = field.options.find((item) => item.value === selectedValue);
    if (!option || option.label === "해당 없음") return [field.summary];
    return [`${field.summary} (${option.label})`];
  });
  return selected.length > 0 ? selected.join(", ") : "없음";
}

// 백엔드 LocalTime "HH:mm:ss" → "HH:mm"
const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

const formatNumber = (n) => (n == null ? "—" : Number(n).toLocaleString());

function ProgressBar({ progress }) {
  return (
    <View className="mt-2 h-2 w-full rounded-full bg-white/70">
      <View
        className="h-2 rounded-full bg-[#0f1c33]"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}

function MetricCard({ label, badge, value, unit, progress, sub, bgColor, onBadgeClick }) {
  return (
    <View
      className="min-h-[150px] flex-1 justify-between rounded-2xl border border-gray-100 p-5 shadow-sm"
      style={{ backgroundColor: bgColor || "#ffffff" }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">{label}</Text>
        {badge && (
          <Pressable
            onPress={onBadgeClick}
            className="rounded-full bg-blue-50 px-2 py-0.5"
          >
            <Text className="text-[11px] font-medium text-blue-500">{badge}</Text>
          </Pressable>
        )}
      </View>
      <View className="mt-2 flex-row items-end gap-1">
        <Text className="text-3xl font-bold text-gray-900">{value}</Text>
        <Text className="mb-1 text-sm text-gray-500">{unit}</Text>
      </View>
      {progress !== undefined && <ProgressBar progress={progress} />}
      {sub && <Text className="mt-2 text-[11px] text-gray-400">{sub}</Text>}
    </View>
  );
}

export default function UserInformation() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };
  const userId = user?.userId ?? user?.id;
  const [subscription, setSubscription] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [userConfig, setUserConfig] = useState(null);
  const [todayBurnedCalorie, setTodayBurnedCalorie] = useState(null);
  const [todayWaterCup, setTodayWaterCup] = useState(0);
  const [todayIntakeCalorie, setTodayIntakeCalorie] = useState(0);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [trackedUserId, setTrackedUserId] = useState(userId);

  // 모달 열림 상태
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [medalModalOpen, setMedalModalOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState(null);

  // 모달 저장 후 페이지 데이터 재조회를 트리거하는 키
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshPage = () => setRefreshKey((k) => k + 1);

  // 계정이 바뀌는 순간 이전 사용자의 잔여 정보를 즉시 비운다.
  if (trackedUserId !== userId) {
    setTrackedUserId(userId);
    setMemberProfile(null);
    setUserConfig(null);
    setSubscription(null);
    setTodayBurnedCalorie(null);
    setTodayWaterCup(0);
    setTodayIntakeCalorie(0);
    setSavedPrescriptions([]);
    setExpandedPrescriptionId(null);
  }

  // 백엔드에서 처방전 목록 + 처방전별 약 목록을 함께 불러온다.
  const loadMedicinesFromServer = useCallback(async () => {
    if (!userId) {
      setSavedPrescriptions([]);
      return;
    }
    try {
      const { data: prescriptions } = await medicineApi.getPrescriptions(userId);
      const withMedicines = await Promise.all(
        (prescriptions || []).map((p) =>
          medicineApi
            .getUserMedicine(p.prescriptionId)
            .then((res) => ({ ...p, medicines: res.data || [] }))
            .catch(() => ({ ...p, medicines: [] })),
        ),
      );
      setSavedPrescriptions(withMedicines);
    } catch {
      setSavedPrescriptions([]);
    }
  }, [userId]);

  useEffect(() => {
    loadMedicinesFromServer();
  }, [loadMedicinesFromServer]);

  // 처방전 삭제 (RN 에는 window.confirm 이 없으므로 바로 진행)
  const handleDeletePrescription = async (prescriptionId) => {
    try {
      await medicineApi.deletePrescription(prescriptionId);
      toast.success("처방전이 삭제되었습니다.");
      if (expandedPrescriptionId === prescriptionId) {
        setExpandedPrescriptionId(null);
      }
      loadMedicinesFromServer();
    } catch (error) {
      console.error("처방전 삭제 실패", error);
    }
  };

  // "건강 분석 보고서" — RN 에서는 blob 다운로드 트리거 불가. 호출만 유지하고 안내.
  const handlePrintHealthReport = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    try {
      await reportApi.downloadMonthlyReport();
      toast.success("건강 분석 보고서가 생성되었습니다.");
    } catch (e) {
      console.error("건강 분석 보고서 다운로드 실패:", e);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        setMemberProfile(data);
      } catch (error) {
        toast.error("회원 정보를 불러오지 못했습니다.");
      }
    };

    const fetchUserConfig = async () => {
      try {
        const { data } = await userConfigApi.getUserConfig(userId);
        setUserConfig(data);
      } catch (error) {
        toast.error("목표/루틴 정보를 불러오지 못했습니다.");
      }
    };

    const fetchTodayBurnedCalorie = async () => {
      try {
        const value = await getBurnedCalorieByDate(userId);
        setTodayBurnedCalorie(value ?? 0);
      } catch (error) {
        setTodayBurnedCalorie(0);
      }
    };

    const fetchTodayWater = async () => {
      try {
        const { data } = await bioValueRecordApi.searchByDate(
          userId,
          "water",
          formatTodayDate(),
        );
        const totalCups = (data || []).reduce(
          (sum, r) => sum + (r.waterIntakeCup || 0),
          0,
        );
        setTodayWaterCup(totalCups);
      } catch (error) {
        setTodayWaterCup(0);
      }
    };

    const fetchTodayIntakeCalorie = async () => {
      try {
        const { data } = await mealApi.getDayTotalNutrient(
          userId,
          formatTodayDate(),
        );
        const kcal = Array.isArray(data) ? Number(data[0]) || 0 : 0;
        setTodayIntakeCalorie(kcal);
      } catch (error) {
        setTodayIntakeCalorie(0);
      }
    };

    const fetchSubscription = async () => {
      try {
        const { data } = await subscriptionApi.getMySubscription();
        setSubscription(data);
      } catch (error) {
        // 미구독/오류 시 무시
      }
    };

    fetchMember();
    fetchUserConfig();
    fetchTodayBurnedCalorie();
    fetchTodayWater();
    fetchTodayIntakeCalorie();
    fetchSubscription();
  }, [userId, refreshKey]);

  const profile = {
    name: memberProfile?.username ?? "—",
    username: memberProfile?.nickname ?? user?.nickname ?? "",
    email: memberProfile?.email ?? "—",
    birth: memberProfile?.birthDate ?? "—",
    gender: memberProfile?.gender ?? "—",
    disease: formatDiseaseSummary(memberProfile?.diseaseIndex) ?? "—",
    profileImage: memberProfile?.profileImage ?? null,
  };

  const fallback = (value) => (value == null || value === "" ? "?" : value);

  const normalBloodSugar = {
    fasting: memberProfile?.normalFastingGlucose ?? "70~99",
    afterMeal1h: memberProfile?.normalGlucoseAfter1h ?? "<180",
    afterMeal2h: memberProfile?.normalGlucoseAfter2h ?? "<140",
  };

  const normalBloodPressure = {
    systolic: memberProfile?.normalSystolicBP ?? "<120",
    diastolic: memberProfile?.normalDiastolicBP ?? "<80",
  };

  const formatDateRange = (start, end) => {
    const fmt = (d) =>
      `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getDate(),
      ).padStart(2, "0")}`;
    return `${fmt(start)} ~ ${fmt(end)}`;
  };

  const buildWeeklyReports = () => {
    const reports = memberProfile?.recentReports;
    if (!Array.isArray(reports) || reports.length === 0) return [];
    return reports.map((report) => {
      let periodLabel = "?";
      if (report?.weekStart && report?.weekEnd) {
        const start = new Date(report.weekStart);
        const end = new Date(report.weekEnd);
        if (!isNaN(start) && !isNaN(end)) {
          periodLabel = formatDateRange(start, end);
        }
      }
      return {
        icon: report?.icon ?? "📊",
        title: report?.title ?? "?",
        period: periodLabel,
      };
    });
  };

  const recentReports = buildWeeklyReports();

  const goals = {
    weight: userConfig?.targetWeight ?? null,
    water: userConfig?.targetDailyWaterIntake ?? null,
    calorieIn: userConfig?.targetDailyCaloriesIntake ?? null,
    calorieOut: userConfig?.targetDailyCaloriesBurned ?? null,
  };

  const currentWeight = memberProfile?.weight ?? null;
  const weightProgress =
    goals.weight && currentWeight
      ? Math.round(
          (Math.min(currentWeight, goals.weight) /
            Math.max(currentWeight, goals.weight)) *
            100,
        )
      : undefined;
  const weightSub = currentWeight ? `현재 체중 ${currentWeight}kg` : undefined;

  const calorieOutProgress =
    goals.calorieOut && todayBurnedCalorie != null
      ? Math.min(100, Math.round((todayBurnedCalorie / goals.calorieOut) * 100))
      : undefined;
  const calorieOutSub =
    todayBurnedCalorie != null && goals.calorieOut
      ? `현재 소모 칼로리 ${formatNumber(todayBurnedCalorie)}kcal / ${formatNumber(goals.calorieOut)}kcal 달성`
      : todayBurnedCalorie != null
        ? `현재 소모 칼로리 ${formatNumber(todayBurnedCalorie)}kcal`
        : undefined;
  const calorieInProgress =
    goals.calorieIn && todayIntakeCalorie != null
      ? Math.min(100, Math.round((todayIntakeCalorie / goals.calorieIn) * 100))
      : undefined;
  const calorieInSub = goals.calorieIn
    ? `현재 섭취 칼로리 ${formatNumber(Math.round(todayIntakeCalorie))}kcal / ${formatNumber(goals.calorieIn)}kcal 달성`
    : `현재 섭취 칼로리 ${formatNumber(Math.round(todayIntakeCalorie))}kcal`;

  const waterCurrentMl = todayWaterCup * ML_PER_CUP;
  const waterTargetMl = goals.water ? goals.water * ML_PER_CUP : 0;
  const waterProgress =
    goals.water && waterTargetMl > 0
      ? Math.min(100, Math.round((waterCurrentMl / waterTargetMl) * 100))
      : undefined;
  const waterSub = goals.water
    ? `${formatNumber(waterCurrentMl)} ml / ${formatNumber(waterTargetMl)} ml`
    : undefined;

  const routine = ROUTINE_FIELDS.map((f) => ({
    label: f.label,
    time: formatTime(userConfig?.[f.key]),
  }));

  // 메달 체크 후 메달 모달 열기 (포인트 기준 자동 지급 반영)
  const handleOpenMedals = async () => {
    try {
      await medalApi.checkMedals();
    } catch (_) {}
    setMedalModalOpen(true);
  };

  const subPlan = subscription?.plan ?? "NONE";
  const subBadge =
    subPlan === "FAMILY"
      ? { label: "가족 플랜", cls: "bg-[#0f1c33]", txt: "text-white" }
      : subPlan === "INDIVIDUAL"
        ? { label: "개인 플랜", cls: "bg-[#EFF6FF]", txt: "text-[#3B82F6]" }
        : { label: "무료", cls: "bg-[#F1F5F9]", txt: "text-[#64748B]" };
  const subExpiry = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString()
    : null;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-[#64748B]">
            로그인이 필요한 페이지입니다.
          </Text>
          <Pressable
            onPress={() => router.push("/login")}
            className="mt-4 rounded-lg bg-[#0f1c33] px-5 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              로그인 하러 가기
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* 프로필 헤더 */}
        <View className="mb-8 flex-row items-center gap-4">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-300">
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl text-gray-500">👤</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {profile.name}
            </Text>
            <Text className="text-sm text-gray-400">{profile.username}</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2"
          >
            <Text className="text-xs font-semibold text-[#DC2626]">로그아웃</Text>
          </Pressable>
        </View>

        <View className="mb-6 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => router.push("/member/edit/profile")}
            className="rounded-lg bg-[#0f1c33] px-4 py-2"
          >
            <Text className="text-xs font-semibold text-white">프로필 수정</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/member/edit/disease")}
            className="rounded-lg bg-[#0f1c33] px-4 py-2"
          >
            <Text className="text-xs font-semibold text-white">보유 질환 수정</Text>
          </Pressable>
          <Pressable
            onPress={handleOpenMedals}
            className="rounded-lg bg-[#0f1c33] px-4 py-2"
          >
            <Text className="text-xs font-semibold text-white">🏅 메달</Text>
          </Pressable>
          <Pressable
            onPress={() => setMissionModalOpen(true)}
            className="rounded-lg bg-[#0f1c33] px-4 py-2"
          >
            <Text className="text-xs font-semibold text-white">🎯 미션</Text>
          </Pressable>
        </View>

        {/* 구독 카드 */}
        <View className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#0f1c33]">
                <Crown size={16} color="#ffffff" />
              </View>
              <Text className="text-[15px] font-bold text-[#0F172A]">구독</Text>
            </View>
            <View className={`rounded-full px-2.5 py-0.5 ${subBadge.cls}`}>
              <Text className={`text-[11px] font-semibold ${subBadge.txt}`}>
                {subBadge.label}
              </Text>
            </View>
          </View>

          {subscription?.active ? (
            <Text className="text-[13px] text-[#64748B]">
              {subscription.planName} 이용 중
              {subExpiry ? ` · ${subExpiry}까지` : ""}
            </Text>
          ) : (
            <Text className="text-[13px] text-[#64748B]">
              플랜을 구독하고 건강 리포트와 가족 건강 공유를 이용해 보세요.
            </Text>
          )}

          <View className="mt-4 flex-row flex-wrap gap-2">
            {subscription?.reportAccess && (
              <Pressable
                onPress={handlePrintHealthReport}
                disabled={reportLoading}
                className={`rounded-lg border border-gray-300 px-4 py-1.5 ${reportLoading ? "opacity-50" : ""}`}
              >
                <Text className="text-xs font-semibold text-gray-600">
                  {reportLoading ? "생성 중…" : "건강 분석 보고서"}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/member/family")}
              className="rounded-lg border border-gray-300 px-4 py-1.5"
            >
              <Text className="text-xs font-semibold text-gray-600">가족 관리</Text>
            </Pressable>
            <Pressable
              onPress={() => setSubscriptionModalOpen(true)}
              className="rounded-lg bg-[#0f1c33] px-4 py-1.5"
            >
              <Text className="text-xs font-semibold text-white">
                {subPlan === "NONE" ? "구독하기" : "구독 관리"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 회원 정보 카드 */}
        <View className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-[15px] font-bold text-[#0F172A]">회원 정보</Text>
          <View className="gap-4">
            <View>
              <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                이메일 주소
              </Text>
              <Text className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                {profile.email}
              </Text>
            </View>
            <View className="flex-row gap-8">
              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                  생년월일
                </Text>
                <Text className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                  {profile.birth}
                </Text>
              </View>
              <View>
                <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                  성별
                </Text>
                <Text className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                  {profile.gender}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                질환
              </Text>
              <Text className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                {profile.disease}
              </Text>
            </View>
          </View>

          {/* 정상 혈당 */}
          <View className="mt-5 border-t border-gray-100 pt-5">
            <Text className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
              정상 혈당
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] text-[#475569]">공복</Text>
                <Text className="text-[13.5px] font-semibold text-[#0F172A]">
                  {fallback(normalBloodSugar.fasting)}
                  {normalBloodSugar.fasting != null ? "  mg/dL" : ""}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] text-[#475569]">식사 1시간</Text>
                <Text className="text-[13.5px] font-semibold text-[#0F172A]">
                  {fallback(normalBloodSugar.afterMeal1h)}
                  {normalBloodSugar.afterMeal1h != null ? "  mg/dL" : ""}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] text-[#475569]">식사 2시간</Text>
                <Text className="text-[13.5px] font-semibold text-[#0F172A]">
                  {fallback(normalBloodSugar.afterMeal2h)}
                  {normalBloodSugar.afterMeal2h != null ? "  mg/dL" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* 정상 혈압 */}
          <View className="mt-5 border-t border-gray-100 pt-5">
            <Text className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
              정상 혈압
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] text-[#475569]">수축기</Text>
                <Text className="text-[13.5px] font-semibold text-[#0F172A]">
                  {fallback(normalBloodPressure.systolic)}
                  {normalBloodPressure.systolic != null ? "  mmHg" : ""}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] text-[#475569]">이완기</Text>
                <Text className="text-[13.5px] font-semibold text-[#0F172A]">
                  {fallback(normalBloodPressure.diastolic)}
                  {normalBloodPressure.diastolic != null ? "  mmHg" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 건강 리포트 */}
        <View className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-[15px] font-bold text-[#0F172A]">건강 리포트</Text>
          <Text className="mb-4 text-[13px] text-[#64748B]">
            나의 최근 건강 지표를 한눈에 확인하세요.
          </Text>

          {recentReports.length > 0 && (
            <View className="mb-4 gap-3">
              {recentReports.map((report, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Text className="text-base">{report.icon}</Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[13px] font-semibold text-[#0F172A]" numberOfLines={1}>
                      {report.title}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-[#94A3B8]">
                      {report.period}
                    </Text>
                  </View>
                  <Text className="text-[#CBD5E1]">›</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => router.push("/report/health")}
            className="w-full flex-row items-center justify-center gap-1.5 rounded-xl bg-[#0f1c33] px-4 py-2.5"
          >
            <Text className="text-[13px] font-semibold text-white">건강 리포트 보기 ›</Text>
          </Pressable>
        </View>

        {/* 목표 지표 2×2 */}
        <View className="mb-5 gap-5">
          <View className="flex-row gap-5">
            <MetricCard
              label="목표 체중"
              badge="수정"
              value={goals.weight ?? "—"}
              unit="kg"
              progress={weightProgress}
              sub={weightSub}
              bgColor="#DAE4F3"
              onBadgeClick={() => setTargetModalOpen(true)}
            />
            <MetricCard
              label="목표 음수량"
              badge="수정"
              value={goals.water ?? "—"}
              unit="잔"
              progress={waterProgress}
              sub={waterSub}
              bgColor="#E4E9ED"
              onBadgeClick={() => setTargetModalOpen(true)}
            />
          </View>
          <View className="flex-row gap-5">
            <MetricCard
              label="목표 섭취 칼로리"
              badge="수정"
              value={formatNumber(goals.calorieIn)}
              unit="kcal"
              progress={calorieInProgress}
              sub={calorieInSub}
              bgColor="#E4E9ED"
              onBadgeClick={() => setTargetModalOpen(true)}
            />
            <MetricCard
              label="목표 소모 칼로리"
              badge="수정"
              value={formatNumber(goals.calorieOut)}
              unit="kcal"
              progress={calorieOutProgress}
              sub={calorieOutSub}
              bgColor="#DAE4F3"
              onBadgeClick={() => setTargetModalOpen(true)}
            />
          </View>
        </View>

        {/* 처방전 목록 */}
        <View className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-gray-800">💊 처방전 목록</Text>
          </View>
          <View className="rounded-2xl bg-gray-100 p-4">
            {savedPrescriptions.length > 0 ? (
              <View className="gap-3">
                {savedPrescriptions.map((p) => {
                  const expanded = expandedPrescriptionId === p.prescriptionId;
                  const medicines = p.medicines || [];
                  const intervals = (p.intakeIntervals || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  return (
                    <View
                      key={p.prescriptionId}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <View className="flex-row items-start justify-between gap-2">
                        <Text className="flex-1 text-sm font-bold text-gray-900">
                          {p.prescriptionName || "이름 없음"}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Pressable
                            onPress={() =>
                              setDetailGroup({ ...p, groupName: p.prescriptionName })
                            }
                            className="rounded-md p-1"
                          >
                            <Pencil size={15} color="#9ca3af" />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeletePrescription(p.prescriptionId)}
                            className="rounded-md p-1"
                          >
                            <Trash2 size={15} color="#9ca3af" />
                          </Pressable>
                        </View>
                      </View>

                      {intervals.length > 0 && (
                        <View className="mt-2 flex-row flex-wrap gap-1">
                          {intervals.map((t) => (
                            <View
                              key={t}
                              className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5"
                            >
                              <Text className="text-[11px] font-semibold text-blue-600">
                                {t}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {p.memo && (
                        <Text className="mt-1 text-xs text-gray-500">{p.memo}</Text>
                      )}

                      <Pressable
                        onPress={() =>
                          setExpandedPrescriptionId((prev) =>
                            prev === p.prescriptionId ? null : p.prescriptionId,
                          )
                        }
                        className="mt-3 flex-row items-center gap-1"
                      >
                        <Text className="text-xs font-semibold text-blue-500">
                          약 목록 {medicines.length}개
                        </Text>
                        <ChevronDown
                          size={14}
                          color="#3b82f6"
                          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
                        />
                      </Pressable>

                      {expanded && (
                        <View className="mt-2 gap-1 border-t border-gray-100 pt-2">
                          {medicines.length > 0 ? (
                            medicines.map((m, idx) => (
                              <Text
                                key={m.userMedicationId ?? idx}
                                className="text-xs text-gray-700"
                              >
                                • {m.medicineName || "이름 없음"}
                              </Text>
                            ))
                          ) : (
                            <Text className="text-xs text-gray-400">
                              등록된 약이 없습니다.
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="items-center gap-2 py-10">
                <Text className="text-5xl">💊</Text>
                <Text className="text-xs text-gray-400">등록된 처방전이 없습니다</Text>
                <Text className="text-[10px] text-gray-300">
                  아래 버튼으로 처방전을 등록하세요
                </Text>
              </View>
            )}
          </View>
          <Pressable
            className="mt-3 h-11 w-full items-center justify-center rounded-xl bg-[#0f1c33]"
            onPress={() => setRegisterOpen(true)}
          >
            <Text className="text-sm font-semibold text-white">처방전 업로드</Text>
          </Pressable>
        </View>

        {/* 하루 생활 루틴 */}
        <View className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-gray-800">하루 생활 루틴</Text>
            <Pressable onPress={() => setRoutineModalOpen(true)}>
              <Text className="text-xs text-blue-500">루틴 수정</Text>
            </Pressable>
          </View>
          <View>
            {routine.map((item, idx) => (
              <View
                key={item.label}
                className={`flex-row items-center justify-between py-3 ${idx < routine.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Text className="text-sm text-gray-600">{item.label}</Text>
                <Text className="text-sm font-semibold text-gray-800">{item.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ───────── 모달 ───────── */}
      <TargetModal
        visible={targetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        onSaved={refreshPage}
        initialTargets={goals}
      />
      <RoutineModal
        visible={routineModalOpen}
        onClose={() => setRoutineModalOpen(false)}
        onSaved={refreshPage}
        initialRoutine={routine}
      />
      <SubscriptionModal
        visible={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSaved={refreshPage}
        currentPlan={subPlan}
      />
      <MissionModal
        visible={missionModalOpen}
        onClose={() => setMissionModalOpen(false)}
        onSaved={refreshPage}
      />
      <UserMedalModal
        visible={medalModalOpen}
        onClose={() => setMedalModalOpen(false)}
        onSaved={refreshPage}
      />
      <PrescriptionRegisterModal
        visible={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={loadMedicinesFromServer}
      />
      <PrescriptionDetailModal
        visible={!!detailGroup}
        group={detailGroup}
        onClose={() => setDetailGroup(null)}
        onSaved={loadMedicinesFromServer}
      />
    </SafeAreaView>
  );
}
