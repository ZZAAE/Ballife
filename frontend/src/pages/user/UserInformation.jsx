import PrescriptionRegisterModal from "../../modals/PrescriptionRegisterModal";
import RoutineModal from "../../modals/RoutineModal";
import TargetModal from "../../modals/TargetModal";
import SubscriptionModal from "../../modals/SubscriptionModal";
import UserMedalModal from "../../modals/UserMedalModal";
import MissionModal from "../../modals/MissionModal";
import medalApi from "../../api/medalApi";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Crown, Pencil, Trash2, ChevronDown } from "lucide-react";
import userApi from "../../api/userApi";
import subscriptionApi from "../../api/subscriptionApi";
import userConfigApi from "../../api/userConfigApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import mealApi from "../../api/mealApi";
import MedicineSearchTestModal from "../../modals/MedicineSearchTestModal";
import PrescriptionOcrTestModal from "../../modals/prescriptionOcrTestModal";
import { getBurnedCalorieByDate } from "../../api/exerciseApi";
import reportApi from "../../api/reportApi";
import medicineApi from "../../api/medicineApi";

const ML_PER_CUP = 200;

const formatTodayDate = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
import { useAuth } from "../../contexts/AuthContext";
import {
  formatDiseaseSummary,
  loadCachedMemberProfile,
} from "../../utils/userProfile";
import { SCHEDULE_SLOTS } from "../../components/medication/prescriptionData";
import { translateTexts } from "../../utils/aiTranslate";

const ROUTINE_FIELDS = [
  { label: "기상", key: "wakeupTime" },
  { label: "아침", key: "breakfastTime" },
  { label: "점심", key: "lunchTime" },
  { label: "저녁", key: "dinnerTime" },
  { label: "취침", key: "bedTime" },
];

const ROUTINE_LABEL_TO_KEY = ROUTINE_FIELDS.reduce((acc, f) => {
  acc[f.label] = f.key;
  return acc;
}, {});

// 백엔드 LocalTime 직렬화 "HH:mm:ss" → "HH:mm"
const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

const formatNumber = (n) => (n == null ? "—" : Number(n).toLocaleString());

function ProgressBar({ progress }) {
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-white/70">
      <div
        className="h-2 rounded-full bg-[#0f1c33]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function MetricCard({
  label,
  badge,
  value,
  unit,
  progress,
  sub,
  bgColor,
  onBadgeClick,
}) {
  return (
    <div
      className="flex min-h-[150px] flex-col justify-between rounded-2xl border border-gray-100 p-5 shadow-sm"
      style={{ backgroundColor: bgColor || "#ffffff" }}
    >
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{label}</span>
        {badge && (
          <button
            type="button"
            onClick={onBadgeClick}
            className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500 hover:bg-blue-100 transition"
          >
            {badge}
          </button>
        )}
      </div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="mb-1 text-sm text-gray-500">{unit}</span>
      </div>
      {progress !== undefined && <ProgressBar progress={progress} />}
      {sub && <p className="mt-2 text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

// 루틴 라벨(저장/비교용 값) → i18n 표시 키 매핑.
// label 값 자체는 ROUTINE_LABEL_TO_KEY 조회와 백엔드 저장에 쓰이므로 보존하고,
// 화면 표시만 t()로 번역한다.
const ROUTINE_LABEL_I18N_KEY = {
  기상: "userInformation.routine.wakeup",
  아침: "userInformation.routine.breakfast",
  점심: "userInformation.routine.lunch",
  저녁: "userInformation.routine.dinner",
  취침: "userInformation.routine.bedtime",
};

// 성별 저장값(한글) → 표시용 i18n 키. 저장값 자체는 보존하고 표시만 번역.
const GENDER_I18N_KEY = {
  남성: "profileEditPage.gender.male",
  여성: "profileEditPage.gender.female",
};

// 복용 시간대 키워드(백엔드 한글 저장: 아침/점심/저녁/취침전) → 약 페이지 슬롯 id.
// 표시는 t(`medication.slot.${id}`) 로 번역(매칭 안 되는 값은 원문 그대로).
const INTERVAL_KEYWORD_TO_SLOT_ID = SCHEDULE_SLOTS.reduce((acc, s) => {
  acc[s.keyword] = s.id;
  return acc;
}, {});

function UserInformation() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;
  const [isPreResisterModalOpen, SetPreResisterModalOpen] = useState(false);
  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [isTargetModalOpen, setTargetModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [isMedalModalOpen, setMedalModalOpen] = useState(false);
  const [isMissionModalOpen, setMissionModalOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [userConfig, setUserConfig] = useState(null);
  const [todayBurnedCalorie, setTodayBurnedCalorie] = useState(null);
  const [todayWaterCup, setTodayWaterCup] = useState(0);
  const [todayIntakeCalorie, setTodayIntakeCalorie] = useState(0);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);
  // 처방 이름/메모(사용자 입력 한글) → 현재 언어 번역 맵 { 원문: 번역문 }
  const [txMap, setTxMap] = useState({});
  const [trackedUserId, setTrackedUserId] = useState(userId);

  // 계정이 바뀌는 순간(렌더 중) 이전 사용자의 잔여 정보를 즉시 비운다.
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

  // 백엔드에서 사용자의 처방전 목록 + 처방전별 약 목록을 함께 불러온다.
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

  // 처방 이름/메모(사용자 입력 한글)를 현재 언어로 즉석 번역해 표시.
  // ko 거나 처방이 없으면 번역하지 않음. 언어 변경 시 다시 번역.
  useEffect(() => {
    const lang = i18n.language;
    if (!lang || lang === "ko" || savedPrescriptions.length === 0) {
      setTxMap({});
      return;
    }
    const texts = [];
    savedPrescriptions.forEach((p) => {
      if (p.prescriptionName) texts.push(p.prescriptionName);
      if (p.memo) texts.push(p.memo);
    });
    if (texts.length === 0) {
      setTxMap({});
      return;
    }
    let cancelled = false;
    translateTexts(texts, lang).then((m) => {
      if (!cancelled) setTxMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, [savedPrescriptions, i18n.language]);

  // 처방전 목록 전체에서 약 정보를 평탄화해 처방전 카드에 노출한다.
  const savedMedicines = savedPrescriptions.flatMap((p) => p.medicines || []);

  // 모달에서 등록/수정이 끝나면 서버에서 최신 약 목록을 다시 불러온다.
  const handleMedicineSaved = () => {
    loadMedicinesFromServer();
  };

  // 처방전 삭제
  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm(t("userInformation.confirm.deletePrescription"))) return;
    try {
      await medicineApi.deletePrescription(prescriptionId);
      toast.success(t("userInformation.toast.prescriptionDeleted"));
      if (expandedPrescriptionId === prescriptionId) {
        setExpandedPrescriptionId(null);
      }
      loadMedicinesFromServer();
    } catch (error) {
      console.error("처방전 삭제 실패", error);
    }
  };

  // "건강 분석 보고서" 버튼 → 백엔드 LLM 분석 보고서 PDF 다운로드.
  // GET /api/health-analysis/report/monthly (JWT 인증, LLM 호출 ~5-15초 소요)
  const [reportLoading, setReportLoading] = useState(false);

  const handlePrintHealthReport = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    const toastId = toast.loading(t("userInformation.toast.reportGenerating"));

    try {
      const response = await reportApi.downloadMonthlyReport();

      // Content-Disposition 에서 파일명 추출 (백엔드가 yyyyMMdd 박아줌)
      const cd = response.headers?.["content-disposition"] || "";
      const match = cd.match(/filename="?([^";]+)"?/);
      const filename = match
        ? match[1]
        : `ballife-report-monthly-${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}.pdf`;

      // Blob 다운로드 트리거
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(t("userInformation.toast.reportDownloaded"));
    } catch (e) {
      toast.dismiss(toastId);
      // api.js 응답 인터셉터가 401 처리 + 기본 에러 토스트 자동.
      console.error("건강 분석 보고서 다운로드 실패:", e);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      const syncDraftProfile = (event) => {
        setMemberProfile(event.detail || loadCachedMemberProfile());
      };

      window.addEventListener("member-profile-updated", syncDraftProfile);
      return () =>
        window.removeEventListener("member-profile-updated", syncDraftProfile);
    }

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        // 백엔드는 profileImage 를 모르므로 localStorage 캐시의 사진을 유지
        const cached = loadCachedMemberProfile();
        setMemberProfile({
          ...data,
          profileImage: cached.profileImage ?? data.profileImage ?? null,
        });
      } catch (error) {
        toast.error(t("userInformation.toast.memberLoadFailed"));
      }
    };

    const fetchUserConfig = async () => {
      try {
        const { data } = await userConfigApi.getUserConfig(userId);
        setUserConfig(data);
      } catch (error) {
        toast.error(t("userInformation.toast.configLoadFailed"));
      }
    };

    const fetchTodayBurnedCalorie = async () => {
      try {
        const value = await getBurnedCalorieByDate(userId);
        setTodayBurnedCalorie(value ?? 0);
      } catch (error) {
        // 운동 기록 없을 수 있으니 토스트 띄우지 않고 0으로 처리
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
    const syncDraftProfile = (event) => {
      setMemberProfile((prev) => ({ ...prev, ...(event.detail || {}) }));
    };
    window.addEventListener("member-profile-updated", syncDraftProfile);
    return () =>
      window.removeEventListener("member-profile-updated", syncDraftProfile);
  }, [userId]);

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

  // 정상 기준치 (출처: 대한당뇨병학회 / 미국심장협회 가이드라인)
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

  // 백엔드 데이터를 UI 표시용으로 변환
  const goals = {
    weight: userConfig?.targetWeight ?? null,
    water: userConfig?.targetDailyWaterIntake ?? null,
    calorieIn: userConfig?.targetDailyCaloriesIntake ?? null,
    calorieOut: userConfig?.targetDailyCaloriesBurned ?? null,
  };

  const currentWeight = memberProfile?.weight ?? null;
  // 진행률: 현재와 목표가 가까울수록 100%에 수렴 (작은값 / 큰값)
  // → 목표가 현재보다 높든 낮든 일관된 의미가 됨
  const weightProgress =
    goals.weight && currentWeight
      ? Math.round(
          (Math.min(currentWeight, goals.weight) /
            Math.max(currentWeight, goals.weight)) *
            100,
        )
      : undefined;
  const weightSub = currentWeight
    ? t("userInformation.metric.currentWeight", { weight: currentWeight })
    : undefined;

  const calorieOutProgress =
    goals.calorieOut && todayBurnedCalorie != null
      ? Math.min(100, Math.round((todayBurnedCalorie / goals.calorieOut) * 100))
      : undefined;
  const calorieOutSub =
    todayBurnedCalorie != null && goals.calorieOut
      ? t("userInformation.metric.calorieOutWithGoal", {
          current: formatNumber(todayBurnedCalorie),
          goal: formatNumber(goals.calorieOut),
        })
      : todayBurnedCalorie != null
        ? t("userInformation.metric.calorieOut", {
            current: formatNumber(todayBurnedCalorie),
          })
        : undefined;
  const calorieInProgress =
    goals.calorieIn && todayIntakeCalorie != null
      ? Math.min(100, Math.round((todayIntakeCalorie / goals.calorieIn) * 100))
      : undefined;
  const calorieInSub = goals.calorieIn
    ? t("userInformation.metric.calorieInWithGoal", {
        current: formatNumber(Math.round(todayIntakeCalorie)),
        goal: formatNumber(goals.calorieIn),
      })
    : t("userInformation.metric.calorieIn", {
        current: formatNumber(Math.round(todayIntakeCalorie)),
      });

  const waterCurrentMl = todayWaterCup * ML_PER_CUP;
  const waterTargetMl = goals.water ? goals.water * ML_PER_CUP : 0;
  const waterProgress =
    goals.water && waterTargetMl > 0
      ? Math.min(100, Math.round((waterCurrentMl / waterTargetMl) * 100))
      : undefined;
  const waterSub = goals.water
    ? t("userInformation.metric.waterMl", {
        current: formatNumber(waterCurrentMl),
        target: formatNumber(waterTargetMl),
      })
    : undefined;

  const routine = ROUTINE_FIELDS.map((f) => ({
    label: f.label,
    time: formatTime(userConfig?.[f.key]),
  }));

  const handleSaveTargets = async (payload) => {
    if (!userId) {
      toast.error(t("userInformation.toast.loginRequired"));
      throw new Error("missing userId");
    }
    const body = {
      targetWeight: payload.weight,
      targetDailyWaterIntake:
        payload.water == null ? null : Math.round(payload.water),
      targetDailyCaloriesIntake:
        payload.calorieIn == null ? null : Math.round(payload.calorieIn),
      targetDailyCaloriesBurned:
        payload.calorieOut == null ? null : Math.round(payload.calorieOut),
    };
    const { data } = await userConfigApi.updateUserConfig(userId, body);
    setUserConfig(data);
    toast.success(t("userInformation.toast.targetsSaved"));
    return data;
  };

  const handleSaveRoutine = async (payload) => {
    if (!userId) {
      toast.error(t("userInformation.toast.loginRequired"));
      throw new Error("missing userId");
    }
    const body = {};
    payload.routine.forEach((item) => {
      const key = ROUTINE_LABEL_TO_KEY[item.label];
      if (key) body[key] = item.time;
    });
    const { data } = await userConfigApi.updateUserConfig(userId, body);
    setUserConfig(data);
    toast.success(t("userInformation.toast.routineSaved"));
    return data;
  };

  const handleSubscribe = async (plan) => {
    if (!userId) {
      toast.error(t("userInformation.toast.loginRequired"));
      throw new Error("missing userId");
    }
    const { data } = await subscriptionApi.activate(plan);
    setSubscription(data);
    toast.success(t("userInformation.toast.subscriptionActivated"));
    return data;
  };

  const handleCancelSubscription = async () => {
    const { data } = await subscriptionApi.cancel();
    setSubscription(data);
    toast.success(t("userInformation.toast.subscriptionCancelled"));
    return data;
  };

  const subPlan = subscription?.plan ?? "NONE";
  const subBadge =
    subPlan === "FAMILY"
      ? {
          label: t("userInformation.subscription.familyPlan"),
          cls: "bg-[#0f1c33] text-white",
        }
      : subPlan === "INDIVIDUAL"
        ? {
            label: t("userInformation.subscription.individualPlan"),
            cls: "bg-[#EFF6FF] text-[#3B82F6]",
          }
        : {
            label: t("userInformation.subscription.free"),
            cls: "bg-[#F1F5F9] text-[#64748B]",
          };
  const subExpiry = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString()
    : null;

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
        <div className="flex pt-[55px]">
          <main className="min-w-0 flex-1">
            <div className="mx-auto box-border max-w-[1280px] px-6 py-20 text-center">
              <p className="text-base text-[#64748B]">
                {t("userInformation.loginRequiredPage")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 rounded-lg bg-[#0f1c33] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
              >
                {t("userInformation.goToLogin")}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-4 sm:px-6 py-8">
            {/* 프로필 헤더 */}
            <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-4xl text-gray-500">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={t("userInformation.profileImageAlt")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="w-full sm:flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-400">{profile.username}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/member/edit/profile")}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    {t("userInformation.editProfile")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/member/edit/disease")}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    {t("userInformation.editDisease")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await medalApi.checkMedals();
                      } catch (_) {}
                      setMedalModalOpen(true);
                    }}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    {t("userInformation.medal")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMissionModalOpen(true)}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    {t("userInformation.mission")}
                  </button>

                  {/* 보유 포인트 — 버튼 줄 맨 오른쪽 */}
                  <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white">
                    <span className="text-white/70">
                      {t("userInformation.points")}
                    </span>
                    <span className="tabular-nums">
                      {t("userInformation.pointsValue", {
                        value: Number(
                          memberProfile?.point ?? 0,
                        ).toLocaleString(),
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
              {/* 좌측 패널 */}
              <div className="flex flex-col gap-5 lg:pr-8">
                {/* 구독 카드 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f1c33] text-white">
                        <Crown size={16} />
                      </div>
                      <h3 className="text-[15px] font-bold tracking-tight text-[#0F172A]">
                        {t("userInformation.subscription.title")}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${subBadge.cls}`}
                    >
                      {subBadge.label}
                    </span>
                  </div>

                  {subscription?.active ? (
                    <p className="text-[13px] text-[#64748B]">
                      {t("userInformation.subscription.activePlan", {
                        plan: subscription.planName,
                      })}
                      {subExpiry &&
                        t("userInformation.subscription.expiryUntil", {
                          date: subExpiry,
                        })}
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#64748B]">
                      {t("userInformation.subscription.promo")}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {subscription?.reportAccess && (
                      <button
                        type="button"
                        onClick={handlePrintHealthReport}
                        disabled={reportLoading}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reportLoading
                          ? t("userInformation.subscription.generating")
                          : t("userInformation.subscription.healthReportBtn")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/member/family")}
                      className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {t("userInformation.subscription.familyManage")}
                    </button>
                    {subPlan === "NONE" ? (
                      <button
                        type="button"
                        onClick={() => setSubscriptionModalOpen(true)}
                        className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                      >
                        {t("userInformation.subscription.subscribe")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubscriptionModalOpen(true)}
                        className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                      >
                        {t("userInformation.subscription.manage")}
                      </button>
                    )}
                  </div>
                </div>

                {/* 회원 정보 카드 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <h3 className="mb-4 text-[15px] font-bold tracking-tight text-[#0F172A]">
                    {t("userInformation.memberInfo.title")}
                  </h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                        {t("userInformation.memberInfo.email")}
                      </dt>
                      <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A] break-all">
                        {profile.email}
                      </dd>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                          {t("userInformation.memberInfo.birthDate")}
                        </dt>
                        <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {profile.birth}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                          {t("userInformation.memberInfo.gender")}
                        </dt>
                        <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                          {GENDER_I18N_KEY[profile.gender]
                            ? t(GENDER_I18N_KEY[profile.gender])
                            : profile.gender}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                        {t("userInformation.memberInfo.disease")}
                      </dt>
                      <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                        {profile.disease}
                      </dd>
                    </div>
                   
                  </dl>

                  {/* 정상 혈당 */}
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                      {t("userInformation.normalBloodSugar.title")}
                    </p>
                    <dl className="space-y-2">
                      <div className="flex items-center justify-between">
                        <dt className="text-[13px] text-[#475569]">
                          {t("userInformation.normalBloodSugar.fasting")}
                        </dt>
                        <dd className="text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {fallback(normalBloodSugar.fasting)}
                          {normalBloodSugar.fasting != null && (
                            <span className="ml-1 text-[12px] font-medium text-[#64748B]">
                              mg/dL
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[13px] text-[#475569]">
                          {t("userInformation.normalBloodSugar.afterMeal1h")}
                        </dt>
                        <dd className="text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {fallback(normalBloodSugar.afterMeal1h)}
                          {normalBloodSugar.afterMeal1h != null && (
                            <span className="ml-1 text-[12px] font-medium text-[#64748B]">
                              mg/dL
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[13px] text-[#475569]">
                          {t("userInformation.normalBloodSugar.afterMeal2h")}
                        </dt>
                        <dd className="text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {fallback(normalBloodSugar.afterMeal2h)}
                          {normalBloodSugar.afterMeal2h != null && (
                            <span className="ml-1 text-[12px] font-medium text-[#64748B]">
                              mg/dL
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* 정상 혈압 */}
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                      {t("userInformation.normalBloodPressure.title")}
                    </p>
                    <dl className="space-y-2">
                      <div className="flex items-center justify-between">
                        <dt className="text-[13px] text-[#475569]">
                          {t("userInformation.normalBloodPressure.systolic")}
                        </dt>
                        <dd className="text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {fallback(normalBloodPressure.systolic)}
                          {normalBloodPressure.systolic != null && (
                            <span className="ml-1 text-[12px] font-medium text-[#64748B]">
                              mmHg
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[13px] text-[#475569]">
                          {t("userInformation.normalBloodPressure.diastolic")}
                        </dt>
                        <dd className="text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {fallback(normalBloodPressure.diastolic)}
                          {normalBloodPressure.diastolic != null && (
                            <span className="ml-1 text-[12px] font-medium text-[#64748B]">
                              mmHg
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* 건강 리포트 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <h3 className="mb-4 text-[15px] font-bold tracking-tight text-[#0F172A]">
                    {t("userInformation.healthReport.title")}
                  </h3>
                  <p className="mb-4 text-[13px] text-[#64748B]">
                    {t("userInformation.healthReport.subtitle")}
                  </p>

                  {recentReports.length > 0 && (
                    <ul className="mb-4 space-y-3">
                      {recentReports.map((report, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">
                            {report.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-[#0F172A]">
                              {report.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#94A3B8] tabular-nums">
                              {report.period}
                            </p>
                          </div>
                          <span className="text-[#CBD5E1]">›</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/report/health")}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0f1c33] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2d4d]"
                  >
                    {t("userInformation.healthReport.viewBtn")}
                    <span aria-hidden>›</span>
                  </button>
                </div>
              </div>

              {/* 우측 콘텐츠 */}
              <div className="flex flex-col gap-5">
                {/* 목표 지표 2×2 */}
                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                  <MetricCard
                    label={t("userInformation.metric.targetWeight")}
                    badge={t("userInformation.metric.editBadge")}
                    value={goals.weight ?? "—"}
                    unit="kg"
                    progress={weightProgress}
                    sub={weightSub}
                    bgColor="#DAE4F3"
                    onBadgeClick={() => setTargetModalOpen(true)}
                  />
                  <MetricCard
                    label={t("userInformation.metric.targetWater")}
                    badge={t("userInformation.metric.editBadge")}
                    value={goals.water ?? "—"}
                    unit={t("userInformation.metric.cupUnit")}
                    progress={waterProgress}
                    sub={waterSub}
                    bgColor="#E4E9ED"
                    onBadgeClick={() => setTargetModalOpen(true)}
                  />
                  <MetricCard
                    label={t("userInformation.metric.targetCalorieIn")}
                    badge={t("userInformation.metric.editBadge")}
                    value={formatNumber(goals.calorieIn)}
                    unit="kcal"
                    progress={calorieInProgress}
                    sub={calorieInSub}
                    bgColor="#E4E9ED"
                    onBadgeClick={() => setTargetModalOpen(true)}
                  />
                  <MetricCard
                    label={t("userInformation.metric.targetCalorieOut")}
                    badge={t("userInformation.metric.editBadge")}
                    value={formatNumber(goals.calorieOut)}
                    unit="kcal"
                    progress={calorieOutProgress}
                    sub={calorieOutSub}
                    bgColor="#DAE4F3"
                    onBadgeClick={() => setTargetModalOpen(true)}
                  />
                </div>

                {/* 약 등록 + 하루 생활 루틴 */}
                <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* 약 등록 */}
                  <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        {t("userInformation.prescription.title")}
                      </h3>
                    </div>
                    <div
                      className={`flex flex-1 flex-col rounded-2xl bg-gray-100 p-4 min-h-[260px] max-h-[460px] overflow-y-auto ${
                        savedPrescriptions.length > 0
                          ? ""
                          : "items-center justify-center"
                      }`}
                    >
                      {savedPrescriptions.length > 0 ? (
                        <div className="flex w-full flex-col gap-3">
                          {savedPrescriptions.map((p) => {
                            const expanded =
                              expandedPrescriptionId === p.prescriptionId;
                            const medicines = p.medicines || [];
                            // "아침,점심,저녁" → ["아침","점심","저녁"]
                            const intervals = (p.intakeIntervals || "")
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            return (
                              <div
                                key={p.prescriptionId}
                                className="rounded-xl border border-gray-200 bg-white p-4"
                              >
                                {/* 처방전 이름 + 수정/삭제 */}
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-bold text-gray-900 break-all">
                                    {p.prescriptionName
                                      ? txMap[p.prescriptionName] ||
                                        p.prescriptionName
                                      : t("userInformation.prescription.noName")}
                                  </p>
                                  <div className="flex flex-shrink-0 items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingPrescription(p)}
                                      className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                      aria-label={t(
                                        "userInformation.prescription.editAria",
                                      )}
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeletePrescription(
                                          p.prescriptionId,
                                        )
                                      }
                                      className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                      aria-label={t(
                                        "userInformation.prescription.deleteAria",
                                      )}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>

                                {/* 복용 시간대 배지 (이름 아래) — 한글 키워드를 현재 언어로 표시 */}
                                {intervals.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {intervals.map((iv) => {
                                      const slotId =
                                        INTERVAL_KEYWORD_TO_SLOT_ID[iv];
                                      return (
                                        <span
                                          key={iv}
                                          className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600"
                                        >
                                          {slotId
                                            ? t(`medication.slot.${slotId}`)
                                            : iv}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 메모 (입력된 경우만) — 사용자 입력값을 현재 언어로 번역 표시 */}
                                {p.memo && (
                                  <p className="mt-1 text-xs text-gray-500 break-words">
                                    {txMap[p.memo] || p.memo}
                                  </p>
                                )}

                                {/* 약 목록 보기 토글 버튼 */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedPrescriptionId((prev) =>
                                      prev === p.prescriptionId
                                        ? null
                                        : p.prescriptionId,
                                    )
                                  }
                                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"
                                >
                                  {t("userInformation.prescription.medicineCount", {
                                    count: medicines.length,
                                  })}
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform ${
                                      expanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>

                                {/* 펼쳤을 때만 저장된 약 이름 표시 */}
                                {expanded && (
                                  <ul className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-2">
                                    {medicines.length > 0 ? (
                                      medicines.map((m, idx) => (
                                        <li
                                          key={m.userMedicationId ?? idx}
                                          className="text-xs text-gray-700 break-words"
                                        >
                                          •{" "}
                                          {m.medicineName ||
                                            t(
                                              "userInformation.prescription.noName",
                                            )}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-xs text-gray-400">
                                        {t(
                                          "userInformation.prescription.noMedicines",
                                        )}
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-5xl">💊</div>
                          <p className="text-xs text-gray-400">
                            {t("userInformation.prescription.emptyTitle")}
                          </p>
                          <p className="text-[10px] text-gray-300">
                            {t("userInformation.prescription.emptyHint")}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      className="mt-3 h-11 w-full rounded-xl bg-[#0f1c33] text-sm font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                      onClick={() => SetPreResisterModalOpen(true)}
                    >
                      {t("userInformation.prescription.uploadBtn")}
                    </button>
                  </div>

                  {/* 하루 생활 루틴 */}
                  <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        {t("userInformation.routine.title")}
                      </h3>
                      <button
                        className="text-xs text-blue-500 hover:underline"
                        onClick={() => setRoutineModalOpen(true)}
                      >
                        {t("userInformation.routine.edit")}
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      {routine.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                        >
                          <span className="text-sm text-gray-600">
                            {ROUTINE_LABEL_I18N_KEY[item.label]
                              ? t(ROUTINE_LABEL_I18N_KEY[item.label])
                              : item.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* <PrescriptionRegisterModal
          open={isPreResisterModalOpen}
          onClose={() => SetPreResisterModalOpen(false)}
        /> */}

        {/* <MedicineSearchTestModal
          isOpen={isPreResisterModalOpen}
          onClose={() => SetPreResisterModalOpen(false)}
          onSaved={handleMedicineSaved}
        /> */}

        <PrescriptionOcrTestModal
          isOpen={isPreResisterModalOpen}
          onClose={() => SetPreResisterModalOpen(false)}
          onSaved={handleMedicineSaved}
        />

        <PrescriptionOcrTestModal
          key={editingPrescription?.prescriptionId ?? "edit"}
          isOpen={!!editingPrescription}
          prescription={editingPrescription}
          onClose={() => setEditingPrescription(null)}
          onSaved={handleMedicineSaved}
        />

        <RoutineModal
          open={isRoutineModalOpen}
          onClose={() => setRoutineModalOpen(false)}
          onSubmit={handleSaveRoutine}
          initialRoutine={routine}
        />

        <TargetModal
          open={isTargetModalOpen}
          onClose={() => setTargetModalOpen(false)}
          onSubmit={handleSaveTargets}
          initialTargets={{
            weight: goals.weight ?? "",
            water: goals.water ?? "",
            calorieIn: goals.calorieIn ?? "",
            calorieOut: goals.calorieOut ?? "",
          }}
        />

        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onClose={() => setSubscriptionModalOpen(false)}
          onSubmit={handleSubscribe}
          onCancel={handleCancelSubscription}
          currentPlan={subPlan}
        />

        <UserMedalModal
          open={isMedalModalOpen}
          onClose={() => setMedalModalOpen(false)}
        />

        <MissionModal
          open={isMissionModalOpen}
          onClose={() => setMissionModalOpen(false)}
          onClaimed={(newPoint) =>
            setMemberProfile((prev) =>
              prev ? { ...prev, point: newPoint } : prev,
            )
          }
        />
      </div>
    </div>
  );
}

export default UserInformation;
