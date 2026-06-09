import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Users,
  Copy,
  RefreshCw,
  LogOut,
  UserMinus,
  Droplet,
  HeartPulse,
  Pill,
  Dumbbell,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import familyApi from "../../api/familyApi";
import subscriptionApi from "../../api/subscriptionApi";
import SubscriptionModal from "../../modals/SubscriptionModal";

/* 항목별 공유 토글 한 줄 */
function ConsentRow({ icon: Icon, label, value, onChange, disabled, badge }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569]">
          <Icon size={16} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#0F172A]">
            {label}
          </span>
          {badge && (
            <span className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold text-[#94A3B8]">
              {badge}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${
          value ? "bg-[#0f1c33]" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            value ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* 구성원 건강 카드 */
function MemberCard({ card, isOwnerViewer, groupActive, onRemove }) {
  const { t } = useTranslation();
  // 그룹 비활성(오너가 가족 플랜이 아닐 때) → 본인 외 모든 항목 비공개
  const locked = !card.me && !groupActive;
  const has = {
    bloodSugar: !locked && card.bloodSugar?.value != null,
    bloodPressure: !locked && card.bloodPressure?.systolic != null,
    exercise: !locked && !!card.exercise?.exerciseName,
    medication: !locked && card.medication?.total != null,
  };
  const bloodSugarText = locked
    ? t("familyPage.private")
    : has.bloodSugar
      ? t("familyPage.bloodSugarValue", { value: card.bloodSugar.value })
      : !card.me && !card.consent?.shareBloodSugar
        ? t("familyPage.private")
        : t("familyPage.noRecord");
  const bloodPressureText = locked
    ? t("familyPage.private")
    : has.bloodPressure
      ? `${card.bloodPressure.systolic} / ${card.bloodPressure.diastolic}`
      : !card.me && !card.consent?.shareBloodPressure
        ? t("familyPage.private")
        : t("familyPage.noRecord");
  const exerciseText = (() => {
    if (locked) return t("familyPage.private");
    if (card.exercise?.exerciseName) {
      const kcal = card.exercise.burnedCalorie;
      return kcal != null
        ? t("familyPage.exerciseValue", {
            name: card.exercise.exerciseName,
            kcal,
          })
        : card.exercise.exerciseName;
    }
    if (!card.me && !card.consent?.shareExercise) return t("familyPage.private");
    return t("familyPage.noRecord");
  })();
  const medicationText = (() => {
    if (locked) return t("familyPage.private");
    if (card.medication?.total != null) {
      const { taken = 0, total } = card.medication;
      return taken >= total
        ? t("familyPage.medicationDone")
        : t("familyPage.medicationProgress", { taken, total });
    }
    if (!card.me && !card.consent?.shareMedication)
      return t("familyPage.private");
    return t("familyPage.noRecord");
  })();

  return (
    <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece8f7] text-sm font-semibold text-gray-600">
            {card.nickname?.[0] || t("familyPage.avatarFallback")}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0F172A]">
              {card.nickname}
              {card.me && (
                <span className="ml-2 text-[11px] font-medium text-[#3B82F6]">
                  {t("familyPage.me")}
                </span>
              )}
            </p>
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                card.role === "OWNER"
                  ? "bg-[#0f1c33] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {card.role === "OWNER" ? t("familyPage.roleOwner") : t("familyPage.roleMember")}
            </span>
          </div>
        </div>
        {isOwnerViewer && !card.me && (
          <button
            type="button"
            onClick={() => onRemove(card.userId, card.nickname)}
            className="flex items-center gap-1 rounded-lg border border-[#efc7c7] bg-[#fff6f6] px-2.5 py-1 text-[11px] font-semibold text-[#c24141] hover:bg-[#feecec]"
          >
            <UserMinus size={12} /> {t("familyPage.kick")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <Droplet size={12} /> {t("familyPage.bloodSugar")}
          </div>
          <p
            className={`text-[15px] font-bold ${
              has.bloodSugar ? "text-[#0F172A]" : "text-[#94A3B8]"
            }`}
          >
            {bloodSugarText}
          </p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <HeartPulse size={12} /> {t("familyPage.bloodPressure")}
          </div>
          <p
            className={`text-[15px] font-bold ${
              has.bloodPressure ? "text-[#0F172A]" : "text-[#94A3B8]"
            }`}
          >
            {bloodPressureText}
          </p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <Dumbbell size={12} /> {t("familyPage.recentExercise")}
          </div>
          <p
            className={`text-[15px] font-bold ${
              has.exercise ? "text-[#0F172A]" : "text-[#94A3B8]"
            }`}
          >
            {exerciseText}
          </p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <Pill size={12} /> {t("familyPage.medicationStatus")}
          </div>
          <p
            className={`text-[15px] font-bold ${
              has.medication ? "text-[#0F172A]" : "text-[#94A3B8]"
            }`}
          >
            {medicationText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* 페이지 공통 셸 — FamilyPage 밖(모듈 스코프)에 두어야 한다.
   컴포넌트 안에 정의하면 렌더마다 새 함수가 되어 React 가 하위 트리를
   통째로 언마운트/재마운트하고, 입력창 포커스가 매 글자마다 풀린다. */
function Shell({ children }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1000px] px-6 py-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33] text-white">
                  <Users size={20} />
                </div>
                <div>
                  <h1 className="text-[24px] font-extrabold tracking-tight">
                    {t("familyPage.headerTitle")}
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    {t("familyPage.headerSubtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/member")}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100"
              >
                {t("familyPage.back")}
              </button>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [family, setFamily] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [famRes, subRes] = await Promise.allSettled([
      familyApi.getMyFamily(),
      subscriptionApi.getMySubscription(),
    ]);
    if (famRes.status === "fulfilled") setFamily(famRes.value.data);
    if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

  const handleJoin = async () => {
    if (!codeInput.trim()) {
      toast.error(t("familyPage.toast.codeRequired"));
      return;
    }
    setBusy(true);
    try {
      const { data } = await familyApi.join(codeInput.trim());
      setFamily(data);
      setCodeInput("");
      toast.success(t("familyPage.toast.joined"));
    } catch {
      /* 인터셉터 토스트 */
    } finally {
      setBusy(false);
    }
  };

  const handleCreateGroup = async () => {
    setBusy(true);
    try {
      const { data } = await familyApi.createGroup();
      setFamily(data);
      toast.success(t("familyPage.toast.groupCreated"));
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  };

  const handleRotate = async () => {
    setBusy(true);
    try {
      await familyApi.rotateInviteCode();
      await refresh();
      toast.success(t("familyPage.toast.codeRotated"));
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  };

  const handleConsent = async (key, value) => {
    try {
      const { data } = await familyApi.updateConsent({ [key]: value });
      setFamily(data);
    } catch {
      /* noop */
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(t("familyPage.confirm.leave"))) return;
    try {
      await familyApi.leave();
      await refresh();
      toast.success(t("familyPage.toast.left"));
    } catch {
      /* noop */
    }
  };

  const handleRemove = async (targetUserId, nickname) => {
    if (!window.confirm(t("familyPage.confirm.remove", { nickname }))) return;
    try {
      await familyApi.removeMember(targetUserId);
      await refresh();
      toast.success(t("familyPage.toast.removed"));
    } catch {
      /* noop */
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).then(
      () => toast.success(t("familyPage.toast.codeCopied")),
      () => toast.error(t("familyPage.toast.copyFailed")),
    );
  };

  // 모달에서 플랜 결제 → 가족/구독 상태 갱신 (그룹 재활성화 반영)
  const handleSubscribe = async (plan) => {
    const { data } = await subscriptionApi.activate(plan);
    await refresh();
    toast.success(t("familyPage.toast.subscribed"));
    return data;
  };

  const handleCancelSubscription = async () => {
    const { data } = await subscriptionApi.cancel();
    await refresh();
    toast.success(t("familyPage.toast.subscriptionCancelled"));
    return data;
  };

  if (loading) {
    return (
      <Shell>
        <div className="rounded-2xl bg-white p-16 text-center text-sm text-[#64748B] shadow-sm">
          {t("familyPage.loading")}
        </div>
      </Shell>
    );
  }

  const inGroup = family?.inGroup;
  const isOwner = family?.role === "OWNER";
  const canCreateGroup =
    subscription?.plan === "FAMILY" && subscription?.active;
  const consent = family?.myConsent ?? {};
  // TODO(임시): 레이아웃 확인용 더미 형제 2명 — 확인 후 제거
  const DUMMY_SIBLINGS = [
    {
      userId: "dummy-bro-1",
      nickname: "원준",
      me: false,
      role: "MEMBER",
      bloodSugar: { value: 98 },
      bloodPressure: { systolic: 118, diastolic: 76 },
      exercise: { exerciseName: "러닝", burnedCalorie: 240 },
      medication: { taken: 2, total: 2 },
      consent: {
        shareBloodSugar: true,
        shareBloodPressure: true,
        shareMedication: true,
        shareExercise: true,
      },
    },
    {
      userId: "dummy-bro-2",
      nickname: "초딩",
      me: false,
      role: "MEMBER",
      bloodSugar: { value: 105 },
      bloodPressure: { systolic: 122, diastolic: 80 },
      exercise: { exerciseName: "수영", burnedCalorie: 310 },
      medication: { taken: 1, total: 3 },
      consent: {
        shareBloodSugar: true,
        shareBloodPressure: true,
        shareMedication: true,
        shareExercise: true,
      },
    },
  ];
  const members = [...(family?.members ?? []), ...DUMMY_SIBLINGS];

  // ── 그룹 미소속 ──
  if (!inGroup) {
    return (
      <Shell>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 초대 코드로 합류 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold">{t("familyPage.joinTitle")}</h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              {t("familyPage.joinDescription")}
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder={t("familyPage.codePlaceholder")}
                maxLength={12}
                className="h-11 flex-1 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm tracking-widest outline-none focus:border-[#0f1c33]"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleJoin}
                className="h-11 rounded-xl bg-[#0f1c33] px-5 text-sm font-semibold text-white hover:bg-[#1a2d4d] disabled:opacity-50"
              >
                {t("familyPage.join")}
              </button>
            </div>
          </div>

          {/* 그룹 만들기 / 업셀 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold">{t("familyPage.createTitle")}</h2>
            {canCreateGroup ? (
              <>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {t("familyPage.createDescriptionActive")}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCreateGroup}
                  className="mt-4 h-11 rounded-xl bg-[#0f1c33] px-5 text-sm font-semibold text-white hover:bg-[#1a2d4d] disabled:opacity-50"
                >
                  {t("familyPage.createGroup")}
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {t("familyPage.createDescriptionUpsell")}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/member")}
                  className="mt-4 h-11 rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  {t("familyPage.goSubscribe")}
                </button>
              </>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ── 그룹 소속 ──
  return (
    <Shell>
      {!family.groupActive && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4 text-[13px] font-medium text-[#9A3412]">
          <span>
            {t("familyPage.inactiveBanner")}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setSubOpen(true)}
              className="shrink-0 rounded-lg bg-[#9A3412] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#7c2d10]"
            >
              {t("familyPage.renewSubscription")}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        {/* 좌측: 그룹 정보 + 내 공유 설정 */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
              {family.groupName || t("familyPage.groupNameFallback")}
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              {t("familyPage.ownerLabel", { nickname: family.ownerNickname })}
            </p>

            {isOwner && family.inviteCode && (
              <div className="mt-4">
                <p className="mb-1 text-[12px] text-[#64748B]">{t("familyPage.inviteCode")}</p>
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <span className="flex-1 text-[18px] font-bold tracking-widest text-[#0F172A]">
                    {family.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(family.inviteCode)}
                    className="rounded-lg p-1.5 text-[#475569] hover:bg-gray-200"
                    title={t("familyPage.copy")}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleRotate}
                    className="rounded-lg p-1.5 text-[#475569] hover:bg-gray-200 disabled:opacity-50"
                    title={t("familyPage.rotate")}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            )}

            {!isOwner && (
              <button
                type="button"
                onClick={handleLeave}
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-100"
              >
                <LogOut size={13} /> {t("familyPage.leaveGroup")}
              </button>
            )}
          </div>

          {/* 내 공유 설정 (항목별 동의) — flex-1 로 남은 높이를 채운다.
              제목/설명은 위에 고정하고, 토글 목록만 남은 공간에서 세로 중앙(justify-center) */}
          <div className="flex flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-[15px] font-bold">{t("familyPage.myShareSettings")}</h3>
            <p className="mb-4 text-[12px] text-[#64748B]">
              {t("familyPage.shareSettingsDescription")}
            </p>
            <div className="flex flex-1 flex-col justify-center gap-2">
              <ConsentRow
                icon={Droplet}
                label={t("familyPage.bloodSugar")}
                value={!!consent.shareBloodSugar}
                onChange={(v) => handleConsent("shareBloodSugar", v)}
              />
              <ConsentRow
                icon={HeartPulse}
                label={t("familyPage.bloodPressure")}
                value={!!consent.shareBloodPressure}
                onChange={(v) => handleConsent("shareBloodPressure", v)}
              />
              <ConsentRow
                icon={Pill}
                label={t("familyPage.medicationStatus")}
                value={!!consent.shareMedication}
                onChange={(v) => handleConsent("shareMedication", v)}
              />
              <ConsentRow
                icon={Dumbbell}
                label={t("familyPage.recentExercise")}
                value={!!consent.shareExercise}
                onChange={(v) => handleConsent("shareExercise", v)}
              />
            </div>
          </div>
        </div>

        {/* 우측: 구성원 목록 — 헤더를 카드 안 상단에 두어 좌측 카드와 윗변을 맞춘다 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-[15px] font-bold">
            {t("familyPage.membersTitle", { count: members.length })}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {members.map((card) => (
              <MemberCard
                key={card.userId}
                card={card}
                isOwnerViewer={isOwner}
                groupActive={family.groupActive}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      </div>

      <SubscriptionModal
        open={subOpen}
        onClose={() => setSubOpen(false)}
        onSubmit={handleSubscribe}
        onCancel={handleCancelSubscription}
        currentPlan={subscription?.plan ?? "NONE"}
      />
    </Shell>
  );
}
