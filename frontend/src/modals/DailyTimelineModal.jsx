import React from "react";

/* ============================================================
 * HealthTimelineModal
 * ------------------------------------------------------------
 * - 1341 × 1278 size
 * - React + TailwindCSS (코어 유틸리티만 사용)
 * - 백엔드 연동 시 `data` props 만 교체하면 됩니다.
 * ============================================================ */

/* ---------- 1. 카테고리별 컬러 테마 매핑 ---------- */
const COLOR_THEME = {
  yellow: {
    card: "bg-amber-50",
    title: "text-amber-900",
    subtitle: "text-amber-500",
    value: "text-amber-900",
    valueSub: "text-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dotFilled: "bg-amber-300",
    dotInner: "bg-amber-500",
    dotBorder: "border-amber-300",
  },
  red: {
    card: "bg-rose-50",
    title: "text-rose-900",
    subtitle: "text-rose-400",
    value: "text-rose-900",
    valueSub: "text-rose-500",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    dotFilled: "bg-rose-500",
    dotInner: "bg-rose-500",
    dotBorder: "border-rose-300",
  },
  purple: {
    card: "bg-purple-50",
    title: "text-purple-900",
    subtitle: "text-purple-400",
    value: "text-purple-900",
    valueSub: "text-purple-500",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    dotFilled: "bg-purple-500",
    dotInner: "bg-purple-500",
    dotBorder: "border-purple-300",
  },
  blue: {
    card: "bg-blue-50",
    title: "text-blue-900",
    subtitle: "text-blue-400",
    value: "text-blue-900",
    valueSub: "text-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    dotFilled: "bg-blue-500",
    dotInner: "bg-blue-500",
    dotBorder: "border-blue-300",
  },
  sky: {
    card: "bg-sky-50",
    title: "text-sky-900",
    subtitle: "text-sky-400",
    value: "text-sky-900",
    valueSub: "text-sky-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    dotFilled: "bg-sky-500",
    dotInner: "bg-sky-500",
    dotBorder: "border-sky-300",
  },
  green: {
    card: "bg-emerald-50",
    title: "text-emerald-900",
    subtitle: "text-emerald-500",
    value: "text-emerald-900",
    valueSub: "text-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    dotFilled: "bg-emerald-500",
    dotInner: "bg-emerald-500",
    dotBorder: "border-emerald-300",
  },
  orange: {
    card: "bg-orange-50",
    title: "text-orange-900",
    subtitle: "text-orange-400",
    value: "text-orange-900",
    valueSub: "text-orange-500",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    dotFilled: "bg-orange-400",
    dotInner: "bg-orange-500",
    dotBorder: "border-orange-300",
  },
};

/* ---------- 2. 더미 데이터 (백엔드 연동 후 교체) ---------- */
const dummyData = {
  month: "5월",
  day: "금요일",
  date: "2026년 5월 15일",
  items: [
    {
      id: 1,
      time: "08:15",
      status: "active",
      color: "yellow",
      title: "체중 측정",
      subtitle: "일상 루틴",
      value: "58.0kg",
      valueSub: "↓ 0.5kg",
    },
    {
      id: 2,
      time: "08:30",
      status: "completed",
      color: "red",
      title: "아침 식사",
      subtitle: "식단",
      value: "450 kcal",
    },
    {
      id: 3,
      time: "09:00",
      status: "completed",
      color: "purple",
      title: "혈압 측정 & 복약",
      subtitle: "혈압 체크",
      value: "118/70",
      valueUnit: "mmHg",
    },
    {
      id: 4,
      time: "10:30",
      status: "completed",
      color: "blue",
      title: "혈당 체크",
      subtitle: "혈당 체크 (식후 1시간)",
      value: "112",
      valueUnit: "mg/dL",
      valueSub: "정상",
    },
    {
      id: 5,
      time: "11:30",
      status: "active",
      color: "sky",
      title: "수분 섭취",
      subtitle: "수분",
      value: "250ml",
      icon: "water",
    },
    {
      id: 6,
      time: "13:00",
      status: "pending",
      color: "green",
      title: "종합 비타민",
      subtitle: "복약 • 1정",
      icon: "pillBottle",
      reminder: true,
    },
    {
      id: 7,
      time: "14:00",
      status: "pending",
      color: "orange",
      title: "운동 (걷기)",
      subtitle: "운동 • 30분",
      value: "120",
      valueUnit: "kcal",
      icon: "dumbbell",
    },
    {
      id: 8,
      time: "18:30",
      status: "pending",
      color: "green",
      title: "오메가-3",
      subtitle: "복약 • 1캡슐",
      icon: "capsule",
      reminder: true,
    },
  ],
};

/* ---------- 3. 아이콘 컴포넌트 ---------- */
const Icons = {
  ArrowLeft: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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
  Bell: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Water: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  PillBottle: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="6" y="3" width="12" height="4" rx="1" />
      <rect x="7" y="7" width="10" height="14" rx="2" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  Dumbbell: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.5 6.5l11 11" />
      <path d="M21 21l-1-1" />
      <path d="M3 3l1 1" />
      <path d="M18 22l4-4" />
      <path d="M2 6l4-4" />
      <path d="M3 10l7-7" />
      <path d="M14 21l7-7" />
    </svg>
  ),
  Capsule: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  ),
};

const ICON_MAP = {
  water: Icons.Water,
  pillBottle: Icons.PillBottle,
  dumbbell: Icons.Dumbbell,
  capsule: Icons.Capsule,
};

/* ---------- 4. 상태 표시용 점(dot) ---------- */
const StatusDot = ({ status, color }) => {
  const t = COLOR_THEME[color];

  if (status === "completed") {
    return (
      <div
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${t.dotFilled} shadow-sm ring-4 ring-white`}
      >
        <Icons.Check className="h-4 w-4 text-white" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${t.dotFilled} shadow-sm ring-4 ring-white`}
      >
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${t.dotBorder} ring-4 ring-white`}
    >
      <div className={`h-2 w-2 rounded-full ${t.dotInner}`} />
    </div>
  );
};

/* ---------- 5. 타임라인 카드 한 줄 ---------- */
const TimelineRow = ({ item, isLast }) => {
  const t = COLOR_THEME[item.color];
  const IconCmp = item.icon ? ICON_MAP[item.icon] : null;

  return (
    <div className="relative flex items-stretch">
      {/* 시간 */}
      <div className="flex w-20 shrink-0 items-center justify-end pr-6">
        <span className="text-sm font-semibold tracking-wide text-gray-500">
          {item.time}
        </span>
      </div>

      {/* 상태 점 + 세로 라인 */}
      <div className="relative flex w-10 shrink-0 items-center justify-center">
        {/* 세로 연결선 (마지막 줄 제외) — inline style 로 calc 처리 */}
        {!isLast && (
          <div
            className="absolute left-1/2 top-1/2 w-px -translate-x-1/2 bg-gray-200"
            style={{ height: "calc(100% + 24px)" }}
          />
        )}
        <StatusDot status={item.status} color={item.color} />
      </div>

      {/* 카드 본체 */}
      <div
        className={`my-3 flex flex-1 items-center justify-between rounded-2xl ${t.card} px-7 py-5`}
      >
        <div className="flex items-center gap-4">
          {IconCmp && (
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.iconBg}`}
            >
              <IconCmp className={`h-5 w-5 ${t.iconColor}`} />
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${t.title}`}>{item.title}</span>
            <span className={`mt-0.5 text-sm ${t.subtitle}`}>
              {item.subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          {item.reminder && !item.value ? (
            <Icons.Bell className={`h-5 w-5 ${t.iconColor}`} />
          ) : item.value ? (
            <div className="flex flex-col items-end">
              <div
                className={`flex items-baseline gap-1 text-xl font-extrabold ${t.value}`}
              >
                <span>{item.value}</span>
                {item.valueUnit && (
                  <span className="text-sm font-semibold">
                    {item.valueUnit}
                  </span>
                )}
              </div>
              {item.valueSub && (
                <span className={`mt-0.5 text-xs font-medium ${t.valueSub}`}>
                  {item.valueSub}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* ---------- 6. 메인 모달 컴포넌트 ---------- */
export default function DailyTimelineModal({
  isOpen = true,
  onClose = () => {},
  data = dummyData,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 모달 본체 — 1341 × 1278, 모서리 40px 는 inline style */}
      <div
        className="relative overflow-hidden bg-white shadow-2xl"
        style={{ width: 1000, height: 700, borderRadius: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full w-full overflow-y-auto px-20 pb-16 pt-14">
          <button
            onClick={onClose}
            className="mb-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="닫기"
          >
            <Icons.ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="mb-14 text-6xl font-black tracking-tight text-gray-900">
            {data.month}
          </h1>

          <div className="mb-6 flex items-baseline pl-4">
            <div className="w-20 pr-6 text-right">
              <span className="text-base font-bold text-gray-700">
                {data.day}
              </span>
            </div>
            <div className="pl-10">
              <span className="text-base font-medium text-gray-500">
                {data.date}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            {data.items.map((item, idx) => (
              <TimelineRow
                key={item.id}
                item={item}
                isLast={idx === data.items.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 사용 예시
 * ------------------------------------------------------------
 *  import HealthTimelineModal from "./HealthTimelineModal";
 *
 *  function App() {
 *    const [open, setOpen] = useState(false);
 *
 *    // 백엔드 연동 시:
 *    // const [data, setData] = useState(null);
 *    // useEffect(() => {
 *    //   fetch("/api/timeline?date=2024-08-28")
 *    //     .then(r => r.json())
 *    //     .then(setData);
 *    // }, []);
 *
 *    return (
 *      <>
 *        <button onClick={() => setOpen(true)}>타임라인 열기</button>
 *        <HealthTimelineModal isOpen={open} onClose={() => setOpen(false)} />
 *      </>
 *    );
 *  }
 * ============================================================ */
