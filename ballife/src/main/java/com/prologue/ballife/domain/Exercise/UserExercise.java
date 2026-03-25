package com.prologue.ballife.domain.Exercise;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity

// 실제 DB 테이블 이름이 user_exercise라는 뜻
@Table(name = "user_exercise")
@Getter
@Setter

// JPA는 기본 생성자가 필요해서 거의 필수
@NoArgsConstructor

// Lombok: 모든 필드를 파라미터로 받는 생성자 자동 생성
@AllArgsConstructor

// Lombok: Builder 패턴 지원
@Builder
public class UserExercise {

    // 이 필드가 기본키(PK)라는 뜻
    @Id

    // 기본키 값을 DB가 자동으로 생성
    // MySQL에서는 AUTO_INCREMENT와 비슷하게 동작
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // DB 컬럼명: user_exercise_id
    @Column(name = "user_exercise_id")
    private Long userExerciseId;
    // 설명:
    // - 사용자 운동 기록 식별자
    // - 이 테이블의 PK
    // - ERD에서 BIGINT
    // - 자바에서는 Long으로 매핑
   

    // 다대일(N:1) 관계
    // 여러 개의 사용자 운동 기록(UserExercise)은 한 명의 사용자(User)에 속할 수 있음
    @ManyToOne(fetch = FetchType.LAZY)

    // FK(외래키) 컬럼명: user_id
    // nullable = false → 반드시 사용자 정보가 있어야 한다는 뜻
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    // 설명:
    // - 이 운동 기록이 어떤 사용자 것인지 연결
    // - DB에서는 user_id라는 외래키(FK) 컬럼으로 저장됨
    // - 자바에서는 단순히 userId 숫자를 두는 게 아니라 User 객체 자체를 참조함

    // 다대일(N:1) 관계
    // 여러 개의 사용자 운동 기록(UserExercise)은 하나의 운동 종류(ExerciseType)를 참조할 수 있음
    @ManyToOne(fetch = FetchType.LAZY)

    // FK 컬럼명: exercise_type_id
    // nullable = false → 어떤 운동 종류인지 반드시 있어야 함
    @JoinColumn(name = "exercise_type_id", nullable = false)
    private ExerciseType exerciseType;
    // 설명:
    // - 사용자가 어떤 운동을 했는지 연결
    // - 예: 러닝, 스쿼트, 벤치프레스
    // - DB에서는 exercise_type_id 외래키로 저장
    // - 자바에서는 ExerciseType 객체를 참조

    // DB 컬럼명: exercise_date
    // nullable = false → 운동 수행 날짜/시간은 반드시 있어야 함
    @Column(name = "exercise_date", nullable = false)
    private LocalDateTime exerciseDate;
    // 설명:
    // - 실제로 운동을 수행한 날짜와 시간
    // - ERD에서 DATETIME
    // - 자바에서는 LocalDateTime으로 매핑


    // DB 컬럼명: burned_calorie
    @Column(name = "burned_calorie")
    private Integer burnedCalorie;
    // 설명:
    // - 운동으로 소모한 총 칼로리
    // - ERD에서 INT
    // - 자바에서는 Integer
}