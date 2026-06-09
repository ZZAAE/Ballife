package com.prologue.ballife.web.dto.meal;

import java.util.List;

import com.prologue.ballife.domain.food.FoodNutrition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 음식 사진 분석 결과 DTO.
 *  - foods: Vision LLM이 식별한 음식별 영양 정보 (g 비율 환산 적용)
 *  - totals: 모든 음식 합산
 *  - unrecognized: 영양정보 매칭 실패한 음식명 목록 (사용자에게 안내용)
 */
public class MealAnalysisDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodItem {
        private String name;
        private Double grams;
        private Double calories;
        private Double carbs;
        private Double protein;
        private Double fat;
        private Double fiber;
        private Double sodium;
        private Double cholesterol;
        private Double saturatedFat;
        private Double sugar;
        private boolean nutritionFound;  // false = 영양정보 매칭 실패
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private Double calories;
        private Double carbs;
        private Double protein;
        private Double fat;
        private Double fiber;
        private Double sodium;
        private Double cholesterol;
        private Double saturatedFat;
        private Double sugar;
    }

    /**
     * 음식명 검색(자동완성) 결과 1건. 모든 영양값은 100g 기준으로 정규화 + 소수점 첫째 자리 반올림.
     * 프론트는 grams(섭취량)에 맞춰 다시 환산한다.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodSearchItem {
        private String name;
        private Double calories;
        private Double carbs;
        private Double protein;
        private Double fat;
        private Double sugar;
        private Double sodium;
        private Double cholesterol;
        private Double saturatedFat;

        public static FoodSearchItem from(FoodNutrition f) {
            double serving = (f.getServingSize() != null && f.getServingSize() > 0)
                    ? f.getServingSize() : 100.0;
            double ratio = 100.0 / serving; // 100g 기준으로 환산
            return FoodSearchItem.builder()
                    .name(f.getName())
                    .calories(scale(f.getCalories(), ratio))
                    .carbs(scale(f.getCarbs(), ratio))
                    .protein(scale(f.getProtein(), ratio))
                    .fat(scale(f.getFat(), ratio))
                    .sugar(scale(f.getSugar(), ratio))
                    .sodium(scale(f.getSodium(), ratio))
                    .cholesterol(scale(f.getCholesterol(), ratio))
                    .saturatedFat(scale(f.getSaturatedFat(), ratio))
                    .build();
        }

        // 100g 기준 환산 후 소수점 첫째 자리까지 반올림 (null은 0)
        private static Double scale(Double base, double ratio) {
            double v = (base == null ? 0.0 : base) * ratio;
            return Math.round(v * 10.0) / 10.0;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private List<FoodItem> foods;
        private Totals totals;
        private List<String> unrecognized;
        private String analyzedBy;   // "YOLO" = 자체 모델 / "OpenAI" = Vision 폴백
        private Double confidence;    // YOLO 신뢰도(0~1). OpenAI 폴백이면 null
    }
}
