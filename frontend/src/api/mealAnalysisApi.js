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
};

export default mealAnalysisApi;
