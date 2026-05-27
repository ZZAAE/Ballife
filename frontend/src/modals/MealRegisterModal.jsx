import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Plus, Brain, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import mealApi from "../api/mealApi";
import { useAuth } from "../contexts/AuthContext";

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침 식사",
  LUNCH: "점심 식사",
  DINNER: "저녁 식사",
  SNACK: "간식",
};

const STOPS = [0, 0.25, 0.5, 0.75, 1];
const STOP_LABELS = ["0", "1/4 인분", "1/2 인분", "3/4 인분", "1인분 전체"];
const STOP_DISPLAY = ["0", "1/4", "1/2", "3/4", "1 (전체)"];

const NUTRIENTS = [
  {
    key: "calories",
    label: "칼로리",
    unit: "kcal",
    color: "#f59e0b",
    integer: true,
  },
  {
    key: "carbs",
    label: "탄수화물",
    unit: "g",
    color: "#10b981",
    integer: false,
  },
  {
    key: "protein",
    label: "단백질",
    unit: "g",
    color: "#3b82f6",
    integer: false,
  },
  { key: "fat", label: "지방", unit: "g", color: "#fbbf24", integer: false },
  { key: "sugar", label: "당류", unit: "g", color: "#ec4899", integer: false },
  {
    key: "sodium",
    label: "나트륨",
    unit: "mg",
    color: "#8b5cf6",
    integer: true,
  },
  {
    key: "cholesterol",
    label: "콜레스테롤",
    unit: "mg",
    color: "#a855f7",
    integer: true,
  },
];

export default function MealRegisterModal({
  isOpen = true,
  onClose = () => {},
  category = "BREAKFAST",
  selectedDate,
  onSaved,
  initialMealId = null,
  initialMealTime = null,
  initialMealPhoto = null,
  initialChips = [],
}) {
  const { user } = useAuth();

  // ----- State -----
  // 기존 Meal에 사진이 있었으면 그 사진으로 시작, 없으면 null
  const [imageUrl, setImageUrl] = useState(initialMealPhoto);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // 기존 사진이 있으면 이미 "분석됨" 상태로 시작 (이미지 영역 표시용)
  const [analyzed, setAnalyzed] = useState(!!initialMealPhoto);
  const [dragOver, setDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  // 현재 입력 중인 음식 (form)
  const makeEmptyFormData = () => ({
    foodName: "",
    baseValues: {
      calories: null, carbs: null, protein: null, fat: null,
      sugar: null, sodium: null, cholesterol: null,
    },
    displayValues: {
      calories: "", carbs: "", protein: "", fat: "",
      sugar: "", sodium: "", cholesterol: "",
    },
    stopIndex: 4,
  });

  const [formData, setFormData] = useState(makeEmptyFormData);
  // 저장된 음식 chip 목록 (전체 영양소 데이터 보관 — 수정 모드용)
  const [chips, setChips] = useState(() =>
    initialChips.map((c) => ({
      mealItemId: c.mealItemId,
      foodName: c.foodName,
      calorie: c.calorie ?? 0,
      carbohydrate: c.carbohydrate ?? 0,
      sugar: c.sugar ?? 0,
      sodium: c.sodium ?? 0,
      cholesterol: c.cholesterol ?? 0,
      saturatedFat: c.saturatedFat ?? 0,
      protein: c.protein ?? 0,
    })),
  );
  // 수정 중인 chip의 mealItemId (null이면 신규 등록 모드)
  const [editingChipId, setEditingChipId] = useState(null);
  // 기존 Meal이 있으면 그 mealId 재사용, 없으면 첫 저장 시 새로 생성
  const [savedMealId, setSavedMealId] = useState(initialMealId);
  // 식사 시간: 기존 Meal 있으면 그 시간, 없으면 현재 시각
  const [mealTime, setMealTime] = useState(
    initialMealTime || new Date().toTimeString().slice(0, 5),
  );
  // bloodsugarModal과 동일한 시간 입력 UI 상태
  const [timeEditing, setTimeEditing] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const timeInputRef = useRef(null);

  const startTimeEdit = () => {
    setTimeInput(mealTime);
    setTimeEditing(true);
  };

  const commitTimeEdit = async () => {
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

    setTimeEditing(false);

    if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) return;

    const formatted = `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}`;
    if (formatted === mealTime) return;

    setMealTime(formatted);

    // 이미 저장된 Meal이면 백엔드 시간도 즉시 갱신
    if (savedMealId && user?.id) {
      try {
        await mealApi.updateMeal(user.id, savedMealId, {
          mealDate:
            selectedDate || new Date().toISOString().split("T")[0],
          mealTime: `${formatted}:00`,
          mealCategory: category,
          mealPhoto: imageUrl,
        });
        toast.success("시간이 변경되었습니다.");
        onSaved?.();
      } catch (err) {
        console.error("시간 변경 실패:", err);
      }
    }
  };

  useEffect(() => {
    if (timeEditing && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [timeEditing]);
  const fileInputRef = useRef(null);
  const trackRef = useRef(null);
  const analysisTimerRef = useRef(null);

  const stopIndex = formData.stopIndex;
  const portion = STOPS[stopIndex];
  const hasImage = !!imageUrl;

  const updateForm = (updater) => setFormData((prev) => updater(prev));

  const recomputeDisplayValues = (data, newStopIndex) => {
    const p = STOPS[newStopIndex];
    const newDisplay = { ...data.displayValues };
    NUTRIENTS.forEach((n) => {
      if (data.baseValues[n.key] != null) {
        newDisplay[n.key] = formatValue(data.baseValues[n.key], p, n.integer);
      }
    });
    return newDisplay;
  };

  const setStopIndex = (newIdx) => {
    updateForm((d) => ({
      ...d,
      stopIndex: newIdx,
      displayValues: recomputeDisplayValues(d, newIdx),
    }));
  };

  const resetForm = () => {
    setFormData(makeEmptyFormData());
    setEditingChipId(null);
  };

  // chip 클릭 → 그 음식 데이터를 form에 로드 (수정 모드 진입)
  const onClickChip = (chip) => {
    setEditingChipId(chip.mealItemId);
    const numToStr = (v, isInt) => {
      if (v == null) return "";
      return isInt ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
    };
    setFormData({
      foodName: chip.foodName,
      baseValues: {
        calories: chip.calorie,
        carbs: chip.carbohydrate,
        protein: chip.protein,
        fat: chip.saturatedFat,
        sugar: chip.sugar,
        sodium: chip.sodium,
        cholesterol: chip.cholesterol,
      },
      displayValues: {
        calories: numToStr(chip.calorie, true),
        carbs: numToStr(chip.carbohydrate, false),
        protein: numToStr(chip.protein, false),
        fat: numToStr(chip.saturatedFat, false),
        sugar: numToStr(chip.sugar, false),
        sodium: numToStr(chip.sodium, true),
        cholesterol: numToStr(chip.cholesterol, true),
      },
      stopIndex: 4,
    });
  };

  const formatValue = (baseVal, portionVal, integer) => {
    if (baseVal == null) return "";
    const v = baseVal * portionVal;
    return integer ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setImageUrl(dataUrl);
      setIsAnalyzing(true);
      setAnalyzed(false);

      // 이미 저장된 Meal이면 사진도 백엔드에 즉시 반영
      if (savedMealId && user?.id) {
        try {
          await mealApi.updateMeal(user.id, savedMealId, {
            mealDate:
              selectedDate || new Date().toISOString().split("T")[0],
            mealTime: `${mealTime}:00`,
            mealCategory: category,
            mealPhoto: dataUrl,
          });
          onSaved?.();
        } catch (err) {
          console.error("사진 업데이트 실패:", err);
        }
      }

      clearTimeout(analysisTimerRef.current);
      analysisTimerRef.current = setTimeout(() => {
        setIsAnalyzing(false);
        setAnalyzed(true);
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
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

  const getNearestStopFromX = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let nearest = 0;
    let minDist = Infinity;
    STOPS.forEach((s, i) => {
      const d = Math.abs(s - ratio);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
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

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    // setStopIndex는 ref 기반이라 항상 최신 active chip을 사용 — deps 추가 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, getNearestStopFromX]);

  const onNutrientChange = (key, value) => {
    const clean = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    updateForm((d) => {
      const p = STOPS[d.stopIndex];
      const newDisplay = { ...d.displayValues, [key]: clean };
      const newBase = { ...d.baseValues };
      if (p > 0 && clean !== "" && !isNaN(parseFloat(clean))) {
        newBase[key] = parseFloat(clean) / p;
      } else if (clean === "") {
        newBase[key] = null;
      }
      return { ...d, displayValues: newDisplay, baseValues: newBase };
    });
  };

  // 저장된 chip 삭제 (백엔드 MealItem도 삭제)
  const removeChip = async (chip) => {
    if (!user?.id || !chip.mealItemId) return;
    try {
      await mealApi.deleteMealItem(user.id, chip.mealItemId);
      setChips((prev) =>
        prev.filter((c) => c.mealItemId !== chip.mealItemId),
      );
      // 수정 중이던 chip을 삭제한 경우 폼도 초기화
      if (chip.mealItemId === editingChipId) {
        resetForm();
      }
      onSaved?.();
    } catch (err) {
      console.error("음식 삭제 실패:", err);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(analysisTimerRef.current);
    };
  }, []);

  const toNumber = (v, isInt = false) => {
    if (v === "" || v == null) return 0;
    const n = parseFloat(v);
    if (Number.isNaN(n)) return 0;
    return isInt ? Math.round(n) : n;
  };

  const handleDelete = async () => {
    if (!user?.id || !savedMealId || isDeleting) return;
    if (!window.confirm("이 식단 기록을 삭제하시겠어요?\n사진과 등록된 음식이 모두 삭제됩니다.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await mealApi.deleteMeal(user.id, savedMealId);
      toast.success("식단이 삭제되었습니다.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("식단 삭제 실패:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    // 새 음식 입력이 없을 때: chip이나 기존 Meal이 있으면 "저장됨" 안내,
    // 아무것도 없으면 입력 요청
    if (!formData.foodName.trim()) {
      if (chips.length > 0 || savedMealId) {
        toast.success("저장되었습니다.");
      } else {
        toast.error("음식 이름을 입력해주세요.");
      }
      return;
    }
    if (!savedMealId && !mealTime) {
      toast.error("식사 시간을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        foodName: formData.foodName.trim(),
        calorie: toNumber(formData.displayValues.calories, true),
        carbohydrate: toNumber(formData.displayValues.carbs),
        sugar: toNumber(formData.displayValues.sugar),
        sodium: toNumber(formData.displayValues.sodium),
        cholesterol: toNumber(formData.displayValues.cholesterol),
        saturatedFat: toNumber(formData.displayValues.fat),
        protein: toNumber(formData.displayValues.protein),
      };

      if (editingChipId != null) {
        // 수정 모드: 기존 MealItem 업데이트
        await mealApi.updateMealItem(user.id, editingChipId, payload);
        setChips((prev) =>
          prev.map((c) =>
            c.mealItemId === editingChipId
              ? { ...c, ...payload, mealItemId: c.mealItemId }
              : c,
          ),
        );
        toast.success("수정되었습니다.");
        resetForm();
        onSaved?.();
      } else {
        // 신규 등록 모드: 필요 시 Meal 먼저 생성
        let mealId = savedMealId;
        if (!mealId) {
          const dateStr =
            selectedDate || new Date().toISOString().split("T")[0];
          const timeStr = `${mealTime}:00`;
          const mealRes = await mealApi.createMeal(user.id, {
            mealDate: dateStr,
            mealTime: timeStr,
            mealCategory: category,
            mealPhoto: imageUrl,
          });
          mealId = mealRes.data?.mealId;
          if (!mealId) throw new Error("mealId not returned");
          setSavedMealId(mealId);
        }

        const itemRes = await mealApi.createMealItem(user.id, mealId, payload);
        const mealItemId = itemRes.data?.mealItemId;
        setChips((prev) => [
          ...prev,
          { mealItemId, ...payload },
        ]);

        toast.success("저장되었습니다.");
        onSaved?.();
      }
    } catch (err) {
      console.error("식단 저장 실패:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    isOpen && (
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-5 antialiased"
        style={{
          background: "rgba(15, 19, 32, 0.5)",
          backdropFilter: "blur(4px)",
          color: "#1a1f2e",
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
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

          .modal-card::-webkit-scrollbar { width: 10px; }
          .modal-card::-webkit-scrollbar-track {
            background: transparent;
            margin: 20px 0;
          }
          .modal-card::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 999px;
            border: 2px solid white;
          }
          .modal-card::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          .modal-card {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }
        `}</style>

        <div
          className="modal-card w-[1040px] bg-white rounded-3xl relative overflow-y-auto"
          style={{
            padding: "32px 40px 24px",
            maxHeight: "calc(100vh - 40px)",
            boxShadow:
              "0 1px 2px rgba(15,19,32,0.04), 0 8px 24px rgba(15,19,32,0.06)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 (우측 상단) */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 22,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#bbb",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
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

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h1
                className="font-bold"
                style={{ fontSize: "28px", letterSpacing: "-0.025em" }}
              >
                식단 등록
              </h1>
              <span
                className="inline-flex items-center rounded-full text-[12.5px] font-semibold"
                style={{
                  background: "#eef2ff",
                  color: "#4338ca",
                  padding: "4px 12px",
                }}
              >
                {MEAL_CATEGORY_LABEL[category] || "식사"}
              </span>
            </div>
            <p className="text-sm font-normal" style={{ color: "#6b7280" }}>
              AI가 분석한 식사 내용입니다. 상세 영양 성분을 확인해 주세요.
            </p>

            {/* 식사 시간 입력 (bloodsugarModal과 동일 스타일) */}
            <div className="mt-[14px] flex items-center gap-2.5 flex-wrap">
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
                  type="button"
                  onClick={startTimeEdit}
                  className="flex items-center gap-2 rounded-[16px] bg-[#F1F5F9] px-4 py-2.5 text-[13px] font-semibold text-[#64748B] border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-colors"
                >
                  <Clock className="h-4 w-4 text-[#2563EB]" />
                  {mealTime}
                </button>
              )}
            </div>

            {(chips.length > 0 || savedMealId != null) && (
              <div className="flex gap-2 mt-[12px] items-center flex-wrap min-h-9 mr-chips-fade-in">
                {chips.map((c) => {
                  const isEditing = c.mealItemId === editingChipId;
                  return (
                    <div
                      key={c.mealItemId}
                      onClick={() => onClickChip(c)}
                      className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all"
                      style={{
                        padding: "7px 14px",
                        background: isEditing ? "#fef3c7" : "#eef2ff",
                        border: isEditing
                          ? "1px solid #fbbf24"
                          : "1px solid #c7d2fe",
                        color: isEditing ? "#78350f" : "#1e3a8a",
                      }}
                    >
                      <span>{c.foodName}</span>
                      <span
                        className="cursor-pointer p-0.5 flex items-center"
                        style={{ color: isEditing ? "#a16207" : "#adb5bd" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChip(c);
                        }}
                      >
                        <X size={14} />
                      </span>
                    </div>
                  );
                })}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium cursor-pointer"
                  style={{
                    padding: "7px 14px",
                    background: "#f5f7ff",
                    border: "1px dashed #c7d2fe",
                    color: "#4f46e5",
                  }}
                  onClick={resetForm}
                >
                  <Plus size={13} />
                  <span>음식 추가</span>
                </div>
              </div>
            )}
          </div>

          <div
            className="grid gap-6 mt-5"
            style={{ gridTemplateColumns: "380px 1fr" }}
          >
            {/* LEFT COLUMN */}
            <div className="relative">
              <div
                className="w-full flex flex-col text-center overflow-hidden relative rounded-[18px] transition-all duration-200"
                style={{
                  aspectRatio: "1 / 1.0",
                  background: hasImage
                    ? "#f8f9fa"
                    : dragOver
                      ? "#eef4ff"
                      : "#fafbfc",
                  border: hasImage
                    ? "1.5px solid #e5e7eb"
                    : dragOver
                      ? "1.5px dashed #2563eb"
                      : "1.5px dashed #cbd5e1",
                  alignItems: hasImage ? "stretch" : "center",
                  justifyContent: hasImage ? "flex-start" : "center",
                  cursor: hasImage ? "default" : "pointer",
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
                      style={{ background: "#eef2ff", color: "#6366f1" }}
                    >
                      <Camera size={30} strokeWidth={2} />
                    </div>
                    <div className="text-base font-semibold mb-2">
                      식단 사진 올리기
                    </div>
                    <div
                      className="leading-relaxed mb-[22px] px-5"
                      style={{ fontSize: "12.5px", color: "#6b7280" }}
                    >
                      이곳을 클릭하거나 사진 파일을 드래그하여
                      <br />
                      업로드 하세요 (JPG, PNG)
                    </div>
                    <button
                      type="button"
                      onClick={onSelectFileClick}
                      className="text-white border-none rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all hover:-translate-y-px"
                      style={{ background: "#2563eb", padding: "11px 24px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#1d4ed8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#2563eb")
                      }
                    >
                      파일 선택하기
                    </button>
                  </>
                )}

                {hasImage && (
                  <>
                    <div className="relative w-full flex-1 overflow-hidden rounded-t-[18px]">
                      <img
                        src={imageUrl}
                        alt="식단 사진"
                        className="w-full h-full object-cover block"
                      />

                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center z-[5] transition-opacity duration-200"
                        style={{
                          background: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(4px)",
                          opacity: isAnalyzing ? 1 : 0,
                          pointerEvents: isAnalyzing ? "all" : "none",
                        }}
                      >
                        <div
                          className="mr-spinner rounded-full mb-3.5"
                          style={{
                            width: "44px",
                            height: "44px",
                            border: "3px solid #e5e7eb",
                            borderTopColor: "#2563eb",
                          }}
                        />
                        <div className="text-[13px] font-semibold mb-1">
                          AI가 분석하고 있어요
                        </div>
                        <div
                          className="text-[11.5px]"
                          style={{ color: "#6b7280" }}
                        >
                          잠시만 기다려 주세요...
                        </div>
                      </div>
                    </div>

                    {analyzed && (
                      <div
                        className="bg-white"
                        style={{
                          padding: "14px 16px 16px",
                          borderTop: "1px solid #f1f3f5",
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 text-[13px] font-semibold"
                          style={{ color: "#4f46e5" }}
                        >
                          <Brain size={14} strokeWidth={2.5} />
                          <span>AI 비전 분석 완료</span>
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
            <div className="flex flex-col gap-[18px]">
              {/* Food name */}
              <div>
                <div className="text-[13px] font-semibold mb-[9px]">
                  음식 이름
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={formData.foodName}
                  onChange={(e) =>
                    updateForm((d) => ({ ...d, foodName: e.target.value }))
                  }
                  className="mr-input w-full text-sm font-medium outline-none transition-all"
                  style={{
                    padding: "14px 18px",
                    background: "#f1f3f5",
                    border: "1.5px solid transparent",
                    borderRadius: "14px",
                    color: "#1a1f2e",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Portion slider */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[13px] font-semibold">
                    섭취량 조절 (PORTION)
                  </span>
                  <span
                    className="text-[11.5px] font-semibold rounded-full"
                    style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      padding: "4px 11px",
                    }}
                  >
                    {STOP_LABELS[stopIndex]}
                  </span>
                </div>

                <div className="relative" style={{ padding: "16px 4px 8px" }}>
                  <div
                    ref={trackRef}
                    className="relative rounded-[3px] cursor-pointer"
                    style={{ height: "6px", background: "#e5e7eb" }}
                    onMouseDown={onSliderPointerDown}
                    onTouchStart={onSliderPointerDown}
                  >
                    <div
                      className="absolute top-0 left-0 h-full rounded-[3px]"
                      style={{
                        width: `${portion * 100}%`,
                        background: "linear-gradient(90deg, #1a1f2e, #4f46e5)",
                        transition: isDragging
                          ? "none"
                          : "width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                  </div>

                  <div
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{ top: "16px", height: "6px" }}
                  >
                    {STOPS.map((s, i) => {
                      const active = i <= stopIndex;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 rounded-full cursor-pointer z-[2] transition-all"
                          style={{
                            left: `${s * 100}%`,
                            width: "8px",
                            height: "8px",
                            background: active ? "#4f46e5" : "white",
                            border: `2px solid ${active ? "#4f46e5" : "#cbd5e1"}`,
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "auto",
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
                      width: "22px",
                      height: "22px",
                      border: "3px solid #1a1f2e",
                      transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
                      cursor: isDragging ? "grabbing" : "grab",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      transition: isDragging
                        ? "transform 0.1s"
                        : "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s",
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
                          color: active ? "#1a1f2e" : "#6b7280",
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
                      background: "#f3f4f6",
                      color: "#6b7280",
                      padding: "4px 10px",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width: "5px",
                        height: "5px",
                        background: "#4f46e5",
                      }}
                    />
                    AI 추정치
                  </span>
                </div>

                {/* Calories (full width) */}
                <div style={{ marginTop: "12px" }}>
                  {(() => {
                    const n = NUTRIENTS[0];
                    return (
                      <>
                        <div className="flex items-center gap-[7px] text-[13px] font-semibold mb-[9px]">
                          <span
                            className="inline-block"
                            style={{
                              width: "4px",
                              height: "14px",
                              borderRadius: "2px",
                              background: n.color,
                            }}
                          />
                          <span>{n.label}</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formData.displayValues[n.key]}
                            onChange={(e) =>
                              onNutrientChange(n.key, e.target.value)
                            }
                            className="mr-input mr-nutrient-input w-full text-right outline-none transition-all"
                            style={{
                              padding: "13px 56px 13px 18px",
                              background: "#f1f3f5",
                              border: "1.5px solid transparent",
                              borderRadius: "14px",
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#1a1f2e",
                              fontFamily: "inherit",
                            }}
                          />
                          <span
                            className="absolute top-1/2 text-[13px] font-medium select-none pointer-events-none"
                            style={{
                              right: "18px",
                              transform: "translateY(-50%)",
                              color: "#6b7280",
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
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 18px",
                    marginTop: "14px",
                  }}
                >
                  {NUTRIENTS.slice(1).map((n) => (
                    <div key={n.key}>
                      <div className="flex items-center gap-[7px] text-[13px] font-semibold mb-[9px]">
                        <span
                          className="inline-block"
                          style={{
                            width: "4px",
                            height: "14px",
                            borderRadius: "2px",
                            background: n.color,
                          }}
                        />
                        <span>{n.label}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.displayValues[n.key]}
                          onChange={(e) =>
                            onNutrientChange(n.key, e.target.value)
                          }
                          className="mr-input mr-nutrient-input w-full text-right outline-none transition-all"
                          style={{
                            padding: "13px 56px 13px 18px",
                            background: "#f1f3f5",
                            border: "1.5px solid transparent",
                            borderRadius: "14px",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#1a1f2e",
                            fontFamily: "inherit",
                          }}
                        />
                        <span
                          className="absolute top-1/2 text-[13px] font-medium select-none pointer-events-none"
                          style={{
                            right: "18px",
                            transform: "translateY(-50%)",
                            color: "#6b7280",
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
              <div className="flex justify-end gap-2.5 mt-4">
                {savedMealId != null && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving || isDeleting}
                    className="inline-flex items-center justify-center rounded-full text-[13.5px] font-semibold cursor-pointer transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      padding: "14px 28px",
                      background: "#ffffff",
                      color: "#DC2626",
                      border: "1.5px solid #FCA5A5",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (!isDeleting) e.currentTarget.style.background = "#FEF2F2";
                    }}
                    onMouseLeave={(e) => {
                      if (!isDeleting) e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    {isDeleting ? "삭제 중..." : "식단 삭제"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isDeleting}
                  className="inline-flex items-center justify-center rounded-full text-[13.5px] font-semibold text-white cursor-pointer transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    padding: "14px 36px",
                    background: "#1a1f2e",
                    border: "none",
                    boxShadow: "0 4px 14px rgba(26,31,46,0.25)",
                    minWidth: "200px",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) e.currentTarget.style.background = "#0f1320";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) e.currentTarget.style.background = "#1a1f2e";
                  }}
                >
                  {isSaving
                    ? "저장 중..."
                    : editingChipId != null
                      ? "수정 완료"
                      : "식단 저장 및 확인"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
