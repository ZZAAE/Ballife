package com.prologue.ballife.analyzer;

import com.prologue.ballife.standard.BloodSugarStandard;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 혈당 분석기.
 * 공복/식전/식후 측정값 리스트를 받아 각 그룹의 평균/min/max를 내고 구간을 분류한다.
 *
 * - 공복(fasting)  : BloodSugarStandard.classifyFasting 적용
 * - 식전(preMeal)  : 공복에 준하는 상태로 보고 동일하게 classifyFasting 재사용
 * - 식후(postMeal) : BloodSugarStandard.classifyPostMeal 적용
 *
 * 측정 기록이 없는 그룹은 결과 필드가 null로 채워진다.
 */
@Component
public class BloodSugarAnalyzer {

    public BloodSugarAnalysisResult analyze(List<Integer> fastingValues,
                                            List<Integer> preMealValues,
                                            List<Integer> postMealValues) {
        // 공복혈당 처리
        Integer fastingAvg = average(fastingValues);
        BloodSugarStandard.Fasting f = (fastingAvg == null)
                ? null
                : BloodSugarStandard.classifyFasting(fastingAvg);

        // 식전혈당 처리 (공복 분류 기준 재사용)
        Integer preMealAvg = average(preMealValues);
        BloodSugarStandard.Fasting pre = (preMealAvg == null)
                ? null
                : BloodSugarStandard.classifyFasting(preMealAvg);

        // 식후혈당 처리
        Integer postMealAvg = average(postMealValues);
        BloodSugarStandard.PostMeal p = (postMealAvg == null)
                ? null
                : BloodSugarStandard.classifyPostMeal(postMealAvg);

        return new BloodSugarAnalysisResult(
                fastingAvg,
                f   == null ? null : f.status,
                f   == null ? null : f.label,

                preMealAvg,
                pre == null ? null : pre.status,
                pre == null ? null : pre.label,

                postMealAvg,
                p   == null ? null : p.status,
                p   == null ? null : p.label,

                // min/max — 빈 리스트면 null
                min(fastingValues),  max(fastingValues),
                min(preMealValues),  max(preMealValues),
                min(postMealValues), max(postMealValues)
        );
    }

    /** 리스트 평균(반올림 정수). null/빈 리스트면 null 반환. */
    private Integer average(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        int sum = 0;
        for (Integer v : values) sum += v;
        return Math.round((float) sum / values.size());
    }

    private Integer min(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        int m = Integer.MAX_VALUE;
        for (Integer v : values) if (v < m) m = v;
        return m;
    }

    private Integer max(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        int m = Integer.MIN_VALUE;
        for (Integer v : values) if (v > m) m = v;
        return m;
    }
}