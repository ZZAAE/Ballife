import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Crown, Users, X } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
 * 구독 플랜 선택 + 모의 결제 모달
 *  props:
 *   - open:        모달 열림 여부
 *   - onClose:     닫기 핸들러
 *   - onSubmit:    async (plan) => any. 부모가 subscriptionApi.activate 호출 담당.
 *   - currentPlan: 현재 플랜 ("NONE" | "INDIVIDUAL" | "FAMILY")
 * ──────────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    key: "INDIVIDUAL",
    nameKey: "subscriptionModal.plan.individual.name",
    price: 4900,
    icon: Crown,
    accent: "#3B82F6",
    bg: "#EFF6FF",
    taglineKey: "subscriptionModal.plan.individual.tagline",
    features: [
      { labelKey: "subscriptionModal.feature.healthReport", ready: true },
      { labelKey: "subscriptionModal.feature.bioSummary", ready: true },
    ],
  },
  {
    key: "FAMILY",
    nameKey: "subscriptionModal.plan.family.name",
    price: 9900,
    icon: Users,
    accent: "#0F172A",
    bg: "#F1F5F9",
    taglineKey: "subscriptionModal.plan.family.tagline",
    features: [
      { labelKey: "subscriptionModal.feature.healthReport", ready: true },
      { labelKey: "subscriptionModal.feature.parentBio", ready: true },
      { labelKey: "subscriptionModal.feature.inviteFamily", ready: true },
      { labelKey: "subscriptionModal.feature.shareMedication", ready: true },
      { labelKey: "subscriptionModal.feature.shareExercise", ready: true },
    ],
  },
];

const won = (n) => `₩${Number(n).toLocaleString()}`;

export default function SubscriptionModal({
  open,
  onClose,
  onSubmit,
  onCancel,
  currentPlan = "NONE",
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(
    currentPlan === "INDIVIDUAL" ? "FAMILY" : "INDIVIDUAL",
  );
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(currentPlan === "INDIVIDUAL" ? "FAMILY" : "INDIVIDUAL");
    }
  }

  if (!open) return null;

  const hasSubscription = currentPlan && currentPlan !== "NONE";
  const isSamePlan = selected === currentPlan;
  const selectedPlanNameKey = PLANS.find((p) => p.key === selected)?.nameKey;
  const selectedName = selectedPlanNameKey ? t(selectedPlanNameKey) : "";
  const primaryLabel = submitting
    ? t("subscriptionModal.button.processing")
    : hasSubscription
      ? isSamePlan
        ? t("subscriptionModal.button.currentPlan")
        : t("subscriptionModal.button.changeTo", { plan: selectedName })
      : t("subscriptionModal.button.pay", { plan: selectedName });

  const handleSubmit = async () => {
    if (!onSubmit || submitting || isSamePlan) return;
    setSubmitting(true);
    try {
      await onSubmit(selected);
      onClose?.();
    } catch {
      // 에러 토스트는 부모/인터셉터에서 처리
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel || cancelling) return;
    if (!window.confirm(t("subscriptionModal.confirm.cancel"))) return;
    setCancelling(true);
    try {
      await onCancel();
      onClose?.();
    } catch {
      // noop
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-[760px] max-h-[92vh] bg-[#F9FAFB] rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-8 pt-7 pb-5 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">
                {t("subscriptionModal.title")}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {t("subscriptionModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label={t("subscriptionModal.close")}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-8 py-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selected === plan.key;
              const isCurrent = currentPlan === plan.key;
              return (
                <button
                  type="button"
                  key={plan.key}
                  onClick={() => setSelected(plan.key)}
                  className={`flex flex-col text-left bg-white rounded-[18px] border-2 p-5 transition ${
                    isSelected
                      ? "border-[#0F172A] shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                      : "border-[#E5E7EB] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: plan.bg, color: plan.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                        {t("subscriptionModal.currentPlanBadge")}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-[15px] font-bold text-[#0F172A]">
                    {t(plan.nameKey)}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {t(plan.taglineKey)}
                  </p>

                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-[26px] font-extrabold text-[#0F172A]">
                      {won(plan.price)}
                    </span>
                    <span className="pb-1.5 text-[12px] text-[#64748B]">
                      {t("subscriptionModal.perMonth")}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f.labelKey}
                        className="flex items-center gap-2 text-[12.5px]"
                      >
                        <Check
                          className="w-4 h-4 shrink-0"
                          style={{ color: f.ready ? plan.accent : "#CBD5E1" }}
                        />
                        <span
                          className={
                            f.ready ? "text-[#475569]" : "text-[#94A3B8]"
                          }
                        >
                          {t(f.labelKey)}
                        </span>
                        {!f.ready && (
                          <span className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold text-[#94A3B8]">
                            {t("subscriptionModal.nextStep")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-8 py-5 flex items-center justify-between gap-2 border-t border-[#E5E7EB] bg-white">
          <div>
            {hasSubscription && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="text-[13px] font-semibold text-[#c24141] hover:underline disabled:opacity-50"
              >
                {cancelling
                  ? t("subscriptionModal.button.cancelling")
                  : t("subscriptionModal.button.cancelSubscription")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-[12px] bg-white border border-[#E5E7EB] text-[#0F172A] text-[13px] font-medium hover:bg-gray-50 transition"
            >
              {t("subscriptionModal.button.close")}
            </button>
            <button
              type="button"
              disabled={submitting || isSamePlan}
              onClick={handleSubmit}
              className="h-11 px-7 rounded-[12px] bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
