import { Check, Circle, Moon, Pill, Sun, Triangle, X } from "lucide-react";
import { weekData } from "./medicationData";

const DEFAULT_DRUGS = ["혈압약", "당뇨약"];

// 데모용 상비약 기록 - 요일/시간대별로 복용했던 상비약
const PRN_RECORDS = {
  "TUE-lunch": ["타이레놀 500mg"],
  "WED-dinner": ["겔포스 1포"],
  "FRI-morning": ["비타민 C"],
};

const getScheduleStatus = (drugs) => {
  if (!drugs || drugs.length === 0) return null;
  const takenCount = drugs.filter((d) => d.taken).length;
  if (takenCount === 0) return null;
  if (takenCount === drugs.length) return "done";
  return "partial";
};

const STATUS_LABEL = {
  done: "복용 완료",
  partial: "부분 복용",
  miss: "미복용",
};

export default function WeeklyCalendarCard({ todaySchedules }) {
  const rows = [
    { key: "morning", label: "아침 (08:00)", icon: Sun },
    { key: "lunch", label: "점심 (13:00)", icon: Sun },
    { key: "dinner", label: "저녁 (21:00)", icon: Moon },
  ];

  const todayStatusMap = todaySchedules
    ? todaySchedules.reduce((acc, s) => {
        acc[s.id] = getScheduleStatus(s.drugs);
        return acc;
      }, {})
    : null;

  const getCellStatus = (item, rowKey) => {
    if (todayStatusMap && item.today) return todayStatusMap[rowKey];
    return item[rowKey];
  };

  // 호버 시 표시할 약 목록: 오늘은 실제 체크 상태, 다른 날은 셀 상태로 추정
  const getCellDrugs = (item, rowKey) => {
    if (todaySchedules && item.today) {
      const s = todaySchedules.find((sch) => sch.id === rowKey);
      return s ? s.drugs.map((d) => ({ name: d.name, taken: d.taken })) : [];
    }
    const status = item[rowKey];
    if (!status || status === "null") return [];
    return DEFAULT_DRUGS.map((name) => ({
      name,
      taken: status === "done",
    }));
  };

  const getCellPrn = (item, rowKey) => PRN_RECORDS[`${item.day}-${rowKey}`] || [];

  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
      <div className="w-full min-w-0">
        {/* 상단 날짜 헤더 */}
        <div className="mb-6 grid grid-cols-7 items-start gap-1">
          {weekData.map((item) => (
            <div key={item.day} className="flex min-w-0 flex-col items-center">
              <span
                className={`mb-1 text-[13px] font-semibold ${
                  item.weekend ? "text-[#E64563]" : "text-gray-500"
                }`}
              >
                {item.day}
              </span>

              <span
                className={`text-[15px] font-bold ${
                  item.weekend ? "text-[#E64563]" : "text-gray-800"
                }`}
              >
                {item.date}
              </span>
            </div>
          ))}
        </div>

        {/* 아침 / 점심 / 저녁 */}
        <div className="space-y-5">
          {rows.map((row) => {
            const RowIcon = row.icon;
            const labelText = row.label.match(/^[^\(]+/)?.[0].trim();
            const timeText = row.label.match(/\([^\)]+\)/)?.[0];

            return (
              <div key={row.key}>
                {/* 아침 / 점심 / 저녁 라벨 */}
                <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-gray-600">
                  <RowIcon className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.8} />
                  <span className="whitespace-nowrap">{labelText}</span>
                  <span className="whitespace-nowrap text-[12px] font-normal text-gray-400">
                    {timeText}
                  </span>
                </div>

                {/* 체크 도형들 */}
                <div className="mb-4 grid grid-cols-7 items-start gap-1">
                  {weekData.map((item, index) => {
                    const status = getCellStatus(item, row.key);
                    const drugs = getCellDrugs(item, row.key);
                    const prn = getCellPrn(item, row.key);
                    const hasContent = drugs.length > 0 || prn.length > 0;

                    return (
                      <div
                        key={`${row.key}-${index}`}
                        className="group relative flex min-w-0 justify-center"
                      >
                        <MedicationStatusIcon status={status} />

                        {hasContent && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-[180px] -translate-x-1/2 rounded-xl bg-[#0F172A] px-3 py-2.5 text-[12px] text-white shadow-xl group-hover:block">
                            <p className="mb-1.5 text-[11px] font-bold text-gray-300">
                              {item.day} {item.date}일 · {row.label.match(/^[^\(]+/)?.[0].trim()}
                              {status && (
                                <span className="ml-1 font-normal text-gray-400">
                                  ({STATUS_LABEL[status] || ""})
                                </span>
                              )}
                            </p>

                            {drugs.length > 0 && (
                              <ul className="space-y-1">
                                {drugs.map((d, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    {d.taken ? (
                                      <Check className="h-3 w-3 text-[#60A5FA]" strokeWidth={3} />
                                    ) : (
                                      <X className="h-3 w-3 text-[#F87171]" strokeWidth={3} />
                                    )}
                                    <span
                                      className={d.taken ? "text-white" : "text-gray-400 line-through"}
                                    >
                                      {d.name}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {prn.length > 0 && (
                              <>
                                <div className="my-2 border-t border-gray-700" />
                                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                                  <Pill className="h-3 w-3" strokeWidth={2.4} /> 상비약
                                </p>
                                <ul className="space-y-1">
                                  {prn.map((name, i) => (
                                    <li key={i} className="text-white">
                                      · {name}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}

                            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-gray-200 pt-6 text-[13px] text-gray-600 sm:gap-x-12">
          <div className="flex items-center gap-2">
            <MedicationStatusIcon status="done" size="sm" />
            <span>복용 완료</span>
          </div>

          <div className="flex items-center gap-2">
            <MedicationStatusIcon status="partial" size="sm" />
            <span>부분 복용</span>
          </div>

          <div className="flex items-center gap-2">
            <MedicationStatusIcon status="miss" size="sm" />
            <span>미복용</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- 내부 상태 아이콘 -------------------- */
function MedicationStatusIcon({ status, size = "md" }) {
  const isSmall = size === "sm";

  const wrapperSize = isSmall ? "h-5 w-5" : "h-9 w-9";
  const checkSize = isSmall ? "h-3 w-3" : "h-5 w-5";
  const triangleSize = isSmall ? "h-3 w-3" : "h-5 w-5";
  const xSize = isSmall ? "h-3 w-3" : "h-5 w-5";

  if (status === "done") {
    return (
      <div
        className={`${wrapperSize} flex items-center justify-center rounded-full bg-[#315BFF]`}
      >
        <Check className={`${checkSize} text-white`} strokeWidth={3} />
      </div>
    );
  }

  if (status === "partial") {
    return (
      <div
        className={`${wrapperSize} flex items-center justify-center rounded-full bg-[#F2A35B]`}
      >
        <Triangle
          className={`${triangleSize} text-[#8A4B14]`}
          strokeWidth={2.4}
        />
      </div>
    );
  }

  if (status === "miss") {
    return (
      <div
        className={`${wrapperSize} flex items-center justify-center rounded-full bg-[#F45074]`}
      >
        <X className={`${xSize} text-gray-800`} strokeWidth={2.8} />
      </div>
    );
  }

  return (
    <div
      className={`${wrapperSize} flex items-center justify-center rounded-full border-2 border-gray-300 bg-white`}
    >
      <Circle
        className={`${isSmall ? "h-2 w-2" : "h-3 w-3"} text-gray-300`}
        strokeWidth={2.5}
      />
    </div>
  );
}