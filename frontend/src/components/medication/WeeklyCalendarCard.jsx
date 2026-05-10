import { Check, Circle, Moon, Sun, Triangle, X } from "lucide-react";
import { weekData } from "./medicationData";

export default function WeeklyCalendarCard() {
  const rows = [
    { key: "morning", label: "아침 (08:00)", icon: Sun },
    { key: "lunch", label: "점심 (13:00)", icon: Sun },
    { key: "dinner", label: "저녁 (21:00)", icon: Moon },
  ];

  return (
    <div className="flex-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
      <div className="min-w-[600px]">
        {/* 상단 날짜 헤더 */}
        <div className="mb-6 grid grid-cols-[repeat(7,85px)] items-start justify-center">
          {weekData.map((item) => (
            <div key={item.day} className="flex flex-col items-center">
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
                <div className="mb-1 grid grid-cols-[repeat(7,85px)] items-center justify-center">
                  <div className="flex items-center justify-between gap-2 text-[14px] font-semibold text-gray-600">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <RowIcon className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
                      <span>{labelText}</span>
                    </div>

                    <span className="w-[50px] whitespace-nowrap text-right text-[12px] text-gray-400">
                      {timeText}
                    </span>
                  </div>
                </div>

                {/* 체크 도형들 */}
                <div className="mb-6 grid grid-cols-[repeat(7,85px)] items-start justify-center">
                  {weekData.map((item, index) => (
                    <div key={`${row.key}-${index}`} className="flex justify-center">
                      <MedicationStatusIcon status={item[row.key]} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-20 border-t border-gray-200 pt-8 text-[13px] text-gray-600">
          <div className="flex items-center gap-3">
            <MedicationStatusIcon status="done" size="sm" />
            <span>복용 완료</span>
          </div>

          <div className="flex items-center gap-3">
            <MedicationStatusIcon status="partial" size="sm" />
            <span>부분 복용</span>
          </div>

          <div className="flex items-center gap-3">
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