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

        @NotBlank(message = "음식이름을 입력해주세요")
        @Size(max = 20, message = "음식이름은 20자 이하여야 합니다")
        private String foodName;

        @NotNull(message = "칼로리를 입력해주세요")
        @Min(value = 0, message = "칼로리는 0 이상이어야 합니다")
        private Integer calorie;

        @NotNull(message = "탄수화물을 입력해주세요")
        @Min(value = 0, message = "탄수화물은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "탄수화물은 소수점 2자리까지 입력 가능합니다")
        private Double carbohydrate;

        @NotNull(message = "당을 입력해주세요")
        @Min(value = 0, message = "당은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "당은 소수점 2자리까지 입력 가능합니다")
        private Double sugar;

        @NotNull(message = "나트륨을 입력해주세요")
        @Min(value = 0, message = "나트륨은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "나트륨은 소수점 2자리까지 입력 가능합니다")
        private Double sodium;

        @NotNull(message = "콜레스테롤을 입력해주세요")
        @Min(value = 0, message = "콜레스테롤은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "콜레스테롤은 소수점 2자리까지 입력 가능합니다")
        private Double cholesterol;

        @NotNull(message = "포화지방을 입력해주세요")
        @Min(value = 0, message = "포화지방은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "포화지방은 소수점 2자리까지 입력 가능합니다")
        private Double saturatedFat;

        @NotNull(message = "단백질을 입력해주세요")
        @Min(value = 0, message = "단백질은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "단백질은 소수점 2자리까지 입력 가능합니다")
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

        @NotBlank(message = "음식이름을 입력해주세요")
        @Size(max = 20, message = "음식이름은 20자 이하여야 합니다")
        private String foodName;

        @NotNull(message = "칼로리를 입력해주세요")
        @Min(value = 0, message = "칼로리는 0 이상이어야 합니다")
        private Integer calorie;

        @NotNull(message = "탄수화물을 입력해주세요")
        @Min(value = 0, message = "탄수화물은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "탄수화물은 소수점 2자리까지 입력 가능합니다")
        private Double carbohydrate;

        @NotNull(message = "당을 입력해주세요")
        @Min(value = 0, message = "당은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "당은 소수점 2자리까지 입력 가능합니다")
        private Double sugar;

        @NotNull(message = "나트륨을 입력해주세요")
        @Min(value = 0, message = "나트륨은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "나트륨은 소수점 2자리까지 입력 가능합니다")
        private Double sodium;

        @NotNull(message = "콜레스테롤을 입력해주세요")
        @Min(value = 0, message = "콜레스테롤은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "콜레스테롤은 소수점 2자리까지 입력 가능합니다")
        private Double cholesterol;

        @NotNull(message = "포화지방을 입력해주세요")
        @Min(value = 0, message = "포화지방은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "포화지방은 소수점 2자리까지 입력 가능합니다")
        private Double saturatedFat;

        @NotNull(message = "단백질을 입력해주세요")
        @Min(value = 0, message = "단백질은 0 이상이어야 합니다")
        @Digits(integer = 10, fraction = 2, message = "단백질은 소수점 2자리까지 입력 가능합니다")
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
        
        // 음식 식별자, 음식 이름, 칼로리, 탄수화물, 당, 나트륨, 콜레스테롤, 포화지방, 단백질
        private Long mealItemId;
        private Meal meal;
        private String foodName;
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
                    .meal(mealItem.getMeal())
                    .foodName(mealItem.getFoodName())
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
