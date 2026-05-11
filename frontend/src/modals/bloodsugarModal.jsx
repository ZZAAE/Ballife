import { useState, useRef, useCallback, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const MEALS = [
  { id: "공복", label: "공복", hasTiming: false },
  { id: "아침", label: "아침", hasTiming: true },
  { id: "점심", label: "점심", hasTiming: true },
  { id: "저녁", label: "저녁", hasTiming: true },
  { id: "취침전", label: "취침전", hasTiming: false },
];

const TIMINGS = ["식전", "식후"];

const getStatusInfo = (value) => {
  if (value <= 100) 
    return { 
      label: "정상 범위 내에 있습니다", 
      color: "#22C55E",
      badge: "bg-[#ECFDF3] text-[#16A34A]"
    };
  if (value <= 180) 
    return { 
      label: "주의 범위에 있습니다", 
      color: "#FB923C",
      badge: "bg-[#FFF7ED] text-[#EA580C]"
    };
  return { 
    label: "경고 범위에 있습니다", 
    color: "#F87171",
    badge: "bg-[#FEF2F2] text-[#DC2626]"
  };
};

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const makeDefaultRecord = () => ({
  pct: 0,
  value: "00.0",
  time: getCurrentTime(),
  saved: false,
});

export default function BloodSugarModal({ isOpen = true, onClose = () => {} }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const dateInputRef = useRef(null);

  const [activeMeal, setActiveMeal] = useState("공복");
  const [activeTiming, setActiveTiming] = useState("식전");

  const [recordsByDate, setRecordsByDate] = useState({});

  const [activeTab, setActiveTab] = useState(0);
  const [tabData, setTabData] = useState({
    0: { pct: 0, value: "00.0", saved: false },
    1: { pct: 0, value: "00.0", saved: false },
    2: { pct: 0, value: "00.0", saved: false },
    3: { pct: 0, value: "00.0", saved: false },
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef(null);
  const inputRef = useRef(null);

  const [timeEditing, setTimeEditing] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const timeInputRef = useRef(null);

  const maxVal = 300;

  const meal = MEALS.find((m) => m.id === activeMeal);
  const currentKey = meal.hasTiming ? `${activeMeal}_${activeTiming}` : activeMeal;
  const currentRecord =
    recordsByDate[selectedDate]?.[currentKey] || makeDefaultRecord();

  const sliderPct = currentRecord.pct;
  const inputValue = currentRecord.value;
  const isSaved = currentRecord.saved;
  const timeValue = currentRecord.time || getCurrentTime();

  const updateCurrentRecord = useCallback(
    (updates) => {
      setRecordsByDate((prev) => {
        const dateRecords = prev[selectedDate] || {};
        const existing = dateRecords[currentKey] || makeDefaultRecord();
        return {
          ...prev,
          [selectedDate]: {
            ...dateRecords,
            [currentKey]: { ...existing, ...updates },
          },
        };
      });
    },
    [selectedDate, currentKey]
  );

  const currentVal = parseFloat(((sliderPct / 100) * maxVal).toFixed(1));
  const display = isFocused
    ? inputValue
    : currentVal === 0
    ? "00.0"
    : currentVal.toFixed(1);
  const statusVal = isFocused ? parseFloat(inputValue) || 0 : currentVal;
  const status = getStatusInfo(statusVal);

  const updateFromX = useCallback(
    (clientX) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100)
      );
      const val = ((pct / 100) * maxVal).toFixed(1);
      updateCurrentRecord({ pct, value: val, saved: false });
    },
    [updateCurrentRecord]
  );

  const onPointerDown = (e) => {
    setIsDragging(true);
    updateFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (isDragging) updateFromX(e.clientX);
  };
  const onPointerUp = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (/^\d{0,3}\.?\d{0,1}$/.test(raw) || raw === "") {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        const pct = Math.max(0, Math.min(100, (num / maxVal) * 100));
        updateCurrentRecord({ value: raw, pct, saved: false });
      } else {
        updateCurrentRecord({ value: raw, saved: false });
      }
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (currentVal > 0) {
      updateCurrentRecord({ value: currentVal.toFixed(1), saved: false });
    } else {
      updateCurrentRecord({ value: "", saved: false });
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) {
      updateCurrentRecord({ pct: 0, value: "00.0", saved: false });
    } else {
      const clamped = Math.min(num, maxVal);
      updateCurrentRecord({
        pct: (clamped / maxVal) * 100,
        value: clamped.toFixed(1),
        saved: false,
      });
    }
  };

  const handleSave = () => {
    if (currentVal > 0) {
      updateCurrentRecord({ saved: true });
    }
  };

  const startTimeEdit = () => {
    setTimeInput(timeValue);
    setTimeEditing(true);
  };

  const commitTimeEdit = () => {
    const raw = timeInput.trim();
    let hours = -1;
    let minutes = -1;

    if (/^\d{1,2}:\d{1,2}$/.test(raw)) {
      const [h, m] = raw.split(":").map(Number);
      hours = h;
      minutes = m;
    } else if (/^\d{4}$/.test(raw)) {
      hours = parseInt(raw.slice(0, 2));
      minutes = parseInt(raw.slice(2));
    } else if (/^\d{3}$/.test(raw)) {
      hours = parseInt(raw.slice(0, 1));
      minutes = parseInt(raw.slice(1));
    } else if (/^\d{1,2}$/.test(raw)) {
      hours = parseInt(raw);
      minutes = 0;
    }

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const formatted = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      updateCurrentRecord({ time: formatted, saved: false });
    }
    setTimeEditing(false);
  };

  useEffect(() => {
    if (timeEditing && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [timeEditing]);

  useEffect(() => {
    setIsFocused(false);
    setTimeEditing(false);
  }, [activeMeal, activeTiming, selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      setIsDragging(false);
      setIsFocused(false);
      setTimeEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative flex w-full max-w-[672px] flex-col rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]" onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">
                혈당 기록하기
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                오늘의 혈당을 기록하세요.
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
              정상 혈당: 100mg/dL 미만
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              주의 범위: 100 ~ 180mg/dL
            </p>
            <p className="text-[13px] leading-relaxed text-[#64748B]">
              경고 범위: 180mg/dL 이상
            </p>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          
          {/* 시간 선택 */}
          <div className="flex gap-3 items-center mb-6">
            <input
              type="date"
              ref={dateInputRef}
              className="absolute opacity-0 pointer-events-none"
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate}
            />

            {timeEditing ? (
              <input
                ref={timeInputRef}
                type="text"
                inputMode="numeric"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                onBlur={commitTimeEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTimeEdit();
                  }
                  if (e.key === "Escape") setTimeEditing(false);
                }}
                placeholder="HH:MM"
                className="rounded-[16px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1E293B] border-2 border-[#2563EB] shadow-sm outline-none w-[130px] tracking-wider"
              />
            ) : (
              <button
                onClick={startTimeEdit}
                className="flex items-center gap-2 rounded-[16px] bg-[#F1F5F9] px-4 py-2.5 text-[13px] font-semibold text-[#64748B] border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-colors"
              >
                <Clock className="h-4 w-4 text-[#2563EB]" />
                {timeValue}
              </button>
            )}
          </div>

          {/* 식사 탭 */}
          <div className="pt-0 mb-6">
            <div className="grid grid-cols-5 rounded-2xl bg-[#F1F5F9] p-1.5 gap-1">
              {MEALS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMeal(tab.id)}
                  className={`rounded-xl px-2 py-2.5 text-[12px] font-semibold transition-all ${
                    activeMeal === tab.id
                      ? "bg-white text-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
                      : "text-[#64748B]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 식전/식후 토글 */}
          {meal.hasTiming && (
            <div className="flex justify-center gap-3 mb-6">
              {TIMINGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTiming(t)}
                  className={`px-6 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all ${
                    activeTiming === t
                      ? "bg-[#1a1a2e] text-white shadow-[0_4px_12px_rgba(26,26,46,0.2)]"
                      : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* 수치 입력 */}
          <div className="mb-6 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={display}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="00.0"
                className="text-[72px] font-bold leading-none tracking-[-0.04em] bg-transparent border-none outline-none placeholder:text-[#CBD5E1] focus:placeholder:text-[#94A3B8] transition-colors"
                style={{ 
                  width: isFocused ? "auto" : "200px", 
                  textAlign: "center",
                  color: isSaved ? "#0F172A" : "#CBD5E1"
                }}
              />
              <span className="text-[18px] font-semibold text-[#94A3B8] ml-1">mg/dL</span>
            </div>
          </div>

          {/* 혈당 상태 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-bold text-[#1E293B]">혈당 상태</span>
              <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${status.badge}`}>
                {statusVal <= 100 ? "정상" : statusVal <= 180 ? "주의" : "경고"}
              </span>
            </div>

            {/* 슬라이더 */}
            <div className="relative h-[12px] w-full overflow-visible rounded-full mb-3">
              <div className="flex h-full overflow-hidden rounded-full">
                <div className="w-1/3 bg-[#22C55E]" />
                <div className="w-1/3 bg-[#FB923C]" />
                <div className="w-1/3 bg-[#F87171]" />
              </div>

              <div
                ref={sliderRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="absolute inset-0 cursor-pointer"
                style={{ touchAction: "none" }}
              >
                <div
                  className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-white shadow-[0_4px_12px_rgba(15,23,42,0.18)]"
                  style={{
                    left: `${sliderPct}%`,
                    transition: isDragging ? "none" : "left 0.15s ease",
                    zIndex: 2,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between px-0.5 text-[11px] font-medium text-[#94A3B8]">
              <span>정상</span>
              <span>주의</span>
              <span>경고</span>
            </div>
          </div>

          {/* 안내 카드 */}
          <div className="overflow-hidden rounded-[24px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF] p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" />
                </svg>
              </div>

              <div>
                <p className="text-[13px] leading-relaxed text-[#475569]">
                  {status.label}
                </p>
                <p className="mt-1.5 text-[12px] text-[#94A3B8]">
                  {statusVal <= 100 
                    ? "현재 혈당 수치는 정상 범위입니다. 꾸준한 관리를 유지해주세요."
                    : statusVal <= 180
                    ? "혈당이 주의 범위에 있습니다. 가벼운 운동이나 건강한 간식을 권장합니다."
                    : "혈당이 높습니다. 의사 상담을 고려하시고 충분한 수분 섭취를 권장합니다."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          <button
            onClick={handleSave}
            className={`w-full rounded-[24px] py-5 text-xl font-bold transition-all shadow-xl ${
              isSaved
                ? "bg-[#0f172a] text-white hover:bg-[#1a1a2e] active:scale-[0.98]"
                : "bg-[#1a1a2e] text-white hover:bg-[#25253d] active:scale-[0.98]"
            }`}
          >
            {isSaved ? "저장 완료 ✓" : "기록 저장 및 확인"}
          </button>
        </div>
    </div>
  );
}