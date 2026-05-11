import { useMemo } from "react";

const MacroBadge = ({ label, value, unit = "g", bgColor, textColor }) => (
  <span
    className={`inline-flex w-14 items-center justify-center gap-1 rounded-[10px] px-1.5 py-1 text-[11px] font-[500] ${bgColor} ${textColor}`}
  >
    <span className="font-[800]">{label}</span>
    <span>
      {value}
      {unit}
    </span>
  </span>
);

const MealRecordCard = ({ time, label, items, image, className = "" }) => {
  const visibleItems = items.slice(0, 2);
  const hiddenCount = items.length - 2;

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        kcal: acc.kcal + (item.kcal || 0),
        carb: acc.carb + (item.carb || 0),
        protein: acc.protein + (item.protein || 0),
        fat: acc.fat + (item.fat || 0),
        sugar: acc.sugar + (item.sugar || 0),
        chol: acc.chol + (item.chol || 0),
        na: acc.na + (item.na || 0)
      }),
      { kcal: 0, carb: 0, protein: 0, fat: 0, sugar: 0, chol: 0, na: 0 },
    );
  }, [items]);

  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Meal Image Header */}
      <div className="h-[180px] relative">
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-cover" />
        ) : (
          <img
            src={"https://cdn-icons-png.flaticon.com/512/1405/1405021.png"}
            alt={label}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30 p-3 flex flex-col justify-end">
          <span className="text-[16px] text-white/70 font-medium">{time}</span>
          <span className="text-[20px] font-bold text-white">{label}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          {visibleItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-b-0"
            >
              <span className="min-w-0 truncate text-[16px] font-[700] text-gray-800">
                {item.name}
              </span>

              <span className="ml-3 shrink-0 text-[15px] font-[700] text-[#393939]">
                {item.kcal} kcal
              </span>
            </div>
          ))}
        </div>

        {hiddenCount > 0 ? (
          <p className="mt-1 mb-3 text-[12px] font-[500] text-gray-400">
            외 {hiddenCount}개
          </p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#3a3a3a]">합계</span>

            <span className="text-lg font-bold text-[#425cdd]">
              {totals.kcal} kcal
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            <MacroBadge
              label="탄"
              value={totals.carb}
              bgColor="bg-slate-100"
              textColor="text-slate-400"
            />

            <MacroBadge
              label="단"
              value={totals.protein}
              bgColor="bg-cyan-50"
              textColor="text-cyan-500"
            />

            <MacroBadge
              label="지"
              value={totals.fat}
              bgColor="bg-orange-50"
              textColor="text-orange-400"
            />

            <MacroBadge
              label="당"
              value={totals.sugar}
              bgColor="bg-pink-50"
              textColor="text-pink-400"
            />

            <MacroBadge
              label="콜"
              value={totals.chol}
              bgColor="bg-indigo-50"
              textColor="text-indigo-400"
              unit="mg"
            />

            <MacroBadge
              label="나"
              value={totals.na}
              bgColor="bg-yellow-50"
              textColor="text-yellow-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealRecordCard;
