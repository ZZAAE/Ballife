import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import salmonImg from "../assets/salmon.jpg";
import riceImg from "../assets/rice.jpg";

function MealDetailModal({ isOpen, onClose, mealData }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // 영양 수치는 소수점 첫째 자리까지만 표시 (정수는 그대로)
  const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

  const meal = mealData || {
    mealType: t("mealDetailModal.sample.mealType"),
    foods: [
      {
        id: 1,
        name: t("mealDetailModal.sample.salmonSalad"),
        calories: 486,
        nutrition: {
          carbs: 12,
          protein: 34,
          fat: 28,
          sugar: 3,
          cholesterol: 45,
          sodium: 60,
        },
        image: salmonImg,
      },
      {
        id: 2,
        name: t("mealDetailModal.sample.brownRiceHalf"),
        calories: 150,
        nutrition: {
          carbs: 32,
          protein: 3,
          fat: 1,
          sugar: 0,
          cholesterol: 0,
          sodium: 10,
        },
        image: riceImg,
      },
    ],
    totalNutrition: {
      carbs: 44,
      protein: 37,
      fat: 29,
      sugar: 3,
      cholesterol: 45,
      sodium: 70,
    },
    totalCalories: 630,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[672px] h-[572px] max-h-[90vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex-shrink-0 px-5 md:px-10 pt-7 pb-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">
                {t("mealDetailModal.label.dietRecord")}
              </p>
              <h2 className="text-[28px] font-bold text-gray-900 leading-tight">
                {meal.mealType}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* 음식 목록 */}
        <div className="flex-1 overflow-y-auto px-5 md:px-10">
          {meal.foods.map((food, index) => (
            <div
              key={food.id}
              className={`flex gap-5 items-center w-full h-[134px] ${
                index < meal.foods.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              {/* 음식 이미지 */}
              <div className="w-[96px] h-[96px] rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                {food.image ? (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* 음식 정보 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-lg leading-tight">
                    {food.name}
                  </p>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500 text-white">
                    {round1(food.calories)} kcal
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    {
                      label: t("mealDetailModal.nutrition.carbs"),
                      value: `${round1(food.nutrition.carbs)}g`,
                    },
                    {
                      label: t("mealDetailModal.nutrition.protein"),
                      value: `${round1(food.nutrition.protein)}g`,
                    },
                    {
                      label: t("mealDetailModal.nutrition.fat"),
                      value: `${round1(food.nutrition.fat)}g`,
                    },
                    {
                      label: t("mealDetailModal.nutrition.sugar"),
                      value: `${round1(food.nutrition.sugar)}g`,
                    },
                    {
                      label: t("mealDetailModal.nutrition.cholesterol"),
                      value: `${round1(food.nutrition.cholesterol)}mg`,
                    },
                    {
                      label: t("mealDetailModal.nutrition.sodium"),
                      value: `${round1(food.nutrition.sodium)}mg`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="text-gray-400 text-[10px]">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 합산 영양소 */}
        <div className="flex-shrink-0 px-5 md:px-10 pt-4 pb-8 border-t border-gray-100">
          <div className="flex gap-2 justify-between mb-4">
            {[
              {
                label: t("mealDetailModal.nutrition.carbs"),
                value: `${round1(meal.totalNutrition.carbs)}g`,
                bgClass: "bg-slate-100",
                textClass: "text-slate-400",
              },
              {
                label: t("mealDetailModal.nutrition.protein"),
                value: `${round1(meal.totalNutrition.protein)}g`,
                bgClass: "bg-cyan-50",
                textClass: "text-cyan-500",
              },
              {
                label: t("mealDetailModal.nutrition.fat"),
                value: `${round1(meal.totalNutrition.fat)}g`,
                bgClass: "bg-orange-50",
                textClass: "text-orange-400",
              },
              {
                label: t("mealDetailModal.nutrition.sugar"),
                value: `${round1(meal.totalNutrition.sugar)}g`,
                bgClass: "bg-pink-50",
                textClass: "text-pink-400",
              },
              {
                label: t("mealDetailModal.nutrition.cholesterol"),
                value: `${round1(meal.totalNutrition.cholesterol)}mg`,
                bgClass: "bg-indigo-50",
                textClass: "text-indigo-400",
              },
              {
                label: t("mealDetailModal.nutrition.sodium"),
                value: `${round1(meal.totalNutrition.sodium)}mg`,
                bgClass: "bg-yellow-50",
                textClass: "text-yellow-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex flex-col items-center px-2 py-2.5 rounded-2xl flex-1 ${item.bgClass}`}
              >
                <span className={`text-[10px] font-medium mb-0.5 ${item.textClass}`}>
                  {item.label}
                </span>
                <span className={`text-base font-bold ${item.textClass}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* 총 칼로리 */}
          <div className="flex justify-between items-center pt-4">
            <span className="text-base font-semibold text-gray-700">
              {t("mealDetailModal.totalCalories")}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {round1(meal.totalCalories)} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDetailModal;
