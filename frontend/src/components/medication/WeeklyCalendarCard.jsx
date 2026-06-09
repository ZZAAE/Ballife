import { Check, Circle, Moon, Pill, Sun, Triangle, X } from "lucide-react";
import { getCurrentWeekData } from "./medicationData";


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

// 시간 문자열(HH:MM)을 아침/점심/저녁/취침전 슬롯으로 매핑. 시간이 없으면 morning으로 기본
const getTimeSlot = (timeStr) => {
  if (!timeStr) return "morning";
  const [hh] = timeStr.split(":");
  const h = parseInt(hh, 10);
  if (Number.isNaN(h)) return "morning";
  if (h < 11) return "morning";
  if (h < 17) return "lunch";
  if (h < 22) return "dinner";
  return "bedtime";
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 과거 날짜용 상태 계산: 하루가 지난 슬롯은 복용 0개를 미복용(miss)으로 굳힌다.
// (오늘은 아직 진행 중이라 getScheduleStatus 가 null 을 반환 — 빈 원으로 둔다)
const getPastStatus = (drugs) => {
  if (!drugs || drugs.length === 0) return null;
  const takenCount = drugs.filter((d) => d.taken).length;
  if (takenCount === drugs.length) return "done";
  if (takenCount === 0) return "miss";
  return "partial";
};

export default function WeeklyCalendarCard({
  todaySchedules,
  prnRecords = [],
  todayKey,
  drugNames = [],
  savedSchedulesByDate = {},
}) {
  const weekData = getCurrentWeekData(todayKey ? new Date(todayKey + "T00:00:00") : new Date());

  const rows = [
    { key: "morning", label: "아침 (08:00)", icon: Sun },
    { key: "lunch", label: "점심 (13:00)", icon: Sun },
    { key: "dinner", label: "저녁 (21:00)", icon: Moon },
    { key: "bedtime", label: "취침전 (23:00)", icon: Moon },
  ];

  const todayStatusMap = todaySchedules
    ? todaySchedules.reduce((acc, s) => {
        acc[s.id] = getScheduleStatus(s.drugs);
        return acc;
      }, {})
    : null;

  const getCellStatus = (item, rowKey, cellIndex) => {
    if (todayStatusMap && item.today) return todayStatusMap[rowKey];
    const cellDate = getCellDateKey(cellIndex);
    // 지난 날짜는 실제 저장 기록 기준. 기록이 있으면 그대로,
    // 복용 확인을 안 눌러 기록이 없으면 미복용(miss)으로 굳힌다.
    if (cellDate && cellDate < todayKey) {
      const slot = getSavedSlot(item, rowKey, cellIndex);
      // 그날 복용할 약이 있었을 때만 판정. 등록 전(약 없음)이면 빈 칸(null).
      return slot ? getPastStatus(slot.drugs) : null;
    }
    return item[rowKey];
  };

  // 호버 시 표시할 약 목록: 오늘은 실제 체크 상태, 과거는 저장 일정(없으면 미복용으로 간주)
  const getCellDrugs = (item, rowKey, cellIndex) => {
    if (todaySchedules && item.today) {
      const s = todaySchedules.find((sch) => sch.id === rowKey);
      return s ? s.drugs.map((d) => ({ name: d.name, taken: d.taken })) : [];
    }
    const slot = getSavedSlot(item, rowKey, cellIndex);
    if (slot) return slot.drugs.map((d) => ({ name: d.name, taken: d.taken }));
    return [];
  };

  // 각 셀의 실제 날짜를 today 기준 인덱스 오프셋으로 계산
  const todayIndex = weekData.findIndex((it) => it.today);
  const todayDate = todayKey ? new Date(todayKey + "T00:00:00") : null;

  const getCellDateKey = (cellIndex) => {
    if (todayIndex < 0 || !todayDate) return null;
    const offset = cellIndex - todayIndex;
    const d = new Date(todayDate);
    d.setDate(d.getDate() + offset);
    return formatDateKey(d);
  };

  // 해당 날짜의 일정 슬롯을 찾는다 (오늘은 라이브 상태를 따로 쓰므로 제외).
  // 과거: 저장된 복용 기록 / 미래: 등록일 이후 예정된 약.
  const getSavedSlot = (item, rowKey, cellIndex) => {
    if (item.today) return null;
    const cellDate = getCellDateKey(cellIndex);
    if (!cellDate || cellDate === todayKey) return null;
    const saved = savedSchedulesByDate[cellDate];
    if (!Array.isArray(saved)) return null;
    return saved.find((s) => s.id === rowKey) ?? null;
  };

  const getCellPrn = (item, rowKey, cellIndex) => {
    const cellDate = getCellDateKey(cellIndex);
    if (!cellDate || prnRecords.length === 0) return [];
    return prnRecords
      .filter((r) => r.date === cellDate && getTimeSlot(r.time) === rowKey)
      .map((r) => (r.dosage ? `${r.drugName} (${r.dosage})` : r.drugName));
  };

  return (
    <div className="flex-1 min-w-0 bg-white p-4 lg:p-5">
      <div className="w-full min-w-0">
        {/* 상단 날짜 헤더 */}
        <div className="mb-6 grid grid-cols-7 items-start gap-1">
          {weekData.map((item) => (
            <div key={item.day} className="flex min-w-0 flex-col items-center">
              <span
                className={`mb-1 text-[13px] font-semibold ${
                  item.day === "SUN"
                    ? "text-[#315BFF]"
                    : item.weekend
                    ? "text-[#E64563]"
                    : "text-gray-500"
                }`}
              >
                {item.day}
              </span>

              <span
                className={`text-[15px] font-bold ${
                  item.day === "SUN"
                    ? "text-[#315BFF]"
                    : item.weekend
                    ? "text-[#E64563]"
                    : "text-gray-800"
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
            const labelText = row.label.match(/^[^(]+/)?.[0].trim();
            const timeText = row.label.match(/\([^)]+\)/)?.[0];

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
                    const status = getCellStatus(item, row.key, index);
                    const drugs = getCellDrugs(item, row.key, index);
                    const prn = getCellPrn(item, row.key, index);
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
                              {item.day} {item.date}일 · {row.label.match(/^[^(]+/)?.[0].trim()}
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-gray-200 pt-4 text-[13px] text-gray-600 sm:gap-x-12">
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