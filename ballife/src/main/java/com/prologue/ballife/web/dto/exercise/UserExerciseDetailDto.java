package com.prologue.ballife.web.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.prologue.ballife.domain.exercise.UserExerciseDetail;

import jakarta.validation.constraints.Size;

public class UserExerciseDetailDto {

    // 사용자 운동 상세 기록 등록 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @Size(max = 10, message = "운동 강도는 최대 10자까지 허용됩니다.")
        private String exerciseHard;

    }

    // 사용자 운동 상세 기록 수정 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        private Integer exerciseMin;
        private Integer exerciseSet;
        private Integer exerciseReps;
        private Integer exerciseWeight;

        @Size(max = 10, message = "운동 강도는 최대 10자까지 허용됩니다.")
        private String exerciseHard;
    }

    // 사용자 운동 상세 기록 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        // 운동 상세 기록 식별자 (MongoDB ObjectId -> String)
        private String userExerciseDetailId;
        // MySQL UserExercise PK 참조
        private Long userExerciseId;
        private Integer exerciseMin;
        private Integer exerciseSet;
        private Integer exerciseReps;
        private Integer exerciseWeight;
        private String exerciseHard;

        public static Response from(UserExerciseDetail detail) {
            return Response.builder()
                    .userExerciseDetailId(detail.getUserExerciseDetailId())
                    .userExerciseId(detail.getUserExerciseId())
                    .exerciseMin(detail.getExerciseMin())
                    .exerciseSet(detail.getExerciseSet())
                    .exerciseReps(detail.getExerciseReps())
                    .exerciseWeight(detail.getExerciseWeight())
                    .exerciseHard(detail.getExerciseHard())
                    .build();
        }
    }
}