package com.prologue.ballife.web.dto.meal;

import java.util.List;

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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private List<FoodItem> foods;
        private Totals totals;
        private List<String> unrecognized;
    }
}
