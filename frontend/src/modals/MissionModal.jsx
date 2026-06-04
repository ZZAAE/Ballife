import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import missionApi from "../api/missionApi";

/*
 * MissionModal
 * props:
 *  - open:       모달 열림 여부
 *  - onClose:    닫기 핸들러
 *  - onClaimed:  보상 수령 후 갱신된 보유 포인트를 전달 (부모의 포인트 표시 갱신용)
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

export default function MissionModal({ open, onClose, onClaimed }) {
  const [statusMap, setStatusMap] = useState({}); // code -> Status
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(null); // 수령 중인 미션 code

  const applyOverview = (data) => {
    const map = {};
    (data?.missions || []).forEach((m) => {
      map[m.code] = m;
    });
    setStatusMap(map);
    setPoint(data?.point ?? 0);
  };

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const handleClaim = async (code) => {
    setClaiming(code);
    try {
      const { data } = await missionApi.claim(code);
      setStatusMap((prev) => ({ ...prev, [code]: data.mission }));
      setPoint(data.point);
      toast.success(`미션 완료! +${data.reward}P`);
      onClaimed?.(data.point);
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

  if (!open) return null;

  // 미션 한 줄의 버튼 라벨
  const buttonLabel = (status, isClaiming) => {
    if (isClaiming) return "처리 중...";
    if (status.claimable) return "받기";
    // 반복 미션: 한도 도달이면 "최대 달성", 아니면 현재 등록분 수령 완료 → "완료"
    if (status.period === "REPEATABLE") {
      return status.claimedCount >= status.maxClaims ? "최대 달성" : "완료";
    }
    // 일반 미션: 아직 행동을 안 했으면 "미달성", 했고 이미 받았으면 "완료"
    if (!status.achieved) return "미달성";
    return "완료";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">🎯 미션</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 보유 포인트 */}
        <div className="mb-5 flex items-center justify-between rounded-xl bg-[#0f1c33] px-4 py-3 text-white">
          <span className="text-[13px] font-medium text-white/80">보유 포인트</span>
          <span className="text-lg font-bold tabular-nums">
            {point == null ? "—" : Number(point).toLocaleString()} P
          </span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : (
          <div className="flex max-h-[55vh] flex-col gap-5 overflow-y-auto pr-1">
            {MISSION_SECTIONS.map((section) => {
              const items = section.codes
                .map((code) => statusMap[code])
                .filter(Boolean);
              if (items.length === 0) return null;

              return (
                <div key={section.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                      {section.title}
                    </p>
                    {section.note && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                        {section.note}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map((status) => {
                      const isClaiming = claiming === status.code;
                      const note = MISSION_NOTES[status.code];
                      const isRepeatable = status.period === "REPEATABLE";
                      return (
                        <div
                          key={status.code}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#0F172A]">
                              {status.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              +{status.reward}P
                              {note && ` · ${note}`}
                              {isRepeatable &&
                                ` · ${status.claimedCount}/${status.maxClaims}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!status.claimable || isClaiming}
                            onClick={() => handleClaim(status.code)}
                            className={`flex-shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                              status.claimable && !isClaiming
                                ? "bg-[#0f1c33] text-white hover:bg-[#1a2d4d]"
                                : "cursor-default bg-gray-100 text-gray-400"
                            }`}
                          >
                            {buttonLabel(status, isClaiming)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
