package com.prologue.ballife.analyzer;

/**
 * 복약 이행률 분석 결과.
 * 예정 복약이 없으면 모든 필드 null (분석 불가).
 */
public record MedicationAnalysisResult(
        Integer scheduledCount,    // 예정 복약 수
        Integer takenCount,        // 실제 복약 수
        Integer adherenceRate,     // 이행률 (%) 0~100
        String  status,            // "NORMAL"/"CAUTION"/"RISK"
        String  label              // "양호 (80% 이상)" 등
) {}
