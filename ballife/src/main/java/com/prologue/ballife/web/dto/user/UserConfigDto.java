package com.prologue.ballife.web.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Period;

import com.prologue.ballife.domain.user.User;
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

        private Double targetWeight;
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
        private Long userId;
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
            User user = userConfig.getUser();
            return UserConfigResponse.builder()
                    .userConfigId(userConfig.getUserConfigId())
                    .userId(user.getUserId())
                    .targetWeight(userConfig.getTargetWeight())
                    // 목표를 직접 설정하지 않았으면 프로필 기반 공식값을 기본으로 제공한다(이후 TargetModal에서 수정 가능).
                    .targetDailyCaloriesBurned(
                            userConfig.getTargetDailyCaloriesBurned() != null
                                    ? userConfig.getTargetDailyCaloriesBurned()
                                    : defaultCaloriesBurned(user))
                    .targetDailyCaloriesIntake(
                            userConfig.getTargetDailyCaloriesIntake() != null
                                    ? userConfig.getTargetDailyCaloriesIntake()
                                    : defaultCaloriesIntake(user))
                    .targetDailyWaterIntake(userConfig.getTargetDailyWaterIntake())
                    .wakeupTime(userConfig.getWakeupTime())
                    .breakfastTime(userConfig.getBreakfastTime())
                    .lunchTime(userConfig.getLunchTime())
                    .dinnerTime(userConfig.getDinnerTime())
                    .bedTime(userConfig.getBedTime())
                    .build();
        }

        // Harris-Benedict 기초대사량(BMR). 프로필(키/몸무게/나이/성별) 중 하나라도 없으면 null.
        //  남성: 66.47 + (13.75 × 체중) + (5 × 키) − (6.76 × 나이)
        //  여성: 655.1 + (9.56 × 체중) + (1.85 × 키) − (4.68 × 나이)
        private static Double computeBmr(User user) {
            if (user == null) return null;
            Double weight = user.getWeight();
            Double height = user.getHeight();
            LocalDate birthDate = user.getBirthDate();
            String gender = user.getGender();
            if (weight == null || height == null || birthDate == null || gender == null) {
                return null;
            }
            boolean female = gender.contains("여");
            boolean male = gender.contains("남");
            if (!female && !male) return null;

            int age = Period.between(birthDate, LocalDate.now()).getYears();
            if (female) {
                return 655.1 + (9.56 * weight) + (1.85 * height) - (4.68 * age);
            }
            return 66.47 + (13.75 * weight) + (5 * height) - (6.76 * age);
        }

        // 목표 섭취 칼로리 기본값 = 기초대사량
        private static Integer defaultCaloriesIntake(User user) {
            Double bmr = computeBmr(user);
            return bmr == null ? null : (int) Math.round(bmr);
        }

        // 목표 소모 칼로리 기본값 = 기초대사량 × 1.55 (보통 활동: 주 3~5회 운동)
        private static Integer defaultCaloriesBurned(User user) {
            Double bmr = computeBmr(user);
            return bmr == null ? null : (int) Math.round(bmr * 1.55);
        }
    }

}
