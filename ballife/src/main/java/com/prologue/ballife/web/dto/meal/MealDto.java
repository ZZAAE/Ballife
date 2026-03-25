package com.prologue.ballife.web.dto.meal;


import java.time.LocalDate;

import com.prologue.ballife.domain.meal.Meal;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class MealDto {

    // ═══════════════════════════════════════════════════════════
    // 식사 저장 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest{

        // 유저가 입력하는게 식사날짜밖에 없음 근데 이것도 로컬시간으로저장하지않나? 혹시몰라서만들어둠
        @NotNull(message = "식사날짜를 입력해주세요")
        private LocalDate mealDate;

    }


    // ═══════════════════════════════════════════════════════════
    // 식사 업데이트 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{

        @NotNull(message = "식사날짜를 입력해주세요")
        private LocalDate mealDate;

    }


    // ═══════════════════════════════════════════════════════════
    // 식사 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealResponse{
            
        private Long mealId;
        private LocalDate mealDate;
        private String mealPhoto;

            // 엔티티 → DTO 변환 메서드
        public static MealResponse from(Meal meal) {
            return MealResponse.builder()
                    .mealId(meal.getMealId())
                    .mealDate(meal.getMealDate())
                    .mealPhoto(meal.getMealPhoto())
                    .build();
        }

    }
}
