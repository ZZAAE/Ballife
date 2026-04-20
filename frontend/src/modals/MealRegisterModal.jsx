import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, ArrowLeft, Plus, Brain, X } from 'lucide-react';

const STOPS = [0, 0.25, 0.5, 0.75, 1];
const STOP_LABELS = ['0', '1/4 인분', '1/2 인분', '3/4 인분', '1인분 전체'];
const STOP_DISPLAY = ['0', '1/4', '1/2', '3/4', '1 (전체)'];

const NUTRIENTS = [
  { key: 'calories',    label: '칼로리',     unit: 'kcal', color: '#f59e0b', integer: true },
  { key: 'carbs',       label: '탄수화물',   unit: 'g',    color: '#10b981', integer: false },
  { key: 'protein',     label: '단백질',     unit: 'g',    color: '#3b82f6', integer: false },
  { key: 'fat',         label: '지방',       unit: 'g',    color: '#fbbf24', integer: false },
  { key: 'sugar',       label: '당류',       unit: 'g',    color: '#ec4899', integer: false },
  { key: 'sodium',      label: '나트륨',     unit: 'mg',   color: '#8b5cf6', integer: true },
  { key: 'cholesterol', label: '콜레스테롤', unit: 'mg',   color: '#a855f7', integer: true },
];

const TARGET_VALUES = {
  calories: 640, carbs: 35, protein: 42,
  fat: 28, sugar: 12, sodium: 420, cholesterol: 85,
};

export default function MealRegisterModal() {
  // ----- State -----
  const [imageUrl, setImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [foodName, setFoodName] = useState('');
  const [stopIndex, setStopIndex] = useState(4);
  const [isDragging, setIsDragging] = useState(false);

  const [baseValues, setBaseValues] = useState({
    calories: null, carbs: null, protein: null,
    fat: null, sugar: null, sodium: null, cholesterol: null,
  });

  const [displayValues, setDisplayValues] = useState({
    calories: '', carbs: '', protein: '',
    fat: '', sugar: '', sodium: '', cholesterol: '',
  });

  const [chips, setChips] = useState([]);
  const [detectionTagsVisible, setDetectionTagsVisible] = useState(false);

  const fileInputRef = useRef(null);
  const trackRef = useRef(null);
  const analysisTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const portion = STOPS[stopIndex];
  const hasImage = !!imageUrl;

  // ----- Helpers -----
  const formatValue = (baseVal, portionVal, integer) => {
    if (baseVal == null) return '';
    const v = baseVal * portionVal;
    return integer ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
  };

  // When portion changes, recompute display values from base
  useEffect(() => {
    setDisplayValues((prev) => {
      const next = { ...prev };
      NUTRIENTS.forEach((n) => {
        if (baseValues[n.key] != null) {
          next[n.key] = formatValue(baseValues[n.key], portion, n.integer);
        }
      });
      return next;
    });
  }, [portion, baseValues]);

  // ----- File handling -----
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      setIsAnalyzing(true);
      setAnalyzed(false);
      setDetectionTagsVisible(false);

      clearTimeout(analysisTimerRef.current);
      analysisTimerRef.current = setTimeout(() => {
        setIsAnalyzing(false);
        setAnalyzed(true);
        setFoodName('연어 아보카도 포케 볼');
        setChips([
          { id: 1, label: '연어 아보카도 포케 볼', active: false },
          { id: 2, label: '닭가슴살 샐러드', active: true },
        ]);

        const startTime = performance.now();
        const duration = 900;

        const animate = (now) => {
          const t = Math.min(1, (now - startTime) / duration);
          const eased = 1 - Math.pow(1 - t, 3);

          setDisplayValues(() => {
            const next = {};
            NUTRIENTS.forEach((n) => {
              const target = TARGET_VALUES[n.key];
              const v = target * eased;
              next[n.key] = n.integer ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
            });
            return next;
          });

          if (t < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            setBaseValues({ ...TARGET_VALUES });
          }
        };
        animationFrameRef.current = requestAnimationFrame(animate);

        setTimeout(() => setDetectionTagsVisible(true), 150);
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onSelectFileClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const onDropzoneClick = () => {
    if (!imageUrl) fileInputRef.current?.click();
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!imageUrl) setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (imageUrl) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ----- Slider logic -----
  const getNearestStopFromX = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let nearest = 0;
    let minDist = Infinity;
    STOPS.forEach((s, i) => {
      const d = Math.abs(s - ratio);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    return nearest;
  }, []);

  const onSliderPointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStopIndex(getNearestStopFromX(clientX));
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setStopIndex(getNearestStopFromX(clientX));
    };
    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, getNearestStopFromX]);

  // ----- Nutrient edit -----
  const onNutrientChange = (key, value) => {
    const clean = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setDisplayValues((prev) => ({ ...prev, [key]: clean }));

    if (portion > 0 && clean !== '' && !isNaN(parseFloat(clean))) {
      const newBase = parseFloat(clean) / portion;
      setBaseValues((prev) => ({ ...prev, [key]: newBase }));
    } else if (clean === '') {
      setBaseValues((prev) => ({ ...prev, [key]: null }));
    }
  };

  const removeChip = (id) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
  };

  // ----- Cleanup -----
  useEffect(() => {
    return () => {
      clearTimeout(analysisTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      className="w-full min-h-[1142px] flex items-center justify-center px-5 py-10 antialiased"
      style={{
        background: '#f4f4f3',
        color: '#1a1f2e',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        letterSpacing: '-0.01em',
      }}
    >
      {/* Inline keyframes + non-utility styles */}
      <style>{`
        @keyframes mr-spin { to { transform: rotate(360deg); } }
        @keyframes mr-fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mr-nutrient-input::-webkit-outer-spin-button,
        .mr-nutrient-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .mr-nutrient-input { -moz-appearance: textfield; }
        .mr-chips-fade-in { animation: mr-fadeInUp 0.4s ease both; }
        .mr-spinner { animation: mr-spin 0.9s linear infinite; }

        .mr-input:hover { background: #e9ecef; }
        .mr-input:focus {
          background: #ffffff;
          border-color: #1a1f2e;
          box-shadow: 0 0 0 4px rgba(26,31,46,0.06);
        }
      `}</style>

      <div
        className="w-[1040px] bg-white rounded-3xl relative"
        style={{
          padding: '56px 64px 48px',
          boxShadow: '0 1px 2px rgba(15,19,32,0.04), 0 8px 24px rgba(15,19,32,0.06)',
        }}
      >
        {/* Header */}
        <div>
          <h1
            className="font-bold mb-2.5"
            style={{ fontSize: '32px', letterSpacing: '-0.025em' }}
          >
            식단 등록
          </h1>
          <p className="text-sm font-normal" style={{ color: '#6b7280' }}>
            AI가 분석한 식사 내용입니다. 상세 영양 성분을 확인해 주세요.
          </p>

          {analyzed && chips.length > 0 && (
            <div className="flex gap-2 mt-[18px] items-center flex-wrap min-h-9 mr-chips-fade-in">
              {chips.map((c) => (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium"
                  style={{
                    padding: '7px 14px',
                    background: c.active ? '#eef2ff' : '#ffffff',
                    border: c.active ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
                    color: c.active ? '#1e3a8a' : '#1a1f2e',
                  }}
                >
                  <span>{c.label}</span>
                  <span
                    className="cursor-pointer p-0.5 flex items-center"
                    style={{ color: '#adb5bd' }}
                    onClick={() => removeChip(c.id)}
                  >
                    <X size={14} />
                  </span>
                </div>
              ))}
              <div
                className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium cursor-pointer"
                style={{
                  padding: '7px 14px',
                  background: '#f5f7ff',
                  border: '1px dashed #c7d2fe',
                  color: '#4f46e5',
                }}
              >
                <Plus size={13} />
                <span>음식 추가</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-10 mt-7" style={{ gridTemplateColumns: '380px 1fr' }}>
          {/* LEFT COLUMN */}
          <div className="relative">
            {analyzed && (
              <span
                className="absolute text-[11px] font-semibold rounded-full"
                style={{
                  top: '-36px',
                  left: 0,
                  background: '#d1fae5',
                  color: '#047857',
                  padding: '5px 10px',
                }}
              >
                정확도 94%
              </span>
            )}

            <div
              className="w-full flex flex-col text-center overflow-hidden relative rounded-[18px] transition-all duration-200"
              style={{
                aspectRatio: '1 / 1.13',
                background: hasImage ? '#f8f9fa' : dragOver ? '#eef4ff' : '#fafbfc',
                border: hasImage
                  ? '1.5px solid #e5e7eb'
                  : dragOver
                  ? '1.5px dashed #2563eb'
                  : '1.5px dashed #cbd5e1',
                alignItems: hasImage ? 'stretch' : 'center',
                justifyContent: hasImage ? 'flex-start' : 'center',
                cursor: hasImage ? 'default' : 'pointer',
              }}
              onClick={onDropzoneClick}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {!hasImage && (
                <>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-[18px]"
                    style={{ background: '#eef2ff', color: '#6366f1' }}
                  >
                    <Camera size={30} strokeWidth={2} />
                  </div>
                  <div className="text-base font-semibold mb-2">식단 사진 올리기</div>
                  <div
                    className="leading-relaxed mb-[22px] px-5"
                    style={{ fontSize: '12.5px', color: '#6b7280' }}
                  >
                    이곳을 클릭하거나 사진 파일을 드래그하여
                    <br />
                    업로드 하세요 (JPG, PNG)
                  </div>
                  <button
                    type="button"
                    onClick={onSelectFileClick}
                    className="text-white border-none rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all hover:-translate-y-px"
                    style={{ background: '#2563eb', padding: '11px 24px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
                  >
                    파일 선택하기
                  </button>
                </>
              )}

              {hasImage && (
                <>
                  <div className="relative w-full flex-1 overflow-hidden rounded-t-[18px]">
                    <img src={imageUrl} alt="식단 사진" className="w-full h-full object-cover block" />

                    {analyzed && (
                      <>
                        <div
                          className="absolute text-white font-semibold rounded-md"
                          style={{
                            top: '18px',
                            left: '18px',
                            background: '#2563eb',
                            fontSize: '11.5px',
                            padding: '5px 10px',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                            opacity: detectionTagsVisible ? 1 : 0,
                            transform: detectionTagsVisible ? 'translateY(0)' : 'translateY(-4px)',
                            transition: 'all 0.4s ease 0ms',
                          }}
                        >
                          닭가슴살 120g
                        </div>
                        <div
                          className="absolute text-white font-semibold rounded-md"
                          style={{
                            top: '56px',
                            left: '18px',
                            background: '#1d4ed8',
                            fontSize: '11.5px',
                            padding: '5px 10px',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                            opacity: detectionTagsVisible ? 1 : 0,
                            transform: detectionTagsVisible ? 'translateY(0)' : 'translateY(-4px)',
                            transition: 'all 0.4s ease 180ms',
                          }}
                        >
                          아보카도 1/2
                        </div>
                      </>
                    )}

                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center z-[5] transition-opacity duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(4px)',
                        opacity: isAnalyzing ? 1 : 0,
                        pointerEvents: isAnalyzing ? 'all' : 'none',
                      }}
                    >
                      <div
                        className="mr-spinner rounded-full mb-3.5"
                        style={{
                          width: '44px',
                          height: '44px',
                          border: '3px solid #e5e7eb',
                          borderTopColor: '#2563eb',
                        }}
                      />
                      <div className="text-[13px] font-semibold mb-1">AI가 분석하고 있어요</div>
                      <div className="text-[11.5px]" style={{ color: '#6b7280' }}>
                        잠시만 기다려 주세요...
                      </div>
                    </div>
                  </div>

                  {analyzed && (
                    <div
                      className="bg-white"
                      style={{ padding: '14px 16px 16px', borderTop: '1px solid #f1f3f5' }}
                    >
                      <div
                        className="flex items-center gap-1.5 text-[13px] font-semibold mb-1.5"
                        style={{ color: '#4f46e5' }}
                      >
                        <Brain size={14} strokeWidth={2.5} />
                        <span>AI 비전 분석 완료</span>
                      </div>
                      <div
                        className="text-xs leading-normal"
                        style={{ color: '#6b7280' }}
                      >
                        감지됨: 닭가슴살, 케일 샐러드, 방울토마토, 아보카도.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={onFileInputChange}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-[22px]">
            {/* Food name */}
            <div>
              <div className="text-[13px] font-semibold mb-[9px]">음식 이름</div>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="mr-input w-full text-sm font-medium outline-none transition-all"
                style={{
                  padding: '14px 18px',
                  background: '#f1f3f5',
                  border: '1.5px solid transparent',
                  borderRadius: '14px',
                  color: '#1a1f2e',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Portion slider */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] font-semibold">섭취량 조절 (PORTION)</span>
                <span
                  className="text-[11.5px] font-semibold rounded-full"
                  style={{
                    background: '#eef2ff',
                    color: '#4338ca',
                    padding: '4px 11px',
                  }}
                >
                  {STOP_LABELS[stopIndex]}
                </span>
              </div>

              <div className="relative" style={{ padding: '16px 4px 8px' }}>
                <div
                  ref={trackRef}
                  className="relative rounded-[3px] cursor-pointer"
                  style={{ height: '6px', background: '#e5e7eb' }}
                  onMouseDown={onSliderPointerDown}
                  onTouchStart={onSliderPointerDown}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-[3px]"
                    style={{
                      width: `${portion * 100}%`,
                      background: 'linear-gradient(90deg, #1a1f2e, #4f46e5)',
                      transition: isDragging
                        ? 'none'
                        : 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </div>

                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ top: '16px', height: '6px' }}
                >
                  {STOPS.map((s, i) => {
                    const active = i <= stopIndex;
                    return (
                      <div
                        key={i}
                        className="absolute top-1/2 rounded-full cursor-pointer z-[2] transition-all"
                        style={{
                          left: `${s * 100}%`,
                          width: '8px',
                          height: '8px',
                          background: active ? '#4f46e5' : 'white',
                          border: `2px solid ${active ? '#4f46e5' : '#cbd5e1'}`,
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'auto',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStopIndex(i);
                        }}
                      />
                    );
                  })}
                </div>

                <div
                  className="absolute top-1/2 bg-white rounded-full z-[3]"
                  style={{
                    left: `${portion * 100}%`,
                    width: '22px',
                    height: '22px',
                    border: '3px solid #1a1f2e',
                    transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: isDragging
                      ? 'transform 0.1s'
                      : 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s',
                  }}
                  onMouseDown={onSliderPointerDown}
                  onTouchStart={onSliderPointerDown}
                />
              </div>

              <div className="flex justify-between mt-3.5 px-0.5">
                {STOP_DISPLAY.map((label, i) => {
                  const active = i === stopIndex;
                  return (
                    <span
                      key={i}
                      className="text-[11.5px] cursor-pointer transition-colors select-none"
                      style={{
                        color: active ? '#1a1f2e' : '#6b7280',
                        fontWeight: active ? 700 : 500,
                      }}
                      onClick={() => setStopIndex(i)}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-bold">영양 성분</span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full"
                  style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    padding: '4px 10px',
                  }}
                >
                  <span
                    className="rounded-full"
                    style={{ width: '5px', height: '5px', background: '#4f46e5' }}
                  />
                  AI 추정치
                </span>
              </div>

              {/* Calories (full width) */}
              <div style={{ marginTop: '14px' }}>
                {(() => {
                  const n = NUTRIENTS[0];
                  return (
                    <>
                      <div className="flex items-center gap-[7px] text-[13px] font-semibold mb-[9px]">
                        <span
                          className="inline-block"
                          style={{
                            width: '4px',
                            height: '14px',
                            borderRadius: '2px',
                            background: n.color,
                          }}
                        />
                        <span>{n.label}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={displayValues[n.key]}
                          onChange={(e) => onNutrientChange(n.key, e.target.value)}
                          className="mr-input mr-nutrient-input w-full text-right outline-none transition-all"
                          style={{
                            padding: '13px 56px 13px 18px',
                            background: '#f1f3f5',
                            border: '1.5px solid transparent',
                            borderRadius: '14px',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#1a1f2e',
                            fontFamily: 'inherit',
                          }}
                        />
                        <span
                          className="absolute top-1/2 text-[13px] font-medium select-none pointer-events-none"
                          style={{
                            right: '18px',
                            transform: 'translateY(-50%)',
                            color: '#6b7280',
                          }}
                        >
                          {n.unit}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Other 6 nutrients in 2-col grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px 18px',
                  marginTop: '18px',
                }}
              >
                {NUTRIENTS.slice(1).map((n) => (
                  <div key={n.key}>
                    <div className="flex items-center gap-[7px] text-[13px] font-semibold mb-[9px]">
                      <span
                        className="inline-block"
                        style={{
                          width: '4px',
                          height: '14px',
                          borderRadius: '2px',
                          background: n.color,
                        }}
                      />
                      <span>{n.label}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={displayValues[n.key]}
                        onChange={(e) => onNutrientChange(n.key, e.target.value)}
                        className="mr-input mr-nutrient-input w-full text-right outline-none transition-all"
                        style={{
                          padding: '13px 56px 13px 18px',
                          background: '#f1f3f5',
                          border: '1.5px solid transparent',
                          borderRadius: '14px',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#1a1f2e',
                          fontFamily: 'inherit',
                        }}
                      />
                      <span
                        className="absolute top-1/2 text-[13px] font-medium select-none pointer-events-none"
                        style={{
                          right: '18px',
                          transform: 'translateY(-50%)',
                          color: '#6b7280',
                        }}
                      >
                        {n.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2.5 mt-9">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full text-[13.5px] font-semibold cursor-pointer transition-all"
                style={{
                  padding: '14px 28px',
                  background: 'white',
                  border: '1.5px solid #e5e7eb',
                  color: '#1a1f2e',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <ArrowLeft size={14} strokeWidth={2.5} />
                이전으로
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full text-[13.5px] font-semibold text-white cursor-pointer transition-all hover:-translate-y-px"
                style={{
                  padding: '14px 36px',
                  background: '#1a1f2e',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(26,31,46,0.25)',
                  minWidth: '200px',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0f1320')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1f2e')}
              >
                식단 저장 및 확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
