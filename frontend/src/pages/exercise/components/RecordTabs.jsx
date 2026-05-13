function RecordTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "anaerobic", label: "무산소" },
    { key: "aerobic", label: "유산소" },
  ];

  return (
    <div className="border-b border-[#E7E7E7]">
      <div className="grid grid-cols-2 text-center text-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange?.(tab.key)}
              className={
                isActive
                  ? "border-b-2 border-[#252A31] py-4 font-semibold text-[#252A31]"
                  : "py-4 text-[#8D949E]"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RecordTabs;
