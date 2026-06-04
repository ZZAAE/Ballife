package com.prologue.ballife.analyzer;

import java.time.LocalDate;

/**
 * 혈압 일별 평균 (LLM 고도화 — Step 17 Phase A).
 *
 *   date       : 측정 날짜
 *   systolic   : 그 날 수축기 평균 (같은 날 여러 측정 → AVG)
 *   diastolic  : 그 날 이완기 평균
 *
 * 순수 데이터 record — 표현 필드(차트 width 등) 없음.
 * PromptBuilder 가 LLM 프롬프트 작성 시 "5월 15일에 평균보다 높았다" 같은
 * 시계열 패턴 추론 입력으로 사용.
 */
public record BloodPressureDaily(
        LocalDate date,
        Double systolic,
        Double diastolic
) {}
