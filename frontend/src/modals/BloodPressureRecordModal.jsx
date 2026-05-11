import React, { useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";


function BloodPressureRecordModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("아침");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");


  const dateInputRef = useRef(null);

  const tabs = ["아침", "점심", "저녁", "취침전"];

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


  const bpInfo = useMemo(() => {
    const s = Number(systolic);
    const d = Number(diastolic);

    if (!systolic && !diastolic) {
      return {
        label: "값 입력 전",
        badgeClass: "bg-[#F1F5F9] text-[#64748B]",
        markerClass: "left-[37.5%] border-[#94A3B8]",
        comment: "수축기와 이완기 값을 입력하면 현재 혈압 상태를 확인할 수 있어요.",
        tip: "측정 직후 바로 입력하면 기록 관리가 더 쉬워져요.",
      };
    }

    if ((systolic && s <= 90) || (diastolic && d <= 60)) {
      return {
        label: "저혈압",
        badgeClass: "bg-[#EFF6FF] text-[#2563EB]",
        markerClass: "left-[12.5%] border-[#60A5FA]",
        comment: "현재 혈압은 낮은 편으로 보여요.",
        tip: "어지럼증이나 피로감이 있다면 충분한 휴식을 취하고 상태를 확인해보세요.",
      };
    }

    if ((systolic && s >= 140) || (diastolic && d >= 90)) {
      return {
        label: "고혈압",
        badgeClass: "bg-[#FEF2F2] text-[#DC2626]",
        markerClass: "left-[87.5%] border-[#F87171]",
        comment: "현재 혈압은 높은 편으로 보여요.",
        tip: "반복적으로 높게 나온다면 생활습관을 점검하고 필요 시 전문의 상담을 고려해보세요.",
      };
    }

    if ((systolic && s >= 120) || (diastolic && d >= 80)) {
      return {
        label: "주의 수치",
        badgeClass: "bg-[#FFF7ED] text-[#EA580C]",
        markerClass: "left-[62.5%] border-[#FB923C]",
        comment: "정상 범위보다 조금 높게 측정됐어요.",
        tip: "짠 음식, 카페인, 스트레스 요인을 함께 체크해보면 좋아요.",
      };
    }

    return {
      label: "정상 수치",
      badgeClass: "bg-[#ECFDF3] text-[#16A34A]",
      markerClass: "left-[37.5%] border-[#22C55E]",
      comment: "현재 혈압 흐름은 안정적인 편이에요.",
      tip: "지금처럼 꾸준히 기록하면 변화 추이를 확인하기 쉬워져요.",
    };
  }, [systolic, diastolic]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6 backdrop-blur-[2px]">
      
      <div className="relative flex w-full max-w-[672px] h-[785px] flex-col rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"  onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">
                혈압 기록하기
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                오늘의 혈압 상태를 간단하게 확인하고 기록해보세요.
              </p>
            </div>

            <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: "#bbb", fontSize: 20, lineHeight: 1,
            }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 안내 박스 */}
          <div className="mt-5 space-y-1.5 rounded-2xl bg-[#F8FAFC] px-4 py-4">
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              정상 혈압: 수축기 120mmHg 미만, 이완기 80mmHg 미만
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              고혈압: 수축기 140mmHg 이상 또는 이완기 90mmHg 이상
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              저혈압: 일반적으로 수축기 90mmHg 이하 또는 이완기 60mmHg 이하
            </p>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
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
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 입력 카드 */}
          <div className="pb-2 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-[#E2E8F0] bg-[#FCFDFE] px-5 py-6 text-center shadow-sm">
                <p className="text-[14px] font-semibold text-[#94A3B8]">수축기</p>

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
                <p className="text-[14px] font-semibold text-[#94A3B8]">이완기</p>

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
              <span className="text-[15px] font-bold text-[#1E293B]">혈압 상태</span>
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
              <span>저혈압</span>
              <span>정상</span>
              <span>주의</span>
              <span>고혈압</span>
            </div>
          </div>

          {/* 안내 카드 */}
          <div className="pb-2 pt-6">
            <div className="overflow-hidden rounded-[24px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF]">
              <div className="flex items-start gap-3 px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" />
                  </svg>
                </div>

                <div>
                  <p className="text-[13px] leading-relaxed text-[#475569]">
                    {bpInfo.comment}
                  </p>
                  <p className="mt-1.5 text-[12px] text-[#94A3B8]">{bpInfo.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          <button
            type="button"
            className="w-full rounded-[24px] bg-[#1a1a2e] py-5 text-xl font-bold text-white shadow-xl transition-all hover:bg-[#25253d] active:scale-[0.98]"
          >
            기록 저장 및 확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default BloodPressureRecordModal;