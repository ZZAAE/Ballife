import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
} from "lucide-react-native";
import toast from "../../lib/toast";
import { useAuth } from "../../context/AuthContext";
import familyApi from "../../api/familyApi";
import subscriptionApi from "../../api/subscriptionApi";
import SubscriptionModal from "../../components/modals/SubscriptionModal";

/* 항목별 공유 토글 한 줄 */
function ConsentRow({ icon: Icon, label, value, onChange, disabled, badge }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
          <Icon size={16} color="#475569" />
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] font-medium text-[#0F172A]">{label}</Text>
          {badge && (
            <View className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5">
              <Text className="text-[10px] font-semibold text-[#94A3B8]">{badge}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        disabled={disabled}
        onPress={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full ${value ? "bg-[#0f1c33]" : "bg-gray-300"} ${disabled ? "opacity-50" : ""}`}
      >
        <View
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${value ? "left-[22px]" : "left-0.5"}`}
        />
      </Pressable>
    </View>
  );
}

/* 구성원 건강 카드 */
function MemberCard({ card, isOwnerViewer, groupActive, onRemove }) {
  const locked = !card.me && !groupActive;
  const has = {
    bloodSugar: !locked && card.bloodSugar?.value != null,
    bloodPressure: !locked && card.bloodPressure?.systolic != null,
    exercise: !locked && !!card.exercise?.exerciseName,
    medication: !locked && card.medication?.total != null,
  };
  const bloodSugarText = locked
    ? "비공개"
    : has.bloodSugar
      ? `${card.bloodSugar.value} mg/dL`
      : !card.me && !card.consent?.shareBloodSugar
        ? "비공개"
        : "기록 없음";
  const bloodPressureText = locked
    ? "비공개"
    : has.bloodPressure
      ? `${card.bloodPressure.systolic} / ${card.bloodPressure.diastolic}`
      : !card.me && !card.consent?.shareBloodPressure
        ? "비공개"
        : "기록 없음";
  const exerciseText = (() => {
    if (locked) return "비공개";
    if (card.exercise?.exerciseName) {
      const kcal = card.exercise.burnedCalorie;
      return kcal != null
        ? `${card.exercise.exerciseName} · ${kcal} kcal`
        : card.exercise.exerciseName;
    }
    if (!card.me && !card.consent?.shareExercise) return "비공개";
    return "기록 없음";
  })();
  const medicationText = (() => {
    if (locked) return "비공개";
    if (card.medication?.total != null) {
      const { taken = 0, total } = card.medication;
      return taken >= total ? "복용 완료" : `${taken}/${total} 복용`;
    }
    if (!card.me && !card.consent?.shareMedication) return "비공개";
    return "기록 없음";
  })();

  return (
    <View className="flex-1 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#ece8f7]">
            <Text className="text-sm font-semibold text-gray-600">
              {card.nickname?.[0] || "회"}
            </Text>
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-[14px] font-semibold text-[#0F172A]">
                {card.nickname}
              </Text>
              {card.me && (
                <Text className="ml-2 text-[11px] font-medium text-[#3B82F6]">나</Text>
              )}
            </View>
            <View
              className={`mt-0.5 self-start rounded-full px-2 py-0.5 ${card.role === "OWNER" ? "bg-[#0f1c33]" : "bg-[#F1F5F9]"}`}
            >
              <Text
                className={`text-[10px] font-semibold ${card.role === "OWNER" ? "text-white" : "text-[#64748B]"}`}
              >
                {card.role === "OWNER" ? "오너" : "구성원"}
              </Text>
            </View>
          </View>
        </View>
        {isOwnerViewer && !card.me && (
          <Pressable
            onPress={() => onRemove(card.userId, card.nickname)}
            className="flex-row items-center gap-1 rounded-lg border border-[#efc7c7] bg-[#fff6f6] px-2.5 py-1"
          >
            <UserMinus size={12} color="#c24141" />
            <Text className="text-[11px] font-semibold text-[#c24141]">추방</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row flex-wrap gap-3">
        <View className="flex-1 rounded-xl bg-white px-4 py-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Droplet size={12} color="#64748B" />
            <Text className="text-[11px] text-[#64748B]">혈당</Text>
          </View>
          <Text className={`text-[15px] font-bold ${has.bloodSugar ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {bloodSugarText}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-white px-4 py-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <HeartPulse size={12} color="#64748B" />
            <Text className="text-[11px] text-[#64748B]">혈압</Text>
          </View>
          <Text className={`text-[15px] font-bold ${has.bloodPressure ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {bloodPressureText}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-white px-4 py-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Dumbbell size={12} color="#64748B" />
            <Text className="text-[11px] text-[#64748B]">최근 운동</Text>
          </View>
          <Text className={`text-[15px] font-bold ${has.exercise ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {exerciseText}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-white px-4 py-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Pill size={12} color="#64748B" />
            <Text className="text-[11px] text-[#64748B]">복약 현황</Text>
          </View>
          <Text className={`text-[15px] font-bold ${has.medication ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {medicationText}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* 페이지 공통 셸 */
function Shell({ children }) {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="mb-6 flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33]">
              <Users size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-[24px] font-extrabold text-[#0F172A]">
                가족 건강 관리
              </Text>
              <Text className="text-sm text-[#64748B]">
                동의 기반으로 가족의 혈당·혈압을 함께 확인하세요.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/member")}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2"
          >
            <Text className="text-[13px] font-semibold text-gray-600">이전</Text>
          </Pressable>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function FamilyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [family, setFamily] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

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
    // RN 에는 window.confirm 이 없으므로 바로 진행
    try {
      await familyApi.leave();
      await refresh();
      toast.success("그룹에서 나갔습니다.");
    } catch {
      /* noop */
    }
  };

  const handleRemove = async (targetUserId) => {
    // RN 에는 window.confirm 이 없으므로 바로 진행
    try {
      await familyApi.removeMember(targetUserId);
      await refresh();
      toast.success("구성원을 제거했습니다.");
    } catch {
      /* noop */
    }
  };

  // 클립보드 모듈 미설치 — 코드 자체는 화면에 노출되어 있으므로 안내만 표시
  const copyCode = () => {
    toast.info("초대 코드를 길게 눌러 복사하세요.");
  };

  if (loading) {
    return (
      <Shell>
        <View className="rounded-2xl bg-white p-16 shadow-sm">
          <Text className="text-center text-sm text-[#64748B]">불러오는 중...</Text>
        </View>
      </Shell>
    );
  }

  const inGroup = family?.inGroup;
  const isOwner = family?.role === "OWNER";
  const canCreateGroup =
    subscription?.plan === "FAMILY" && subscription?.active;
  const consent = family?.myConsent ?? {};
  const members = family?.members ?? [];

  // ── 그룹 미소속 ──
  if (!inGroup) {
    return (
      <Shell>
        <View className="gap-5">
          {/* 초대 코드로 합류 */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-[16px] font-bold text-[#0F172A]">초대 코드로 합류</Text>
            <Text className="mt-1 text-[13px] text-[#64748B]">
              가족이 보내준 초대 코드를 입력하세요. 구독 없이도 합류할 수 있어요.
            </Text>
            <View className="mt-4 flex-row gap-2">
              <TextInput
                value={codeInput}
                onChangeText={(t) => setCodeInput(t.toUpperCase())}
                placeholder="예: AB3D9K2P"
                maxLength={12}
                autoCapitalize="characters"
                className="h-11 flex-1 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm tracking-widest text-[#0F172A]"
              />
              <Pressable
                disabled={busy}
                onPress={handleJoin}
                className={`h-11 justify-center rounded-xl bg-[#0f1c33] px-5 ${busy ? "opacity-50" : ""}`}
              >
                <Text className="text-sm font-semibold text-white">합류</Text>
              </Pressable>
            </View>
          </View>

          {/* 그룹 만들기 / 업셀 */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-[16px] font-bold text-[#0F172A]">내 가족 그룹 만들기</Text>
            {canCreateGroup ? (
              <>
                <Text className="mt-1 text-[13px] text-[#64748B]">
                  가족 플랜 이용 중입니다. 그룹을 만들고 구성원을 초대하세요.
                </Text>
                <Pressable
                  disabled={busy}
                  onPress={handleCreateGroup}
                  className={`mt-4 h-11 justify-center self-start rounded-xl bg-[#0f1c33] px-5 ${busy ? "opacity-50" : ""}`}
                >
                  <Text className="text-sm font-semibold text-white">가족 그룹 만들기</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mt-1 text-[13px] text-[#64748B]">
                  가족 그룹을 만들려면 가족 플랜 구독이 필요합니다.
                </Text>
                <Pressable
                  onPress={() => router.push("/member")}
                  className="mt-4 h-11 justify-center self-start rounded-xl border border-gray-300 px-5"
                >
                  <Text className="text-sm font-semibold text-gray-700">구독하러 가기</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Shell>
    );
  }

  // ── 그룹 소속 ──
  return (
    <Shell>
      {!family.groupActive && (
        <View className="mb-5 flex-row items-center justify-between gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4">
          <Text className="flex-1 text-[13px] font-medium text-[#9A3412]">
            이 가족 그룹은 현재 비활성화 상태입니다. 오너의 가족 플랜이 만료되었어요.
          </Text>
          {isOwner && (
            <Pressable
              onPress={() => setSubscriptionOpen(true)}
              className="shrink-0 rounded-lg bg-[#9A3412] px-3 py-2"
            >
              <Text className="text-[12px] font-semibold text-white">구독 갱신</Text>
            </Pressable>
          )}
        </View>
      )}

      <View className="gap-5">
        {/* 그룹 정보 */}
        <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
            {family.groupName || "가족 그룹"}
          </Text>
          <Text className="mt-1 text-[14px] font-semibold text-[#0F172A]">
            오너 · {family.ownerNickname}
          </Text>

          {isOwner && family.inviteCode && (
            <View className="mt-4">
              <Text className="mb-1 text-[12px] text-[#64748B]">초대 코드</Text>
              <View className="flex-row items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <Text
                  selectable
                  className="flex-1 text-[18px] font-bold tracking-widest text-[#0F172A]"
                >
                  {family.inviteCode}
                </Text>
                <Pressable onPress={copyCode} className="rounded-lg p-1.5">
                  <Copy size={16} color="#475569" />
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={handleRotate}
                  className={`rounded-lg p-1.5 ${busy ? "opacity-50" : ""}`}
                >
                  <RefreshCw size={16} color="#475569" />
                </Pressable>
              </View>
            </View>
          )}

          {!isOwner && (
            <Pressable
              onPress={handleLeave}
              className="mt-4 flex-row items-center gap-1.5 self-start rounded-lg border border-gray-300 px-4 py-2"
            >
              <LogOut size={13} color="#4b5563" />
              <Text className="text-[12px] font-semibold text-gray-600">그룹 나가기</Text>
            </Pressable>
          )}
        </View>

        {/* 내 공유 설정 */}
        <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="mb-1 text-[15px] font-bold text-[#0F172A]">내 공유 설정</Text>
          <Text className="mb-4 text-[12px] text-[#64748B]">
            동의한 항목만 가족에게 공개됩니다.
          </Text>
          <View className="gap-2">
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
              label="복약 현황"
              value={!!consent.shareMedication}
              onChange={(v) => handleConsent("shareMedication", v)}
            />
            <ConsentRow
              icon={Dumbbell}
              label="최근 운동"
              value={!!consent.shareExercise}
              onChange={(v) => handleConsent("shareExercise", v)}
            />
          </View>
        </View>

        {/* 구성원 목록 */}
        <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-[15px] font-bold text-[#0F172A]">
            가족 구성원 ({members.length})
          </Text>
          <View className="gap-4">
            {members.map((card) => (
              <MemberCard
                key={card.userId}
                card={card}
                isOwnerViewer={isOwner}
                groupActive={family.groupActive}
                onRemove={handleRemove}
              />
            ))}
          </View>
        </View>
      </View>

      <SubscriptionModal
        visible={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        onSaved={refresh}
        currentPlan={subscription?.plan ?? "NONE"}
      />
    </Shell>
  );
}
