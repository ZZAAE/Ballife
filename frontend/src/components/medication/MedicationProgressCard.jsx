export default function MedicationProgressCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-[16px] text-gray-400 mb-3">오늘의 복용 이행률</p>
      <p className="text-[45px] font-extrabold text-gray-900 leading-none mb-4">75 %</p>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[8px] bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "75%" }} />
        </div>

        <span className="text-[12px] text-[#2563EB] font-semibold bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
          3/4 복용 완료
        </span>
      </div>
    </div>
  );
}