package com.prologue.ballife.domain.Exercise;


import jakarta.persistence.*;

import lombok.*;

// 이 클래스가 JPA 엔티티(= DB 테이블과 매핑되는 클래스)라는 뜻
@Entity

// 이 엔티티가 매핑될 실제 DB 테이블 이름
// MySQL의 exercise_type 테이블과 연결됨
@Table(name = "exercise_type")
@Getter
@Setter

// Lombok: 기본 생성자 자동 생성
// JPA는 기본 생성자가 필요해서 거의 필수라고 보면 됨
@NoArgsConstructor

// Lombok: 모든 필드를 파라미터로 받는 생성자 자동 생성
@AllArgsConstructor

// 예: ExerciseType.builder().exerciseName("러닝").build();
@Builder
public class ExerciseType {

    // 이 필드가 기본키(PK)라는 뜻
    @Id

    // 기본키 값을 DB가 자동으로 생성해준다는 뜻
    // MySQL에서는 AUTO_INCREMENT와 비슷하게 동작
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // DB 컬럼명과 매핑
    // 자바 필드명은 exerciseTypeId, DB 컬럼명은 exercise_type_id
    @Column(name = "exercise_type_id")
    private Long exerciseTypeId;
    // 설명:
    // - 운동 종류 식별자
    // - ERD에서 BIGINT 타입
    // - 자바에서는 보통 Long으로 매핑
    // - PK라서 운동 종류를 구분하는 고유 번호 역할

    // DB 컬럼명 exercise_name과 매핑
    // length = 20 은 VARCHAR(20)과 비슷한 의미
    @Column(name = "exercise_name", length = 20)
    private String exerciseName;
    // 설명:
    // - 운동명 저장
    // - 예: 러닝, 스쿼트, 벤치프레스
    // - ERD에서 VARCHAR(20)
    // - 자바에서는 문자열이라 String 사용

    // DB 컬럼명 exercise_category와 매핑
    @Column(name = "exercise_category", length = 20)
    private String exerciseCategory;
    // 설명:
    // - 운동 카테고리 저장
    // - 예: 유산소, 무산소, 스트레칭
    // - ERD에서 VARCHAR(20)
    // - String 사용

    // DB 컬럼명 calorie_unit과 매핑
    @Column(name = "calorie_unit", length = 10)
    private String calorieUnit;
    // 설명:
    // - 칼로리 계산 기준 저장
    // - 예: 분당, 회당
    // - 유산소 운동이면 보통 "분당"
    // - 무산소 운동이면 보통 "회당"
    // - ERD에서 VARCHAR(10)

    // DB 컬럼명 calorie_per_unit과 매핑
    @Column(name = "calorie_per_unit")
    private Integer caloriePerUnit;
    // - ERD에서 INT 타입
    // - 자바에서는 Integer 사용
}