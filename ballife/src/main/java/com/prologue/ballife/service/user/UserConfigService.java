package com.prologue.ballife.service.user;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.domain.user.UserConfig;
import com.prologue.ballife.repository.user.UserConfigRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.user.UserConfigDto.ConfigUpdateRequest;
import com.prologue.ballife.web.dto.user.UserConfigDto.UserConfigResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserConfigService {

    private final UserConfigRepository userConfigRepository;
    private final UserRepository userRepository;
    private final MessageResolver messages;

    private UserConfig findUserConfigByUserId(Long userId) {
        return userConfigRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(messages.get("business.userConfig.configNotFound", userId)));
    }

    public UserConfigResponse getUserConfig(Long userId) {
        UserConfig userConfig = userConfigRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findByUserId(userId)
                            .orElseThrow(() -> new IllegalArgumentException(messages.get("business.userConfig.userNotFound", userId)));
                    return UserConfig.builder().user(user).build();
                });
        return UserConfigResponse.from(userConfig);
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
        return userConfigRepository.findByUser_UserId(userId)
                .map(UserConfig::getTargetDailyWaterIntake)
                .orElse(0);
    }

    public Map<String, LocalTime> getMealTimes(Long userId) {
        UserConfig userConfig = findUserConfigByUserId(userId);

        Map<String, LocalTime> mealTimes = new HashMap<>();
        mealTimes.put("breakfastTime", userConfig.getBreakfastTime());
        mealTimes.put("lunchTime", userConfig.getLunchTime());
        mealTimes.put("dinnerTime", userConfig.getDinnerTime());

        return mealTimes;
    }

    // 목표/루틴 통합 upsert. null이 아닌 필드만 적용한다.
    @Transactional
    public UserConfigResponse upsertUserConfig(Long userId, ConfigUpdateRequest request) {
        UserConfig userConfig = userConfigRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findByUserId(userId)
                            .orElseThrow(() -> new IllegalArgumentException(messages.get("business.userConfig.userNotFound", userId)));
                    return UserConfig.builder().user(user).build();
                });

        if (request.getTargetWeight() != null) {
            userConfig.setTargetWeight(request.getTargetWeight());
        }
        if (request.getTargetDailyCaloriesBurned() != null) {
            userConfig.setTargetDailyCaloriesBurned(request.getTargetDailyCaloriesBurned());
        }
        if (request.getTargetDailyCaloriesIntake() != null) {
            userConfig.setTargetDailyCaloriesIntake(request.getTargetDailyCaloriesIntake());
        }
        if (request.getTargetDailyWaterIntake() != null) {
            userConfig.setTargetDailyWaterIntake(request.getTargetDailyWaterIntake());
        }
        if (request.getWakeupTime() != null) {
            userConfig.setWakeupTime(request.getWakeupTime());
        }
        if (request.getBreakfastTime() != null) {
            userConfig.setBreakfastTime(request.getBreakfastTime());
        }
        if (request.getLunchTime() != null) {
            userConfig.setLunchTime(request.getLunchTime());
        }
        if (request.getDinnerTime() != null) {
            userConfig.setDinnerTime(request.getDinnerTime());
        }
        if (request.getBedTime() != null) {
            userConfig.setBedTime(request.getBedTime());
        }

        UserConfig saved = userConfigRepository.save(userConfig);
        return UserConfigResponse.from(saved);
    }
}
