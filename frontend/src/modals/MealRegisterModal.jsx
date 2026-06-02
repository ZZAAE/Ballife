import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Plus, Brain, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import mealApi from "../api/mealApi";
import mealAnalysisApi from "../api/mealAnalysisApi";
import uploadApi from "../api/uploadApi";
import { resizeImageFile } from "../utils/imageResize";
import { useAuth } from "../contexts/AuthContext";

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침 식사",
  LUNCH: "점심 식사",
  DINNER: "저녁 식사",
  SNACK: "간식",
};


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


  // 현재 입력 중인 음식 (form)
  // baseValues = 100g 기준 영양소, displayValues = 실제 grams 기준 환산값
  const makeEmptyFormData = () => ({
    foodName: "",
    mealPhoto: null,
    baseValues: {
      calories: null, carbs: null, protein: null, fat: null,
      sugar: null, sodium: null, cholesterol: null,
    },
    displayValues: {
      calories: "", carbs: "", protein: "", fat: "",
      sugar: "", sodium: "", cholesterol: "",
    },
    grams: 100, // 기본 100g
  });

  const [formData, setFormData] = useState(makeEmptyFormData);
  // 저장된 음식 chip 목록 (전체 영양소 데이터 보관 — 수정 모드용)
  const [chips, setChips] = useState(() =>
    initialChips.map((c) => ({
      mealItemId: c.mealItemId,
      foodName: c.foodName,
      mealPhoto: c.mealPhoto ?? null,
      grams: c.grams ?? null, // DB 실제값 그대로 (null이면 chip에 g 미표시 — 가짜 100으로 가리지 않음)
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
  const analysisTimerRef = useRef(null);
  const searchTimerRef = useRef(null);

  // 음식명 자동완성(식약처 검색)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const grams = formData.grams ?? 100;
  const portion = grams / 100;
  const hasImage = !!imageUrl;

  const updateForm = (updater) => setFormData((prev) => updater(prev));

  const recomputeDisplayValues = (data, newGrams) => {
    const p = (newGrams || 0) / 100;
    const newDisplay = { ...data.displayValues };
    NUTRIENTS.forEach((n) => {
      if (data.baseValues[n.key] != null) {
        newDisplay[n.key] = formatValue(data.baseValues[n.key], p, n.integer);
      }
    });
    return newDisplay;
  };

  const setGrams = (newGrams) => {
    const safe = Math.max(0, Math.min(9999, Number(newGrams) || 0));
    updateForm((d) => ({
      ...d,
      grams: safe,
      displayValues: recomputeDisplayValues(d, safe),
    }));
  };

  // 음식명 입력 → 식약처 검색 (300ms 디바운스)
  const onFoodNameChange = (value) => {
    updateForm((d) => ({ ...d, foodName: value }));
    clearTimeout(searchTimerRef.current);
    const q = value.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await mealAnalysisApi.searchFoods(q);
        setSuggestions(Array.isArray(res?.data) ? res.data : []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("음식 검색 실패:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // 검색 결과 선택 → 음식명 + 영양소(100g 기준)를 폼에 채움 (현재 grams 기준으로 환산 표시)
  const selectSuggestion = (item) => {
    const base = {
      calories: item.calories ?? null,
      carbs: item.carbs ?? null,
      protein: item.protein ?? null,
      // UI '지방' 필드는 저장 시 saturatedFat 으로 들어가므로 동일 관례 유지
      fat: item.saturatedFat ?? item.fat ?? null,
      sugar: item.sugar ?? null,
      sodium: item.sodium ?? null,
      cholesterol: item.cholesterol ?? null,
    };
    updateForm((d) => {
      const p = (d.grams ?? 100) / 100;
      const display = {};
      NUTRIENTS.forEach((n) => {
        display[n.key] = base[n.key] != null ? formatValue(base[n.key], p, n.integer) : "";
      });
      return { ...d, foodName: item.name, baseValues: base, displayValues: display };
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // "음식 추가" — 폼·이미지 영역 완전히 비우기 (chips 배열은 유지)
  // chips에 사진 URL이 보존되어 있으므로 chip 클릭 시 원래 사진으로 복원됨
  const resetForm = () => {
    setFormData(makeEmptyFormData());
    setEditingChipId(null);
    setImageUrl(null);
    setAnalyzed(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // chip 클릭 → 그 음식 데이터를 form에 로드 + 사진 미리보기 복원
  // pending chip(mealItemId=null)도 그대로 두고 tempId로 식별
  const onClickChip = (chip) => {
    setEditingChipId(chip.mealItemId ?? chip.tempId ?? null);
    // chip이 자기 사진 URL을 갖고 있으면 미리보기 영역도 그 사진으로 전환
    if (chip.mealPhoto) {
      setImageUrl(chip.mealPhoto);
      setAnalyzed(true);
    } else {
      setImageUrl(null);
      setAnalyzed(false);
    }
    const numToStr = (v, isInt) => {
      if (v == null) return "";
      return isInt ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
    };
    const chipGrams = chip.grams && chip.grams > 0 ? chip.grams : 100;
    // baseValues = 100g 기준으로 역산 (chip.values 는 chip.grams 기준 실제 섭취 값)
    const toBase = (v) => (v == null ? null : (v * 100) / chipGrams);
    setFormData({
      foodName: chip.foodName,
      baseValues: {
        calories: toBase(chip.calorie),
        carbs: toBase(chip.carbohydrate),
        protein: toBase(chip.protein),
        fat: toBase(chip.saturatedFat),
        sugar: toBase(chip.sugar),
        sodium: toBase(chip.sodium),
        cholesterol: toBase(chip.cholesterol),
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
      grams: chipGrams,
      mealPhoto: chip.mealPhoto ?? null,
    });
  };

  const formatValue = (baseVal, portionVal, integer) => {
    if (baseVal == null) return "";
    const v = baseVal * portionVal;
    return integer ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
  };

  const handleFile = async (rawFile) => {
    if (!rawFile || !rawFile.type.startsWith("image/")) return;

    // 업로드 전 1024px / 80% 품질로 압축 (Vision 비용·DB 용량 절감)
    let file;
    try {
      file = await resizeImageFile(rawFile, { maxDim: 1024, quality: 0.8 });
    } catch (e) {
      file = rawFile;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;

      // 현재 '미저장 pending chip'을 편집 중인데 새 사진을 고르면,
      // 그 항목을 교체하는 것으로 본다 (이전 분석 결과가 유령처럼 남는 문제 방지).
      // 새 음식을 '추가'하려면 "음식 추가"(resetForm)로 editingChipId 를 비운 뒤 올린다.
      if (editingChipId != null) {
        setChips((prev) =>
          prev.filter(
            (c) => !(c.mealItemId == null && c.tempId === editingChipId),
          ),
        );
        setEditingChipId(null);
      }

      setImageUrl(dataUrl);
      setIsAnalyzing(true);
      setAnalyzed(false);

      // 1) 서버에 업로드 → URL 받기 (실패해도 분석은 진행)
      let uploadedUrl = null;
      try {
        const result = await uploadApi.uploadImage(file, "meal");
        uploadedUrl = result?.url ?? null;
      } catch (err) {
        console.error("사진 업로드 실패:", err);
      }

      // 2) 이미 저장된 Meal이면 사진 URL도 백엔드에 즉시 반영 (현재 Meal 단위 사진은 그대로 유지)
      if (savedMealId && user?.id && uploadedUrl) {
        try {
          await mealApi.updateMeal(user.id, savedMealId, {
            mealDate:
              selectedDate || new Date().toISOString().split("T")[0],
            mealTime: `${mealTime}:00`,
            mealCategory: category,
            mealPhoto: uploadedUrl,
          });
          onSaved?.();
        } catch (err) {
          console.error("사진 업데이트 실패:", err);
        }
      }

      // 3) AI 분석 호출 (OpenAI Vision + 식약처 영양정보)
      try {
        const res = await mealAnalysisApi.analyze(file);
        console.log("[MealAnalysis] 서버 응답 전체:", res);
        console.log("[MealAnalysis] res.data:", res?.data);

        // 어떤 엔진으로 분석했는지 콘솔에 표시 (YOLO 자체 모델 vs OpenAI Vision 폴백)
        const analyzedBy = res?.data?.analyzedBy;
        const confidence = res?.data?.confidence;
        if (analyzedBy === "YOLO") {
          const pct = confidence != null ? `${Math.round(confidence * 100)}%` : "?";
          console.log(
            `%c[음식분석] 🧠 자체 YOLO 모델 사용 (신뢰도 ${pct})`,
            "color:#16a34a;font-weight:bold;",
          );
        } else if (analyzedBy === "OpenAI") {
          console.log(
            "%c[음식분석] 🤖 OpenAI Vision 폴백 사용 (모델이 음식을 확신하지 못함)",
            "color:#2563eb;font-weight:bold;",
          );
        } else {
          console.log("[음식분석] 분석 엔진 정보 없음:", analyzedBy);
        }

        const foods = Array.isArray(res?.data?.foods) ? res.data.foods : [];
        console.log("[MealAnalysis] foods 배열:", foods);
        foods.forEach((f, i) =>
          console.log(`[MealAnalysis] food[${i}]:`, JSON.stringify(f, null, 2))
        );
        const recognizedFoods = foods.filter((f) => f.nutritionFound);

        if (recognizedFoods.length === 0) {
          if (foods.length > 0) {
            const names = foods.map((f) => f.name).join(", ");
            toast(
              `${foods.length}개 음식 인식(${names})했지만 영양정보를 찾지 못했어요. 직접 입력해주세요.`,
              { icon: "⚠️", duration: 5000 },
            );
          } else {
            toast("사진에서 음식을 인식하지 못했어요. 직접 입력해주세요.", {
              icon: "⚠️",
              duration: 5000,
            });
          }
        } else {
          // 정책: **한 사진 = 한 음식**. 여러 개 인식돼도 메인 1개만 chip 생성.
          //  - 이 사진은 그 음식의 고유 사진이 됨 (음식별로 다른 사진을 갖게 하기 위함)
          //  - 다른 음식 추가하려면 "음식 추가" → 그 음식 사진을 새로 업로드
          const mainFood = recognizedFoods[0];
          const tsBase = Date.now();
          const newChip = {
            mealItemId: null,
            tempId: `pending-${tsBase}-0`,
            foodName: mainFood.name,
            mealPhoto: uploadedUrl, // 이 음식 전용 사진
            grams: mainFood.grams ? Math.round(mainFood.grams) : 100,
            calorie: Math.round(mainFood.calories ?? 0),
            carbohydrate: mainFood.carbs ?? 0,
            sugar: mainFood.sugar ?? 0,
            sodium: mainFood.sodium ?? 0,
            cholesterol: mainFood.cholesterol ?? 0,
            saturatedFat: mainFood.saturatedFat ?? 0,
            protein: mainFood.protein ?? 0,
          };
          setChips((prev) => [...prev, newChip]);
          // 영양 성분을 form에 즉시 표시 (사용자가 chip을 따로 안 눌러도 보이게)
          onClickChip(newChip);

          if (recognizedFoods.length > 1) {
            const others = recognizedFoods
              .slice(1)
              .map((f) => f.name)
              .join(", ");
            toast.success(
              `'${mainFood.name}' 추가됨. (${others}는 '음식 추가' 후 각자 사진을 따로 올려주세요)`,
              { duration: 6000 },
            );
          } else {
            toast.success(
              `'${mainFood.name}' 인식됨. 확인 후 저장 버튼을 눌러주세요.`,
            );
          }
        }
      } catch (err) {
        console.error("AI 분석 실패:", err);
        toast.error("AI 분석에 실패했습니다. 직접 입력해주세요.");
      } finally {
        setIsAnalyzing(false);
        setAnalyzed(true);
      }
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
    // 이미지 유무 관계없이 클릭하면 다시 선택 가능
    fileInputRef.current?.click();
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true); // 이미지 있어도 드롭으로 교체 가능
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

  const onNutrientChange = (key, value) => {
    const clean = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    updateForm((d) => {
      const p = (d.grams ?? 0) / 100;
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

  // chip 삭제 (X 버튼). 미저장(pending) chip은 로컬에서만, 저장된 chip은 백엔드까지 삭제.
  const removeChip = async (chip) => {
    if (!user?.id) return;

    // 1) 미저장 pending chip(mealItemId 없음): DB 호출 없이 로컬에서만 제거
    if (chip.mealItemId == null) {
      setChips((prev) => prev.filter((c) => c.tempId !== chip.tempId));
      if (chip.tempId === editingChipId) {
        resetForm();
      }
      return;
    }

    // 2) 저장된 chip: 백엔드 MealItem 도 삭제
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
      clearTimeout(searchTimerRef.current);
    };
  }, []);

  const toNumber = (v, isInt = false) => {
    if (v === "" || v == null) return 0;
    const n = parseFloat(v);
    if (Number.isNaN(n)) return 0;
    // 칼로리/나트륨/콜레스테롤은 정수, 그 외 영양소는 소수점 첫째 자리까지만 저장
    return isInt ? Math.round(n) : Math.round(n * 10) / 10;
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

  // AI 분석 후 로컬에 쌓인 pending chips(mealItemId=null)를 DB에 일괄 저장
  // chipsToFlush: 명시하지 않으면 현재 chips state 사용.
  //   (편집 직후처럼 setChips 반영 전이라면 갱신된 배열을 직접 넘겨야 최신 grams가 저장됨)
  const flushPendingChips = async (chipsToFlush = chips) => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const pending = chipsToFlush.filter((c) => c.mealItemId == null);
    if (pending.length === 0) return;

    setIsSaving(true);
    try {
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

      // 순서 보존을 위해 순차 저장
      const updated = [...chipsToFlush];
      for (let i = 0; i < updated.length; i++) {
        const c = updated[i];
        if (c.mealItemId != null) continue;
        // chip의 영양소 + grams 를 그대로 전송 (백엔드 MealItemSaveRequest 에 grams 포함됨)
        const { mealItemId: _, tempId: __, ...itemPayload } = c;
        try {
          const res = await mealApi.createMealItem(user.id, mealId, itemPayload);
          const newId = res.data?.mealItemId;
          if (newId != null) updated[i] = { ...c, mealItemId: newId };
        } catch (err) {
          console.error("음식 저장 실패:", c.foodName, err);
        }
      }
      setChips(updated);
      toast.success(`${pending.length}개 음식이 저장되었습니다.`);
      onSaved?.();
    } catch (err) {
      console.error("일괄 저장 실패:", err);
      toast.error("일부 음식 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    // form 입력 없으면: pending(AI) chips 일괄 저장 시도
    if (!formData.foodName.trim()) {
      const pending = chips.filter((c) => c.mealItemId == null);
      if (pending.length === 0) {
        if (chips.length > 0 || savedMealId) {
          toast.success("저장되었습니다.");
        } else {
          toast.error("음식 이름을 입력해주세요.");
        }
        return;
      }
      await flushPendingChips();
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
        mealPhoto: formData.mealPhoto ?? null,
        grams: Math.round(formData.grams ?? 100),
        calorie: toNumber(formData.displayValues.calories, true),
        carbohydrate: toNumber(formData.displayValues.carbs),
        sugar: toNumber(formData.displayValues.sugar),
        sodium: toNumber(formData.displayValues.sodium),
        cholesterol: toNumber(formData.displayValues.cholesterol),
        saturatedFat: toNumber(formData.displayValues.fat),
        protein: toNumber(formData.displayValues.protein),
      };

      if (editingChipId != null) {
        // pending chip(tempId) 저장 → 폼값을 chip에 반영 후 즉시 DB 저장
        const editingPending = chips.find(
          (c) => c.mealItemId == null && c.tempId === editingChipId,
        );
        if (editingPending) {
          // 폼의 현재 값(grams·환산 영양소 포함)을 pending chip에 반영하고 곧바로 DB에 저장.
          // (예전엔 chip에만 반영하고 별도 저장 클릭을 또 요구해서, 미반영된 grams=100이 저장되는 버그가 있었음)
          const updatedChips = chips.map((c) =>
            c.tempId === editingChipId ? { ...c, ...payload } : c,
          );
          setChips(updatedChips);
          resetForm();
          await flushPendingChips(updatedChips);
        } else {
          // 이미 저장된 chip 수정: DB 업데이트
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
        }
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
        resetForm(); // 저장 후 폼 초기화 (pending 저장 경로와 동작 일치 — 저장된 음식이 '편집 중'처럼 남지 않게)
        onSaved?.();
      }
    } catch (err) {
      console.error("식단 저장 실패:", err);
    } finally {
      setIsSaving(false);
    }
    // 주의: 여기서 pending chips 를 자동 flush 하지 않는다.
    //  - editing-pending 분기는 이미 flushPendingChips(updatedChips) 로 저장함
    //  - 옛날엔 stale 클로저(chips)를 읽어 grams=100 이 잘못 저장/중복 저장되던 버그가 있었음
    //  - 남은 pending 은 사용자가 chip 을 눌러 명시적으로 저장한다 (foodName 비면 flushPendingChips 경로)
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
          className="modal-card w-full max-w-[1040px] bg-white rounded-3xl relative overflow-y-auto px-5 pt-6 pb-6 md:px-10 md:pt-8 md:pb-6"
          style={{
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
                {chips.map((c, idx) => {
                  const chipKey = c.mealItemId ?? c.tempId ?? null;
                  const isEditing = chipKey != null && chipKey === editingChipId;
                  const isPending = c.mealItemId == null; // AI 분석 후 아직 DB 미저장
                  return (
                    <div
                      key={chipKey ?? `chip-${idx}`}
                      onClick={() => onClickChip(c)}
                      className="inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all"
                      style={{
                        padding: "7px 14px",
                        background: isEditing
                          ? "#fef3c7"
                          : isPending
                            ? "#fff7ed"
                            : "#eef2ff",
                        border: isEditing
                          ? "1px solid #fbbf24"
                          : isPending
                            ? "1px dashed #fb923c"
                            : "1px solid #c7d2fe",
                        color: isEditing
                          ? "#78350f"
                          : isPending
                            ? "#9a3412"
                            : "#1e3a8a",
                      }}
                    >
                      <span>{c.foodName}</span>
                      {c.grams != null && (
                        <span
                          className="text-[11px] opacity-70"
                          style={{ color: isEditing ? "#92400e" : "#475569" }}
                        >
                          {Math.round(c.grams)}g
                        </span>
                      )}
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

          <div className="grid gap-6 mt-5 grid-cols-1 lg:grid-cols-[380px_1fr]">
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
                  cursor: "pointer",
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
                      className="leading-relaxed mb-3 px-5"
                      style={{ fontSize: "12.5px", color: "#6b7280" }}
                    >
                      이곳을 클릭하거나 사진 파일을 드래그하여
                      <br />
                      업로드 하세요 (JPG, PNG)
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-[18px]"
                      style={{ background: "#f0f9ff", color: "#0369a1", fontSize: "11.5px", fontWeight: 600 }}
                    >
                      <Brain size={13} />
                      AI가 음식과 영양소를 자동 인식해요
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

                      {/* 사진 변경 + 제거 (우상단) */}
                      {!isAnalyzing && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onSelectFileClick}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-sm transition"
                            style={{
                              background: "rgba(15,23,42,0.78)",
                              color: "white",
                              backdropFilter: "blur(6px)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(15,23,42,0.92)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "rgba(15,23,42,0.78)")
                            }
                          >
                            <Camera size={12} strokeWidth={2.4} />
                            사진 변경
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageUrl(null);
                              setAnalyzed(false);
                            }}
                            aria-label="사진 제거"
                            className="inline-flex items-center justify-center rounded-full shadow-sm transition"
                            style={{
                              width: 28,
                              height: 28,
                              background: "rgba(15,23,42,0.78)",
                              color: "white",
                              backdropFilter: "blur(6px)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(220,38,38,0.85)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "rgba(15,23,42,0.78)")
                            }
                          >
                            <X size={14} strokeWidth={2.4} />
                          </button>
                        </div>
                      )}

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
                <div className="relative">
                  <input
                    type="text"
                    maxLength={20}
                    value={formData.foodName}
                    onChange={(e) => onFoodNameChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // 항목 클릭(onMouseDown)이 먼저 처리되도록 약간 지연 후 닫기
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    placeholder="음식 이름을 입력하면 식약처 DB에서 검색됩니다"
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
                  {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <div
                      className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-[14px] bg-white"
                      style={{
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(15,19,32,0.12)",
                        maxHeight: 260,
                        overflowY: "auto",
                      }}
                    >
                      {isSearching && suggestions.length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-slate-400">
                          검색 중...
                        </div>
                      ) : (
                        suggestions.map((s, i) => (
                          <div
                            key={`${s.name}-${i}`}
                            // onMouseDown: input blur 보다 먼저 실행되도록
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSuggestion(s);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#f1f5f9]"
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <span className="text-[13.5px] font-medium text-slate-800 truncate">
                              {s.name}
                            </span>
                            <span className="ml-3 shrink-0 text-[11.5px] text-slate-400">
                              {Math.round(s.calories ?? 0)}kcal / 100g
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 섭취량 (g) 입력 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold">섭취량 (g)</span>
                  <span
                    className="text-[11.5px] font-semibold rounded-full"
                    style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      padding: "4px 11px",
                    }}
                  >
                    100g 기준
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGrams(grams - 50)}
                    className="rounded-[10px] text-[14px] font-bold transition"
                    style={{
                      width: 40,
                      height: 42,
                      background: "#eef2ff",
                      color: "#4338ca",
                    }}
                  >
                    −
                  </button>
                  <div
                    className="flex-1 flex items-center rounded-[10px] px-3"
                    style={{
                      height: 42,
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="flex-1 bg-transparent text-[18px] font-bold text-slate-900 outline-none text-right"
                    />
                    <span className="ml-2 text-[13px] font-medium text-slate-500">g</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGrams(grams + 50)}
                    className="rounded-[10px] text-[14px] font-bold transition"
                    style={{
                      width: 40,
                      height: 42,
                      background: "#eef2ff",
                      color: "#4338ca",
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[50, 100, 150, 200, 250, 300, 400, 500].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrams(g)}
                      className="text-[11.5px] font-semibold rounded-full transition"
                      style={{
                        padding: "4px 10px",
                        background: grams === g ? "#1a1f2e" : "#f1f5f9",
                        color: grams === g ? "white" : "#475569",
                      }}
                    >
                      {g}g
                    </button>
                  ))}
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
