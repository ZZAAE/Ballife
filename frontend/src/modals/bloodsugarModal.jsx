import { useState, useRef, useCallback, useEffect } from "react";
import { Clock, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import bioValueRecordApi from "../api/bioValueRecordApi";
import userApi from "../api/userApi";
import userConfigApi from "../api/userConfigApi";
import { BIO_CATEGORY } from "../constants/bioCategory";
import {
  loadCachedMemberProfile,
  parseDiseaseIndex,
  persistMemberProfile,
} from "../utils/userProfile";

const MEALS = [
  { id: "공복", label: "공복", hasTiming: false },
  { id: "아침", label: "아침", hasTiming: true },
  { id: "점심", label: "점심", hasTiming: true },
  { id: "저녁", label: "저녁", hasTiming: true },
  { id: "취침전", label: "취침전", hasTiming: false },
];

const TIMINGS = ["식전", "식후"];

// 루틴(/member)에 저장된 식사 시간 기준 자동 선택용.
// getMealTimes 응답 키 → 모달 식사 탭 라벨.
const MEAL_TIME_FIELDS = [
  { key: "breakfastTime", meal: "아침" },
  { key: "lunchTime", meal: "점심" },
  { key: "dinnerTime", meal: "저녁" },
];

// "HH:mm" / "HH:mm:ss" → 자정 기준 분(0~1439). 파싱 실패 시 null.
const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

// 식사 시간 ±60분 안이면 해당 끼니의 식전(-1시간~T)/식후(T~+1시간)를 반환.
// 여러 끼니 창이 겹칠 땐 현재 시각과 가장 가까운 끼니를 선택.
// 어느 창에도 들지 않으면 null — 호출부에서 기본값(공복/식전)을 유지한다.
const resolveAutoMealTiming = (mealTimes, now) => {
  if (!mealTimes) return null;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let best = null;
  for (const { key, meal } of MEAL_TIME_FIELDS) {
    const mealMin = timeStringToMinutes(mealTimes[key]);
    if (mealMin == null) continue;
    const diff = nowMin - mealMin; // 음수=식전, 양수=식후
    if (diff < -60 || diff > 60) continue;
    const timing = diff < 0 ? "식전" : "식후";
    const dist = Math.abs(diff);
    if (!best || dist < best.dist) best = { meal, timing, dist };
  }
  return best ? { meal: best.meal, timing: best.timing } : null;
};

// 저혈당은 임상 표준에 따라 모든 유형에서 70mg/dL 미만으로 통일
const HYPO_CUT = 70;

// 당뇨 유형 · 측정 시점별 혈당 기준 (mg/dL)
//   warn   : 정상 → 경고 경계 (이 값부터 경고)
//   danger : 경고 → 위험 경계 (이 값부터 위험)
// 저혈당(<70)과 정상 시작값 사이 구간은 정상으로 포함하므로 정상 하한은 항상 70.
const BLOOD_SUGAR_RANGES = {
  NONE: {
    공복: { warn: 100, danger: 126 },
    식전: { warn: 100, danger: 140 },
    식후: { warn: 140, danger: 180 },
    취침전: { warn: 121, danger: 140 },
  },
  type1: {
    공복: { warn: 131, danger: 181 },
    식전: { warn: 131, danger: 181 },
    식후: { warn: 181, danger: 251 },
    취침전: { warn: 151, danger: 201 },
  },
  type2: {
    공복: { warn: 131, danger: 181 },
    식전: { warn: 131, danger: 181 },
    식후: { warn: 181, danger: 251 },
    취침전: { warn: 141, danger: 201 },
  },
  GESTATIONAL: {
    공복: { warn: 96, danger: 106 },
    식전: { warn: 96, danger: 106 },
    식후: { warn: 121, danger: 141 },
    취침전: { warn: 121, danger: 141 },
  },
};

const DIABETES_LABEL = {
  NONE: "당뇨 없음",
  type1: "1형 당뇨",
  type2: "2형 당뇨",
  GESTATIONAL: "임신성 당뇨",
};

// 식사 탭/식전·식후 토글을 기준표의 행(공복/식전/식후/취침전)으로 매핑
const resolveBsContext = (meal, timing) => {
  if (meal === "공복") return "공복";
  if (meal === "취침전") return "취침전";
  return timing === "식후" ? "식후" : "식전";
};

const getRange = (diabetesType, meal, timing) => {
  const byType = BLOOD_SUGAR_RANGES[diabetesType] || BLOOD_SUGAR_RANGES.NONE;
  return byType[resolveBsContext(meal, timing)];
};

const getStatusInfo = (value, range) => {
  const { warn, danger } = range;
  if (value < HYPO_CUT)
    return {
      statusText: "저혈당",
      label: "저혈당 상태입니다",
      description: "혈당이 낮습니다. 당분이 포함된 음식을 섭취해주세요.",
      color: "#60A5FA",
      badge: "bg-[#EFF6FF] text-[#2563EB]",
    };
  if (value < warn)
    return {
      statusText: "정상",
      label: "이상적인 혈당입니다",
      description: "현재 혈당 수치는 정상 범위입니다. 꾸준한 관리를 유지해주세요.",
      color: "#22C55E",
      badge: "bg-[#ECFDF3] text-[#16A34A]",
    };
  if (value < danger)
    return {
      statusText: "경고",
      label: "혈당 관리가 필요합니다",
      description: "혈당이 높습니다. 식단과 운동을 통한 관리가 필요합니다.",
      color: "#FB923C",
      badge: "bg-[#FFF7ED] text-[#EA580C]",
    };
  return {
    statusText: "위험",
    label: "매우 높은 혈당입니다",
    description: "위험 수준의 혈당입니다. 의료진과 상담하시기 바랍니다.",
    color: "#F87171",
    badge: "bg-[#FEF2F2] text-[#DC2626]",
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

// "BloodSugar-아침식전" 같은 카테고리에서 meal/timing 추출
const parseBsCategory = (category) => {
  if (typeof category !== "string" || !category.includes("-"))
    return { meal: "공복", timing: "식전" };
  const suffix = category.split("-")[1];
  if (suffix === "공복") return { meal: "공복", timing: "식전" };
  if (suffix === "취침전") return { meal: "취침전", timing: "식전" };
  for (const m of ["아침", "점심", "저녁"]) {
    if (suffix.startsWith(m)) {
      const t = suffix.slice(m.length) === "식후" ? "식후" : "식전";
      return { meal: m, timing: t };
    }
  }
  return { meal: "공복", timing: "식전" };
};

export default function BloodSugarModal({
  isOpen = true,
  onClose = () => {},
  onSaved,
  editingRecord = null,
  diabetesType: diabetesTypeProp = null,
}) {
  const { user } = useAuth();
  const isEditMode = Boolean(editingRecord?.recordId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const dateInputRef = useRef(null);

  const [activeMeal, setActiveMeal] = useState("공복");
  const [activeTiming, setActiveTiming] = useState("식전");

  // 보유 질환 정보(당뇨 유형)에 따라 기준표를 다르게 적용
  const [diabetesType, setDiabetesType] = useState(diabetesTypeProp || "NONE");

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

  // 당뇨 유형 + 현재 측정 시점(공복/식전/식후/취침전)에 맞는 기준
  const currentRange = getRange(diabetesType, activeMeal, activeTiming);
  const bsContext = resolveBsContext(activeMeal, activeTiming);
  const status = getStatusInfo(statusVal, currentRange);

  // 슬라이더의 4개 색상 구간 (0~maxVal 스케일)
  const zones = [
    { key: "저혈당", color: "#60A5FA", start: 0, end: HYPO_CUT },
    { key: "정상", color: "#22C55E", start: HYPO_CUT, end: currentRange.warn },
    { key: "경고", color: "#FB923C", start: currentRange.warn, end: currentRange.danger },
    { key: "위험", color: "#F87171", start: currentRange.danger, end: maxVal },
  ].map((zone) => ({
    ...zone,
    width: Math.max(0, ((zone.end - zone.start) / maxVal) * 100),
    left: (zone.start / maxVal) * 100,
  }));

  // 안내 박스에 표시할 기준표 행
  // 저혈당(<70)과 정상 시작값 사이 구간은 정상으로 포함해 70부터 표시
  const guideRows = [
    { label: "저혈당", text: `< ${HYPO_CUT}mg/dL` },
    { label: "정상", text: `${HYPO_CUT} ~ ${currentRange.warn - 1}mg/dL` },
    { label: "경고", text: `${currentRange.warn} ~ ${currentRange.danger - 1}mg/dL` },
    { label: "위험", text: `≥ ${currentRange.danger}mg/dL` },
  ];

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

  const handleSave = async (e) => {
    e?.stopPropagation();

    if (isSaving) return;

    if (currentVal <= 0) {
      toast.error("혈당 수치를 입력해주세요");
      return;
    }

    const userId = user?.userId ?? user?.id;
    if (!userId) {
      toast.error("로그인이 필요합니다");
      return;
    }

    const suffix = meal.hasTiming
      ? `${activeMeal}${activeTiming}`
      : activeMeal;

    try {
      setIsSaving(true);
      if (isEditMode) {
        const payload = {
          recordDate:
            typeof editingRecord.recordDate === "string"
              ? editingRecord.recordDate.slice(0, 10)
              : selectedDate,
          recordTime: `${timeValue}:00`,
          category: `${BIO_CATEGORY.BLOOD_SUGAR}-${suffix}`,
          bloodSugar: Math.round(currentVal),
        };
        await bioValueRecordApi.updateBioValueRecord(
          editingRecord.recordId,
          payload
        );
        toast.success("혈당 기록이 수정되었습니다");
        onSaved?.(null);
        onClose();
      } else {
        const payload = {
          recordDate: selectedDate,
          recordTime: `${timeValue}:00`,
          category: `${BIO_CATEGORY.BLOOD_SUGAR}-${suffix}`,
          bloodSugar: Math.round(currentVal),
        };
        await bioValueRecordApi.createBioValueRecord(userId, payload);
        updateCurrentRecord({ saved: true });
        toast.success("혈당이 저장되었습니다");
        onClose();
      }
    } catch {
      // 에러 토스트는 api 인터셉터에서 처리됨
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e?.stopPropagation();
    if (!isEditMode || isDeleting) return;
    if (!window.confirm("이 혈당 기록을 삭제하시겠어요?")) return;

    setIsDeleting(true);
    try {
      await bioValueRecordApi.deleteBioValueRecord(editingRecord.recordId);
      toast.success("혈당 기록이 삭제되었습니다");
      onSaved?.(null);
      onClose();
    } catch {
      // 인터셉터 처리
    } finally {
      setIsDeleting(false);
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

  // 모달이 열릴 때 보유 질환 정보에서 당뇨 유형을 읽어 기준표를 결정.
  // diseaseIndex는 회원가입 때 입력받아 서버에만 저장되고 로그인 응답에는 없어서,
  // 질환 편집 페이지를 거치지 않은 사용자의 캐시에는 비어 있을 수 있다.
  // 따라서 캐시 값으로 우선 표시한 뒤 서버에서 최신 질환 정보를 조회해 보정한다.
  useEffect(() => {
    if (!isOpen) return;
    if (diabetesTypeProp) {
      setDiabetesType(diabetesTypeProp);
      return;
    }

    // 1) 캐시 값으로 우선 표시 (깜빡임 방지)
    const cached = parseDiseaseIndex(loadCachedMemberProfile().diseaseIndex);
    setDiabetesType(cached.diabetes || "NONE");

    // 2) 서버에서 회원가입 때 입력한 실제 당뇨 여부를 조회해 보정하고 캐시도 동기화
    const userId = user?.userId ?? user?.id;
    if (!userId) return;

    let cancelled = false;
    userApi
      .getMember(userId)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const parsed = parseDiseaseIndex(data.diseaseIndex);
        setDiabetesType(parsed.diabetes || "NONE");
        persistMemberProfile(data);
      })
      .catch(() => {
        // 조회 실패 시 위에서 적용한 캐시 값을 그대로 유지
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, diabetesTypeProp, user]);

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

  // 모달 오픈 시 editingRecord에 맞춰 폼 초기화
  useEffect(() => {
    if (!isOpen) return;

    if (editingRecord) {
      const { meal, timing } = parseBsCategory(editingRecord.category);
      const dateStr =
        typeof editingRecord.recordDate === "string"
          ? editingRecord.recordDate.slice(0, 10)
          : new Date().toISOString().split("T")[0];
      const value = editingRecord.bloodsugar != null ? editingRecord.bloodsugar : 0;
      const pct = Math.max(0, Math.min(100, (value / maxVal) * 100));
      const time =
        typeof editingRecord.recordTime === "string"
          ? editingRecord.recordTime.slice(0, 5)
          : getCurrentTime();
      const mealInfo = MEALS.find((m) => m.id === meal);
      const key = mealInfo?.hasTiming ? `${meal}_${timing}` : meal;

      setSelectedDate(dateStr);
      setActiveMeal(meal);
      setActiveTiming(timing);
      setRecordsByDate({
        [dateStr]: {
          [key]: {
            pct,
            value: value > 0 ? Number(value).toFixed(1) : "00.0",
            time,
            saved: true,
          },
        },
      });
    } else {
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setActiveMeal("공복");
      setActiveTiming("식전");
      setRecordsByDate({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingRecord]);

  // 새 기록 모달이 열릴 때, 루틴(/member)에 저장된 식사 시간 ±1시간 안이면
  // 끼니 탭과 식전/식후를 자동으로 선택해 둔다. (식전: T-1h~T, 식후: T~T+1h)
  // editingRecord가 있을 땐 위 init effect가 기존 기록값을 그대로 복원하므로 건너뛴다.
  // 모달 오픈 시 1회만 적용하고, 이후 사용자가 직접 바꾼 값은 덮어쓰지 않는다.
  useEffect(() => {
    if (!isOpen || editingRecord) return;
    const userId = user?.userId ?? user?.id;
    if (!userId) return;

    let cancelled = false;
    userConfigApi
      .getMealTimes(userId)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const auto = resolveAutoMealTiming(data, new Date());
        if (!auto) return;
        setActiveMeal(auto.meal);
        setActiveTiming(auto.timing);
      })
      .catch(() => {
        // 조회 실패 시 기본값(공복/식전)을 그대로 유지
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, editingRecord, user]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[672px] flex-col rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]" onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">
                {isEditMode ? "혈당 기록 수정" : "혈당 기록하기"}
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">
                {isEditMode
                  ? "값을 수정하거나 기록을 삭제할 수 있어요."
                  : "오늘의 혈당을 기록하세요."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* 안내 박스 — 당뇨 유형 · 측정 시점별 기준 */}
          <div className="mt-5 rounded-2xl bg-[#F8FAFC] px-4 py-4">
            <p className="mb-2 text-[12px] font-bold text-[#475569]">
              {DIABETES_LABEL[diabetesType] ?? "당뇨 없음"} · {bsContext} 기준
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {guideRows.map((row) => (
                <p
                  key={row.label}
                  className="text-[13px] leading-relaxed text-[#64748B]"
                >
                  {row.label}: {row.text}
                </p>
              ))}
            </div>
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
                  color: isFocused || currentVal > 0 ? "#0F172A" : "#CBD5E1"
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
                {status.statusText}
              </span>
            </div>

            {/* 슬라이더 */}
            <div className="relative h-[12px] w-full overflow-visible rounded-full mb-3">
              <div className="flex h-full overflow-hidden rounded-full">
                {zones.map((zone) => (
                  <div
                    key={zone.key}
                    className="h-full"
                    style={{ width: `${zone.width}%`, backgroundColor: zone.color }}
                  />
                ))}
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

            <div className="relative h-[16px] text-[11px] font-medium text-[#94A3B8]">
              {zones.map((zone) => (
                <span
                  key={zone.key}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${zone.left}%` }}
                >
                  {zone.key}
                </span>
              ))}
            </div>
          </div>

          {/* AI 조언 카드 */}
          <div className="mb-6 overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF]">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[13px] leading-relaxed text-[#475569]">
                  {status.label}
                </p>
                <p className="text-[12px] text-[#94A3B8]">
                  {status.description}
                </p>
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
                disabled={isSaving || isDeleting}
                className="flex-1 rounded-[20px] border border-[#FCA5A5] bg-white py-5 text-lg font-bold text-[#DC2626] transition hover:bg-[#FEF2F2] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className={`${isEditMode ? "flex-1" : "w-full"} rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSaving
                ? "저장 중..."
                : isEditMode
                ? "수정 저장"
                : isSaved
                ? "저장 완료 ✓"
                : "기록 저장 및 확인"}
            </button>
          </div>
        </div>
    </div>
    </div>
  );
}