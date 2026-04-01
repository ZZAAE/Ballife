package com.prologue.ballife.web.dto.meal;

import com.prologue.ballife.domain.meal.DayIntakeMeal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DayIntakeMealDto {

    // ═══════════════════════════════════════════════════════════
    // 음식 데이터 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayIntakeMealResponse{
        
        // 하루 식별자, 칼로리, 탄수화물, 당, 나트륨, 콜레스테롤, 포화지방, 단백질
        // 유저아이디 제외 전부 반환
        private Long dailyMealId;  
        private Integer calorie;
        private Double carbohydrate;
        private Double sugar;
        private Double sodium;
        private Double cholesterol;
        private Double saturatedFat;
        private Double protein;

        // 엔티티 → DTO 변환 메서드
        public static DayIntakeMealResponse from(DayIntakeMeal DayIntakeMeal) {
            return DayIntakeMealResponse.builder()
                    .dailyMealId(DayIntakeMeal.getDailyMealId())
                    .calorie(DayIntakeMeal.getCalorie())
                    .carbohydrate(DayIntakeMeal.getCarbohydrate())
                    .sugar(DayIntakeMeal.getSugar())
                    .sodium(DayIntakeMeal.getSodium())
                    .cholesterol(DayIntakeMeal.getCholesterol())
                    .saturatedFat(DayIntakeMeal.getSaturatedFat())
                    .protein(DayIntakeMeal.getProtein())
                    .build();
        }

    }
    
}
