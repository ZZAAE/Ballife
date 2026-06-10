package com.prologue.ballife.web.dto.meal;

import java.util.List;

import com.prologue.ballife.domain.meal.Meal;
import com.prologue.ballife.domain.meal.MealItem;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

public class MealItemDto {

    // ═══════════════════════════════════════════════════════════
    // 음식 데이터 저장 요청 DTO
    // ═══════════════════════════════════════════════════════════
    // 음식 식별자, 식사 식별자, 기타 영양소는 자동
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemSaveRequest{

        private Meal meal;

        @NotBlank(message = "{validation.mealItem.foodName.required}")
        @Size(max = 20, message = "{validation.mealItem.foodName.size}")
        private String foodName;

        @Size(max = 500, message = "{validation.mealItem.mealPhoto.size}")
        private String mealPhoto;

        @Min(value = 0, message = "{validation.mealItem.grams.min}")
        private Integer grams;

        @NotNull(message = "{validation.mealItem.calorie.required}")
        @Min(value = 0, message = "{validation.mealItem.calorie.min}")
        private Integer calorie;

        @NotNull(message = "{validation.mealItem.carbohydrate.required}")
        @Min(value = 0, message = "{validation.mealItem.carbohydrate.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.carbohydrate.digits}")
        private Double carbohydrate;

        @NotNull(message = "{validation.mealItem.sugar.required}")
        @Min(value = 0, message = "{validation.mealItem.sugar.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.sugar.digits}")
        private Double sugar;

        @NotNull(message = "{validation.mealItem.sodium.required}")
        @Min(value = 0, message = "{validation.mealItem.sodium.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.sodium.digits}")
        private Double sodium;

        @NotNull(message = "{validation.mealItem.cholesterol.required}")
        @Min(value = 0, message = "{validation.mealItem.cholesterol.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.cholesterol.digits}")
        private Double cholesterol;

        @NotNull(message = "{validation.mealItem.saturatedFat.required}")
        @Min(value = 0, message = "{validation.mealItem.saturatedFat.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.saturatedFat.digits}")
        private Double saturatedFat;

        @NotNull(message = "{validation.mealItem.protein.required}")
        @Min(value = 0, message = "{validation.mealItem.protein.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.protein.digits}")
        private Double protein;


    }


    // ═══════════════════════════════════════════════════════════
    // 음식 데이터 업데이트 요청 DTO
    // ═══════════════════════════════════════════════════════════
    // 음식 식별자, 식사 식별자, 기타 영양소는 자동
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemUpdateRequest{

        private Meal meal;

        @NotBlank(message = "{validation.mealItem.foodName.required}")
        @Size(max = 20, message = "{validation.mealItem.foodName.size}")
        private String foodName;

        @Size(max = 500, message = "{validation.mealItem.mealPhoto.size}")
        private String mealPhoto;

        @Min(value = 0, message = "{validation.mealItem.grams.min}")
        private Integer grams;

        @NotNull(message = "{validation.mealItem.calorie.required}")
        @Min(value = 0, message = "{validation.mealItem.calorie.min}")
        private Integer calorie;

        @NotNull(message = "{validation.mealItem.carbohydrate.required}")
        @Min(value = 0, message = "{validation.mealItem.carbohydrate.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.carbohydrate.digits}")
        private Double carbohydrate;

        @NotNull(message = "{validation.mealItem.sugar.required}")
        @Min(value = 0, message = "{validation.mealItem.sugar.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.sugar.digits}")
        private Double sugar;

        @NotNull(message = "{validation.mealItem.sodium.required}")
        @Min(value = 0, message = "{validation.mealItem.sodium.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.sodium.digits}")
        private Double sodium;

        @NotNull(message = "{validation.mealItem.cholesterol.required}")
        @Min(value = 0, message = "{validation.mealItem.cholesterol.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.cholesterol.digits}")
        private Double cholesterol;

        @NotNull(message = "{validation.mealItem.saturatedFat.required}")
        @Min(value = 0, message = "{validation.mealItem.saturatedFat.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.saturatedFat.digits}")
        private Double saturatedFat;

        @NotNull(message = "{validation.mealItem.protein.required}")
        @Min(value = 0, message = "{validation.mealItem.protein.min}")
        @Digits(integer = 10, fraction = 2, message = "{validation.mealItem.protein.digits}")
        private Double protein;


    }


    // ═══════════════════════════════════════════════════════════
    // 음식 데이터 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemResponse{

        // 음식 식별자, 음식 이름, 사진 URL, 그램, 칼로리, 탄수화물, 당, 나트륨, 콜레스테롤, 포화지방, 단백질
        private Long mealItemId;
        private Long mealId;
        private String foodName;
        private String mealPhoto;
        private Integer grams;
        private Integer calorie;
        private Double carbohydrate;
        private Double sugar;
        private Double sodium;
        private Double cholesterol;
        private Double saturatedFat;
        private Double protein;

        // 엔티티 → DTO 변환 메서드
        public static MealItemResponse from(MealItem mealItem) {
            return MealItemResponse.builder()
                    .mealItemId(mealItem.getMealItemId())
                    .mealId(mealItem.getMeal() != null ? mealItem.getMeal().getMealId() : null)
                    .foodName(mealItem.getFoodName())
                    .mealPhoto(mealItem.getMealPhoto())
                    .grams(mealItem.getGrams())
                    .calorie(mealItem.getCalorie())
                    .carbohydrate(mealItem.getCarbohydrate())
                    .sugar(mealItem.getSugar())
                    .sodium(mealItem.getSodium())
                    .cholesterol(mealItem.getCholesterol())
                    .saturatedFat(mealItem.getSaturatedFat())
                    .protein(mealItem.getProtein())
                    .build();
        }

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemSummaryResponse {
        // 해당 조회 조건(예: 하루/카테고리)에 맞는 식단 아이템 목록
        private List<MealItemResponse> items;
        private Integer totalCalorie;

        public static MealItemSummaryResponse of(List<MealItemResponse> items, Integer totalCalorie) {
            return MealItemSummaryResponse.builder()
                    .items(items)
                    .totalCalorie(totalCalorie == null ? 0 : totalCalorie)
                    .build();
        }
    }

}
