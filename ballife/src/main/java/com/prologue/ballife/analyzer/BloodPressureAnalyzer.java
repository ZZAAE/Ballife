package com.prologue.ballife.analyzer;

import com.prologue.ballife.standard.BloodPressureStandard;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 혈압 분석기.
 * 수축기/이완기 측정값 리스트를 받아 평균 내고 GRADE_MAX로 분류한다.
 */
@Component
public class BloodPressureAnalyzer {

    /**
     * @param systolicValues  수축기 측정값 리스트
     * @param diastolicValues 이완기 측정값 리스트
     *
     * 주의: 두 리스트는 같은 측정 시점의 쌍이어야 의미가 있다.
     *       (예: 월요일 측정 → systolic[0], diastolic[0])
     *       리스트 길이가 다르면 각자 평균만 내서 처리한다.
     *       기록이 없으면 모든 필드 null.
     */
    public BloodPressureAnalysisResult analyze(List<Integer> systolicValues,
                                               List<Integer> diastolicValues) {
        Integer avgSys = average(systolicValues);
        Integer avgDia = average(diastolicValues);

        // 둘 중 하나라도 없으면 분석 불가
        if (avgSys == null || avgDia == null) {
            return new BloodPressureAnalysisResult(avgSys, avgDia, null, null, null);
        }

        BloodPressureStandard.Grade grade = BloodPressureStandard.classify(avgSys, avgDia);
        return new BloodPressureAnalysisResult(
                avgSys, avgDia, grade.grade, grade.status, grade.label);
    }

    private Integer average(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        int sum = 0;
        for (Integer v : values) sum += v;
        return Math.round((float) sum / values.size());
    }
}
