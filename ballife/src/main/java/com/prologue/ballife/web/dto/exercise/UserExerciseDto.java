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

        // 무산소: 무게 (kg)
        private Integer exerciseWeight;

        // 운동 강도 (선택)
        private String exerciseHard;
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

        private LocalTime exerciseTime;

        // detail 갱신용 필드 (서버에서 칼로리 재계산에 사용)
        private Integer exerciseMin;
        private Integer exerciseSet;
        private Integer exerciseReps;
        private Integer exerciseWeight;
        private String exerciseHard;

        // 클라이언트가 직접 칼로리를 지정하고 싶을 때만 사용 (보통은 서버 계산)
        private Integer burnedCalorie;
    }

    // 사용자 운동 기록 + 상세(분/세트/반복/무게/강도)를 한 객체로 합친 응답 DTO
    // 목록 페이지에서 한 번의 호출로 모든 정보를 받기 위함
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailedResponse {
        private Long userExerciseId;
        private String exerciseTypeId;
        private String exerciseName;
        private String exerciseCategory; // 유산소 / 무산소
        private java.time.LocalDate exerciseDate;
        private java.time.LocalTime exerciseTime;
        private Integer burnedCalorie;

        // MongoDB user_exercise_detail
        private Integer exerciseMin;
        private Integer exerciseSet;
        private Integer exerciseReps;
        private Integer exerciseWeight;
        private String exerciseHard;
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
        // 운동명 (MongoDB exercise_type 조인)
        private String exerciseName;
        // 운동 카테고리 - 유산소/무산소 (MongoDB exercise_type 조인)
        private String exerciseCategory;
        private LocalDate exerciseDate;
        private LocalTime exerciseTime;
        private Integer burnedCalorie;

        // 엔티티 -> dto 변환 메서드 (운동 종류 미상)
        public static Response from(UserExercise userExercise) {
            return from(userExercise, null);
        }

        // 엔티티 + ExerciseType -> dto 변환 메서드
        public static Response from(UserExercise userExercise, ExerciseType exerciseType) {
            return Response.builder()
                    .userExerciseId(userExercise.getUserExerciseId())
                    .exerciseTypeId(userExercise.getExerciseTypeId())
                    .exerciseName(exerciseType != null ? exerciseType.getExerciseName() : null)
                    .exerciseCategory(exerciseType != null ? exerciseType.getExerciseCategory() : null)
                    .exerciseDate(userExercise.getExerciseDate())
                    .exerciseTime(userExercise.getExerciseTime())
                    .burnedCalorie(userExercise.getBurnedCalorie())
                    .build();
        }
    }
}