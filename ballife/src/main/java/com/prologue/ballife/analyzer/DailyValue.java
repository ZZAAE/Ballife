package com.prologue.ballife.analyzer;

import java.time.LocalDate;

/**
 * 일별 단일 측정값 평균 (LLM 고도화 — Step 17 Phase A).
 * 혈당 공복/식전/식후 그룹별로 사용.
 *
 *   date  : 측정 날짜
 *   value : 그 날 평균 (같은 날 여러 측정 → AVG)
 *
 * 순수 데이터 record — 표현 필드 없음.
 */
public record DailyValue(
        LocalDate date,
        Double value
) {}
