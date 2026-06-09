package com.prologue.ballife.domain.subscription;

/**
 * 구독 플랜 — 가격/표시명을 코드에 하드코딩(별도 테이블 아님).
 * INDIVIDUAL/FAMILY 는 건강 리포트 접근을 부여하고, FAMILY 는 추가로 가족 기능을 부여한다.
 */
public enum SubscriptionPlan {

    NONE(0, "무료"),
    INDIVIDUAL(4900, "개인 플랜"),
    FAMILY(9900, "가족 플랜");

    private final int monthlyPrice;
    private final String displayName;

    SubscriptionPlan(int monthlyPrice, String displayName) {
        this.monthlyPrice = monthlyPrice;
        this.displayName = displayName;
    }

    public int getMonthlyPrice() {
        return monthlyPrice;
    }

    public String getDisplayName() {
        return displayName;
    }

    // 건강 리포트 접근 권한이 있는 플랜인지
    public boolean grantsReport() {
        return this == INDIVIDUAL || this == FAMILY;
    }

    // 가족 기능 접근 권한이 있는 플랜인지
    public boolean grantsFamily() {
        return this == FAMILY;
    }
}
