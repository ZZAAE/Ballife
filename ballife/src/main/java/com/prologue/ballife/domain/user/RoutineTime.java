package com.prologue.ballife.domain.user;

import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ROUTINE_TIME") // 테이블 이름
@Getter // 여기서 부터
@Setter
@NoArgsConstructor
@AllArgsConstructor // 여기까지는 lombok에서 제공하는 기능
@Builder // 빌더 패턴
public class RoutineTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROUTINE_TIME_ID")
    private Long routineTimeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "WAKEUP_Time")
    private LocalTime wakeupTime;

    @Column(name = "BREAKFAST_Time")
    private LocalTime breakfastTime;

    @Column(name = "LUNCH_Time")
    private LocalTime lunchTime;

    @Column(name = "DINNER_Time")
    private LocalTime dinnerTime;

    @Column(name = "BEDTIME")
    private LocalTime bedtimeTime;
}
