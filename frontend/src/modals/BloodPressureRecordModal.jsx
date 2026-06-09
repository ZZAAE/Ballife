import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import bioValueRecordApi from "../api/bioValueRecordApi";
import { useAuth } from "../contexts/AuthContext";
import { USER_KEY } from "../api/api";
import { BIO_CATEGORY } from "../constants/bioCategory";

const resolveUserId = (user) => {
  const fromContext = user?.userId ?? user?.id ?? user?.memberId;
  if (fromContext != null) return fromContext;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem("user") ||
      localStorage.getItem("loginUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? parsed?.id ?? parsed?.memberId ?? null;
  } catch {
    return null;
  }
};

function BloodPressureRecordModal({ isOpen, onClose, onSaved, editingRecord = null, recordDate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const isEditMode = Boolean(editingRecord?.recordId);

  const [activeTab, setActiveTab] = useState("아침");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dateInputRef = useRef(null);

  const tabs = ["아침", "점심", "저녁", "취침전"];

  // 모달이 열릴 때 editingRecord에 맞춰 폼 초기화
  useEffect(() => {
    if (!isOpen) return;

    if (editingRecord) {
      const timing =
        typeof editingRecord.category === "string" &&
        editingRecord.category.includes("-")
          ? editingRecord.category.split("-")[1]
          : null;
      setActiveTab(tabs.includes(timing) ? timing : "아침");
      setSystolic(
        editingRecord.systolicBp != null ? String(editingRecord.systolicBp) : ""
      );
      setDiastolic(
        editingRecord.diastolicBp != null ? String(editingRecord.diastolicBp) : ""
      );
    } else {
      setActiveTab("아침");
      setSystolic("");
      setDiastolic("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingRecord]);

  const handleNumberChange = (setter) => (e) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setter(onlyNumber);
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error(t("bloodPressureRecordModal.toast.loginRequired"));
      return;
    }
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    if (!s || !d || s <= 0 || d <= 0) {
      toast.error(t("bloodPressureRecordModal.toast.enterBoth"));
      return;
    }
    if (s <= d) {
      toast.error(t("bloodPressureRecordModal.toast.systolicGreater"));
      return;
    }

    const pad = (n) => String(n).padStart(2, "0");
    const category = `${BIO_CATEGORY.BLOOD_PRESSURE}-${activeTab}`;

    setSubmitting(true);
    try {
      if (isEditMode) {
        // 기존 recordDate/recordTime 유지하고 값/카테고리만 수정
        const payload = {
          recordDate: editingRecord.recordDate,
          recordTime:
            typeof editingRecord.recordTime === "string" &&
            editingRecord.recordTime.length === 5
              ? `${editingRecord.recordTime}:00`
              : editingRecord.recordTime,
          category,
          systolicBP: s,
          diastolicBP: d,
        };
        const res = await bioValueRecordApi.updateBioValueRecord(
          editingRecord.recordId,
          payload
        );
        toast.success(t("bloodPressureRecordModal.toast.updated"));
        onSaved?.(res.data);
      } else {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const targetDate = recordDate || todayStr; // 부모가 날짜 안 주면 오늘
        const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const payload = {
          recordDate: targetDate,
          recordTime,
          category,
          systolicBP: s,
          diastolicBP: d,
        };
        const res = await bioValueRecordApi.createBioValueRecord(userId, payload);
        toast.success(t("bloodPressureRecordModal.toast.created"));
        onSaved?.(res.data);
      }
      setSystolic("");
      setDiastolic("");
      onClose?.();
    } catch (err) {
      console.error(isEditMode ? "혈압 기록 수정 실패:" : "혈압 기록 실패:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;
    if (!window.confirm(t("bloodPressureRecordModal.confirm.delete"))) return;

    setDeleting(true);
    try {
      await bioValueRecordApi.deleteBioValueRecord(editingRecord.recordId);
      toast.success(t("bloodPressureRecordModal.toast.deleted"));
      onSaved?.(null);
      onClose?.();
    } catch (err) {
      console.error("혈압 기록 삭제 실패:", err);
    } finally {
      setDeleting(false);
    }
  };


  const bpInfo = useMemo(() => {
    const s = Number(systolic);
    const d = Number(diastolic);

    if (!systolic && !diastolic) {
      return {
        label: t("bloodPressureRecordModal.status.empty.label"),
        badgeClass: "bg-[#F1F5F9] text-[#64748B]",
        markerClass: "left-[37.5%] border-[#94A3B8]",
        comment: t("bloodPressureRecordModal.status.empty.comment"),
        tip: t("bloodPressureRecordModal.status.empty.tip"),
      };
    }

    if ((systolic && s <= 90) || (diastolic && d <= 60)) {
      return {
        label: t("bloodPressureRecordModal.status.low.label"),
        badgeClass: "bg-[#EFF6FF] text-[#2563EB]",
        markerClass: "left-[12.5%] border-[#60A5FA]",
        comment: t("bloodPressureRecordModal.status.low.comment"),
        tip: t("bloodPressureRecordModal.status.low.tip"),
      };
    }

    if ((systolic && s >= 140) || (diastolic && d >= 90)) {
      return {
        label: t("bloodPressureRecordModal.status.high.label"),
        badgeClass: "bg-[#FEF2F2] text-[#DC2626]",
        markerClass: "left-[87.5%] border-[#F87171]",
        comment: t("bloodPressureRecordModal.status.high.comment"),
        tip: t("bloodPressureRecordModal.status.high.tip"),
      };
    }

    if ((systolic && s >= 120) || (diastolic && d >= 80)) {
      return {
        label: t("bloodPressureRecordModal.status.caution.label"),
        badgeClass: "bg-[#FFF7ED] text-[#EA580C]",
        markerClass: "left-[62.5%] border-[#FB923C]",
        comment: t("bloodPressureRecordModal.status.caution.comment"),
        tip: t("bloodPressureRecordModal.status.caution.tip"),
      };
    }

    return {
      label: t("bloodPressureRecordModal.status.normal.label"),
      badgeClass: "bg-[#ECFDF3] text-[#16A34A]",
      markerClass: "left-[37.5%] border-[#22C55E]",
      comment: t("bloodPressureRecordModal.status.normal.comment"),
      tip: t("bloodPressureRecordModal.status.normal.tip"),
    };
  }, [systolic, diastolic, t]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6 backdrop-blur-sm">

      <div onClick={(e) => e.stopPropagation()} className="relative flex h-[785px] max-h-[92vh] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] xl:h-[840px] xl:max-w-[760px] 2xl:h-[880px] 2xl:max-w-[820px]">
        {/* 헤더 */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">
                {isEditMode
                  ? t("bloodPressureRecordModal.title.edit")
                  : t("bloodPressureRecordModal.title.create")}
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                {isEditMode
                  ? t("bloodPressureRecordModal.subtitle.edit")
                  : t("bloodPressureRecordModal.subtitle.create")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("bloodPressureRecordModal.close")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* 안내 박스 */}
          <div className="mt-5 space-y-1.5 rounded-2xl bg-[#F8FAFC] px-4 py-4">
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              {t("bloodPressureRecordModal.info.normal")}
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              {t("bloodPressureRecordModal.info.high")}
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              {t("bloodPressureRecordModal.info.low")}
            </p>
          </div>
        </div>

        {/* 본문 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {/* 탭 */}
          <div className="pt-0">
            <div className="grid grid-cols-4 rounded-2xl bg-[#F1F5F9] p-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-white text-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
                      : "text-[#64748B]"
                  }`}
                >
                  {t(`bloodPressureRecordModal.tab.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          {/* 입력 카드 */}
          <div className="pb-2 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-[#E2E8F0] bg-[#FCFDFE] px-5 py-6 text-center shadow-sm">
                <p className="text-[14px] font-semibold text-[#94A3B8]">{t("bloodPressureRecordModal.systolic")}</p>

                <div className="mt-3 flex items-end justify-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={systolic}
                    onChange={handleNumberChange(setSystolic)}
                    placeholder="00"
                    maxLength={3}
                    className="w-full bg-transparent text-center text-[56px] font-bold leading-none tracking-[-0.04em] text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>

                <p className="mt-2 text-[12px] font-medium text-[#94A3B8]">mmHg</p>
              </div>

              <div className="rounded-[24px] border border-[#E2E8F0] bg-[#FCFDFE] px-5 py-6 text-center shadow-sm">
                <p className="text-[14px] font-semibold text-[#94A3B8]">{t("bloodPressureRecordModal.diastolic")}</p>

                <div className="mt-3 flex items-end justify-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={diastolic}
                    onChange={handleNumberChange(setDiastolic)}
                    placeholder="00"
                    maxLength={3}
                    className="w-full bg-transparent text-center text-[56px] font-bold leading-none tracking-[-0.04em] text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>

                <p className="mt-2 text-[12px] font-medium text-[#94A3B8]">mmHg</p>
              </div>
            </div>
          </div>

          {/* 혈압 상태 */}
          <div className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1E293B]">{t("bloodPressureRecordModal.statusHeading")}</span>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-bold ${bpInfo.badgeClass}`}
              >
                {bpInfo.label}
              </span>
            </div>

            <div className="relative h-[10px] w-full overflow-visible rounded-full">
              <div className="flex h-full overflow-hidden rounded-full">
                <div className="w-1/4 bg-[#60A5FA]" />
                <div className="w-1/4 bg-[#22C55E]" />
                <div className="w-1/4 bg-[#FB923C]" />
                <div className="w-1/4 bg-[#F87171]" />
              </div>

              <div
                className={`absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.18)] ${bpInfo.markerClass}`}
              />
            </div>

            <div className="mt-3 flex justify-between px-0.5 text-[11px] font-medium text-[#94A3B8]">
              <span>{t("bloodPressureRecordModal.gauge.low")}</span>
              <span>{t("bloodPressureRecordModal.gauge.normal")}</span>
              <span>{t("bloodPressureRecordModal.gauge.caution")}</span>
              <span>{t("bloodPressureRecordModal.gauge.high")}</span>
            </div>
          </div>

          {/* AI 조언 카드 */}
          <div className="pb-2 pt-6">
            <div className="overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF]">
              <div className="flex items-start gap-3 px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[13px] leading-relaxed text-[#475569]">
                    {bpInfo.comment}
                  </p>
                  <p className="text-[12px] text-[#94A3B8]">{bpInfo.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          <div className={isEditMode ? "flex gap-3" : ""}>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting || deleting}
                className="flex-1 rounded-[20px] border border-[#FCA5A5] bg-white py-5 text-lg font-bold text-[#DC2626] transition hover:bg-[#FEF2F2] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting
                  ? t("bloodPressureRecordModal.button.deleting")
                  : t("bloodPressureRecordModal.button.delete")}
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || deleting}
              className={`${isEditMode ? "flex-1" : "w-full"} rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {submitting
                ? t("bloodPressureRecordModal.button.saving")
                : isEditMode
                ? t("bloodPressureRecordModal.button.update")
                : t("bloodPressureRecordModal.button.submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloodPressureRecordModal;