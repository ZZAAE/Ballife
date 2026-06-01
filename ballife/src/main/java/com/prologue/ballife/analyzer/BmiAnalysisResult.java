package com.prologue.ballife.analyzer;

/**
 * BMI 분석 결과.
 * 키/몸무게 정보가 없으면 모든 필드 null.
 */
public record BmiAnalysisResult(
        Double value,     // 계산된 BMI 값 (예: 22.1)
        String status,    // "LOW"/"NORMAL"/"CAUTION"/"RISK"
        String label      // "정상 (18.5-22.9)" 등
) {}
