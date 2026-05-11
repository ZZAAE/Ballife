package com.prologue.ballife.web.dto.exercise;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.prologue.ballife.domain.exercise.ExerciseType;
import com.prologue.ballife.domain.exercise.UserExercise;
public class UserExerciseDto {
    // 사용자 운동 기록 등록 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "운동 종류 선택 필수입니다.")
        private String exerciseTypeId; // MongoDB ObjectId (String)

        @NotNull(message = "운동 수행 날짜는 필수입니다.")
        private LocalDate exerciseDate;

        private LocalTime exerciseTime;

        // 유산소용 (분당 계산)
        private Integer exerciseMin;

        // 무산소용 (세트 × 반복 계산)
        private Integer exerciseSet;
        private Integer exerciseReps;
    }

    // 사용자 운동 기록 수정 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "운동 종류 선택 필수입니다.")
        private String exerciseTypeId; // MongoDB ObjectId (String)

        @NotNull(message = "운동 수행 날짜는 필수입니다.")
        private LocalDate exerciseDate;

        private Integer burnedCalorie;
    }

    // 사용자 운동 기록 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        // 사용자 운동 기록 식별자 (MySQL PK -> Long)
        private Long userExerciseId;

        // 운동 종류 식별자 (MongoDB ObjectId -> String)
        private String exerciseTypeId;
        private LocalDate exerciseDate;
        private LocalTime exerciseTime;
        private Integer burnedCalorie;

        // 엔티티 -> dto 변환 메서드
        public static Response from(UserExercise userExercise) {
            return Response.builder()
                    .userExerciseId(userExercise.getUserExerciseId())
                    .exerciseTypeId(userExercise.getExerciseTypeId())
                    .exerciseDate(userExercise.getExerciseDate())
                    .exerciseTime(userExercise.getExerciseTime())
                    .burnedCalorie(userExercise.getBurnedCalorie())
                    .build();
        }
    }
}