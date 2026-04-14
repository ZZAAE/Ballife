package com.prologue.ballife.domain.user;

import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_CONFIG") // 테이블 이름
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder 
public class UserConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_CONFIG_ID", nullable = false)
    private Long userConfigId;

    @OneToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TARGET_WEIGHT")
    private Double targetWeight;

    @Column(name = "TARGET_DAILY_CALORIES_BURNED")
    private Integer targetDailyCaloriesBurned;

    @Column(name = "TARGET_DAILY_CALORIES_INTAKE")
    private Integer targetDailyCaloriesIntake;

    @Column(name = "TARGET_DAILY_WATER_INTAKE")
    private Integer targetDailyWaterIntake;

    @Column(name = "WAKEUP_TIME")
    private LocalTime wakeupTime;

    @Column(name = "BREAKFAST_TIME")
    private LocalTime breakfastTime;

    @Column(name = "LUNCH_TIME")
    private LocalTime lunchTime;

    @Column(name = "DINNER_TIME")
    private LocalTime dinnerTime;

    @Column(name = "BED_TIME")
    private LocalTime bedTime;
}
