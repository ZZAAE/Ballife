package com.prologue.ballife.domain.user;

/**
 * 미션 카탈로그.
 * 보상 포인트(reward)와 수령 주기(period)는 서버가 권위를 가진다.
 * 프론트엔드는 code 로 각 미션의 수령 가능 여부/보상을 조회·요청한다.
 */
public enum MissionType {

    // 일일 미션 (하루 1번)
    DAILY_RECORD("기록 · 출석", 1, Period.DAILY, 1),
    DAILY_RECOMMEND("추천", 2, Period.DAILY, 1),

    // 주간 미션 (일주일 1번)
    WEEKLY_COMMENT("댓글 작성", 3, Period.WEEKLY, 1),
    WEEKLY_POST("글쓰기", 5, Period.WEEKLY, 1),

    // 특별 미션
    PET_CHECK("펫 상태 확인", 1, Period.DAILY, 1),
    FIRST_SUBSCRIBE("첫 구독", 10, Period.ONCE, 1),
    FIRST_FAMILY("첫 가족 등록", 20, Period.ONCE, 1),
    EACH_REGISTER("등록할 때마다", 10, Period.REPEATABLE, 3),

    // 연속 기록 보너스
    STREAK_7("7일 연속 기록", 10, Period.WEEKLY, 1),
    STREAK_30("30일 연속 기록", 50, Period.MONTHLY, 1);

    private final String title;
    private final int reward;
    private final Period period;
    private final int maxClaims;

    MissionType(String title, int reward, Period period, int maxClaims) {
        this.title = title;
        this.reward = reward;
        this.period = period;
        this.maxClaims = maxClaims;
    }

    public String getTitle() {
        return title;
    }

    public int getReward() {
        return reward;
    }

    public Period getPeriod() {
        return period;
    }

    public int getMaxClaims() {
        return maxClaims;
    }

    /** 수령 주기 */
    public enum Period {
        DAILY,      // 하루 1번
        WEEKLY,     // 한 주(월~일) 1번
        MONTHLY,    // 한 달 1번
        ONCE,       // 평생 1번
        REPEATABLE  // maxClaims 횟수까지 반복 수령
    }
}
