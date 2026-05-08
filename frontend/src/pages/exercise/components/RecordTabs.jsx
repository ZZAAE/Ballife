function RecordTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "anaerobic", label: "무산소" },
    { key: "aerobic", label: "유산소" },
  ];

  return (
    <div className="border-b border-gray-200">
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
                  ? "border-b-2 border-[#2563eb] py-4 font-semibold text-[#2563eb]"
                  : "py-4 text-gray-500"
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
