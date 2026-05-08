function RecordTabs() {
  return (
    <div className="border-b border-gray-200">
      <div className="grid grid-cols-2 text-center text-xs">
        <button className="border-b-2 border-[#2563eb] py-4 font-semibold text-[#2563eb]">
          무산소
        </button>
        <button className="py-4 text-gray-500">유산소</button>
      </div>
    </div>
  );
}

export default RecordTabs;
