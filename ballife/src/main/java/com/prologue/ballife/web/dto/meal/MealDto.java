package com.prologue.ballife.web.dto.meal;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.meal.Meal;
import com.prologue.ballife.domain.meal.Meal.MealCategory;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MealDto {

    // ═══════════════════════════════════════════════════════════
    // 식 데이터 저장 요청 DTO
    // ═══════════════════════════════════════════════════════════
    // 식사 식별자, 유저 아이디는 자동, 음식사진은 null 가능
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealSaveRequest{

        @NotNull(message = "식사 날짜를 입력해주세요")
        private LocalDate mealDate;

        @NotNull(message = "식사 시간을 입력해주세요")
        private LocalTime mealTime;

        @NotNull(message = "식사 카테고리를 입력해주세요")
        private MealCategory mealCategory;

        private String mealPhoto;


    }


    // ═══════════════════════════════════════════════════════════
    // 식사 데이터 업데이트 요청 DTO
    // ═══════════════════════════════════════════════════════════
    // 식사 식별자, 유저 아이디는 자동, 음식사진은 null 가능
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealUpdateRequest{

        @NotNull(message = "식사 날짜를 입력해주세요")
        private LocalDate mealDate;

        @NotNull(message = "식사 시간을 입력해주세요")
        private LocalTime mealTime;

        @NotNull(message = "식사 카테고리를 입력해주세요")
        private MealCategory mealCategory;

        private String mealPhoto;


    }


    // ═══════════════════════════════════════════════════════════
    // 식사 데이터 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealResponse{
        
        // 식사 식별자, 식사 날짜, 아점저간식 구분, 음식 사진
        private Long mealId;
        private LocalDate mealDate;
        private LocalTime mealTime;
        private MealCategory mealCategory;
        private String mealPhoto;

        // 엔티티 → DTO 변환 메서드
        public static MealResponse from(Meal meal) {
            return MealResponse.builder()
                    .mealId(meal.getMealId())
                    .mealDate(meal.getMealDate())
                    .mealTime(meal.getMealTime())
                    .mealCategory(meal.getMealCategory())
                    .mealPhoto(meal.getMealPhoto())
                    .build();
        }

    }
    
}
