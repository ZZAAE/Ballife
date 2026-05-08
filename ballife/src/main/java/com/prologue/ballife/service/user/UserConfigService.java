package com.prologue.ballife.service.user;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.user.UserConfig;
import com.prologue.ballife.repository.user.UserConfigRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserConfigService {

    private final UserConfigRepository userConfigRepository;

    private UserConfig findUserConfigByUserId(Long userId) {
        return userConfigRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 설정 정보가 없습니다. userId=" + userId));
    }

    public Double getTargetWeight(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);
        return userConfig.getTargetWeight();
    }

    public Integer getTargetDailyCaloriesBurned(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);
        return userConfig.getTargetDailyCaloriesBurned();
    }

    public Integer getTargetDailyCaloriesIntake(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);
        return userConfig.getTargetDailyCaloriesIntake();
    }

    public Integer getTargetDailyWaterIntake(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);
        return userConfig.getTargetDailyWaterIntake();
    }

    public Map<String, LocalTime> getMealTimes(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);

        Map<String, LocalTime> mealTimes = new HashMap<>();
        mealTimes.put("breakfastTime", userConfig.getBreakfastTime());
        mealTimes.put("lunchTime", userConfig.getLunchTime());
        mealTimes.put("dinnerTime", userConfig.getDinnerTime());

        return mealTimes;
    }
}