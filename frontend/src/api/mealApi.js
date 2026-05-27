import api from './api';

// 식사(Meal) / 식단(MealItem) API
const mealApi = {

    // 식사 생성 (한 끼 등록) - mealId 반환
    createMeal: (userId, payload) => {
        // payload: { mealDate, mealTime, mealCategory, mealPhoto }
        return api.post(`/meal?userId=${userId}`, payload);
    },

    // 식사 수정 (시간/사진 등)
    updateMeal: (userId, mealId, payload) => {
        // payload: { mealDate, mealTime, mealCategory, mealPhoto }
        return api.put(`/meal/${mealId}?userId=${userId}`, payload);
    },

    // 식사 삭제 (Meal + 연결된 MealItem 일괄 삭제)
    deleteMeal: (userId, mealId) => {
        return api.delete(`/meal/${mealId}?userId=${userId}`);
    },

    // 음식 생성 (MealItem 등록)
    createMealItem: (userId, mealId, payload) => {
        // payload: { foodName, calorie, carbohydrate, sugar, sodium, cholesterol, saturatedFat, protein }
        return api.post(`/mealItem?userId=${userId}&mealId=${mealId}`, payload);
    },

    // 음식 삭제 (MealItem 삭제)
    deleteMealItem: (userId, mealItemId) => {
        return api.delete(`/mealItem/${mealItemId}?userId=${userId}`);
    },

    // 음식 수정 (MealItem 업데이트)
    updateMealItem: (userId, mealItemId, payload) => {
        // payload: { foodName, calorie, carbohydrate, sugar, sodium, cholesterol, saturatedFat, protein }
        return api.put(`/mealItem/${mealItemId}?userId=${userId}`, payload);
    },

    // 오늘 또는 특정 날짜의 식사 목록 조회
    getTodayMeals: (userId, date) => {
        return api.get(`/meal/today?userId=${userId}&date=${date}`);
    },

    // 특정 mealId에 속한 모든 MealItem 조회
    getMealItemsByMealId: (mealId) => {
        return api.get(`/mealItem/byMeal/${mealId}`);
    },

    // 하루치 영양소 합계 조회 (kcal, carb, sugar, sodium, chol, satFat, protein)
    getDayTotalNutrient: (userId, date) => {
        return api.get(`/mealItem/Nut?userId=${userId}&date=${date}`);
    },
};

export default mealApi;
