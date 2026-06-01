package com.prologue.ballife.analyzer;

/**
 * 혈압 분석 결과.
 * 측정 기록이 없으면 모든 필드 null.
 *
 * 필드 순서: (기존 5개 → 뒤에 min/max 4개 추가)
 *   기존 — avgSystolic, avgDiastolic, grade, status, label
 *   추가 — minSystolic, maxSystolic, minDiastolic, maxDiastolic (보고서용)
 */
public record BloodPressureAnalysisResult(
        Integer avgSystolic,   // 수축기 평균 (없으면 null)
        Integer avgDiastolic,  // 이완기 평균 (없으면 null)
        Integer grade,         // 0~4 (없으면 null)
        String  status,        // "NORMAL"/"CAUTION"/"RISK"
        String  label,         // "높음 (140-159 또는 90-99)" 등

        Integer minSystolic,   // 수축기 최저값 (없으면 null)
        Integer maxSystolic,   // 수축기 최고값 (없으면 null)
        Integer minDiastolic,  // 이완기 최저값 (없으면 null)
        Integer maxDiastolic   // 이완기 최고값 (없으면 null)
) {}