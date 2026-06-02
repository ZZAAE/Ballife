import { FileText } from "lucide-react";

const defaultPrescriptions = [
  {
    id: 1,
    groupName: "혈압약",
    dosage: "1정",
    scheduleLabel: "아침 · 점심 · 저녁",
  },
  {
    id: 2,
    groupName: "당뇨약",
    dosage: "3정",
    scheduleLabel: "아침 · 점심 · 저녁",
  },
];

export default function PrescriptionListCard({
  prescriptions = defaultPrescriptions,
  onSelectGroup,
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 md:px-8 pt-7 pb-5">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
          나의 처방 약 목록
        </h2>
      </div>

      <div className="bg-[#EAF3FF] border-y border-[#D6E6FF]">
        <div className="grid grid-cols-3 items-center py-4">
          <div className="pl-4 md:pl-10 text-[14px] font-semibold text-gray-600">약 그룹</div>
          <div className="px-2 md:px-6 text-[14px] font-semibold text-gray-600 text-center">
            복용량
          </div>
          <div className="pr-4 md:pr-10 text-[14px] font-semibold text-gray-600 text-right">
            복용일정
          </div>
        </div>
      </div>

      <div className="py-2">
        {prescriptions.length === 0 && (
          <div className="py-10 text-center text-[15px] text-gray-400">
            처방된 약이 없습니다.
          </div>
        )}
        {prescriptions.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectGroup(item)}
            className={`w-full grid grid-cols-3 items-center py-7 text-left hover:bg-gray-50 transition ${
              index !== prescriptions.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="pl-4 md:pl-10 pr-4 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[10px] bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-[15px] font-semibold text-gray-900 truncate">
                {item.groupName}
              </span>
            </div>

            <div className="px-2 md:px-6 text-center text-[15px] text-gray-700">
              {item.dosage}
            </div>

            <div className="pr-4 md:pr-10 pl-4 text-right text-[15px] font-semibold text-gray-900">
              {item.scheduleLabel ?? "-"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}