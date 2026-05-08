import { Search, X, Pill, PlusSquare } from "lucide-react";

const medicineList = [
  {
    id: 1,
    name: "아스피린 100mg",
    subText: "항혈소판제",
    dosage: "500mg",
    type: "blue",
  },
  {
    id: 2,
    name: "리피토 정 10mg",
    subText: "고지혈증 치료제",
    dosage: "250mg",
    type: "orange",
  },
  {
    id: 3,
    name: "리피토 정 10mg",
    subText: "고지혈증 치료제",
    dosage: "250mg",
    type: "orange",
  },
  {
    id: 4,
    name: "리피토 정 10mg",
    subText: "고지혈증 치료제",
    dosage: "250mg",
    type: "orange",
  },
];

function MedicineIcon({ type }) {
  if (type === "blue") {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
        <Pill className="w-4 h-4 text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] flex items-center justify-center">
      <PlusSquare className="w-4 h-4 text-[#C2410C]" />
    </div>
  );
}

export default function SearchMedicineModal({
  open,
  onClose,
  onSelectMedicine,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[760px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* 상단 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-[28px] font-semibold text-gray-800">검색</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-8 py-8">
          {/* 검색 영역 */}
          <div className="mb-8">
            <label className="block text-[14px] font-semibold text-gray-600 mb-3">
              약물 이름 검색
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="약물 이름을 입력하거나 선택하세요"
                className="w-full h-[52px] rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#2563EB] outline-none pl-11 pr-4 text-[14px] text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* 복용 상세 정보 */}
          <div>
            <p className="text-[14px] font-semibold text-gray-600 mb-3">
              복용 상세 정보
            </p>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {/* 헤더 */}
              <div className="grid grid-cols-[1.6fr_0.8fr] bg-[#F8FAFC] px-6 py-4 border-b border-gray-200">
                <span className="text-[12px] font-semibold text-gray-400">
                  이름
                </span>
                <span className="text-[12px] font-semibold text-gray-400 text-right">
                  용량 (MG/PILL)
                </span>
              </div>

              {/* 리스트 */}
              {medicineList.map((medicine, index) => (
                <button
                  key={medicine.id}
                  type="button"
                  onClick={() => onSelectMedicine?.(medicine)}
                  className={`w-full grid grid-cols-[1.6fr_0.8fr] items-center px-6 py-5 text-left hover:bg-gray-50 transition ${
                    index !== medicineList.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <MedicineIcon type={medicine.type} />

                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-gray-900 truncate">
                        {medicine.name}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-1">
                        {medicine.subText}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[15px] font-semibold text-gray-700">
                    {medicine.dosage}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}