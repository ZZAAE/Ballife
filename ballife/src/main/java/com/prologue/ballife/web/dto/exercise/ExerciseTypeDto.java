package com.prologue.ballife.web.dto.exercise;

import com.prologue.ballife.domain.exercise.ExerciseType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ExerciseTypeDto {

    // 운동 종류 등록 요청 (관리자)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "{validation.exerciseType.exerciseName.required}")
        private String exerciseName;

        @NotBlank(message = "{validation.exerciseType.exerciseCategory.required}")
        private String exerciseCategory;

        @NotBlank(message = "{validation.exerciseType.calorieUnit.required}")
        private String calorieUnit;

        // 무산소: 회당 칼로리. 유산소면 0 또는 null
        @PositiveOrZero(message = "{validation.exerciseType.caloriePerUnit.positiveOrZero}")
        private Integer caloriePerUnit;

        // 유산소: MET 값. 무산소면 null
        private Double met;
    }

    // 운동 종류 수정 요청 (관리자)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String exerciseName;
        private String exerciseCategory;
        private String calorieUnit;
        private Integer caloriePerUnit;
        private Double met;
    }

    // 운동 종류 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        // 운동 종류 식별자 (MongoDB ObjectId)
        private String exerciseTypeId;
        private String exerciseName;
        private String exerciseCategory;
        private String calorieUnit;
        private Integer caloriePerUnit;
        private Double met;

        public static Response from(ExerciseType exerciseType) {
            return Response.builder()
                    .exerciseTypeId(exerciseType.getExerciseTypeId())
                    .exerciseName(exerciseType.getExerciseName())
                    .exerciseCategory(exerciseType.getExerciseCategory())
                    .calorieUnit(exerciseType.getCalorieUnit())
                    .caloriePerUnit(exerciseType.getCaloriePerUnit())
                    .met(exerciseType.getMet())
                    .build();
        }
    }
}
