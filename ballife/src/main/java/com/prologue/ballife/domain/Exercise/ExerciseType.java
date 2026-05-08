package com.prologue.ballife.domain.Exercise;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// MongoDB 컬렉션 exercise_type 과 매핑되는 도큐먼트 클래스
@Document(collection = "exercise_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseType {

    // MongoDB _id 필드 (ObjectId -> String 으로 자동 변환)
    @Id
    private String exerciseTypeId;

    // 운동명 (예: 러닝, 스쿼트)
    private String exerciseName;

    // 운동 카테고리 (예: 유산소, 무산소)
    private String exerciseCategory;

    // 칼로리 계산 기준 (예: 분당, 회당)
    private String calorieUnit;

    // 단위당 소모 칼로리
    private Integer caloriePerUnit;
}