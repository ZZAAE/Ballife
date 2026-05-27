import { useState } from "react";
import SearchMedicineModal from "../../modals/SearchMedicineModal";

export default function MedicationRecordCard({
  drugName,
  setDrugName,
  dosage,
  setDosage,
  time,
  setTime,
  date,
  setDate,
  onSaveRecord,
}) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleSelectMedicine = (medicine) => {
    setDrugName(medicine.name);
    setDosage(medicine.dosage);
    setIsSearchModalOpen(false);
  };

  return (
    <>
      <div className="bg-[#1B1F2A] rounded-2xl p-4 sm:p-5 lg:p-6 text-white flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base sm:text-lg">📝</span>
          <span className="text-[15px] sm:text-[16px] font-bold">
            직접 기록하기
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed mb-4">
          상비약 복용 시 기록해주세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              약 이름
            </label>
            <input
              type="text"
              placeholder="예: 비타민 C, 타이레놀"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="w-full h-[40px] sm:h-[42px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white placeholder-gray-500 outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              복용량
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full h-[40px] sm:h-[42px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              복용 날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[40px] sm:h-[42px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white outline-none [color-scheme:dark]"
            />
          </div>

          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              복용 시간
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-[40px] sm:h-[42px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white placeholder-gray-500 outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={openSearchModal}
            className="flex-1 h-[42px] sm:h-[44px] bg-white text-[#1B1F2A] rounded-xl text-[13px] sm:text-[14px] font-bold hover:bg-gray-100 transition-colors"
          >
            약 추가하기
          </button>
          <button
            type="button"
            onClick={onSaveRecord}
            className="flex-1 h-[42px] sm:h-[44px] bg-primary-600 text-white rounded-xl text-[13px] sm:text-[14px] font-bold hover:bg-primary-700 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>

      <SearchMedicineModal
        open={isSearchModalOpen}
        onClose={closeSearchModal}
        onSelectMedicine={handleSelectMedicine}
      />
    </>
  );
}