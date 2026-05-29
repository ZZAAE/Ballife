package com.prologue.ballife.analyzer;

/**
 * 혈압 분석 결과.
 * 측정 기록이 없으면 모든 필드 null.
 */
public record BloodPressureAnalysisResult(
        Integer avgSystolic,   // 수축기 평균 (없으면 null)
        Integer avgDiastolic,  // 이완기 평균 (없으면 null)
        Integer grade,         // 0~4 (없으면 null)
        String  status,        // "NORMAL"/"CAUTION"/"RISK"
        String  label          // "높음 (140-159 또는 90-99)" 등
) {}
