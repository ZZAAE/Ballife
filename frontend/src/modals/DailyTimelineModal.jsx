import React from "react";

/* ============================================================
 * HealthTimelineModal (v2)
 * ------------------------------------------------------------
 * - 크기: 720 × 720 (일반적인 데스크탑 모달 사이즈)
 * - 디자인: 캘린더와 톤 통일 (흰 배경, 슬레이트, 라운드)
 * - 상단: 그날 기록한 카테고리 요약 (7개 항목, 활성/비활성)
 * - 배경 클릭 시 닫힘
 * ============================================================ */

/* ---------- 1. 카테고리별 컬러 테마 ---------- */
const COLOR_THEME = {
  yellow: {
    card: "bg-amber-50",
    title: "text-amber-900",
    subtitle: "text-amber-600",
    value: "text-amber-900",
    valueSub: "text-amber-600",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dot: "bg-amber-400",
    dotBorder: "border-amber-300",
  },
  red: {
    card: "bg-rose-50",
    title: "text-rose-900",
    subtitle: "text-rose-500",
    value: "text-rose-900",
    valueSub: "text-rose-500",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    dot: "bg-rose-400",
    dotBorder: "border-rose-300",
  },
  purple: {
    card: "bg-purple-50",
    title: "text-purple-900",
    subtitle: "text-purple-500",
    value: "text-purple-900",
    valueSub: "text-purple-500",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    dot: "bg-purple-400",
    dotBorder: "border-purple-300",
  },
  blue: {
    card: "bg-blue-50",
    title: "text-blue-900",
    subtitle: "text-blue-500",
    value: "text-blue-900",
    valueSub: "text-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    dot: "bg-blue-400",
    dotBorder: "border-blue-300",
  },
  sky: {
    card: "bg-sky-50",
    title: "text-sky-900",
    subtitle: "text-sky-500",
    value: "text-sky-900",
    valueSub: "text-sky-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    dot: "bg-sky-400",
    dotBorder: "border-sky-300",
  },
  green: {
    card: "bg-emerald-50",
    title: "text-emerald-900",
    subtitle: "text-emerald-600",
    value: "text-emerald-900",
    valueSub: "text-emerald-600",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-400",
    dotBorder: "border-emerald-300",
  },
  orange: {
    card: "bg-orange-50",
    title: "text-orange-900",
    subtitle: "text-orange-500",
    value: "text-orange-900",
    valueSub: "text-orange-500",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    dot: "bg-orange-400",
    dotBorder: "border-orange-300",
  },
};

/* ---------- 2. 카테고리 정의 (상단 요약용) ---------- */
const CATEGORIES = [
  { key: "식단", color: "red" },
  { key: "혈압", color: "purple" },
  { key: "혈당", color: "blue" },
  { key: "수분", color: "sky" },
  { key: "복약", color: "green" },
  { key: "운동", color: "orange" },
  { key: "체중", color: "yellow" },
];

/* ---------- 3. 더미 데이터 ---------- */
const dummyData = {
  month: "5월",
  day: "금요일",
  date: "2026년 5월 15일",
  items: [
    {
      id: 1,
      time: "08:15",
      color: "yellow",
      title: "체중 측정",
      value: "58.0kg",
      valueSub: "↓ 0.5kg",
    },
    {
      id: 2,
      time: "08:30",
      color: "red",
      title: "아침 식사",
      value: "450 kcal",
    },
    {
      id: 3,
      time: "09:00",
      color: "purple",
      title: "혈압 측정",
      value: "118/70",
      valueUnit: "mmHg",
    },
    {
      id: 4,
      time: "10:30",
      color: "blue",
      title: "혈당 체크",
      value: "112",
      valueUnit: "mg/dL",
    },
    {
      id: 5,
      time: "11:30",
      color: "sky",
      title: "수분 섭취",
      value: "250ml",
    },
    {
      id: 6,
      time: "13:00",
      color: "green",
      title: "종합 비타민",
      value: "1정",
    },
    {
      id: 7,
      time: "14:00",
      color: "orange",
      title: "운동 (걷기)",
      subtitle: "30분",
      value: "120",
      valueUnit: "kcal",
    },
  ],
};

/* ---------- 4. 아이콘 ---------- */
const Icons = {
  Close: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

/* ---------- 5. 상태 점(dot) — 모두 동일하게 컬러 + 체크 ---------- */
const StatusDot = ({ color }) => {
  const t = COLOR_THEME[color];

  return (
    <div
      className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ${t.dot} ring-4 ring-white`}
    >
      <Icons.Check className="h-3 w-3 text-white" />
    </div>
  );
};

/* ---------- 6. 타임라인 카드 한 줄 ---------- */
const TimelineRow = ({ item, isLast }) => {
  const t = COLOR_THEME[item.color];

  return (
    <div className="relative flex items-stretch">
      {/* 시간 */}
      <div className="flex w-14 shrink-0 items-center justify-end pr-4">
        <span className="text-xs font-semibold text-slate-500">{item.time}</span>
      </div>

      {/* 상태 점 + 세로 라인 */}
      <div className="relative flex w-8 shrink-0 items-center justify-center">
        {!isLast && (
          <div
            className="absolute left-1/2 top-1/2 w-px -translate-x-1/2 bg-slate-200"
            style={{ height: "calc(100% + 12px)" }}
          />
        )}
        <StatusDot color={item.color} />
      </div>

      {/* 카드 본체 */}
      <div
        className={`my-1.5 ml-4 flex h-16 flex-1 items-center justify-between rounded-xl ${t.card} px-4`}
      >
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${t.title}`}>{item.title}</span>
          {item.subtitle && (
            <span className={`mt-0.5 text-xs ${t.subtitle}`}>{item.subtitle}</span>
          )}
        </div>

        {item.value && (
          <div className="flex flex-col items-end">
            <div className={`flex items-baseline gap-1 text-base font-extrabold ${t.value}`}>
              <span>{item.value}</span>
              {item.valueUnit && (
                <span className="text-xs font-semibold">{item.valueUnit}</span>
              )}
            </div>
            {item.valueSub && (
              <span className={`mt-0.5 text-[10px] font-medium ${t.valueSub}`}>
                {item.valueSub}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- 7. 상단 카테고리 요약 ---------- */
const CategorySummary = ({ items }) => {
  // color 값으로 기록 여부 판정 (subtitle보다 안전)
  const recordedColorSet = new Set(items.map((it) => it.color));

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <p className="mb-3 text-xs font-bold text-slate-500">오늘 기록한 항목</p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isRecorded = recordedColorSet.has(cat.color);
          const t = COLOR_THEME[cat.color];

          return (
            <div
              key={cat.key}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition
                ${isRecorded
                  ? `${t.card} ${t.title}`
                  : "bg-white text-slate-300 border border-slate-100"}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isRecorded ? t.dot : "bg-slate-200"
                }`}
              />
              {cat.key}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- 8. 메인 모달 ---------- */
export default function HealthTimelineModal({
  isOpen = true,
  onClose = () => {},
  data = dummyData,
}) {
  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
        style={{ width: 720, maxWidth: "100%", height: 720, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between border-b border-slate-100 px-8 pt-7 pb-5">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{data.date}</h2>
            <p className="text-sm font-semibold text-slate-400">{data.day}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <Icons.Close className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* 상단 카테고리 요약 */}
          <CategorySummary items={data.items || []} />

          {/* 타임라인 */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-bold text-slate-500">
              타임라인 ({(data.items || []).length}건)
            </p>
            {(data.items || []).length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">
                이 날에는 기록이 없습니다.
              </p>
            ) : (
              <div className="flex flex-col">
                {data.items.map((item, idx) => (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    isLast={idx === data.items.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}