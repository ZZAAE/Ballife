import { useMemo } from "react";

const MacroBadge = ({ label, value, unit = "g", textColor }) => (
  <span
    className={`inline-flex items-center justify-center gap-1.5 text-[12px] ${textColor} bg-slate-50 rounded w-14 py-0.5`}
  >
    <span className={`${textColor} font-bold `}>{label}</span> {value}
    {unit}
  </span>
);

const MealRecordCard = ({ time, label, items, image, onClick, className = "" }) => {
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
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Meal Image Header */}
      <div className="h-48 relative">
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
          <span className="text-[10px] text-white/70 font-medium">{time}</span>
          <span className="text-lg font-bold text-white">{label}</span>
        </div>
      </div>

      <div className="p-3.5">
        {visibleItems.map((item, i) => (
          <div key={i} className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-800">
                {item.name}
              </span>
              <span className="text-xs font-bold text-blue-600">
                {item.kcal} kcal
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              <MacroBadge
                label="탄"
                value={item.carb}
                textColor={`text-slate-400`}
              />
              <MacroBadge
                label="단"
                value={item.protein}
                textColor={`text-cyan-500`}
              />
              <MacroBadge
                label="지"
                value={item.fat}
                textColor={`text-orange-400`}
              />
              <MacroBadge
                label="당"
                value={item.sugar}
                textColor={`text-pink-400`}
              />
              <MacroBadge
                label="콜"
                value={item.chol}
                textColor={`text-indigo-400`}
                unit="mg"
              />
              <MacroBadge
                label="나"
                value={item.na}
                textColor={`text-yellow-500`}
              />
            </div>
          </div>
        ))}

        {hiddenCount > 0 ? (
          <p className="text-[11px] text-gray-400 mb-2">외 {hiddenCount}개</p>
        ) : (
          <p className="text-[11px] text-gray-400 mb-2">&nbsp;</p>
        )}

        {/* Total */}
        <div className="border-t border-gray-100 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">합계</span>
            <span className="text-lg font-bold text-gray-900">
              {totals.kcal} kcal
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <MacroBadge label="탄" value={totals.carb} textColor={`text-slate-400`}/>
            <MacroBadge label="단" value={totals.protein} textColor={`text-cyan-500`}/>
            <MacroBadge label="지" value={totals.fat} textColor={`text-orange-400`}/>
            <MacroBadge label="당" value={totals.sugar} textColor={`text-pink-400`}/>
            <MacroBadge label="콜" value={totals.chol} textColor={`text-indigo-400`} unit="mg" />
            <MacroBadge label="나" value={totals.na} textColor={`text-yellow-500`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealRecordCard;