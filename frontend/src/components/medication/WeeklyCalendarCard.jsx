import { Moon, Sun } from "lucide-react";
import { weekData } from "./medicationData";

export default function WeeklyCalendarCard() {
  const rows = [
    { key: "morning", label: "아침 (08:00)", icon: Sun },
    { key: "lunch", label: "점심 (13:00)", icon: Sun },
    { key: "dinner", label: "저녁 (21:00)", icon: Moon },
  ];

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 lg:p-7 shadow-sm border border-gray-100 overflow-x-auto">
      <div className="min-w-[720px]">
        {/* 상단 날짜 헤더 */}
        <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] items-start mb-8">
          <div />
          {weekData.map((item) => (
            <div key={item.day} className="flex flex-col items-center">
              <span
                className={`text-[13px] font-semibold mb-1 ${
                  item.today
                    ? "text-gray-500"
                    : item.weekend
                      ? "text-[#E64563]"
                      : "text-gray-500"
                }`}
              >
                {item.day}
              </span>

              <span
                className={`text-[15px] font-bold ${
                  item.today
                    ? "text-gray-800"
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
        <div className="space-y-10">
          {rows.map((row) => {
            const RowIcon = row.icon;

            return (
              <div
                key={row.key}
                className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] items-center"
              >
                <div className="flex items-center gap-2 text-[14px] text-gray-600 font-semibold">
                  <RowIcon
                    className="w-4 h-4 text-gray-400"
                    strokeWidth={1.8}
                  />
                  <span>{row.label}</span>
                </div>

                {weekData.map((item, index) => (
                  <div
                    key={`${row.key}-${index}`}
                    className="flex justify-center"
                  >
                    <MedicationStatusIcon status={item[row.key]} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-center gap-20 text-[13px] text-gray-600">
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

  if (isSmall) {
    if (status === "done") {
      return (
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#315BFF" />
          <path
            d="M13.5 20.5L17.5 24.5L26.5 15.5"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (status === "partial") {
      return (
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#F2A35B" />
          <path
            d="M20 12L28 26H12L20 12Z"
            stroke="#8A4B14"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    }

    if (status === "miss") {
      return (
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#F45074" />
          <path
            d="M14.5 14.5L25.5 25.5M25.5 14.5L14.5 25.5"
            stroke="#1F2937"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    return (
      <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
        <circle
          cx="20"
          cy="20"
          r="13.5"
          stroke="#D1D5DB"
          strokeWidth="2.3"
          fill="white"
        />
        <circle
          cx="20"
          cy="20"
          r="5.3"
          stroke="#D1D5DB"
          strokeWidth="2"
          fill="white"
        />
      </svg>
    );
  }

  if (status === "done") {
    return (
      <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#315BFF" />
        <path
          d="M12.8 20.3L17.4 24.9L27.2 15.1"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "partial") {
    return (
      <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#F2A35B" />
        <path
          d="M20 12L28 26H12L20 12Z"
          stroke="#8A4B14"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  if (status === "miss") {
    return (
      <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#F45074" />
        <path
          d="M14.5 14.5L25.5 25.5M25.5 14.5L14.5 25.5"
          stroke="#1F2937"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
      <circle
        cx="20"
        cy="20"
        r="14.5"
        stroke="#D1D5DB"
        strokeWidth="2.2"
        fill="white"
      />
      <circle
        cx="20"
        cy="20"
        r="6"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="white"
      />
    </svg>
  );
}