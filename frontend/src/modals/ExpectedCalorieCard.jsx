function ExpectedCalorieCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-l-4 border-blue-500 bg-gray-100/80 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <span className="text-xl">🔥</span>
      </div>

      <div>
        <p className="text-[11px] font-medium text-gray-500">
          예상 소모 칼로리
        </p>
        <p className="text-xl font-bold text-gray-900">
          {/* 142 */}
          <span className="text-sm font-normal text-gray-500">kcal</span>
        </p>
      </div>
    </div>
  );
}

export default ExpectedCalorieCard;
