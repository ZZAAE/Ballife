import api from "./api";

const mealAnalysisApi = {
  // 음식 사진 분석 (multipart/form-data)
  // 응답: { foods: [...], totals: {...}, unrecognized: [...] }
  analyze: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/meal/analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000, // Vision API 대기 여유
    });
  },

  // 음식명 검색(자동완성) — 식약처 DB 부분 일치 후보 목록
  // 응답: [{ name, calories, carbs, protein, fat, sugar, sodium, cholesterol, saturatedFat }] (100g 기준)
  searchFoods: (query) =>
    api.get("/meal/foods/search", {
      params: { query },
      timeout: 15000,
    }),
};

export default mealAnalysisApi;
