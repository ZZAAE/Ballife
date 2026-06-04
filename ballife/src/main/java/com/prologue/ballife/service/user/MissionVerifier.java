package com.prologue.ballife.service.user;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.prologue.ballife.domain.user.MissionType;
import com.prologue.ballife.repository.user.MissionQueryRepository;

import lombok.RequiredArgsConstructor;

/**
 * 미션의 "실제 행동 달성 여부"를 검증한다.
 * (주기 제한 검증은 MissionService.isClaimable 이 담당; 여기서는 실제로 그 행동을 했는지를 본다)
 */
@Component
@RequiredArgsConstructor
public class MissionVerifier {

    private final MissionQueryRepository query;

    /**
     * @param claimedCount 해당 미션을 지금까지 수령한 횟수 (반복 미션 검증에 사용)
     * @return 실제 행동을 수행해 미션 조건을 달성했으면 true
     */
    public boolean isAchieved(Long userId, MissionType type, LocalDate today, int claimedCount) {
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime weekStart = today
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();

        switch (type) {
            case DAILY_RECORD:
                // 오늘 어떤 기록(식단/운동/생체/복약)이라도 남겼는가
                return query.recordDates(userId).contains(today);
            case DAILY_RECOMMEND:
                // 오늘 게시글/댓글 추천을 눌렀는가
                return query.countRecommendsSince(userId, dayStart) > 0;
            case WEEKLY_COMMENT:
                // 이번 주에 댓글을 작성했는가
                return query.countCommentsSince(userId, weekStart) > 0;
            case WEEKLY_POST:
                // 이번 주에 게시글을 작성했는가
                return query.countPostsSince(userId, weekStart) > 0;
            case FIRST_SUBSCRIBE:
                return query.hasSubscription(userId);
            case FIRST_FAMILY:
                return query.hasFamily(userId);
            case EACH_REGISTER:
                // 수령 횟수보다 등록한 처방전이 더 많을 때만 (등록 1건당 1회 수령)
                return query.prescriptionCount(userId) > claimedCount;
            case STREAK_7:
                return currentStreak(userId, today) >= 7;
            case STREAK_30:
                return currentStreak(userId, today) >= 30;
            case PET_CHECK:
            default:
                // 펫 도메인이 아직 없어 실제 검증 불가 → 일일 주기 제한만 적용
                return true;
        }
    }

    /** 오늘부터 거꾸로 이어지는 연속 기록 일수 */
    private int currentStreak(Long userId, LocalDate today) {
        Set<LocalDate> dates = query.recordDates(userId);
        int streak = 0;
        LocalDate cursor = today;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
