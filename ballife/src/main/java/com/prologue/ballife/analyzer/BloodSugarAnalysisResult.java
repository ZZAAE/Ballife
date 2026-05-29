package com.prologue.ballife.analyzer;

/**
 * 혈당 분석 결과.
 * 공복혈당과 식후혈당을 각각 분석한다. 측정 기록이 없는 쪽은 null.
 */
public record BloodSugarAnalysisResult(
        Integer fastingValue,    // 공복혈당 평균 (없으면 null)
        String  fastingStatus,   // "NORMAL"/"LOW"/"CAUTION"/"RISK"
        String  fastingLabel,    // "다소 높음 (100-125)"

        Integer postMealValue,   // 식후혈당 평균 (없으면 null)
        String  postMealStatus,
        String  postMealLabel
) {}
