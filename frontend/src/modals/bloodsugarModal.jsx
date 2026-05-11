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
  if (value <= 100) return { label: "정상 범위 내에 있습니다", color: "#34c759" };
  if (value <= 180) return { label: "주의 범위에 있습니다", color: "#f5a623" };
  return { label: "경고 범위에 있습니다", color: "#ff3b30" };
};

export default function WaterRecordModal({ isOpen, onClose }) {

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

  // 시간 인라인 편집
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
    // 값이 0보다 클 때만 저장 처리 → 글씨 진하게
    if (currentVal > 0) {
      updateCurrentRecord({ saved: true });
    }
  };

  // 시간 편집 시작/완료
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
      // 1430 -> 14:30
      hours = parseInt(raw.slice(0, 2));
      minutes = parseInt(raw.slice(2));
    } else if (/^\d{3}$/.test(raw)) {
      // 930 -> 9:30
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

  // 시간 편집 모드 진입 시 자동 포커스 + 전체 선택
  useEffect(() => {
    if (timeEditing && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [timeEditing]);

  // 탭/날짜 바뀌면 포커스 상태 해제
  useEffect(() => {
    setIsFocused(false);
    setTimeEditing(false);
  }, [activeMeal, activeTiming, selectedDate]);

  // 모달이 닫힐 때 드래그/편집 상태 초기화 (이벤트 누수 방지)
  useEffect(() => {
    if (!isOpen) {
      setIsDragging(false);
      setIsFocused(false);
      setTimeEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        fontFamily:
          "'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px 0",
      }}
    >
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 672,
          maxWidth: "95vw",
          background: "#fff",
          borderRadius: 20,
          padding: "44px 40px 32px",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: -0.3,
              }}
            >
              혈당 기록하기
            </h2>
            <p
              style={{
                margin: "5px 0 14px",
                fontSize: 14,
                color: "#999",
                fontWeight: 400,
              }}
            >
              오늘의 혈당을 기록하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#bbb",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="#bbb"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

       

          {/* 시간 - 클릭하면 직접 입력 */}
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
              className="rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold
               text-slate-700 border border-blue-400 shadow-sm outline-none w-[120px]
               tracking-wider"
              style={{ fontFamily: "inherit" }}
            />
          ) : (
            <button
              onClick={startTimeEdit}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 text-[14px] font-semibold
               text-slate-600 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
            >
              <Clock className="h-4 w-4 text-blue-500" />
              {timeValue}
              <span className="ml-1 text-[10px] text-slate-300">✎</span>
            </button>
          )}
        </div>

        {/* 식사 탭 */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {MEALS.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMeal(m.id)}
              style={{
                flex: 1,
                padding: "15px 0",
                background: "none",
                border: "none",
                borderBottom:
                  activeMeal === m.id
                    ? "2.5px solid #222"
                    : "2.5px solid transparent",
                fontSize: 14,
                fontWeight: activeMeal === m.id ? 700 : 400,
                color: activeMeal === m.id ? "#222" : "#bbb",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                letterSpacing: -0.2,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 식전/식후 토글 (식사 시간일 때만 표시) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: meal.hasTiming ? 16 : 0,
            height: meal.hasTiming ? 36 : 8,
            transition: "all 0.2s ease",
            overflow: "hidden",
          }}
        >
          {meal.hasTiming &&
            TIMINGS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTiming(t)}
                style={{
                  padding: "8px 28px",
                  borderRadius: 20,
                  border:
                    activeTiming === t
                      ? "1.5px solid #1a1a2e"
                      : "1.5px solid #e5e7eb",
                  background: activeTiming === t ? "#1a1a2e" : "#fff",
                  color: activeTiming === t ? "#fff" : "#666",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                {t}
              </button>
            ))}
        </div>

        {/* 수치 입력 영역 */}
        <div
          style={{
            marginTop: meal.hasTiming ? 24 : 28,
            textAlign: "center",
            marginBottom: 8,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={display}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{
              fontSize: 64,
              fontWeight: isSaved ? 600 : 200,
              color: isFocused ? "#333" : isSaved ? "#1a1a2e" : "#d0d4dc",
              letterSpacing: 3,
              fontVariantNumeric: "tabular-nums",
              border: "none",
              outline: "none",
              background: "transparent",
              textAlign: "right",
              width: 220,
              fontFamily: "inherit",
              caretColor: "#8b5cf6",
              padding: 17,
              transition: "color 0.2s ease, font-weight 0.2s ease",
            }}
            placeholder="00.0"
          />
          <span
            style={{
              fontSize: 18,
              color: "#aab0bc",
              fontWeight: 400,
              marginLeft: 12,
            }}
          >
            mg/dL
          </span>
        </div>

        {/* 슬라이더 */}
        <div style={{ marginTop: 24, padding: "0 2px" }}>
          <div
            ref={sliderRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              position: "relative",
              height: 12,
              borderRadius: 6,
              background:
                "linear-gradient(to right, #86efac 0%, #4ade80 15%, #a3e635 30%, #fde047 50%, #fbbf24 65%, #fb923c 78%, #f87171 90%, #ef4444 100%)",
              cursor: "pointer",
              touchAction: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${sliderPct}%`,
                transform: "translate(-50%, -50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#fff",
                border: "2.5px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: isDragging ? "none" : "left 0.15s ease",
                zIndex: 2,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 12,
              color: "#b0b0b0",
              fontWeight: 400,
            }}
          >
            <span>정상</span>
            <span>주의</span>
            <span>경고</span>
          </div>
        </div>

        {/* 상태 표시 */}
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: status.color,
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: status.color,
              display: "inline-block",
              opacity: 0.45,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#333",
              marginLeft: 4,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* AI 인사이트 카드 */}
        <div
          style={{
            marginTop: 22,
            background: "#f6f7f9",
            borderRadius: 14,
            padding: "18px 22px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2l1.8 3.6L15 6.5l-2.8 2.7.7 3.8L9 11l-3.9 2l.7-3.8L3 6.5l4.2-.9L9 2z"
                fill="#8b5cf6"
              />
            </svg>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#555",
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            지난번 대비{" "}
            <strong style={{ fontWeight: 700, color: "#333" }}>5mg/dL</strong>{" "}
            감소했습니다. 식후 혈당이 약간
            <br />
            높으니 가벼운 산책 15분 추천드립니다.
          </p>
        </div>

        {/* 저장 버튼 */}
        <div style={{ paddingTop: 16 }}>
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              borderRadius: 24,
              background: isSaved ? "#0f172a" : "#1a1a2e",
              padding: "18px 0",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 24px rgba(26,26,46,0.18)",
              transition: "all 0.15s ease",
            }}
          >
            {isSaved ? "저장 완료 ✓" : "기록 저장 및 확인"}
          </button>
        </div>
    </div>
  );
}