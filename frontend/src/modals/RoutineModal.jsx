import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, X, ChevronDown } from "lucide-react";

const HOUR12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")); // "01" ~ "12"
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

// "HH:mm" (24h) → { meridiem: "AM"|"PM", hour12: "01"~"12", minute: "00" }
const parseTime = (time) => {
  if (!time || typeof time !== "string" || !time.includes(":")) {
    return { meridiem: "", hour12: "", minute: "" };
  }
  const [hStr, mStr] = time.split(":");
  const h24 = Number(hStr);
  if (Number.isNaN(h24)) return { meridiem: "", hour12: "", minute: "" };
  const meridiem = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    meridiem,
    hour12: String(h12).padStart(2, "0"),
    minute: mStr ?? "",
  };
};

// { meridiem, hour12, minute } → "HH:mm" (24h)
const composeTime = (meridiem, hour12, minute) => {
  if (!meridiem && !hour12 && !minute) return "";
  const m = meridiem || "AM";
  const h12 = Number(hour12 || "12");
  let h24 = h12 % 12;
  if (m === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${minute || "00"}`;
};

function TimeSelect({ value, onChange }) {
  const { t } = useTranslation();
  const { meridiem, hour12, minute } = parseTime(value);

  const selectClass =
    "appearance-none h-9 pl-3 pr-7 rounded-lg bg-gray-100 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition cursor-pointer";

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* 오전/오후 */}
      <div className="relative">
        <select
          value={meridiem}
          onChange={(e) => onChange(composeTime(e.target.value, hour12, minute))}
          className={selectClass}
          aria-label={t("routineModal.meridiemLabel")}
        >
          <option value="" disabled>
            {t("routineModal.meridiemLabel")}
          </option>
          <option value="AM">{t("routineModal.am")}</option>
          <option value="PM">{t("routineModal.pm")}</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {/* 시 */}
      <div className="relative">
        <select
          value={hour12}
          onChange={(e) => onChange(composeTime(meridiem, e.target.value, minute))}
          className={selectClass}
          aria-label={t("routineModal.hourLabel")}
        >
          <option value="" disabled>
            {t("routineModal.hourLabel")}
          </option>
          {HOUR12.map((h) => (
            <option key={h} value={h}>
              {t("routineModal.hourUnit", { value: h })}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <span className="text-gray-400 text-[13px]">:</span>
      {/* 분 */}
      <div className="relative">
        <select
          value={minute}
          onChange={(e) => onChange(composeTime(meridiem, hour12, e.target.value))}
          className={selectClass}
          aria-label={t("routineModal.minuteLabel")}
        >
          <option value="" disabled>
            {t("routineModal.minuteLabel")}
          </option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {t("routineModal.minuteUnit", { value: m })}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

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

// 루틴 라벨(식별·저장용 값) → i18n 표시 키.
// label 값 자체는 React key / onChange 식별 / 백엔드 payload 에 그대로 쓰이므로 보존하고,
// 화면 표시만 t()로 번역한다. (UserInformation 의 ROUTINE_LABEL_I18N_KEY 와 동일 매핑)
const ROUTINE_LABEL_I18N_KEY = {
  기상: "userInformation.routine.wakeup",
  아침: "userInformation.routine.breakfast",
  점심: "userInformation.routine.lunch",
  저녁: "userInformation.routine.dinner",
  취침: "userInformation.routine.bedtime",
};

export default function RoutineModal({
  open,
  onClose,
  onSubmit,
  onSaved,
  initialRoutine,
  title,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("routineModal.title");

  // 한글 라벨은 보존하고 표시만 번역 (매핑에 없으면 원본 라벨 그대로)
  const routineLabel = (label) =>
    ROUTINE_LABEL_I18N_KEY[label] ? t(ROUTINE_LABEL_I18N_KEY[label]) : label;

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
      alert(t("routineModal.saveError"));
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
            <h2 className="text-[17px] font-semibold text-gray-800">{resolvedTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label={t("routineModal.close")}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ───────── 본문 (스크롤) ───────── */}
        <div className="px-7 pb-6 overflow-y-auto flex-1 space-y-5">
          {/* 안내 */}
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            {t("routineModal.description")}
          </p>

          {/* 루틴 목록 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              {t("routineModal.scheduleLabel")}
            </label>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {routine.map((item, idx) => (
                <div
                  key={item.label}
                  className={`grid grid-cols-[1fr_auto] gap-3 items-center px-4 py-3 bg-white ${
                    idx !== routine.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-[14px] font-medium text-gray-800">
                    {routineLabel(item.label)}
                  </span>
                  <TimeSelect
                    value={item.time}
                    onChange={(v) => handleTimeChange(item.label, v)}
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
            {submitting ? t("routineModal.saving") : t("routineModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
