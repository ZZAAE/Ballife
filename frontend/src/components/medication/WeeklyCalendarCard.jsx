import { Check, Circle, Moon, Sun, Triangle, X } from "lucide-react";
import { weekData } from "./medicationData";

export default function WeeklyCalendarCard() {
  const rows = [
    { key: "morning", label: "아침 (08:00)", icon: Sun },
    { key: "lunch", label: "점심 (13:00)", icon: Sun },
    { key: "dinner", label: "저녁 (21:00)", icon: Moon },
  ];

  const calendarGridStyle = {
    gridTemplateColumns: "minmax(128px, 156px) repeat(7, minmax(0, 1fr))",
  };

  return (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="w-full">
        {/* 상단 날짜 헤더 */}
        <div
          className="mb-8 grid min-h-[90px] items-center gap-x-4 rounded-xl px-2 py-3"
          style={calendarGridStyle}
        >
          <div />
          {weekData.map((item) => (
            <div
              key={item.day}
              className="flex h-full flex-col items-center justify-center pt-3"
            >
              <span
                className={`mb-2 text-[14px] font-semibold tracking-[0.04em] ${
                  item.weekend ? "text-[#E64563]" : "text-gray-500"
                }`}
              >
                {item.day}
              </span>

              <span
                className={`text-[18px] font-bold leading-none ${
                  item.weekend ? "text-[#E64563]" : "text-gray-800"
                }`}
              >
                {item.date}
              </span>
            </div>
          ))}
        </div>

        {/* 아침 / 점심 / 저녁 */}
        <div className="space-y-4">
          {rows.map((row) => {
            const RowIcon = row.icon;
            const labelText = row.label.match(/^[^(]+/)?.[0].trim();
            const timeText = row.label.match(/\([^)]+\)/)?.[0];

            return (
              <div
                key={row.key}
                className="grid min-h-[82px] items-center gap-x-4"
                style={calendarGridStyle}
              >
                <div className="flex min-w-0 items-center justify-center gap-4 pt-2 text-[22px] font-semibold text-gray-600">
                  <div className="flex items-center gap-3 whitespace-nowrap text-[#374151]">
                    <RowIcon
                      className="h-[18px] w-[18px] text-gray-400"
                      strokeWidth={1.8}
                    />
                    <span>{labelText}</span>
                  </div>

                  <span className="whitespace-nowrap text-center text-[14px] font-medium text-gray-400">
                    {timeText}
                  </span>
                </div>

                {weekData.map((item, index) => (
                  <div
                    key={`${row.key}-${index}`}
                    className="flex justify-center py-2"
                  >
                    <MedicationStatusIcon status={item[row.key]} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-16 gap-y-4 border-t border-gray-200 pt-10 text-[15px] font-medium text-gray-600">
          <div className="flex items-center gap-3.5">
            <MedicationStatusIcon status="done" size="sm" />
            <span>복용 완료</span>
          </div>

          <div className="flex items-center gap-3.5">
            <MedicationStatusIcon status="partial" size="sm" />
            <span>부분 복용</span>
          </div>

          <div className="flex items-center gap-3.5">
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
