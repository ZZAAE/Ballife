import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { X, Plus, Search, Camera, ImagePlus, Trash2 } from "lucide-react-native";
import mealApi from "../../api/mealApi";
import mealAnalysisApi from "../../api/mealAnalysisApi";
import uploadApi from "../../api/uploadApi";
import toast from "../../lib/toast";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { pickFromGallery, takePhoto } from "../../lib/pickImage";
import { API_BASE_URL } from "../../lib/runtime";
import Dropdown from "../Dropdown";

// 서버가 돌려주는 상대경로(/uploads/..) 를 절대 URL 로. (API_BASE_URL 의 호스트 사용)
const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const toImageUri = (p) =>
  !p ? null : /^https?:|^file:|^data:/.test(p) ? p : `${ORIGIN}${p}`;

/*
 * RN(Expo) FUNCTIONAL port of web MealRegisterModal.jsx.
 *
 * OMITTED / SIMPLIFIED vs web (intentional — see report):
 *  - 100g 기준 환산(grams 비율 재계산) 로직 생략 — 검색 결과/분석 결과의 100g 기준
 *    영양소를 그대로 항목에 담는다. 수동 추가도 입력값 그대로 사용.
 *  - 기존 Meal 수정(initialMealId/chips 편집/시간 즉시 갱신/삭제) 흐름 생략.
 *    이 모달은 신규 등록 전용.
 *  - 사진 업로드(uploadApi)·mealPhoto 저장 생략 — 사진은 분석에만 쓰고 mealPhoto=null.
 *
 * PRESERVED (원본과 동일):
 *  - 사진 분석 API: mealAnalysisApi.analyze(file) → /meal/analyze (multipart "file")
 *    응답 res.data.foods (nutritionFound 인 항목만) 를 음식 목록에 추가.
 *  - 검색 API: mealAnalysisApi.searchFoods(query)
 *  - 저장 API: mealApi.createMeal(userId, {mealDate, mealTime, mealCategory, mealPhoto})
 *             → mealApi.createMealItem(userId, mealId, {foodName, calorie, carbohydrate,
 *               sugar, sodium, cholesterol, saturatedFat, protein, grams})
 *  - MealItem payload 필드명/형태 동일.
 */

const MEAL_CATEGORY_LABEL = {
  BREAKFAST: "아침 식사",
  LUNCH: "점심 식사",
  DINNER: "저녁 식사",
  SNACK: "간식",
};

const CATEGORY_OPTIONS = [
  { label: "아침 식사", value: "BREAKFAST" },
  { label: "점심 식사", value: "LUNCH" },
  { label: "저녁 식사", value: "DINNER" },
  { label: "간식", value: "SNACK" },
];

// 영양소 정의 (key: 폼 필드, payloadKey: MealItem 페이로드 필드, integer: 정수 저장 여부)
const NUTRIENTS = [
  { key: "calories", payloadKey: "calorie", label: "칼로리", unit: "kcal", integer: true },
  { key: "carbs", payloadKey: "carbohydrate", label: "탄수화물", unit: "g", integer: false },
  { key: "protein", payloadKey: "protein", label: "단백질", unit: "g", integer: false },
  { key: "fat", payloadKey: "saturatedFat", label: "지방", unit: "g", integer: false },
  { key: "sugar", payloadKey: "sugar", label: "당류", unit: "g", integer: false },
  { key: "sodium", payloadKey: "sodium", label: "나트륨", unit: "mg", integer: true },
  { key: "cholesterol", payloadKey: "cholesterol", label: "콜레스테롤", unit: "mg", integer: true },
];

const todayStr = () => new Date().toISOString().split("T")[0];

const emptyForm = () => ({
  foodName: "",
  calories: "",
  carbs: "",
  protein: "",
  fat: "",
  sugar: "",
  sodium: "",
  cholesterol: "",
  grams: "100",
});

const toNum = (v, isInt = false) => {
  if (v === "" || v == null) return 0;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return 0;
  return isInt ? Math.round(n) : Math.round(n * 10) / 10;
};

// 영양성분 환산용 (그람수 변경 시 100g 기준 base 로 비례 계산)
const NUT_FORM_KEYS = [
  "calories",
  "carbs",
  "protein",
  "fat",
  "sugar",
  "sodium",
  "cholesterol",
];
const NUT_INT = new Set(["calories", "sodium", "cholesterol"]);

// 100g 기준 base + grams(숫자) → 폼 영양소 문자열
const scaleForm = (base, gramsNum) => {
  const ratio = gramsNum > 0 ? gramsNum / 100 : 0;
  const out = {};
  for (const k of NUT_FORM_KEYS) {
    const b = base?.[k] ?? 0;
    if (!b) {
      out[k] = "";
      continue;
    }
    const v = b * ratio;
    out[k] = String(NUT_INT.has(k) ? Math.round(v) : Math.round(v * 10) / 10);
  }
  return out;
};

// 식약처/분석 결과 객체 → 100g 기준 base (폼 키 기준)
const baseFromFood = (s) => ({
  calories: s.calories ?? 0,
  carbs: s.carbs ?? 0,
  protein: s.protein ?? 0,
  fat: (s.saturatedFat ?? s.fat) ?? 0,
  sugar: s.sugar ?? 0,
  sodium: s.sodium ?? 0,
  cholesterol: s.cholesterol ?? 0,
});

export default function MealRegisterModal({
  visible = false,
  onClose = () => {},
  onSaved,
  date,
  category = "BREAKFAST",
  meal = null, // 전달되면 '수정' 모드 (기존 meal: { mealId, category, image, rawItems })
}) {
  const { user } = useAuth();
  const isEdit = !!meal?.mealId;

  const [mealCategory, setMealCategory] = useState(category);
  const [form, setForm] = useState(emptyForm);
  // 100g 기준 영양소(base). 그람수 변경 시 이 값으로 비례 환산한다.
  const [base, setBase] = useState(null);
  const [items, setItems] = useState([]); // 추가된 음식 목록
  const [photo, setPhoto] = useState(null); // 작업 중(미리보기)·분석용 사진 — '음식 추가' 시 초기화
  const [mealPhoto, setMealPhoto] = useState(null); // 저장용 식단 대표 사진(유지) — {uri} 또는 기존 URL
  const [removedItemIds, setRemovedItemIds] = useState([]); // 수정 시 삭제할 기존 항목 id
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const searchTimerRef = useRef(null);

  // 모달이 열릴 때 상태 초기화 (수정 모드면 기존 식단 값으로 채움)
  useEffect(() => {
    if (!visible) return;
    setForm(emptyForm());
    setBase(null);
    setSuggestions([]);
    setRemovedItemIds([]);
    setPhoto(null);
    if (meal?.mealId) {
      setMealCategory(meal.category || category);
      setMealPhoto(meal.image || null);
      setPhoto(meal.image || null); // 기존 식단 사진을 미리보기로 표시
      // 기존 음식 항목 → 모달 item 형태(payload 필드명 + mealItemId 보존)
      const existing = (meal.rawItems || []).map((it) => ({
        mealItemId: it.mealItemId,
        foodName: it.foodName ?? "",
        grams: it.grams ?? 100,
        calorie: it.calorie ?? 0,
        carbohydrate: it.carbohydrate ?? 0,
        sugar: it.sugar ?? 0,
        sodium: it.sodium ?? 0,
        cholesterol: it.cholesterol ?? 0,
        saturatedFat: it.saturatedFat ?? 0,
        protein: it.protein ?? 0,
        mealPhoto: null,
      }));
      setItems(existing);
    } else {
      setMealCategory(category);
      setMealPhoto(null);
      setItems([]);
    }
  }, [visible, category, meal]);

  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const setField = (key, value) => setForm((d) => ({ ...d, [key]: value }));

  const onNutrientChange = (key, value) => {
    const clean = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setField(key, clean);
    // 수동 입력값을 현재 그람수 기준 100g base 로 환산해 갱신
    // → 이후 그람수를 바꾸면 이 값도 비례해서 같이 변한다.
    const g = toNum(form.grams, true);
    const per100 = g > 0 ? (toNum(clean) * 100) / g : toNum(clean);
    setBase((prev) => ({ ...(prev || {}), [key]: per100 }));
  };

  // 그람수 변경 → 100g base 로 영양성분 비례 환산
  const handleGramsChange = (v) => {
    const clean = v.replace(/[^0-9]/g, "");
    setForm((prev) => ({
      ...prev,
      grams: clean,
      ...(base ? scaleForm(base, toNum(clean, true)) : {}),
    }));
  };

  // 음식명 검색 (원본과 동일 API). 버튼으로도 호출 가능, 입력 시 300ms 디바운스.
  const runSearch = async (q) => {
    const query = (q ?? form.foodName).trim();
    if (!query) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await mealAnalysisApi.searchFoods(query);
      setSuggestions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("음식 검색 실패:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onFoodNameChange = (value) => {
    setField("foodName", value);
    clearTimeout(searchTimerRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    searchTimerRef.current = setTimeout(() => runSearch(value), 300);
  };

  // 검색 결과 선택 → 100g base 저장 + 폼에 100g 기준 영양소 채움(그람수 100)
  const selectSuggestion = (s) => {
    const b = baseFromFood(s);
    setBase(b);
    setForm({ foodName: s.name ?? "", grams: "100", ...scaleForm(b, 100) });
    setSuggestions([]);
  };

  // 현재 폼을 음식 목록에 추가 (수동 추가 + 검색 선택 후 추가 공용)
  const addItem = () => {
    if (!form.foodName.trim()) {
      toast.error("음식 이름을 입력해주세요.");
      return;
    }
    const item = {
      foodName: form.foodName.trim(),
      grams: Math.round(toNum(form.grams, true)) || 100,
      calorie: toNum(form.calories, true),
      carbohydrate: toNum(form.carbs),
      sugar: toNum(form.sugar),
      sodium: toNum(form.sodium, true),
      cholesterol: toNum(form.cholesterol, true),
      saturatedFat: toNum(form.fat),
      protein: toNum(form.protein),
      mealPhoto: null,
    };
    setItems((prev) => [...prev, item]);
    setMealPhoto((m) => m || photo); // 첫 사진을 식단 대표 사진으로 보존(저장 시 업로드)
    setForm(emptyForm());
    setBase(null); // 다음 음식 입력을 위해 환산 base 초기화
    setPhoto(null); // 추가 시 작업 사진/성분표 초기화
    setSuggestions([]);
  };

  const removeItem = (idx) =>
    setItems((prev) => {
      const target = prev[idx];
      // 기존(서버) 항목이면 삭제 목록에 기록
      if (target?.mealItemId) {
        setRemovedItemIds((ids) => [...ids, target.mealItemId]);
      }
      return prev.filter((_, i) => i !== idx);
    });

  // 추가된 음식(분석 결과 포함)을 다시 폼으로 불러와 성분표 수정 → '음식 추가'로 재반영.
  const editItem = (idx) => {
    const it = items[idx];
    if (!it) return;
    const g = it.grams || 100;
    const r = g > 0 ? 100 / g : 1; // 항목값(현재 그람수) → 100g 기준 base 역산
    setBase({
      calories: (it.calorie ?? 0) * r,
      carbs: (it.carbohydrate ?? 0) * r,
      protein: (it.protein ?? 0) * r,
      fat: (it.saturatedFat ?? 0) * r,
      sugar: (it.sugar ?? 0) * r,
      sodium: (it.sodium ?? 0) * r,
      cholesterol: (it.cholesterol ?? 0) * r,
    });
    setForm({
      foodName: it.foodName ?? "",
      calories: it.calorie != null ? String(it.calorie) : "",
      carbs: it.carbohydrate != null ? String(it.carbohydrate) : "",
      protein: it.protein != null ? String(it.protein) : "",
      fat: it.saturatedFat != null ? String(it.saturatedFat) : "",
      sugar: it.sugar != null ? String(it.sugar) : "",
      sodium: it.sodium != null ? String(it.sodium) : "",
      cholesterol: it.cholesterol != null ? String(it.cholesterol) : "",
      grams: it.grams != null ? String(it.grams) : "100",
    });
    removeItem(idx); // 목록에서 빼고 폼에서 편집 → 수정 후 '음식 추가'
    setSuggestions([]);
  };

  // 사진으로 분석 — 카메라 촬영 또는 갤러리 선택한 이미지를 웹과 동일한 분석 API 로 전송.
  // mealAnalysisApi.analyze(file) → POST /meal/analyze (multipart "file").
  // 응답 res.data.foods 중 nutritionFound 인 음식을 모달 음식 목록에 추가.
  // source: "camera" 면 바로 촬영, "gallery" 면 갤러리에서 업로드.
  const handleAnalyzePhoto = async (source = "gallery") => {
    if (isAnalyzing) return;
    try {
      const img =
        source === "camera" ? await takePhoto() : await pickFromGallery();
      if (!img) return;
      // 고른 사진을 미리보기(작업용) + 식단 대표 사진(저장용)으로 첨부
      setPhoto(img);
      setMealPhoto((m) => m || img);
      setIsAnalyzing(true);
      try {
        // RN 파일 객체를 그대로 넘기면 mealAnalysisApi 가 FormData "file" 로 담는다.
        const res = await mealAnalysisApi.analyze({
          uri: img.uri,
          name: img.fileName,
          type: img.mimeType,
        });
        const foods = Array.isArray(res?.data?.foods) ? res.data.foods : [];
        const recognized = foods.filter((f) => f.nutritionFound);

        if (recognized.length === 0) {
          toast.error(
            foods.length > 0
              ? "음식을 인식했지만 영양정보를 찾지 못했어요. 직접 입력해주세요."
              : "사진에서 음식을 인식하지 못했어요. 직접 입력해주세요.",
          );
          return;
        }

        // 첫 인식 음식 → 100g base 저장 + 그람수(인식 분량) 기준 환산값을 폼에 채움
        const [first, ...rest] = recognized;
        const fb = baseFromFood(first); // 100g 기준
        const fg = first.grams ? Math.round(first.grams) : 100;
        setBase(fb);
        setForm({ foodName: first.name ?? "", grams: String(fg), ...scaleForm(fb, fg) });
        setSuggestions([]);
        // 여러 개 인식되면 나머지는 목록에 바로 담아 분실 방지(각자 그람수로 환산)
        if (rest.length) {
          const restItems = rest.map((f) => {
            const rb = baseFromFood(f);
            const rg = f.grams ? Math.round(f.grams) : 100;
            const r = rg / 100;
            return {
              foodName: f.name ?? "",
              grams: rg,
              calorie: Math.round(rb.calories * r),
              carbohydrate: Math.round(rb.carbs * r * 10) / 10,
              sugar: Math.round(rb.sugar * r * 10) / 10,
              sodium: Math.round(rb.sodium * r),
              cholesterol: Math.round(rb.cholesterol * r),
              saturatedFat: Math.round(rb.fat * r * 10) / 10,
              protein: Math.round(rb.protein * r * 10) / 10,
              mealPhoto: null,
            };
          });
          setItems((prev) => [...prev, ...restItems]);
        }
        toast.success(
          rest.length
            ? `음식 ${recognized.length}건 인식 — 첫 음식은 영양성분에 표시(나머지 ${rest.length}건은 목록에 담김). 확인·수정 후 '음식 추가'를 눌러주세요.`
            : "영양성분에 표시했어요. 확인·수정 후 '음식 추가'를 눌러주세요.",
        );
      } catch (err) {
        console.error("AI 분석 실패:", err);
        toast.error("AI 분석에 실패했습니다. 직접 입력해주세요.");
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err) {
      toast.error(err.message || "사진을 불러오지 못했습니다.");
    }
  };

  // 영양소 합계
  const totals = NUTRIENTS.reduce((acc, n) => {
    acc[n.payloadKey] = items.reduce(
      (sum, it) => sum + (it[n.payloadKey] || 0),
      0,
    );
    return acc;
  }, {});

  // 저장: 원본과 동일한 Meal 생성 → 각 MealItem 생성
  const handleSave = async () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    // 폼에 입력만 하고 추가를 안 눌렀으면 자동 추가
    let toSave = items;
    if (toSave.length === 0 && form.foodName.trim()) {
      const item = {
        foodName: form.foodName.trim(),
        grams: Math.round(toNum(form.grams, true)) || 100,
        calorie: toNum(form.calories, true),
        carbohydrate: toNum(form.carbs),
        sugar: toNum(form.sugar),
        sodium: toNum(form.sodium, true),
        cholesterol: toNum(form.cholesterol, true),
        saturatedFat: toNum(form.fat),
        protein: toNum(form.protein),
        mealPhoto: null,
      };
      toSave = [item];
    }
    if (toSave.length === 0) {
      toast.error("음식을 하나 이상 추가해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // 1) 사진 처리 — 저장용 대표 사진(mealPhoto 상태) 우선, 없으면 작업 사진(photo).
      //    새 이미지면 업로드해 URL 확보, 기존 URL 은 그대로 유지.
      let mealPhotoUrl = null;
      const photoToSave = mealPhoto || photo;
      if (photoToSave) {
        if (typeof photoToSave === "string") {
          mealPhotoUrl = photoToSave;
        } else {
          try {
            const up = await uploadApi.uploadImage(
              {
                uri: photoToSave.uri,
                name: photoToSave.fileName,
                type: photoToSave.mimeType,
              },
              "meal",
            );
            mealPhotoUrl = up?.url ?? null;
          } catch (e) {
            console.error("사진 업로드 실패:", e);
            toast.error("사진 업로드에 실패했어요. 사진 없이 저장합니다.");
          }
        }
      }

      const dateStr = date || todayStr();
      const timeStr = `${new Date().toTimeString().slice(0, 5)}:00`;

      if (isEdit) {
        // 2-A) 수정: 식단 정보 갱신 + 삭제된 항목 제거 + 신규 항목 추가
        await mealApi.updateMeal(user.id, meal.mealId, {
          mealDate: dateStr,
          mealTime: timeStr,
          mealCategory,
          mealPhoto: mealPhotoUrl,
        });
        for (const id of removedItemIds) {
          try {
            await mealApi.deleteMealItem(user.id, id);
          } catch (err) {
            console.error("음식 삭제 실패:", id, err);
          }
        }
        for (const it of toSave.filter((x) => !x.mealItemId)) {
          try {
            await mealApi.createMealItem(user.id, meal.mealId, it);
          } catch (err) {
            console.error("음식 저장 실패:", it.foodName, err);
          }
        }
        toast.success("수정되었습니다.");
      } else {
        // 2-B) 신규: 식단 생성 + 각 음식 생성
        const mealRes = await mealApi.createMeal(user.id, {
          mealDate: dateStr,
          mealTime: timeStr,
          mealCategory,
          mealPhoto: mealPhotoUrl,
        });
        const mealId = mealRes.data?.mealId;
        if (!mealId) throw new Error("mealId not returned");
        for (const it of toSave) {
          try {
            await mealApi.createMealItem(user.id, mealId, it);
          } catch (err) {
            console.error("음식 저장 실패:", it.foodName, err);
          }
        }
        toast.success("저장되었습니다.");
      }

      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error("식단 저장 실패:", err);
      toast.error("식단 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 식단 전체 삭제 (수정 모드)
  const handleDeleteMeal = () => {
    if (!isEdit) return;
    Alert.alert("식단 삭제", "이 식단 기록을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await mealApi.deleteMeal(user.id, meal.mealId);
            toast.success("삭제되었습니다.");
            onSaved && onSaved();
            onClose();
          } catch (err) {
            console.error("식단 삭제 실패:", err);
            toast.error("삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 백드롭 — 누르면 닫힘 */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 p-4"
        onPress={onClose}
      >
        {/* 카드 — 내부 터치는 닫기 전파 차단 */}
        <Pressable
          className="w-full max-w-[520px] rounded-3xl bg-white"
          style={{ maxHeight: "90%" }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between px-6 pt-6 pb-2">
            <View className="flex-1 flex-row items-center gap-2">
              <Text className="text-[22px] font-bold text-[#0F172A]">
                {isEdit ? "식단 수정" : "식단 등록"}
              </Text>
              <View className="rounded-full bg-[#EEF2FF] px-3 py-1">
                <Text className="text-[12px] font-semibold text-[#4338CA]">
                  {MEAL_CATEGORY_LABEL[mealCategory] || "식사"}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="p-1">
              <X size={20} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView
            className="px-6"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* 식사 분류 */}
            <View className="mt-2">
              <Text className="mb-2 text-[13px] font-semibold text-[#0F172A]">
                식사 분류
              </Text>
              <Dropdown
                value={mealCategory}
                onChange={setMealCategory}
                options={CATEGORY_OPTIONS}
              />
            </View>

            {/* 사진으로 분석 — 촬영 또는 갤러리 사진을 AI 비전 분석해 음식 자동 추가 */}
            {isAnalyzing ? (
              <View className="mt-4 h-12 flex-row items-center justify-center gap-2 rounded-lg bg-[#EEF2FF] opacity-70">
                <ActivityIndicator size="small" color="#4338CA" />
                <Text className="text-[13px] font-semibold text-[#4338CA]">
                  사진 분석 중...
                </Text>
              </View>
            ) : (
              <View className="mt-4 flex-row gap-2">
                <Pressable
                  onPress={() => handleAnalyzePhoto("camera")}
                  className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-[#EEF2FF]"
                >
                  <Camera size={16} color="#4338CA" />
                  <Text className="text-[13px] font-semibold text-[#4338CA]">
                    촬영
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAnalyzePhoto("gallery")}
                  className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-[#EEF2FF]"
                >
                  <ImagePlus size={16} color="#4338CA" />
                  <Text className="text-[13px] font-semibold text-[#4338CA]">
                    갤러리
                  </Text>
                </Pressable>
              </View>
            )}

            {/* 첨부된 식단 사진 미리보기 (저장 시 mealPhoto 로 업로드됨) */}
            {photo ? (
              <View className="mt-3">
                <View className="relative overflow-hidden rounded-[14px] border border-[#E5E7EB]">
                  <Image
                    source={{
                      uri:
                        typeof photo === "string" ? toImageUri(photo) : photo.uri,
                    }}
                    style={{ width: "100%", height: 160 }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => {
                      setPhoto(null);
                      setMealPhoto(null);
                    }}
                    hitSlop={8}
                    className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/60"
                  >
                    <X size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/* 음식 이름 + 검색 */}
            <View className="mt-4">
              <Text className="mb-2 text-[13px] font-semibold text-[#0F172A]">
                음식 이름
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={form.foodName}
                  onChangeText={onFoodNameChange}
                  maxLength={20}
                  placeholder="음식 이름 입력 (식약처 DB 검색)"
                  placeholderTextColor="#94A3B8"
                  className="h-12 flex-1 rounded-lg bg-[#F1F3F5] px-4 text-sm text-[#0F172A]"
                />
                <Pressable
                  onPress={() => runSearch()}
                  className="h-12 flex-row items-center gap-1 rounded-lg bg-[#1A1F2E] px-4"
                >
                  <Search size={15} color="#FFFFFF" />
                  <Text className="text-[13px] font-semibold text-white">
                    검색
                  </Text>
                </Pressable>
              </View>

              {/* 검색 결과 */}
              {(isSearching || suggestions.length > 0) && (
                <View
                  className="mt-2 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white"
                  style={{ maxHeight: 220 }}
                >
                  {isSearching && suggestions.length === 0 ? (
                    <View className="flex-row items-center gap-2 px-4 py-3">
                      <ActivityIndicator size="small" color="#94A3B8" />
                      <Text className="text-[13px] text-[#94A3B8]">
                        검색 중...
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={suggestions}
                      keyboardShouldPersistTaps="handled"
                      keyExtractor={(s, i) => `${s.name}-${i}`}
                      renderItem={({ item: s }) => (
                        <Pressable
                          onPress={() => selectSuggestion(s)}
                          className="flex-row items-center justify-between border-b border-[#F1F5F9] px-4 py-3"
                        >
                          <Text
                            className="flex-1 text-[13.5px] font-medium text-[#1E293B]"
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                          <Text className="ml-3 text-[11.5px] text-[#94A3B8]">
                            {Math.round(s.calories ?? 0)}kcal / 100g
                          </Text>
                        </Pressable>
                      )}
                    />
                  )}
                </View>
              )}
            </View>

            {/* 섭취량 + 영양소 (수동 입력 / 검색 결과 자동 채움) */}
            <View className="mt-4">
              <Text className="mb-2 text-[13px] font-semibold text-[#0F172A]">
                섭취량 (g)
              </Text>
              <TextInput
                value={form.grams}
                onChangeText={handleGramsChange}
                keyboardType="number-pad"
                className="h-11 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] px-4 text-[15px] font-bold text-[#0F172A]"
              />
              <Text className="mt-1 text-[11px] text-[#94A3B8]">
                그람수를 바꾸면 아래 영양성분이 자동 환산됩니다.
              </Text>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-[15px] font-bold text-[#0F172A]">
                영양 성분
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {NUTRIENTS.map((n) => (
                  <View key={n.key} style={{ width: "47%" }}>
                    <Text className="mb-1.5 text-[12px] font-semibold text-[#475569]">
                      {n.label} ({n.unit})
                    </Text>
                    <TextInput
                      value={form[n.key]}
                      onChangeText={(v) => onNutrientChange(n.key, v)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#CBD5E1"
                      className="h-11 rounded-lg bg-[#F1F3F5] px-3 text-right text-[15px] font-semibold text-[#0F172A]"
                    />
                  </View>
                ))}
              </View>

              <Pressable
                onPress={addItem}
                className="mt-4 h-11 flex-row items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#C7D2FE] bg-[#F5F7FF]"
              >
                <Plus size={15} color="#4F46E5" />
                <Text className="text-[13px] font-semibold text-[#4F46E5]">
                  음식 추가
                </Text>
              </Pressable>
            </View>

            {/* 추가된 음식 목록 */}
            {items.length > 0 && (
              <View className="mt-5">
                <Text className="mb-2 text-[13px] font-semibold text-[#0F172A]">
                  추가된 음식 ({items.length})
                </Text>
                {items.map((it, idx) => (
                  <View
                    key={`${it.foodName}-${idx}`}
                    className="mb-2 flex-row items-center justify-between rounded-[14px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3"
                  >
                    <Pressable
                      onPress={() => editItem(idx)}
                      className="flex-1 pr-2"
                    >
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[14px] font-semibold text-[#0F172A]">
                          {it.foodName}
                          <Text className="text-[11px] font-normal text-[#94A3B8]">
                            {"  "}
                            {it.grams}g
                          </Text>
                        </Text>
                        <Text className="text-[10px] font-semibold text-[#4338CA]">
                          수정 ✎
                        </Text>
                      </View>
                      <Text className="mt-0.5 text-[11.5px] text-[#64748B]">
                        {it.calorie}kcal · 탄 {it.carbohydrate} · 단{" "}
                        {it.protein} · 지 {it.saturatedFat}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-[#94A3B8]">
                        당 {it.sugar} · 나트륨 {it.sodium} · 콜레스테롤{" "}
                        {it.cholesterol}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(idx)}
                      hitSlop={8}
                      className="p-1"
                    >
                      <X size={16} color="#ADB5BD" />
                    </Pressable>
                  </View>
                ))}

                {/* 합계 */}
                <View className="mt-1 rounded-[14px] bg-[#EEF2FF] px-4 py-3">
                  <Text className="text-[12px] font-bold text-[#4338CA]">
                    합계: {Math.round(totals.calorie)}kcal · 탄{" "}
                    {Math.round(totals.carbohydrate * 10) / 10}g · 단{" "}
                    {Math.round(totals.protein * 10) / 10}g · 지{" "}
                    {Math.round(totals.saturatedFat * 10) / 10}g
                  </Text>
                  <Text className="mt-1 text-[11px] text-[#6366F1]">
                    당 {Math.round(totals.sugar * 10) / 10}g · 나트륨{" "}
                    {Math.round(totals.sodium)}mg · 콜레스테롤{" "}
                    {Math.round(totals.cholesterol)}mg
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="flex-row items-center justify-end gap-2.5 px-6 py-4 border-t border-[#F1F3F5]">
            {isEdit ? (
              <Pressable
                onPress={handleDeleteMeal}
                disabled={isSaving}
                className="mr-auto h-12 flex-row items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-5"
              >
                <Trash2 size={15} color="#DC2626" />
                <Text className="text-[13.5px] font-semibold text-[#DC2626]">
                  삭제
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onClose}
              disabled={isSaving}
              className="h-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-6"
            >
              <Text className="text-[13.5px] font-semibold text-[#64748B]">
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              className={`h-12 min-w-[140px] flex-row items-center justify-center rounded-full bg-[#1A1F2E] px-8 ${
                isSaving ? "opacity-60" : ""
              }`}
            >
              {isSaving && (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-[13.5px] font-semibold text-white">
                {isSaving ? "저장 중..." : isEdit ? "수정 저장" : "식단 저장"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
          <Toast />
    </Modal>
  );
}
