import { useMemo } from "react";

const MacroBadge = ({ label, value, unit = "g", bgColor, textColor }) => (
  <span
    className={`inline-flex min-w-[54px] items-center justify-center gap-[3px] rounded-full px-2 py-1 text-[11px] font-[600] ${bgColor} ${textColor}`}
  >
    <span className="font-[600]">{label}</span>
    <span>
      {value}
      {unit}
    </span>
  </span>
);

const MealRecordCard = ({
  time,
  label,
  items = [],
  image,
  className = "",
  onClick,
}) => {
  const visibleItems = items.slice(0, 2);
  const hiddenCount = Math.max(items.length - 3, 0);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        kcal: acc.kcal + (item.kcal || 0),
        carb: acc.carb + (item.carb || 0),
        protein: acc.protein + (item.protein || 0),
        fat: acc.fat + (item.fat || 0),
        sugar: acc.sugar + (item.sugar || 0),
        chol: acc.chol + (item.chol || 0),
        na: acc.na + (item.na || 0),
      }),
      { kcal: 0, carb: 0, protein: 0, fat: 0, sugar: 0, chol: 0, na: 0 },
    );
  }, [items]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block overflow-hidden rounded-[12px] border border-[#E8ECF1] bg-white text-left shadow-[0_4px_14px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="relative h-[180px]">
        {image ? (
          <img src={image} alt={label} className="h-full w-full object-cover" />
        ) : (
          <img
            src="https://saladpanda.co.kr/web/product/extra/big/202407/a039af315a7e721c8e8cb37b387fe90f.jpg"
            alt={label}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-[14px] font-[500] text-white/75">{time}</span>
          <p className="mt-1 text-[19px] font-[700] leading-none text-white">
            {label}
          </p>
        </div>
      </div>

      <div className="py-3 px-6">
        <div>
          {visibleItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-gray-100 py-2 last:border-b-0 mb-1"
            >
              <span className="min-w-0 truncate text-[16px] font-[600] text-gray-800">
                {item.name}
              </span>

              <span className="ml-3 shrink-0 text-[16px] font-[600] text-[#5172dc]">
                {item.kcal} kcal
              </span>
            </div>
          ))}
        </div>

        {hiddenCount > 0 ? (
          <p className="mb-3 mt-1 text-[12px] font-[500] text-gray-400">
            외 {hiddenCount}개
          </p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-[800] text-[#363636]">
              합계
            </span>

            <span className="text-[17px] font-[700] text-[#323232]">
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
    </button>
  );
};

export default MealRecordCard;