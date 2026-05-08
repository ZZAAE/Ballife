import { X } from "lucide-react";
import salmonImg from "../assets/salmon.jpg";
import riceImg from "../assets/rice.jpg";

function MealDetailModal({ isOpen, onClose, mealData }) {
  if (!isOpen) return null;

  const meal = mealData || {
    mealType: "점심 식사",
    foods: [
      {
        id: 1,
        name: "연어 샐러드",
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
        name: "현미밥 반 공기",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[672px] h-[572px] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex-shrink-0 px-10 pt-7 pb-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">식단 기록</p>
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
        <div className="flex-1 overflow-y-auto px-10">
          {meal.foods.map((food, index) => (
            <div
              key={food.id}
              className={`flex gap-5 items-center w-[592px] h-[134px] ${
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
              <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-lg leading-tight">
                    {food.name}
                  </p>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500 text-white">
                    {food.calories} kcal
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    { label: "탄수화물", value: `${food.nutrition.carbs}g` },
                    { label: "단백질", value: `${food.nutrition.protein}g` },
                    { label: "지방", value: `${food.nutrition.fat}g` },
                    { label: "당류", value: `${food.nutrition.sugar}g` },
                    {
                      label: "콜레스테롤",
                      value: `${food.nutrition.cholesterol}mg`,
                    },
                    { label: "나트륨", value: `${food.nutrition.sodium}mg` },
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
        <div className="flex-shrink-0 px-10 pt-4 pb-8 border-t border-gray-100">
          <div className="flex gap-2 justify-between mb-4">
            {[
              {
                label: "탄수화물",
                value: `${meal.totalNutrition.carbs}g`,
                bg: "#F2F4F6",
              },
              {
                label: "단백질",
                value: `${meal.totalNutrition.protein}g`,
                bg: "#EBF5FF",
              },
              {
                label: "지방",
                value: `${meal.totalNutrition.fat}g`,
                bg: "#FFF5F0",
              },
              {
                label: "당류",
                value: `${meal.totalNutrition.sugar}g`,
                bg: "#FFF0F3",
              },
              {
                label: "콜레스테롤",
                value: `${meal.totalNutrition.cholesterol}mg`,
                bg: "#F8F9FA",
              },
              {
                label: "나트륨",
                value: `${meal.totalNutrition.sodium}mg`,
                bg: "#EDF9ED",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center px-2 py-2.5 rounded-2xl flex-1"
                style={{ backgroundColor: item.bg }}
              >
                <span className="text-[10px] font-medium mb-0.5 text-gray-500">
                  {item.label}
                </span>
                <span className="text-base font-bold text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* 총 칼로리 */}
          <div className="flex justify-between items-center pt-4">
            <span className="text-base font-semibold text-gray-700">
              총 칼로리
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {meal.totalCalories} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDetailModal;
