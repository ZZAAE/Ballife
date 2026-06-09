package com.prologue.ballife.analyzer;

import java.util.List;

/**
 * 혈당 분석 결과.
 * 공복/식전/식후 세 그룹을 각각 분석. 측정 없는 그룹은 필드 null + 일별 빈 list.
 *
 * 필드 순서:
 *   기존 9개   : fastingValue/Status/Label, preMealValue/Status/Label, postMealValue/Status/Label
 *   min/max 6 : fastingMin/Max, preMealMin/Max, postMealMin/Max
 *   일별 3개   : dailyFasting, dailyPreMeal, dailyPostMeal  (LLM 시계열 추론 입력)
 */
public record BloodSugarAnalysisResult(
        Integer fastingValue,
        String  fastingStatus,
        String  fastingLabel,

        Integer preMealValue,
        String  preMealStatus,
        String  preMealLabel,

        Integer postMealValue,
        String  postMealStatus,
        String  postMealLabel,

        Integer fastingMin,
        Integer fastingMax,
        Integer preMealMin,
        Integer preMealMax,
        Integer postMealMin,
        Integer postMealMax,

        List<DailyValue> dailyFasting,
        List<DailyValue> dailyPreMeal,
        List<DailyValue> dailyPostMeal
) {}
