package com.prologue.ballife.domain.exercise;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_exercise_id")
    private Long userExerciseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_type_id", nullable = false)
    private ExerciseType exerciseType;

    @Column(name = "exercise_date", nullable = false)
    private LocalDateTime exerciseDate;

    @Column(name = "burned_calorie")
    private Integer burnedCalorie;
}