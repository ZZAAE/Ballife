package com.prologue.ballife.analyzer;

import java.util.List;

/**
 * 혈압 분석 결과.
 * 측정 기록이 없으면 통계 필드 모두 null + dailyRecords 빈 list.
 *
 * 필드 순서:
 *   기존 5개   : avgSystolic, avgDiastolic, grade, status, label
 *   min/max 4 : minSystolic, maxSystolic, minDiastolic, maxDiastolic
 *   일별 1개   : dailyRecords  (LLM 시계열 추론 입력)
 */
public record BloodPressureAnalysisResult(
        Integer avgSystolic,
        Integer avgDiastolic,
        Integer grade,
        String  status,
        String  label,

        Integer minSystolic,
        Integer maxSystolic,
        Integer minDiastolic,
        Integer maxDiastolic,

        List<BloodPressureDaily> dailyRecords
) {}
