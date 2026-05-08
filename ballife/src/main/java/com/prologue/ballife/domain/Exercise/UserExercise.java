package com.prologue.ballife.domain.Exercise;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.user.User;

// 사용자 운동 기록을 저장하는 JPA 엔티티
// MySQL 의 user_exercise 테이블과 1:1 로 매핑됨
// 운동 종류(ExerciseType)는 MongoDB 에 저장되어 있어 FK 대신 ID(String) 만 보관함

// @Entity: 이 클래스가 JPA 가 관리하는 테이블 매핑 객체임을 선언
@Entity
// @Table: 매핑할 실제 DB 테이블 이름 지정
@Table(name = "user_exercise")
// @Getter / @Setter: Lombok 이 모든 필드의 getter / setter 를 자동 생성
@Getter
@Setter
// @NoArgsConstructor: 기본 생성자 자동 생성 (JPA 필수 요건)
@NoArgsConstructor
// @AllArgsConstructor: 모든 필드를 인자로 받는 생성자 자동 생성
@AllArgsConstructor
// @Builder: 빌더 패턴으로 객체를 생성할 수 있게 해줌 (UserExercise.builder()...build())
@Builder
public class UserExercise {

    // 기본 키 (Primary Key)
    // @Id: 이 필드가 PK 임을 선언
    // @GeneratedValue(IDENTITY): DB 의 AUTO_INCREMENT 전략으로 PK 를 자동 생성
    // @Column: 매핑할 실제 DB 컬럼 이름 지정
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_exercise_id")
    private Long userExerciseId;

    // 사용자(User) 와의 다대일 관계 (여러 운동 기록이 하나의 유저에 속함)
    // @ManyToOne: N:1 연관 관계 매핑
    // fetch = FetchType.LAZY: 실제로 user 를 사용할 때만 DB 조회 (성능 최적화)
    // @JoinColumn: 외래 키(FK) 컬럼 이름 지정, nullable = false 로 필수값 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 운동 종류 식별자 (MongoDB ExerciseType 컬렉션의 ObjectId)
    // MySQL ↔ MongoDB 간 직접 FK 를 걸 수 없으므로 ID 값(String) 만 저장
    @Column(name = "exercise_type_id")
    private String exerciseTypeId;

    // 운동을 수행한 날짜 (필수값)
    // LocalDate: 시간 없이 날짜만 저장 (예: 2026-04-26)
    @Column(name = "exercise_date", nullable = false)
    private LocalDate exerciseDate;

    // 운동 시작 시각 (선택값)
    // LocalTime: 날짜 없이 시간만 저장 (예: 10:30:00)
    @Column(name = "exercise_time")
    private LocalTime exerciseTime;

    // 해당 운동으로 소모한 칼로리 (kcal)
    // 서비스 레이어의 calculateCalorie() 에서 계산된 값을 저장
    @Column(name = "burned_calorie")
    private Integer burnedCalorie;

    // 소프트 삭제 여부 (true 이면 삭제된 것으로 간주)
    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    // 소프트 삭제 메서드
    public void softDelete() {
        this.isDeleted = true;
    }
}