package com.prologue.ballife.web.dto.Exercise;

import com.prologue.ballife.domain.Exercise.ExerciseType;
import com.prologue.ballife.domain.Exercise.UserExercise;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class UserExerciseDto {

    // 사용자 운동 기록 등록 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "운동 종류 선택 필수입니다.")
        private Long exerciseTypeId;

        @NotNull(message = "운동 수행 날짜는 필수입니다.")
        private LocalDateTime exerciseDate;

        private Integer burnedCalorie;
    }

    // 사용자 운동 기록 수정 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "운동 종류 선택 필수입니다.")
        private Long exerciseTypeId;

        @NotNull(message = "운동 수행 날짜는 필수입니다.")
        private LocalDateTime exerciseDate;
        
        private Integer burnedCalorie;
    }

    // 사용자 운동 기록 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        //사용자 운동 기록 식별자
        private Long userExerciseId;
      

        //운동 종류 식별자
        private Long exerciseTypeId; //수정
        private String exerciseName;
        private String exerciseCategory;
        private LocalDateTime exerciseDate;
        private Integer burnedCalorie;

        //엔티티 -> dto 변환 메서드
        public static Response from(UserExercise userExercise) {
            return Response.builder()
                    .userExerciseId(userExercise.getUserExerciseId())
                    // .userId(userExercise.getUser().getUserId())
                    // 연결된 ExerciseType 엔티티에서 운동 종류 식별자 꺼내기
                    .exerciseTypeId(userExercise.getExerciseType().getExerciseTypeId())
                    .exerciseName(userExercise.getExerciseType().getExerciseName())
                    .exerciseCategory(userExercise.getExerciseType().getExerciseCategory())
                    //실제 운동 수행 날짜/시간
                    .exerciseDate(userExercise.getExerciseDate())
                    //총 소모 칼로리
                    .burnedCalorie(userExercise.getBurnedCalorie())
                    //최종 response 객체 생성
                    .build();
        }
    }
}