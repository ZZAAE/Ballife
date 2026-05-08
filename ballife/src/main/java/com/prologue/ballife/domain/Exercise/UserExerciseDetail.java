package com.prologue.ballife.domain.Exercise;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// MongoDB user_exercise_detail 컬렉션과 매핑되는 도큐먼트 클래스
@Document(collection = "user_exercise_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserExerciseDetail {

    // MongoDB _id 필드 (ObjectId -> String 으로 자동 변환)
    @Id
    private String userExerciseDetailId;

    // MySQL UserExercise 의 PK 를 참조 (FK 제약 없이 ID 만 저장)
    private Long userExerciseId;

    // 운동 시간 (분)
    private Integer exerciseMin;
    // 세트 수
    private Integer exerciseSet;
    // 반복 수
    private Integer exerciseReps;
    // 무게
    private Integer exerciseWeight;
    // 운동 강도
    private String exerciseHard;
}