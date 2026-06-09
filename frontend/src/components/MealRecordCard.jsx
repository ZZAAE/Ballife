import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// 영양 수치는 소수점 첫째 자리까지만 표시 (정수는 그대로)
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

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
  const { t } = useTranslation();
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
      <div
        className="relative h-[180px]"
        style={{
          background: image
            ? undefined
            : "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
        }}
      >
        {image && (
          <img src={image} alt={label} className="h-full w-full object-cover" />
        )}

        {image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span
            className={`text-[14px] font-[500] ${image ? "text-white/75" : "text-[#64748B]"}`}
          >
            {time}
          </span>
          <p
            className={`mt-1 text-[19px] font-[700] leading-none ${image ? "text-white" : "text-[#0F172A]"}`}
          >
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
                {round1(item.kcal)} kcal
              </span>
            </div>
          ))}
        </div>

        {hiddenCount > 0 ? (
          <p className="mb-3 mt-1 text-[12px] font-[500] text-gray-400">
            {t("mealRecordCard.hiddenCount", { count: hiddenCount })}
          </p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-[800] text-[#363636]">
              {t("mealRecordCard.total")}
            </span>

            <span className="text-[17px] font-[700] text-[#323232]">
              {round1(totals.kcal)} kcal
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            <MacroBadge
              label={t("mealRecordCard.macro.carb")}
              value={round1(totals.carb)}
              bgColor="bg-slate-100"
              textColor="text-slate-400"
            />

            <MacroBadge
              label={t("mealRecordCard.macro.protein")}
              value={round1(totals.protein)}
              bgColor="bg-cyan-50"
              textColor="text-cyan-500"
            />

            <MacroBadge
              label={t("mealRecordCard.macro.fat")}
              value={round1(totals.fat)}
              bgColor="bg-orange-50"
              textColor="text-orange-400"
            />

            <MacroBadge
              label={t("mealRecordCard.macro.sugar")}
              value={round1(totals.sugar)}
              bgColor="bg-pink-50"
              textColor="text-pink-400"
            />

            <MacroBadge
              label={t("mealRecordCard.macro.chol")}
              value={round1(totals.chol)}
              bgColor="bg-indigo-50"
              textColor="text-indigo-400"
              unit="mg"
            />

            <MacroBadge
              label={t("mealRecordCard.macro.na")}
              value={round1(totals.na)}
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