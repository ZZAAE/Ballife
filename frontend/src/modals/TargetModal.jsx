import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dumbbell, Flame, Scale, Target, X, Droplet } from "lucide-react";
import i18n from "../i18n";

/* ──────────────────────────────────────────────────────────────────────────
 * 목표 지표 일괄 수정 모달 (체중 / 음수량 / 섭취 칼로리 / 소모 칼로리)
 *  props:
 *   - open:           모달 열림 여부
 *   - onClose:        닫기 핸들러
 *   - onSubmit:       저장 핸들러 async (payload) => any. 부모가 백엔드 호출 담당.
 *   - onSaved:        저장 성공 시 콜백 (onSubmit 반환값 전달)
 *   - initialTargets: { weight, water, calorieIn, calorieOut }
 *   - title:          상단 타이틀
 * ──────────────────────────────────────────────────────────────────────── */
const DEFAULT_TARGETS = {
  weight: "",
  water: "",
  calorieIn: "",
  calorieOut: "",
};

const FIELDS = [
  {
    key: "weight",
    label: i18n.t("targetModal.field.weight.label"),
    description: i18n.t("targetModal.field.weight.description"),
    unit: "kg",
    placeholder: "70.0",
    step: "0.1",
    accent: "#3B82F6",
    bg: "#EFF6FF",
    icon: Scale,
  },
  {
    key: "water",
    label: i18n.t("targetModal.field.water.label"),
    description: i18n.t("targetModal.field.water.description"),
    unit: i18n.t("targetModal.field.water.unit"),
    placeholder: "8",
    step: "1",
    accent: "#0EA5E9",
    bg: "#F0F9FF",
    icon: Droplet,
  },
  {
    key: "calorieIn",
    label: i18n.t("targetModal.field.calorieIn.label"),
    description: i18n.t("targetModal.field.calorieIn.description"),
    unit: "kcal",
    placeholder: "2000",
    step: "10",
    accent: "#F97316",
    bg: "#FFF7ED",
    icon: Flame,
  },
  {
    key: "calorieOut",
    label: i18n.t("targetModal.field.calorieOut.label"),
    description: i18n.t("targetModal.field.calorieOut.description"),
    unit: "kcal",
    placeholder: "1200",
    step: "10",
    accent: "#10B981",
    bg: "#ECFDF5",
    icon: Dumbbell,
  },
];

const sanitize = (source) => ({
  weight: source?.weight ?? "",
  water: source?.water ?? "",
  calorieIn: source?.calorieIn ?? "",
  calorieOut: source?.calorieOut ?? "",
});

export default function TargetModal({
  open,
  onClose,
  onSubmit,
  onSaved,
  initialTargets,
  title,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("targetModal.title");
  const [targets, setTargets] = useState(() =>
    initialTargets ? sanitize(initialTargets) : DEFAULT_TARGETS,
  );
  const [submitting, setSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTargets(initialTargets ? sanitize(initialTargets) : DEFAULT_TARGETS);
    }
  }

  if (!open) return null;

  const handleChange = (key, value) => {
    setTargets((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTargets(DEFAULT_TARGETS);
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setSubmitting(true);

    const payload = {
      weight: targets.weight === "" ? null : Number(targets.weight),
      water: targets.water === "" ? null : Number(targets.water),
      calorieIn: targets.calorieIn === "" ? null : Number(targets.calorieIn),
      calorieOut: targets.calorieOut === "" ? null : Number(targets.calorieOut),
    };

    try {
      const result = await onSubmit(payload);
      onSaved?.(result);
      onClose?.();
    } catch (err) {
      console.error("목표 지표 저장 실패:", err);
      alert(t("targetModal.alert.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-[760px] max-h-[92vh] bg-[#F9FAFB] rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* ───────── 헤더 ───────── */}
        <div className="px-8 pt-7 pb-5 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">
                {resolvedTitle}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {t("targetModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label={t("targetModal.close")}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ───────── 본문 (스크롤) ───────── */}
        <div className="px-8 py-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.key}
                  className="bg-white rounded-[18px] border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: field.bg, color: field.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#0F172A]">
                        {field.label}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-end gap-2 rounded-[12px] px-4 py-3 border border-[#E5E7EB] focus-within:border-[#0F172A] transition"
                    style={{ backgroundColor: "#F8FAFC" }}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      step={field.step}
                      min="0"
                      value={targets[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 min-w-0 bg-transparent text-[26px] font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1] placeholder:font-semibold"
                    />
                    <span className="text-[13px] font-medium text-[#64748B] pb-1.5">
                      {field.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────── 푸터 ───────── */}
        <div className="px-8 py-5 flex items-center justify-between border-t border-[#E5E7EB] bg-white">
          <button
            type="button"
            onClick={handleReset}
            className="text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] transition"
          >
            {t("targetModal.reset")}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-[12px] bg-white border border-[#E5E7EB] text-[#0F172A] text-[13px] font-medium hover:bg-gray-50 transition"
            >
              {t("targetModal.cancel")}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="h-11 px-7 rounded-[12px] bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t("targetModal.saving") : t("targetModal.submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
