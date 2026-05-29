package com.prologue.ballife.analyzer;

import com.prologue.ballife.standard.BloodSugarStandard;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 혈당 분석기.
 * 공복/식후 측정값 리스트를 받아 평균 내고 구간을 분류한다.
 */
@Component
public class BloodSugarAnalyzer {

    public BloodSugarAnalysisResult analyze(List<Integer> fastingValues,
                                            List<Integer> postMealValues) {
        // 공복혈당 처리
        Integer fastingAvg = average(fastingValues);
        BloodSugarStandard.Fasting f = (fastingAvg == null)
                ? null
                : BloodSugarStandard.classifyFasting(fastingAvg);

        // 식후혈당 처리
        Integer postMealAvg = average(postMealValues);
        BloodSugarStandard.PostMeal p = (postMealAvg == null)
                ? null
                : BloodSugarStandard.classifyPostMeal(postMealAvg);

        return new BloodSugarAnalysisResult(
                fastingAvg,
                f == null ? null : f.status,
                f == null ? null : f.label,
                postMealAvg,
                p == null ? null : p.status,
                p == null ? null : p.label
        );
    }

    /** 리스트 평균(반올림 정수). null/빈 리스트면 null 반환. */
    private Integer average(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        int sum = 0;
        for (Integer v : values) sum += v;
        return Math.round((float) sum / values.size());
    }
}
