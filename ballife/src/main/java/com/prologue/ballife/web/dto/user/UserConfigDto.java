package com.prologue.ballife.web.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

import com.prologue.ballife.domain.user.UserConfig;

public class UserConfigDto {

    // 해당 DTO는 ConfigId, UserId는 각각 시퀀스, 외래키이므로 유효성 검사 안함

    // 최초 사용자 설정 창조
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfigCreateRequest {

        private Long targetWeight;
        private Integer targetDailyCaloriesBurned;
        private Integer targetDailyCaloriesIntake;
        private Integer targetDailyWaterIntake;
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedTime;

    }

    // 사용자 설정 업데이트
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfigUpdateRequest {

<<<<<<< HEAD
        private Long targetWeight;
=======
        private Double targetWeight;
>>>>>>> origin/jisoo0508
        private Integer targetDailyCaloriesBurned;
        private Integer targetDailyCaloriesIntake;
        private Integer targetDailyWaterIntake;
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedTime;

    }

    // 사용자 설정 조회
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserConfigResponse {
        private Long userConfigId;
<<<<<<< HEAD
=======
        private Long userId;
>>>>>>> origin/jisoo0508
        private Double targetWeight;
        private Integer targetDailyCaloriesBurned;
        private Integer targetDailyCaloriesIntake;
        private Integer targetDailyWaterIntake;
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedTime;

        public static UserConfigResponse from(UserConfig userConfig) {
            return UserConfigResponse.builder()
                    .userConfigId(userConfig.getUserConfigId())
<<<<<<< HEAD
=======
                    .userId(userConfig.getUser().getUserId())
>>>>>>> origin/jisoo0508
                    .targetWeight(userConfig.getTargetWeight())
                    .targetDailyCaloriesBurned(userConfig.getTargetDailyCaloriesBurned())
                    .targetDailyCaloriesIntake(userConfig.getTargetDailyCaloriesIntake())
                    .targetDailyWaterIntake(userConfig.getTargetDailyWaterIntake())
                    .wakeupTime(userConfig.getWakeupTime())
                    .breakfastTime(userConfig.getBreakfastTime())
                    .lunchTime(userConfig.getLunchTime())
                    .dinnerTime(userConfig.getDinnerTime())
                    .bedTime(userConfig.getBedTime())
                    .build();
        }
    }

}
