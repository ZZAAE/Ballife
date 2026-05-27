package com.prologue.ballife.web;

import java.time.LocalTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.user.UserConfigService;
import com.prologue.ballife.web.dto.user.UserConfigDto.ConfigUpdateRequest;
import com.prologue.ballife.web.dto.user.UserConfigDto.UserConfigResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-config")
public class UserConfigController {

    private final UserConfigService userConfigService;

    // 전체 설정 조회 (목표 + 루틴) - UserConfig가 없으면 빈 값으로 반환
    @GetMapping("/{userId}")
    public ResponseEntity<UserConfigResponse> getUserConfig(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getUserConfig(userId));
    }

    // 전체 설정 업데이트 (목표 + 루틴) - 없으면 생성 (upsert)
    @PutMapping("/{userId}")
    public ResponseEntity<UserConfigResponse> updateUserConfig(
            @PathVariable Long userId,
            @RequestBody ConfigUpdateRequest request) {
        return ResponseEntity.ok(userConfigService.upsertUserConfig(userId, request));
    }

    // 목표 체중 조회
    @GetMapping("/{userId}/targetWeight")
    public ResponseEntity<Double> getTargetWeight(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getTargetWeight(userId));
    }

    // 소모 칼로리 조회
    @GetMapping("/{userId}/targetDailyCaloriesBurned")
    public ResponseEntity<Integer> getTargetDailyCaloriesBurned(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getTargetDailyCaloriesBurned(userId));
    }

    // 섭취 칼로리 조회
    @GetMapping("/{userId}/targetDailyCaloriesIntake")
    public ResponseEntity<Integer> getTargetDailyCaloriesIntake(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getTargetDailyCaloriesIntake(userId));
    }

    // 수분 섭취량 조회
    @GetMapping("/{userId}/targetDailyWaterIntake")
    public ResponseEntity<Integer> getTargetDailyWaterIntake(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getTargetDailyWaterIntake(userId));
    }

    // 식사 시간 조회
    @GetMapping("/{userId}/mealTimes")
    public ResponseEntity<Map<String, LocalTime>> getMealTimes(@PathVariable Long userId) {
        return ResponseEntity.ok(userConfigService.getMealTimes(userId));
    }
}
