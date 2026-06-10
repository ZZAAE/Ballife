import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DailyTimelineModal from "../../modals/DailyTimelineModal";

const WEEKDAY_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// 해당 주의 일요일 0시로 정규화
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// 주간 캘린더 컴포넌트
const WeeklyCalendar = ({ onDayClick }) => {
  const { t } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 이 주의 7일
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const moveWeek = (offset) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + offset * 7);
    setWeekStart(next);
  };

  const monthTitle = t("healthCalenderPage.monthTitle", {
    year: weekStart.getFullYear(),
    month: weekStart.getMonth() + 1,
  });
  const rangeLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${
    days[6].getMonth() + 1
  }/${days[6].getDate()}`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 헤더: < 2026년 5월 (주 범위) > */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => moveWeek(-1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
          aria-label={t("healthCalenderPage.prevWeek")}
        >
          {"<"}
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-lg text-gray-800">{monthTitle}</h2>
          <span className="text-xs text-gray-400 mt-0.5">{rangeLabel}</span>
        </div>
        <button
          onClick={() => moveWeek(1)}
          className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors font-bold"
          aria-label={t("healthCalenderPage.nextWeek")}
        >
          {">"}
        </button>
      </div>

      {/* 요일 + 날짜 헤더 */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          const dayColor =
            idx === 0
              ? "text-red-400"
              : idx === 6
                ? "text-blue-400"
                : "text-gray-400";
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center py-1.5"
            >
              <span className={`text-[11px] font-semibold ${dayColor}`}>
                {WEEKDAY_EN[idx]}
              </span>
              <span
                className={`text-sm font-bold mt-0.5 ${
                  isToday ? "text-emerald-600" : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* 요일 칸 */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((d, idx) => {
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={idx}
              type="button"
              onClick={() =>
                onDayClick?.({
                  year: d.getFullYear(),
                  month: d.getMonth(),
                  day: d.getDate(),
                })
              }
              className={`min-h-[280px] rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-gray-100 ${
                isToday
                  ? "border-emerald-400 ring-2 ring-emerald-400/40"
                  : "border-gray-100"
              }`}
              title={t("healthCalenderPage.dayTitle", {
                month: d.getMonth() + 1,
                day: d.getDate(),
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

// 건강 지표 테이블 컴포넌트
const Table = () => {
  const { t } = useTranslation();
  const rows = [
    [
      t("healthCalenderPage.table.rows.bloodSugar.label"),
      t("healthCalenderPage.table.rows.bloodSugar.lastWeek"),
      t("healthCalenderPage.table.rows.bloodSugar.thisWeek"),
      t("healthCalenderPage.table.rows.bloodSugar.change"),
    ],
    [
      t("healthCalenderPage.table.rows.bloodPressure.label"),
      t("healthCalenderPage.table.rows.bloodPressure.lastWeek"),
      t("healthCalenderPage.table.rows.bloodPressure.thisWeek"),
      t("healthCalenderPage.table.rows.bloodPressure.change"),
    ],
    [
      t("healthCalenderPage.table.rows.weight.label"),
      t("healthCalenderPage.table.rows.weight.lastWeek"),
      t("healthCalenderPage.table.rows.weight.thisWeek"),
      t("healthCalenderPage.table.rows.weight.change"),
    ],
    [
      t("healthCalenderPage.table.rows.exercise.label"),
      t("healthCalenderPage.table.rows.exercise.lastWeek"),
      t("healthCalenderPage.table.rows.exercise.thisWeek"),
      t("healthCalenderPage.table.rows.exercise.change"),
    ],
    [
      t("healthCalenderPage.table.rows.meal.label"),
      t("healthCalenderPage.table.rows.meal.lastWeek"),
      t("healthCalenderPage.table.rows.meal.thisWeek"),
      t("healthCalenderPage.table.rows.meal.change"),
    ],
    [
      t("healthCalenderPage.table.rows.sleep.label"),
      t("healthCalenderPage.table.rows.sleep.lastWeek"),
      t("healthCalenderPage.table.rows.sleep.thisWeek"),
      t("healthCalenderPage.table.rows.sleep.change"),
    ],
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
      <h3 className="font-bold text-gray-800 mb-4 text-base">
        {t("healthCalenderPage.table.heading")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-left">
            <tr className="border-b border-gray-100">
              <th className="pb-3 font-semibold">
                {t("healthCalenderPage.table.col.item")}
              </th>
              <th className="pb-3 font-semibold">
                {t("healthCalenderPage.table.col.lastWeek")}
              </th>
              <th className="pb-3 font-semibold">
                {t("healthCalenderPage.table.col.thisWeek")}
              </th>
              <th className="pb-3 font-semibold">
                {t("healthCalenderPage.table.col.change")}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/40">
                <td className="py-3.5 font-medium">{r[0]}</td>
                <td className="py-3.5">{r[1]}</td>
                <td className="py-3.5 font-semibold text-gray-900">{r[2]}</td>
                <td
                  className={`py-3.5 font-bold ${
                    r[3].includes("-") ? "text-blue-500" : "text-green-500"
                  }`}
                >
                  {r[3]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 bg-green-50 text-green-700 p-4 rounded-xl text-xs font-semibold flex items-center gap-1.5">
        <span>👍</span> {t("healthCalenderPage.table.footer")}
      </div>
    </div>
  );
};

// 우측 사이드바 컴포넌트
const Sidebar = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 text-sm">
          {t("healthCalenderPage.sidebar.monthlyTitle")}
        </h4>
        {[
          [t("healthCalenderPage.sidebar.metrics.diet"), 82],
          [t("healthCalenderPage.sidebar.metrics.bloodSugarStability"), 50],
          [t("healthCalenderPage.sidebar.metrics.sleepRhythm"), 65],
          [t("healthCalenderPage.sidebar.metrics.fitnessIndex"), 100],
          [t("healthCalenderPage.sidebar.metrics.exercisePerformance"), 75],
        ].map(([label, val], i) => (
          <div key={i} className="mb-3.5 last:mb-0">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-800 font-bold">{val}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-md">
        <h4 className="font-bold mb-1.5 text-sm">
          {t("healthCalenderPage.sidebar.weeklyAnalysisTitle")}
        </h4>
        <p className="text-xs text-gray-400 mb-4 font-medium">
          {t("healthCalenderPage.sidebar.streak")}
        </p>
        <div className="flex items-end justify-between gap-2.5 h-24 pt-2">
          {[20, 40, 30, 60, 50, 80, 90].map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
              <div className="w-full bg-gray-800 rounded-t h-20 flex items-end">
                <div
                  className="bg-blue-400 w-full rounded-t hover:bg-blue-300 transition-colors"
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {
                  [
                    t("healthCalenderPage.sidebar.weekdayShort.mon"),
                    t("healthCalenderPage.sidebar.weekdayShort.tue"),
                    t("healthCalenderPage.sidebar.weekdayShort.wed"),
                    t("healthCalenderPage.sidebar.weekdayShort.thu"),
                    t("healthCalenderPage.sidebar.weekdayShort.fri"),
                    t("healthCalenderPage.sidebar.weekdayShort.sat"),
                    t("healthCalenderPage.sidebar.weekdayShort.sun"),
                  ][i]
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HealthCalendarPage() {
  const { t } = useTranslation();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const handleDayClick = (dayInfo) => {
    setSelectedDayInfo(dayInfo);
    setIsTimelineOpen(true);
  };

  const timelineData = useMemo(() => {
    if (!selectedDayInfo) return null;
    const { year, month, day } = selectedDayInfo;
    const dateObj = new Date(year, month, day);
    const weekdayKeys = [
      "sun",
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
    ];
    return {
      month: t("healthCalenderPage.timeline.month", { month: month + 1 }),
      day: t(`healthCalenderPage.weekday.${weekdayKeys[dateObj.getDay()]}`),
      date: t("healthCalenderPage.timeline.date", {
        year,
        month: month + 1,
        day,
      }),
    };
  }, [selectedDayInfo, t]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-['Noto_Sans_KR']">
      <div className="px-4 py-8 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 max-w-[1920px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
            {t("healthCalenderPage.header.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {t("healthCalenderPage.header.subtitle")}
          </p>
        </header>

        <div className="space-y-6">
          <WeeklyCalendar onDayClick={handleDayClick} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
            <div className="lg:col-span-7">
              <Table />
            </div>
            <div className="lg:col-span-3">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      <DailyTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        data={timelineData}
      />
    </div>
  );
}
