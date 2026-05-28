import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

/* 항목별 공유 토글 한 줄 */
function ConsentRow({ icon: Icon, label, value, onChange, disabled, badge }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569]">
          <Icon size={16} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#0F172A]">{label}</span>
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
function MemberCard({ card, isOwnerViewer, onRemove }) {
  const bloodSugarText =
    card.bloodSugar?.value != null
      ? `${card.bloodSugar.value} mg/dL`
      : !card.me && !card.consent?.shareBloodSugar
        ? "비공개"
        : "기록 없음";
  const bloodPressureText =
    card.bloodPressure?.systolic != null
      ? `${card.bloodPressure.systolic} / ${card.bloodPressure.diastolic}`
      : !card.me && !card.consent?.shareBloodPressure
        ? "비공개"
        : "기록 없음";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece8f7] text-sm font-semibold text-gray-600">
            {card.nickname?.[0] || "회"}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0F172A]">
              {card.nickname}
              {card.me && (
                <span className="ml-2 text-[11px] font-medium text-[#3B82F6]">
                  나
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
              {card.role === "OWNER" ? "오너" : "구성원"}
            </span>
          </div>
        </div>
        {isOwnerViewer && !card.me && (
          <button
            type="button"
            onClick={() => onRemove(card.userId, card.nickname)}
            className="flex items-center gap-1 rounded-lg border border-[#efc7c7] bg-[#fff6f6] px-2.5 py-1 text-[11px] font-semibold text-[#c24141] hover:bg-[#feecec]"
          >
            <UserMinus size={12} /> 추방
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <Droplet size={12} /> 혈당
          </div>
          <p
            className={`text-[15px] font-bold ${
              card.bloodSugar?.value != null
                ? "text-[#0F172A]"
                : "text-[#94A3B8]"
            }`}
          >
            {bloodSugarText}
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <HeartPulse size={12} /> 혈압
          </div>
          <p
            className={`text-[15px] font-bold ${
              card.bloodPressure?.systolic != null
                ? "text-[#0F172A]"
                : "text-[#94A3B8]"
            }`}
          >
            {bloodPressureText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [family, setFamily] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);

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
      toast.error("초대 코드를 입력해주세요.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await familyApi.join(codeInput.trim());
      setFamily(data);
      setCodeInput("");
      toast.success("가족 그룹에 합류했습니다.");
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
      toast.success("가족 그룹이 만들어졌습니다.");
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
      toast.success("초대 코드를 재발급했습니다.");
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
    if (!window.confirm("가족 그룹에서 나가시겠어요?")) return;
    try {
      await familyApi.leave();
      await refresh();
      toast.success("그룹에서 나갔습니다.");
    } catch {
      /* noop */
    }
  };

  const handleRemove = async (targetUserId, nickname) => {
    if (!window.confirm(`${nickname}님을 그룹에서 제거할까요?`)) return;
    try {
      await familyApi.removeMember(targetUserId);
      await refresh();
      toast.success("구성원을 제거했습니다.");
    } catch {
      /* noop */
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).then(
      () => toast.success("초대 코드를 복사했습니다."),
      () => toast.error("복사에 실패했습니다."),
    );
  };

  const Shell = ({ children }) => (
    <div className="min-h-screen w-full bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="min-w-0 flex-1">
          <div className="mx-auto box-border max-w-[1000px] px-6 py-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33] text-white">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-[24px] font-extrabold tracking-tight">
                  가족 건강 관리
                </h1>
                <p className="text-sm text-[#64748B]">
                  동의 기반으로 가족의 혈당·혈압을 함께 확인하세요.
                </p>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="rounded-2xl bg-white p-16 text-center text-sm text-[#64748B] shadow-sm">
          불러오는 중...
        </div>
      </Shell>
    );
  }

  const inGroup = family?.inGroup;
  const isOwner = family?.role === "OWNER";
  const canCreateGroup = subscription?.plan === "FAMILY" && subscription?.active;
  const consent = family?.myConsent ?? {};
  const members = family?.members ?? [];

  // ── 그룹 미소속 ──
  if (!inGroup) {
    return (
      <Shell>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 초대 코드로 합류 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold">초대 코드로 합류</h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              가족이 보내준 초대 코드를 입력하세요. 구독 없이도 합류할 수 있어요.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="예: AB3D9K2P"
                maxLength={12}
                className="h-11 flex-1 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm tracking-widest outline-none focus:border-[#0f1c33]"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleJoin}
                className="h-11 rounded-xl bg-[#0f1c33] px-5 text-sm font-semibold text-white hover:bg-[#1a2d4d] disabled:opacity-50"
              >
                합류
              </button>
            </div>
          </div>

          {/* 그룹 만들기 / 업셀 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold">내 가족 그룹 만들기</h2>
            {canCreateGroup ? (
              <>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  가족 플랜 이용 중입니다. 그룹을 만들고 구성원을 초대하세요.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCreateGroup}
                  className="mt-4 h-11 rounded-xl bg-[#0f1c33] px-5 text-sm font-semibold text-white hover:bg-[#1a2d4d] disabled:opacity-50"
                >
                  가족 그룹 만들기
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  가족 그룹을 만들려면 가족 플랜 구독이 필요합니다.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/member")}
                  className="mt-4 h-11 rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  구독하러 가기
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
        <div className="mb-5 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4 text-[13px] font-medium text-[#9A3412]">
          이 가족 그룹은 현재 비활성화 상태입니다. 오너의 가족 플랜이 만료되었어요.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        {/* 좌측: 그룹 정보 + 내 공유 설정 */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
              {family.groupName || "가족 그룹"}
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              오너 · {family.ownerNickname}
            </p>

            {isOwner && family.inviteCode && (
              <div className="mt-4">
                <p className="mb-1 text-[12px] text-[#64748B]">초대 코드</p>
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <span className="flex-1 text-[18px] font-bold tracking-widest text-[#0F172A]">
                    {family.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(family.inviteCode)}
                    className="rounded-lg p-1.5 text-[#475569] hover:bg-gray-200"
                    title="복사"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleRotate}
                    className="rounded-lg p-1.5 text-[#475569] hover:bg-gray-200 disabled:opacity-50"
                    title="재발급"
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
                <LogOut size={13} /> 그룹 나가기
              </button>
            )}
          </div>

          {/* 내 공유 설정 (항목별 동의) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-[15px] font-bold">내 공유 설정</h3>
            <p className="mb-4 text-[12px] text-[#64748B]">
              동의한 항목만 가족에게 공개됩니다.
            </p>
            <div className="space-y-2">
              <ConsentRow
                icon={Droplet}
                label="혈당"
                value={!!consent.shareBloodSugar}
                onChange={(v) => handleConsent("shareBloodSugar", v)}
              />
              <ConsentRow
                icon={HeartPulse}
                label="혈압"
                value={!!consent.shareBloodPressure}
                onChange={(v) => handleConsent("shareBloodPressure", v)}
              />
              <ConsentRow
                icon={Pill}
                label="복약 알림"
                value={false}
                onChange={() => {}}
                disabled
                badge="준비 중"
              />
              <ConsentRow
                icon={Dumbbell}
                label="운동 현황"
                value={false}
                onChange={() => {}}
                disabled
                badge="준비 중"
              />
            </div>
          </div>
        </div>

        {/* 우측: 구성원 목록 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">
              가족 구성원 ({members.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {members.map((card) => (
              <MemberCard
                key={card.userId}
                card={card}
                isOwnerViewer={isOwner}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
