import { useState } from "react";
import SearchMedicineModal from "../../modals/SearchMedicineModal";

export default function MedicationRecordCard({
  drugName,
  setDrugName,
  dosage,
  setDosage,
  time,
  setTime,
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
      <div className="bg-[#1B1F2A] rounded-2xl p-4 sm:p-5 lg:p-6 text-white flex flex-col h-auto xl:min-h-[270px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base sm:text-lg">📝</span>
          <span className="text-[15px] sm:text-[16px] font-bold">
            직접 기록하기
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed mb-5 sm:mb-6">
          상비약 복용 시 기록해주세요.
        </p>

        <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5">
          약 이름
        </label>
        <input
          type="text"
          placeholder="예: 비타민 C, 타이레놀"
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          className="w-full h-[42px] sm:h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white placeholder-gray-500 outline-none mb-4 sm:mb-5"
        />

        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              복용량
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full h-[42px] sm:h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1.5 block">
              복용 시간
            </label>
            <input
              type="text"
              placeholder="--:-- --"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-[42px] sm:h-[44px] bg-[#2A2F3F] rounded-lg px-4 text-[12px] sm:text-[13px] text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={openSearchModal}
            className="w-full h-[46px] sm:h-[48px] bg-white text-[#1B1F2A] rounded-xl text-[13px] sm:text-[14px] font-bold hover:bg-gray-100 transition-colors"
          >
            약 추가하기
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
