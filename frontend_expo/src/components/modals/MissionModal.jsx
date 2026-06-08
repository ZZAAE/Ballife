import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import missionApi from "../../api/missionApi";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";

/*
 * MissionModal
 * props:
 *  - visible:   모달 열림 여부
 *  - onClose:   닫기 핸들러
 *  - onSaved:   보상 수령 후 갱신된 보유 포인트를 전달 (부모의 포인트 표시 갱신용)
 */

// 화면 표시용 섹션 구성. 보상/수령 가능 여부는 서버에서 받아온다.
const MISSION_SECTIONS = [
  { title: "일일 미션", note: "하루 1번", codes: ["DAILY_RECORD", "DAILY_RECOMMEND"] },
  { title: "주간 미션", note: "일주일 1번", codes: ["WEEKLY_COMMENT", "WEEKLY_POST"] },
  {
    title: "특별 미션",
    codes: ["PET_CHECK", "FIRST_SUBSCRIBE", "FIRST_FAMILY", "EACH_REGISTER"],
  },
  { title: "연속 기록 보너스", codes: ["STREAK_7", "STREAK_30"] },
];

// 서버 title 외에 화면에서 덧붙일 부가 설명
const MISSION_NOTES = {
  EACH_REGISTER: "최대 3번",
  STREAK_7: "주간 보너스",
  STREAK_30: "월간 보너스",
};

export default function MissionModal({ visible, onClose, onSaved }) {
  const [statusMap, setStatusMap] = useState({}); // code -> Status
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(null); // 수령 중인 미션 code

  const applyOverview = (data) => {
    const map = {};
    (data?.missions || []).forEach((m) => {
      map[m.code] = m;
    });
    setStatusMap(map);
  };

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const { data } = await missionApi.getMissions();
        if (alive) applyOverview(data);
      } catch {
        // api 인터셉터가 에러 토스트를 표시함
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchMissions();
    return () => {
      alive = false;
    };
  }, [visible]);

  const handleClaim = async (code) => {
    setClaiming(code);
    try {
      const { data } = await missionApi.claim(code);
      setStatusMap((prev) => ({ ...prev, [code]: data.mission }));
      toast.success(`미션 완료! +${data.reward}P`);
      onSaved && onSaved(data.point);
    } catch {
      // 인터셉터가 에러 토스트 표시. 상태가 어긋났을 수 있으니 현황을 다시 동기화.
      try {
        const { data } = await missionApi.getMissions();
        applyOverview(data);
      } catch {
        /* 무시 */
      }
    } finally {
      setClaiming(null);
    }
  };

  // 미션 한 줄의 버튼 라벨
  const buttonLabel = (status, isClaiming) => {
    if (isClaiming) return "처리 중...";
    if (status.claimable) return "받기";
    if (status.period === "REPEATABLE") {
      return status.claimedCount >= status.maxClaims ? "최대 달성" : "완료";
    }
    if (!status.achieved) return "미달성";
    return "완료";
  };

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
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0F172A]">🎯 미션</Text>
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
            <ScrollView className="max-h-[55vh]" contentContainerStyle={{ gap: 20 }}>
              {MISSION_SECTIONS.map((section) => {
                const items = section.codes
                  .map((code) => statusMap[code])
                  .filter(Boolean);
                if (items.length === 0) return null;

                return (
                  <View key={section.title}>
                    <View className="mb-2 flex-row items-center gap-2">
                      <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                        {section.title}
                      </Text>
                      {section.note && (
                        <View className="rounded-full bg-blue-50 px-2 py-0.5">
                          <Text className="text-[10px] font-semibold text-blue-500">
                            {section.note}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="gap-2">
                      {items.map((status) => {
                        const isClaiming = claiming === status.code;
                        const note = MISSION_NOTES[status.code];
                        const isRepeatable = status.period === "REPEATABLE";
                        const enabled = status.claimable && !isClaiming;
                        return (
                          <View
                            key={status.code}
                            className="flex-row items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                          >
                            <View className="min-w-0 flex-1">
                              <Text className="text-[13px] font-semibold text-[#0F172A]">
                                {status.title}
                              </Text>
                              <Text className="mt-0.5 text-[11px] text-gray-400">
                                +{status.reward}P
                                {note ? ` · ${note}` : ""}
                                {isRepeatable
                                  ? ` · ${status.claimedCount}/${status.maxClaims}`
                                  : ""}
                              </Text>
                            </View>
                            <Pressable
                              disabled={!enabled}
                              onPress={() => handleClaim(status.code)}
                              className={`rounded-lg px-4 py-1.5 ${
                                enabled ? "bg-[#0f1c33]" : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  enabled ? "text-white" : "text-gray-400"
                                }`}
                              >
                                {buttonLabel(status, isClaiming)}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
