package com.prologue.ballife.analyzer;

/**
 * 혈당 분석 결과.
 * 공복혈당 / 식전혈당 / 식후혈당 세 그룹을 각각 분석한다.
 * 측정 기록이 없는 그룹의 필드는 null.
 *
 * - 공복(fasting)  : "BloodSugar-공복" 카테고리. 8시간 이상 공복 기준.
 * - 식전(preMeal)  : "BloodSugar-아침식전 / 점심식전 / 저녁식전". 마지막 식사 후 4~6시간
 *                   경과한 "공복에 가까운 상태"로 보아, 공복 기준치(70-99 정상)를 그대로 적용.
 * - 식후(postMeal) : "BloodSugar-아침식후 / 점심식후 / 저녁식후". 식후 2시간 기준.
 *
 * 취침전(BloodSugar-취침전)은 저녁식후 영향이 남아있어 공복도 식후도 아니므로 분석에서 제외.
 *
 * 필드 순서: (기존 9개 → 뒤에 min/max 6개 추가)
 *   기존 — fastingValue/Status/Label, preMealValue/Status/Label, postMealValue/Status/Label
 *   추가 — fastingMin/Max, preMealMin/Max, postMealMin/Max (보고서용)
 */
public record BloodSugarAnalysisResult(
        Integer fastingValue,    // 공복혈당 평균 (없으면 null)
        String  fastingStatus,   // "NORMAL"/"LOW"/"CAUTION"/"RISK"
        String  fastingLabel,    // "다소 높음 (100-125)"

        Integer preMealValue,    // 식전혈당 평균 (없으면 null)
        String  preMealStatus,   // "NORMAL"/"LOW"/"CAUTION"/"RISK"
        String  preMealLabel,    // 공복 기준치 라벨 그대로 사용

        Integer postMealValue,   // 식후혈당 평균 (없으면 null)
        String  postMealStatus,
        String  postMealLabel,

        Integer fastingMin,      // 공복 최저값 (없으면 null)
        Integer fastingMax,      // 공복 최고값 (없으면 null)
        Integer preMealMin,      // 식전 최저값
        Integer preMealMax,      // 식전 최고값
        Integer postMealMin,     // 식후 최저값
        Integer postMealMax      // 식후 최고값
) {}
