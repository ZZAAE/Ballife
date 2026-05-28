package com.prologue.ballife.web.dto.subscription;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.subscription.SubscriptionPlan;
import com.prologue.ballife.domain.subscription.SubscriptionStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class SubscriptionDto {

    // 모의 결제 요청 — 활성화할 플랜
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivateRequest {
        @NotNull(message = "플랜을 선택해주세요")
        private SubscriptionPlan plan; // INDIVIDUAL / FAMILY
    }

    // 내 구독 상태 + 기능 게이팅 플래그
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusResponse {
        private SubscriptionPlan plan;     // NONE 이면 미구독
        private String planName;           // 표시명
        private Integer monthlyPrice;      // 월 요금
        private SubscriptionStatus status; // null 가능(미구독)
        private LocalDateTime startedAt;
        private LocalDateTime expiresAt;
        private boolean active;            // 현재 유효한 구독인지
        private boolean reportAccess;      // 건강 리포트 접근 가능
        private boolean familyAccess;      // 가족 기능 접근 가능
    }
}
