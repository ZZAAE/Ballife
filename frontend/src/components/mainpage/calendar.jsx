import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DailyTimelineModal from "../../modals/DailyTimelineModal";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import mealApi from "../../api/mealApi";
import { getExercisesInRange } from "../../api/exerciseApi";
import { useAuth } from "../../contexts/AuthContext";
import i18n from "../../i18n";
import { formatDate, formatMonthDay, formatNumber } from "../../utils/format";

const ML_PER_CUP = 200;
const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";

const pad2 = (n) => String(n).padStart(2, "0");
const toDateStr = (year, month, day) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;
const sliceTime = (t) => (t ? String(t).slice(0, 5) : "");

const MEAL_LABEL = {
  BREAKFAST: () => i18n.t("mainCalendar.meal.breakfast"),
  LUNCH: () => i18n.t("mainCalendar.meal.lunch"),
  DINNER: () => i18n.t("mainCalendar.meal.dinner"),
  SNACK: () => i18n.t("mainCalendar.meal.snack"),
};

const SCHEDULE_LABEL = {
  morning: () => i18n.t("mainCalendar.medicationSlot.morning"),
  lunch: () => i18n.t("mainCalendar.medicationSlot.lunch"),
  dinner: () => i18n.t("mainCalendar.medicationSlot.dinner"),
};

const categoryDot = {
  식단: "bg-rose-400",
  혈압: "bg-purple-400",
  혈당: "bg-blue-400",
  수분: "bg-sky-400",
  복약: "bg-emerald-400",
  운동: "bg-orange-400",
  체중: "bg-amber-400",
};

const isCategoryStartWith = (cat, prefix) =>
  typeof cat === "string" && cat.startsWith(prefix);

const buildBioItemsForDate = (records, dateStr) => {
  if (!Array.isArray(records)) return [];
  return records
    .filter((r) => String(r?.recordDate || "").slice(0, 10) === dateStr)
    .map((r, idx) => {
      const time = sliceTime(r.recordTime) || "00:00";
      const id = `bio-${r.recordId ?? `${dateStr}-${idx}`}`;
      if (r.bloodSugar != null && isCategoryStartWith(r.category, "BloodSugar")) {
        return {
          id,
          time,
          category: "혈당",
          color: "blue",
          title: i18n.t("mainCalendar.item.bloodSugarCheck"),
          value: String(r.bloodSugar),
          valueUnit: "mg/dL",
        };
      }
      if (
        r.systolicBP != null &&
        r.diastolicBP != null &&
        isCategoryStartWith(r.category, "BloodPressure")
      ) {
        return {
          id,
          time,
          category: "혈압",
          color: "purple",
          title: i18n.t("mainCalendar.item.bloodPressureCheck"),
          value: `${r.systolicBP}/${r.diastolicBP}`,
          valueUnit: "mmHg",
        };
      }
      if (r.weight != null && isCategoryStartWith(r.category, "Weight")) {
        return {
          id,
          time,
          category: "체중",
          color: "yellow",
          title: i18n.t("mainCalendar.item.weightCheck"),
          value: `${r.weight}kg`,
        };
      }
      if (r.waterIntakeCup != null) {
        const ml = Number(r.waterIntakeCup) * ML_PER_CUP;
        return {
          id,
          time,
          category: "수분",
          color: "sky",
          title: i18n.t("mainCalendar.item.waterIntake"),
          value: `${ml}ml`,
        };
      }
      return null;
    })
    .filter(Boolean);
};

const buildExerciseItemsForDate = (records, dateStr) => {
  if (!Array.isArray(records)) return [];
  return records
    .filter((r) => String(r?.exerciseDate || "").slice(0, 10) === dateStr)
    .map((r, idx) => {
      const time = sliceTime(r.exerciseTime) || "00:00";
      const minutes = Number(r.exerciseMin) || 0;
      return {
        id: `ex-${r.userExerciseId ?? `${dateStr}-${idx}`}`,
        time,
        category: "운동",
        color: "orange",
        title: i18n.t("mainCalendar.item.exercise", {
          name: r.exerciseName ?? i18n.t("mainCalendar.item.exerciseFallback"),
        }),
        subtitle: minutes > 0 ? i18n.t("mainCalendar.item.minutes", { count: minutes }) : undefined,
        value: r.burnedCalorie != null ? String(Math.round(r.burnedCalorie)) : undefined,
        valueUnit: r.burnedCalorie != null ? "kcal" : undefined,
      };
    });
};

const buildMedicineItemsForDate = (dateStr) => {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_PREFIX + dateStr);
    if (!raw) return [];
    const schedules = JSON.parse(raw);
    if (!Array.isArray(schedules)) return [];
    const items = [];
    schedules.forEach((s, sIdx) => {
      const taken = (s.drugs || []).filter((d) => d.taken);
      if (taken.length === 0) return;
      items.push({
        id: `med-${dateStr}-${s.id ?? sIdx}`,
        time: sliceTime(s.time) || "00:00",
        category: "복약",
        color: "green",
        title: SCHEDULE_LABEL[s.id]?.() || s.name || i18n.t("mainCalendar.item.medication"),
        subtitle: taken.map((d) => d.name).join(", "),
        value: i18n.t("mainCalendar.item.count", { count: taken.length }),
      });
    });
    return items;
  } catch {
    return [];
  }
};

const buildMealItemsForDate = (meals, mealItemsByMealId, dateStr) => {
  if (!Array.isArray(meals)) return [];
  return meals
    .filter((m) => String(m?.mealDate || "").slice(0, 10) === dateStr)
    .map((m) => {
      const items = mealItemsByMealId?.[m.mealId] ?? [];
      const totalKcal = items.reduce(
        (sum, it) => sum + (Number(it.calorie) || 0),
        0,
      );
      return {
        id: `meal-${m.mealId}`,
        time: sliceTime(m.mealTime) || "00:00",
        category: "식단",
        color: "red",
        title: MEAL_LABEL[m.mealCategory]?.() ?? i18n.t("mainCalendar.item.meal"),
        value: totalKcal > 0 ? `${formatNumber(Math.round(totalKcal))} kcal` : undefined,
      };
    });
};

const sortByTime = (items) =>
  [...items].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

function Calendar() {
  const { t } = useTranslation();
  const weekdays = [
    t("mainCalendar.weekdayShort.sun"),
    t("mainCalendar.weekdayShort.mon"),
    t("mainCalendar.weekdayShort.tue"),
    t("mainCalendar.weekdayShort.wed"),
    t("mainCalendar.weekdayShort.thu"),
    t("mainCalendar.weekdayShort.fri"),
    t("mainCalendar.weekdayShort.sat"),
  ];
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredCell, setHoveredCell] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const pickerRef = useRef(null);

  const [bioRecords, setBioRecords] = useState([]);
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [modalMeals, setModalMeals] = useState([]);
  const [modalMealItems, setModalMealItems] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthTitle = formatDate(currentDate, { year: "numeric", month: "long" });

  const { daysInMonth, firstDayOfWeek, totalCells } = useMemo(() => {
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const firstDay = firstDate.getDay();
    const daysCount = lastDate.getDate();
    const cells = Math.ceil((firstDay + daysCount) / 7) * 7;
    return {
      daysInMonth: daysCount,
      firstDayOfWeek: firstDay,
      totalCells: cells,
    };
  }, [year, month]);

  // 사용자 변경 시 모든 BioValue 기록 1회 로딩 (월 필터링은 클라이언트 측에서 처리)
  useEffect(() => {
    if (!userId) {
      setBioRecords([]);
      return undefined;
    }
    let cancelled = false;
    bioValueRecordApi
      .getAllBioValueRecords(userId)
      .then((res) => {
        if (cancelled) return;
        setBioRecords(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setBioRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 월 변경 시 해당 월의 운동 기록 페치
  useEffect(() => {
    if (!userId) {
      setExerciseRecords([]);
      return undefined;
    }
    let cancelled = false;
    const start = toDateStr(year, month, 1);
    const end = toDateStr(year, month, daysInMonth);
    getExercisesInRange(userId, start, end)
      .then((list) => {
        if (cancelled) return;
        setExerciseRecords(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setExerciseRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, year, month, daysInMonth]);

  // 모달 열림 시 해당 날짜의 식단(끼니 + 음식 항목) 페치
  const loadMealsForDate = useCallback(
    async (dateStr) => {
      if (!userId || !dateStr) {
        setModalMeals([]);
        setModalMealItems({});
        return;
      }
      setModalLoading(true);
      try {
        const res = await mealApi.getTodayMeals(userId, dateStr);
        const meals = Array.isArray(res?.data) ? res.data : [];
        setModalMeals(meals);

        const itemEntries = await Promise.all(
          meals.map(async (m) => {
            try {
              const itemsRes = await mealApi.getMealItemsByMealId(m.mealId);
              return [m.mealId, Array.isArray(itemsRes?.data) ? itemsRes.data : []];
            } catch {
              return [m.mealId, []];
            }
          }),
        );
        const itemMap = {};
        itemEntries.forEach(([mealId, items]) => {
          itemMap[mealId] = items;
        });
        setModalMealItems(itemMap);
      } catch {
        setModalMeals([]);
        setModalMealItems({});
      } finally {
        setModalLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!modalDate) {
      setModalMeals([]);
      setModalMealItems({});
      return;
    }
    const dateStr = toDateStr(modalDate.year, modalDate.month, modalDate.day);
    loadMealsForDate(dateStr);
  }, [modalDate, loadMealsForDate]);

  // 날짜별 식단 외 아이템 캐시 (월 단위 데이터 기반)
  const baseItemsByDate = useMemo(() => {
    const map = {};
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = toDateStr(year, month, day);
      const items = [
        ...buildBioItemsForDate(bioRecords, dateStr),
        ...buildExerciseItemsForDate(exerciseRecords, dateStr),
        ...buildMedicineItemsForDate(dateStr),
      ];
      if (items.length > 0) map[dateStr] = sortByTime(items);
    }
    return map;
  }, [bioRecords, exerciseRecords, year, month, daysInMonth]);

  const moveMonth = (offset) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setHoveredCell(null);
  };

  const toggleMonthPicker = () => {
    setShowMonthPicker((prev) => {
      const next = !prev;
      if (next) setPickerYear(year);
      return next;
    });
    setHoveredCell(null);
  };

  const selectPickerMonth = (m) => {
    setCurrentDate(new Date(pickerYear, m, 1));
    setShowMonthPicker(false);
    setHoveredCell(null);
  };

  useEffect(() => {
    if (!showMonthPicker) return undefined;
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showMonthPicker]);

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth() &&
    today.getDate() === day;

  const handleMouseEnter = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCell({ day, rect });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleCellClick = (day) => {
    setModalDate({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day,
    });
  };

  // 모달에 전달할 데이터 (식단 포함)
  const buildModalData = () => {
    if (!modalDate) return null;
    const dateStr = toDateStr(modalDate.year, modalDate.month, modalDate.day);
    const dateObj = new Date(modalDate.year, modalDate.month, modalDate.day);
    const weekdayKor = [
      t("mainCalendar.weekdayLong.sun"),
      t("mainCalendar.weekdayLong.mon"),
      t("mainCalendar.weekdayLong.tue"),
      t("mainCalendar.weekdayLong.wed"),
      t("mainCalendar.weekdayLong.thu"),
      t("mainCalendar.weekdayLong.fri"),
      t("mainCalendar.weekdayLong.sat"),
    ];
    const baseItems = baseItemsByDate[dateStr] || [];
    const mealItems = buildMealItemsForDate(modalMeals, modalMealItems, dateStr);
    const items = sortByTime([...baseItems, ...mealItems]);
    return {
      month: t("mainCalendar.monthLabel", { month: modalDate.month + 1 }),
      day: weekdayKor[dateObj.getDay()],
      date: formatDate(dateObj),
      items,
      loading: modalLoading,
    };
  };

  const renderDayCell = (index) => {
    const dayNumber = index - firstDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dayOfWeek = index % 7;

    if (!isCurrentMonth) {
      return <div key={`empty-${index}`} className="aspect-square rounded-xl bg-slate-50/60" />;
    }

    const dateStr = toDateStr(year, month, dayNumber);
    const hasItems = (baseItemsByDate[dateStr]?.length ?? 0) > 0;

    const dayColor =
      dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : "text-slate-700";

    return (
      <div
        key={`day-${dayNumber}`}
        className={`relative aspect-square rounded-xl border bg-white px-3 py-2.5 transition cursor-pointer
          ${isToday(dayNumber)
            ? "border-blue-400 ring-1 ring-blue-200"
            : "border-slate-100 hover:border-slate-300 hover:shadow-sm"}
        `}
        onMouseEnter={(e) => handleMouseEnter(e, dayNumber)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleCellClick(dayNumber)}
      >
        <div className="flex items-start justify-between">
          <span
            className={`text-sm font-semibold ${
              isToday(dayNumber)
                ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
                : dayColor
            }`}
          >
            {dayNumber}
          </span>
          {hasItems && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
          )}
        </div>
      </div>
    );
  };

  // 팝오버 위치 계산 — 셀 우측 / 모자라면 좌측
  const getPopoverStyle = () => {
    if (!hoveredCell) return {};
    const { rect } = hoveredCell;
    const popoverWidth = 260;
    const gap = 8;
    const viewportWidth = window.innerWidth;

    let left = rect.right + gap;
    if (left + popoverWidth > viewportWidth - 16) {
      left = rect.left - popoverWidth - gap;
    }

    return {
      position: "fixed",
      top: rect.top,
      left,
      width: popoverWidth,
      zIndex: 50,
      pointerEvents: "none",
    };
  };

  const hoveredDateStr = hoveredCell
    ? toDateStr(year, month, hoveredCell.day)
    : null;
  const hoveredItems = hoveredDateStr ? baseItemsByDate[hoveredDateStr] || [] : [];
  const previewItems = hoveredItems.slice(0, 4);
  const totalCount = hoveredItems.length;

  return (
    <>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label={t("mainCalendar.aria.prevMonth")}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="relative flex-1" ref={pickerRef}>
            <button
              type="button"
              onClick={toggleMonthPicker}
              aria-haspopup="dialog"
              aria-expanded={showMonthPicker}
              className="mx-auto flex items-center gap-1.5 rounded-lg px-3 py-1 text-xl font-bold tracking-tight text-slate-900 transition hover:bg-slate-100"
            >
              <span>{monthTitle}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 text-slate-400 transition-transform ${showMonthPicker ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showMonthPicker && (
              <div
                role="dialog"
                aria-label={t("mainCalendar.aria.yearMonthPicker")}
                className="absolute left-1/2 top-full z-30 mt-2 w-[280px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y - 1)}
                    aria-label={t("mainCalendar.aria.prevYear")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <span className="text-sm font-bold text-slate-900">
                    {t("mainCalendar.yearLabel", { year: pickerYear })}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y + 1)}
                    aria-label={t("mainCalendar.aria.nextYear")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, m) => {
                    const isSelected = pickerYear === year && m === month;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => selectPickerMonth(m)}
                        className={`rounded-lg py-2 text-sm font-medium transition ${
                          isSelected
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {t("mainCalendar.monthLabel", { month: m + 1 })}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label={t("mainCalendar.aria.nextMonth")}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekdays.map((day, idx) => (
            <div
              key={day}
              className={`pb-2 text-xs font-bold ${
                idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-2">
          {Array.from({ length: totalCells }, (_, i) => renderDayCell(i))}
        </div>

        {/* 호버 팝오버 — 작은 미리보기 */}
        {hoveredCell && (
          <div
            style={getPopoverStyle()}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-sm font-bold text-slate-900">
                {formatMonthDay(new Date(year, month, hoveredCell.day))}
              </p>
              <span className="text-xs text-slate-400">
                {t("mainCalendar.item.count", { count: totalCount })}
              </span>
            </div>

            <div className="space-y-2">
              {previewItems.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400">
                  {t("mainCalendar.empty")}
                </p>
              ) : (
                previewItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        categoryDot[item.category] || "bg-slate-300"
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-500 w-10 shrink-0">
                      {item.time}
                    </span>
                    <span className="text-xs text-slate-700 truncate">{item.title}</span>
                  </div>
                ))
              )}
              {totalCount > previewItems.length && (
                <p className="pt-1 text-[10px] text-slate-400">
                  {t("mainCalendar.moreItems", {
                    count: totalCount - previewItems.length,
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 정식 모달 */}
      <DailyTimelineModal
        isOpen={!!modalDate}
        onClose={() => setModalDate(null)}
        data={buildModalData()}
      />
    </>
  );
}

export default Calendar;
