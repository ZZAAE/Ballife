import { useState, useRef, useCallback } from "react";
import { Calendar } from "lucide-react";

const TABS = ["공복", "식전", "식후", "취침전"];

const getStatusInfo = (value) => {
  if (value <= 100) return { label: "정상 범위 내에 있습니다", color: "#34c759" };
  if (value <= 180) return { label: "주의 범위에 있습니다", color: "#f5a623" };
  return { label: "경고 범위에 있습니다", color: "#ff3b30" };
};

export default function WaterRecordModal({ isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);
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

  const maxVal = 300;
  const sliderPct = tabData[activeTab].pct;
  const inputValue = tabData[activeTab].value;
  const isSaved = tabData[activeTab].saved;

  const setSliderPct = (pct) => setTabData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], pct, saved: false } }));
  const setInputValue = (value) => setTabData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], value, saved: false } }));

  const currentVal = parseFloat(((sliderPct / 100) * maxVal).toFixed(1));
  const display = isFocused ? inputValue : currentVal === 0 ? "00.0" : currentVal.toFixed(1);
  const statusVal = isFocused ? (parseFloat(inputValue) || 0) : currentVal;
  const status = getStatusInfo(statusVal);

  const updateFromX = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const val = ((pct / 100) * maxVal).toFixed(1);
    setTabData(prev => ({ ...prev, [activeTab]: { pct, value: val, saved: false } }));
  }, [activeTab]);

  const onPointerDown = (e) => {
    setIsDragging(true);
    updateFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => { if (isDragging) updateFromX(e.clientX); };
  const onPointerUp = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (/^\d{0,3}\.?\d{0,1}$/.test(raw) || raw === "") {
      setInputValue(raw);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        const pct = Math.max(0, Math.min(100, (num / maxVal) * 100));
        setSliderPct(pct);
      }
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setInputValue(currentVal > 0 ? currentVal.toFixed(1) : "");
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) {
      setSliderPct(0);
      setInputValue("00.0");
    } else {
      const clamped = Math.min(num, maxVal);
      setSliderPct((clamped / maxVal) * 100);
      setInputValue(clamped.toFixed(1));
    }
  };

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
        fontFamily: "'Pretendard Variable', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        zIndex: 1000,
      }}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
      />

      <div onClick={(e) => e.stopPropagation()} style={{
        width: 672,
        height: 785,
        maxWidth: "95vw",
        background: "#fff",
        borderRadius: 20,
        padding: "44px 40px 32px",
        position: "relative",
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a", letterSpacing: -0.3 }}>
              혈당 기록하기
            </h2>
            <p style={{ margin: "5px 0 10px", fontSize: 14, color: "#999", fontWeight: 400 }}>
              오늘의 혈당을 기록하세요.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: "#bbb", fontSize: 20, lineHeight: 1,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="relative">
            <input
              type="date"
              ref={dateInputRef}
              className="absolute opacity-0 pointer-events-none"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button 
              onClick={() => dateInputRef.current.showPicker()}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 text-[14px] font-semibold
               text-slate-600 border border-slate-100 shadow-sm"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              {selectedDate}<span className="ml-1 text-[10px] text-slate-300">▼</span>
            </button>
          </div>

        {/* Tabs */}
        <div style={{
          marginTop: 22,
          display: "flex",
          borderBottom: "1px solid #f0f0f0",
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(i); setIsFocused(false); }}
              style={{
                flex: 1,
                padding: "17px 0",
                background: "none",
                border: "none",
                borderBottom: activeTab === i ? "2.5px solid #222" : "2.5px solid transparent",
                fontSize: 15,
                fontWeight: activeTab === i ? 700 : 400,
                color: activeTab === i ? "#222" : "#bbb",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                letterSpacing: -0.2,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Value Display */}
        <div style={{ marginTop: 40, textAlign: "center", marginBottom: 8, display: "flex", alignItems: "baseline", justifyContent: "center" }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={display}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{
              fontSize: 67,
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
            }}
            placeholder="00.0"
          />
          <span style={{
            fontSize: 18,
            color: "#aab0bc",
            fontWeight: 400,
            marginLeft: 12,
          }}>
            mg/dL
          </span>
        </div>

        {/* Slider Track */}
        <div style={{ marginTop: 32, padding: "0 2px" }}>
          <div
            ref={sliderRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              position: "relative",
              height: 12,
              borderRadius: 6,
              background: "linear-gradient(to right, #86efac 0%, #4ade80 15%, #a3e635 30%, #fde047 50%, #fbbf24 65%, #fb923c 78%, #f87171 90%, #ef4444 100%)",
              cursor: "pointer",
              touchAction: "none",
            }}
          >
            <div style={{
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
            }} />
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontSize: 12,
            color: "#b0b0b0",
            fontWeight: 400,
          }}>
            <span>정상</span>
            <span>주의</span>
            <span>경고</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{
          marginTop: 20,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: status.color, display: "inline-block",
          }} />
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: status.color, display: "inline-block", opacity: 0.45,
          }} />
          <span style={{
            fontSize: 14, fontWeight: 600, color: "#333", marginLeft: 4,
          }}>
            {status.label}
          </span>
        </div>

        {/* AI Insight Card */}
        <div style={{
          marginTop: 26,
          background: "#f6f7f9",
          borderRadius: 14,
          padding: "20px 22px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2l1.8 3.6L15 6.5l-2.8 2.7.7 3.8L9 11l-3.9 2l.7-3.8L3 6.5l4.2-.9L9 2z"
                fill="#8b5cf6"/>
            </svg>
          </div>
          <p style={{
            margin: 0, fontSize: 14, color: "#555", lineHeight: 1.7, fontWeight: 400,
          }}>
            지난번 대비 <strong style={{ fontWeight: 700, color: "#333" }}>5mg/dL</strong> 감소했습니다. 식후 혈당이 약간
            <br />높으니 가벼운 산책 15분 추천드립니다.
          </p>
        </div>

        {/* Footer Button */}
          <div className="pt-4">
            <button className="w-full rounded-[24px] bg-[#1a1a2e] py-5 text-xl font-bold text-white transition-all active:scale-[0.98] hover:bg-[#25253d] shadow-xl">
              기록 저장 및 확인
            </button>
          </div> 
      </div>
    </div>
  );
}