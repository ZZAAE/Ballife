import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, Image } from "react-native";
import medalApi from "../../api/medalApi";
import userApi from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

/*
 * UserMedalModal
 * props:
 *  - visible: 모달 열림 여부
 *  - onClose: 닫기 핸들러
 *  - onSaved: 장착 변경 성공 시 콜백 (선택)
 */
const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

// 깨진 메달 아이콘은 숨김 처리하기 위한 작은 컴포넌트
function MedalIcon({ uri, size }) {
  const [hidden, setHidden] = useState(false);
  if (!uri || hidden) {
    return <View style={{ width: size, height: size }} />;
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode="contain"
      onError={() => setHidden(true)}
    />
  );
}

export default function UserMedalModal({ visible, onClose, onSaved }) {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [myMedals, setMyMedals] = useState([]);
  const [allMedals, setAllMedals] = useState([]);
  const [equippedMedalId, setEquippedMedalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [equipping, setEquipping] = useState(null); // 장착 중인 medalId

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const [myRes, allRes, userRes] = await Promise.all([
          medalApi.getMyMedals(),
          medalApi.getAllMedals(),
          userId ? userApi.getMember(userId) : Promise.resolve({ data: {} }),
        ]);
        if (!alive) return;
        setMyMedals(myRes.data);
        setAllMedals(allRes.data);
        setEquippedMedalId(userRes.data?.medalId ?? null);
      } catch {
        if (alive) toast.error("메달 정보를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetch();
    return () => {
      alive = false;
    };
  }, [visible, userId]);

  const handleEquip = async (medalId) => {
    setEquipping(medalId);
    try {
      await medalApi.equipMedal(medalId);
      setEquippedMedalId(medalId);
      toast.success("메달을 장착했습니다.");
      onSaved && onSaved(medalId);
    } catch (error) {
      toast.error(error?.response?.data?.message || "메달 장착에 실패했습니다.");
    } finally {
      setEquipping(null);
    }
  };

  const myMedalIds = new Set(myMedals.map((m) => m.medalId));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#0f172a]/40 px-4 py-6"
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-md rounded-2xl bg-white p-6"
        >
          {/* 헤더 */}
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0F172A]">🏅 내 메달</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="닫기"
              className="rounded-full p-1"
            >
              <Text className="text-[16px] font-bold text-gray-500">✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <Text className="py-10 text-center text-sm text-gray-400">불러오는 중...</Text>
          ) : (
            <ScrollView className="max-h-[70vh]">
              {/* 보유 메달 */}
              <View className="mb-5">
                <Text className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                  보유 메달 · 클릭하여 장착
                </Text>
                {myMedals.length === 0 ? (
                  <Text className="text-sm text-gray-400">
                    아직 획득한 메달이 없습니다.
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-3">
                    {myMedals.map((m) => {
                      const isEquipped = m.medalId === equippedMedalId;
                      const isEquipping = equipping === m.medalId;
                      return (
                        <Pressable
                          key={m.medalId}
                          disabled={isEquipped || isEquipping}
                          onPress={() => handleEquip(m.medalId)}
                          className={`items-center gap-1 rounded-xl border px-4 py-3 ${
                            isEquipped
                              ? "border-yellow-300 bg-yellow-50"
                              : "border-blue-100 bg-blue-50"
                          }`}
                        >
                          <MedalIcon uri={m.medalIcon} size={40} />
                          <Text className="text-[12px] font-semibold text-[#0F172A]">
                            {m.medalName}
                          </Text>
                          {isEquipped ? (
                            <View className="rounded-full bg-yellow-400 px-2 py-0.5">
                              <Text className="text-[10px] font-semibold text-white">
                                장착됨
                              </Text>
                            </View>
                          ) : (
                            <View className="rounded-full bg-blue-100 px-2 py-0.5">
                              <Text className="text-[10px] font-semibold text-blue-500">
                                {isEquipping ? "장착 중..." : "장착"}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* 전체 메달 목록 */}
              <View>
                <Text className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                  전체 메달
                </Text>
                <View className="gap-2">
                  {allMedals.map((m) => {
                    const owned = myMedalIds.has(m.medalId);
                    const isEquipped = m.medalId === equippedMedalId;
                    return (
                      <View
                        key={m.medalId}
                        className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 ${
                          owned
                            ? "border-blue-100 bg-blue-50"
                            : "border-gray-100 bg-gray-50 opacity-50"
                        }`}
                      >
                        <MedalIcon uri={m.medalIcon} size={32} />
                        <View className="flex-1">
                          <Text className="text-[13px] font-semibold text-[#0F172A]">
                            {m.medalName}
                          </Text>
                          <Text className="text-[11px] text-gray-400">
                            {m.medalPrice?.toLocaleString()}P 필요
                          </Text>
                        </View>
                        {isEquipped ? (
                          <View className="rounded-full bg-yellow-400 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold text-white">
                              장착됨
                            </Text>
                          </View>
                        ) : owned ? (
                          <View className="rounded-full bg-blue-500 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold text-white">
                              보유
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
