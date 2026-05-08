function ExerciseModalTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-100 px-8">
      <button
        onClick={() => setActiveTab("anaerobic")}
        className={`flex-1 py-4 text-sm font-semibold transition-all ${
          activeTab === "anaerobic"
            ? "border-b-2 border-blue-600 bg-blue-50/30 text-blue-600"
            : "text-gray-400 hover:bg-gray-50"
        }`}
      >
        무산소 (Anaerobic)
      </button>

      <button
        onClick={() => setActiveTab("aerobic")}
        className={`flex-1 py-4 text-sm font-semibold transition-all ${
          activeTab === "aerobic"
            ? "border-b-2 border-blue-600 bg-blue-50/30 text-blue-600"
            : "text-gray-400 hover:bg-gray-50"
        }`}
      >
        유산소 (Aerobic)
      </button>
    </div>
  );
}

export default ExerciseModalTabs;
