package com.prologue.ballife.domain.Exercise;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_exercise_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserExerciseDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_exercise_detail_id")
    private Long userExerciseDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_exercise_id", nullable = false)
    private UserExercise userExerciseId;//수정 2지우기

    //시간
    @Column(name = "exercise_min")
    private Integer exerciseMin;
    //세트수
    @Column(name = "exercise_set")
    private Integer exerciseSet;
    //반복수
    @Column(name = "exercise_reps")
    private Integer exerciseReps;
    //무게
    @Column(name = "exercise_weight")
    private Integer exerciseWeight;
    //강도
    @Column(name = "exercise_hard", length = 10)
    private String exerciseHard;
}