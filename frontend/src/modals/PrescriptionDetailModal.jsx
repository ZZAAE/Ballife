import { Pencil, Trash2, X } from "lucide-react";

const prescriptionDetailMap = {
  1: {
    groupName: "혈압약",
    medicines: [
      {
        id: 101,
        name: "암로디핀정 5mg",
        purpose: "혈압 조절",
        dosageText: "1일 1회, 식후 복용",
        imageType: "white",
      },
      {
        id: 102,
        name: "로사르탄정 50mg",
        purpose: "혈압 안정화",
        dosageText: "1일 1회, 아침 식후 복용",
        imageType: "pink",
      },
    ],
  },
  2: {
    groupName: "당뇨약",
    medicines: [
      {
        id: 201,
        name: "다이아벡스정 500mg",
        purpose: "혈당 강하제",
        dosageText: "1일 2회, 식사 직후 복용",
        imageType: "whiteBlue",
      },
      {
        id: 202,
        name: "자누비아정 100mg",
        purpose: "인슐린 분비 조절",
        dosageText: "1일 1회, 식사와 관계없이 복용",
        imageType: "yellow",
      },
      {
        id: 203,
        name: "아마릴정 2mg",
        purpose: "인슐린 분비 촉진",
        dosageText: "1일 1회, 아침 식전 또는 직후",
        imageType: "green",
      },
    ],
  },
};

function MedicineThumb({ type }) {
  if (type === "yellow") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F2C36A]" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F2C36A]" />
      </div>
    );
  }

  if (type === "green") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 rounded-full bg-[#9DB37A] rotate-[-10deg]" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-4 rounded-full bg-[#9DB37A] rotate-[10deg]" />
      </div>
    );
  }

  if (type === "whiteBlue") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F3F4F6] border border-gray-200" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EAF2FF] border border-blue-100" />
      </div>
    );
  }

  if (type === "pink") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8D7DA] border border-pink-200" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
      </div>
    );
  }

  return (
    <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
    </div>
  );
}

export default function PrescriptionDetailModal({ open, group, onClose }) {
  if (!open || !group) return null;

  const detailData = prescriptionDetailMap[group.id];

  if (!detailData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[900px] rounded-2xl bg-[#F3F4F6] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-8 pt-8 pb-6">
          <div>
            <h2 className="text-[30px] font-semibold text-gray-700 leading-tight">
              나의 [{detailData.groupName}] 처방 목록
            </h2>
            <p className="mt-2 text-[14px] text-gray-400">
              총 {detailData.medicines.length}개의 약이 처방되어 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-5">
          {detailData.medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-2xl px-5 py-5 shadow-sm flex items-center gap-5"
            >
              <MedicineThumb type={medicine.imageType} />

              <div className="flex-1 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-[#2563EB] uppercase mb-1">
                    Medication Name
                  </p>
                  <p className="text-[18px] font-semibold text-gray-800">
                    {medicine.name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase mb-1">
                    Purpose
                  </p>
                  <p className="text-[15px] text-gray-700">{medicine.purpose}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase mb-1">
                    Dosage
                  </p>
                  <p className="text-[15px] text-gray-700 whitespace-pre-line">
                    {medicine.dosageText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" className="text-red-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}