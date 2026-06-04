package com.prologue.ballife.web.dto.user;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MissionDto {

    // 개별 미션 현황
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        private String code;            // MissionType 이름 (예: DAILY_RECORD)
        private String title;           // 미션 제목
        private int reward;             // 보상 포인트
        private String period;          // DAILY/WEEKLY/MONTHLY/ONCE/REPEATABLE
        private boolean claimable;      // 지금 수령 가능한지 (주기 통과 + 행동 달성)
        private boolean achieved;       // 실제 행동을 달성했는지 (주기와 무관)
        private int claimedCount;       // 누적 수령 횟수
        private int maxClaims;          // 최대 수령 횟수 (반복 미션)
        private LocalDateTime lastClaimedAt; // 마지막 수령 시각 (없으면 null)
    }

    // 미션 현황 전체 + 보유 포인트
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private Long point;             // 현재 보유 포인트
        private List<Status> missions;
    }

    // 보상 수령 결과
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimResult {
        private Long point;             // 지급 후 보유 포인트
        private int reward;             // 이번에 지급된 포인트
        private Status mission;         // 갱신된 미션 현황
    }
}
