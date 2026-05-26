import { useState } from "react";
import { Clock, X } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
 * 하루 생활 루틴 수정 모달
 *  props:
 *   - open:           모달 열림 여부
 *   - onClose:        닫기 핸들러
 *   - onSubmit:       저장 핸들러 async (payload) => any. 부모가 백엔드 호출 담당.
 *   - onSaved:        저장 성공 시 콜백 (onSubmit 반환값 전달)
 *   - initialRoutine: 초기 루틴 배열 [{ label, time }]
 *   - title:          상단 타이틀
 * ──────────────────────────────────────────────────────────────────────── */
const DEFAULT_ROUTINE = [
  { label: "기상", time: "" },
  { label: "아침", time: "07:30" },
  { label: "점심", time: "12:30" },
  { label: "저녁", time: "18:30" },
  { label: "취침", time: "23:30" },
];

export default function RoutineModal({
  open,
  onClose,
  onSubmit,
  onSaved,
  initialRoutine,
  title = "하루 생활 루틴 수정",
}) {
  const buildRoutine = (source) =>
    source && source.length > 0
      ? source.map((r) => ({
          label: r.label,
          time: r.time && r.time !== "—" ? r.time : "",
        }))
      : DEFAULT_ROUTINE;

  const [routine, setRoutine] = useState(() => buildRoutine(initialRoutine));
  const [submitting, setSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRoutine(buildRoutine(initialRoutine));
    }
  }

  if (!open) return null;

  const handleTimeChange = (label, value) => {
    setRoutine((prev) =>
      prev.map((item) => (item.label === label ? { ...item, time: value } : item)),
    );
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setSubmitting(true);

    const payload = {
      routine: routine.map((item) => ({
        label: item.label,
        time: item.time || null,
      })),
    };

    try {
      const result = await onSubmit(payload);
      onSaved?.(result);
      onClose?.();
    } catch (err) {
      console.error("루틴 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[560px] max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ───────── 헤더 ───────── */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#2563EB]">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-[17px] font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ───────── 본문 (스크롤) ───────── */}
        <div className="px-7 pb-6 overflow-y-auto flex-1 space-y-5">
          {/* 안내 */}
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            매일의 생활 시간을 입력해 주세요. 입력한 시간을 기준으로 알림과 추천 시점이 조정됩니다.
          </p>

          {/* 루틴 목록 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              생활 시간 설정
            </label>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {routine.map((item, idx) => (
                <div
                  key={item.label}
                  className={`grid grid-cols-[1fr_140px] gap-3 items-center px-4 py-3 bg-white ${
                    idx !== routine.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-[14px] font-medium text-gray-800">
                    {item.label}
                  </span>
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => handleTimeChange(item.label, e.target.value)}
                    className="h-9 px-3 rounded-lg bg-gray-100 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ───────── 푸터 ───────── */}
        <div className="px-7 py-4 flex justify-end border-t border-gray-100 bg-white">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-10 px-6 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
