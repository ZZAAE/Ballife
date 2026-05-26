import PrescriptionRegisterModal from "../../modals/PrescriptionRegisterModal";
import RoutineModal from "../../modals/RoutineModal";
import TargetModal from "../../modals/TargetModal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import userApi from "../../api/userApi";
import userConfigApi from "../../api/userConfigApi";
import { getBurnedCalorieByDate } from "../../api/exerciseApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  formatDiseaseSummary,
  loadCachedMemberProfile,
} from "../../utils/userProfile";

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
    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
      <div
        className="h-1.5 rounded-full bg-[#0f1c33]"
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

function UserInformation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.userId ?? user?.id;
  const [isPreResisterModalOpen, SetPreResisterModalOpen] = useState(false);
  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [isTargetModalOpen, setTargetModalOpen] = useState(false);
  const [memberProfile, setMemberProfile] = useState(() =>
    loadCachedMemberProfile(),
  );
  const [userConfig, setUserConfig] = useState(null);
  const [todayBurnedCalorie, setTodayBurnedCalorie] = useState(null);

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
        // 운동 기록 없을 수 있으니 토스트 띄우지 않고 0으로 처리
        setTodayBurnedCalorie(0);
      }
    };

    fetchMember();
    fetchUserConfig();
    fetchTodayBurnedCalorie();
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

  // 백엔드 데이터를 UI 표시용으로 변환
  const goals = {
    weight: userConfig?.targetWeight ?? null,
    water: userConfig?.targetDailyWaterIntake ?? null,
    calorieIn: userConfig?.targetDailyCaloriesIntake ?? null,
    calorieOut: userConfig?.targetDailyCaloriesBurned ?? null,
  };

  const currentWeight = memberProfile?.weight ?? null;
  const weightProgress =
    goals.weight && currentWeight
      ? Math.min(100, Math.round((currentWeight / goals.weight) * 100))
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
  const calorieInSub = `현재 섭취 칼로리 ?kcal / ${
    goals.calorieIn ? `${formatNumber(goals.calorieIn)}kcal` : "?kcal"
  } 달성`;

  const routine = ROUTINE_FIELDS.map((f) => ({
    label: f.label,
    time: formatTime(userConfig?.[f.key]),
  }));

  const handleSaveTargets = async (payload) => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
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
    toast.success("목표가 저장되었습니다.");
    return data;
  };

  const handleSaveRoutine = async (payload) => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      throw new Error("missing userId");
    }
    const body = {};
    payload.routine.forEach((item) => {
      const key = ROUTINE_LABEL_TO_KEY[item.label];
      if (key) body[key] = item.time;
    });
    const { data } = await userConfigApi.updateUserConfig(userId, body);
    setUserConfig(data);
    toast.success("루틴이 저장되었습니다.");
    return data;
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1280px] px-6 py-8">
            {/* 프로필 헤더 */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-4xl text-gray-500">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="프로필 사진"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-400">{profile.username}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/member/edit/profile")}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    프로필 수정
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/member/edit/disease")}
                    className="rounded-lg bg-[#0f1c33] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                  >
                    보유 질환 수정
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    ↩ 로그아웃
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
              {/* 좌측 패널 */}
              <div className="flex flex-col gap-5 pr-8">
                {/* 회원 정보 카드 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <h3 className="mb-4 text-[15px] font-bold tracking-tight text-[#0F172A]">
                    회원 정보
                  </h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                        이메일 주소
                      </dt>
                      <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A] break-all">
                        {profile.email}
                      </dd>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                          생년월일
                        </dt>
                        <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A] tabular-nums">
                          {profile.birth}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                          성별
                        </dt>
                        <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                          {profile.gender}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                        질환
                      </dt>
                      <dd className="mt-1 text-[13.5px] font-semibold text-[#0F172A]">
                        {profile.disease}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 우측 콘텐츠 */}
              <div className="flex flex-col gap-5">
                {/* 목표 지표 2×2 */}
                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
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
                    bgColor="#E4E9ED"
                    onBadgeClick={() => setTargetModalOpen(true)}
                  />
                  <MetricCard
                    label="목표 섭취 칼로리"
                    badge="수정"
                    value={formatNumber(goals.calorieIn)}
                    unit="kcal"
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
                </div>

                {/* 약 등록 + 하루 생활 루틴 */}
                <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* 약 등록 */}
                  <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        💊 약 등록
                      </h3>
                      <button className="text-xs text-blue-500 hover:underline">
                        편집
                      </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center rounded-xl bg-gray-100 py-6">
                      <div className="text-center text-gray-400">
                        <div className="mb-1 text-3xl">💊</div>
                        <p className="text-xs">처방전 이미지</p>
                        <p className="text-[10px] mt-0.5 text-gray-300">RX</p>
                      </div>
                    </div>
                    <button
                      className="mt-3 h-9 w-full rounded-xl bg-[#0f1c33] text-xs font-semibold text-white hover:bg-[#1a2d4d] transition-colors"
                      onClick={() => SetPreResisterModalOpen(true)}
                    >
                      사진 업로드
                    </button>
                  </div>

                  {/* 하루 생활 루틴 */}
                  <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800">
                        하루 생활 루틴
                      </h3>
                      <button
                        className="text-xs text-blue-500 hover:underline"
                        onClick={() => setRoutineModalOpen(true)}
                      >
                        루틴 수정
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      {routine.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                        >
                          <span className="text-sm text-gray-600">
                            {item.label}
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

        <PrescriptionRegisterModal
          open={isPreResisterModalOpen}
          onClose={() => SetPreResisterModalOpen(false)}
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
      </div>
    </div>
  );
}

export default UserInformation;
