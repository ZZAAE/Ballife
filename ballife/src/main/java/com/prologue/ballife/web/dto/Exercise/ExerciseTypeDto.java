package com.prologue.ballife.web.dto.Exercise;

import com.prologue.ballife.domain.Exercise.ExerciseType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ExerciseType 관련 DTO들을 모아두는 클래스
// 지금은 Response DTO만 들어있음
public class ExerciseTypeDto {

    // 운동 종류 응답 DTO
    // 서버가 프론트엔드(앱/웹)에 운동 종류 정보를 보낼 때 사용하는 클래스
    @Data
    // Lombok: getter, setter, toString, equals, hashCode 자동 생성

    @Builder
    // Lombok: Builder 패턴 사용 가능
    // 예: Response.builder().exerciseName("러닝").build();

    @NoArgsConstructor
    // Lombok: 기본 생성자 자동 생성

    @AllArgsConstructor
    // Lombok: 모든 필드를 파라미터로 받는 생성자 자동 생성
    public static class Response {

        // 운동 종류 식별자
        private Long exerciseTypeId;
        // 설명:
        // - exercise_type 테이블의 기본키(PK)
        // - DB에서는 exercise_type_id 컬럼과 연결되는 값
        // - 클라이언트가 특정 운동을 식별할 때 사용 가능

        // 운동명
        private String exerciseName;
        // 운동 카테고리
        private String exerciseCategory;
       
        // 칼로리 계산 기준
        private String calorieUnit;
        
        // 단위당 소모 칼로리
        private Integer caloriePerUnit;
       

        // 엔티티(ExerciseType) -> DTO(Response) 변환 메서드
        // 서비스나 컨트롤러에서 엔티티를 그대로 반환하지 않고,
        // 필요한 값만 골라서 Response DTO로 바꿀 때 사용함
        public static Response from(ExerciseType exerciseType) {
            return Response.builder()
                    // exerciseType 엔티티의 exerciseTypeId 값을 DTO에 넣음
                    .exerciseTypeId(exerciseType.getExerciseTypeId())

                    // exerciseType 엔티티의 exerciseName 값을 DTO에 넣음
                    .exerciseName(exerciseType.getExerciseName())

                    // exerciseType 엔티티의 exerciseCategory 값을 DTO에 넣음
                    .exerciseCategory(exerciseType.getExerciseCategory())

                    // exerciseType 엔티티의 calorieUnit 값을 DTO에 넣음
                    .calorieUnit(exerciseType.getCalorieUnit())

                    // exerciseType 엔티티의 caloriePerUnit 값을 DTO에 넣음
                    .caloriePerUnit(exerciseType.getCaloriePerUnit())

                    // Builder로 만든 Response 객체를 최종 생성
                    .build();
        }
    }
}