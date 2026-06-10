package com.prologue.ballife.analyzer;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.standard.BmiStandard;
import org.springframework.stereotype.Component;

/**
 * BMI 분석기.
 * 키(cm), 몸무게(kg)를 받아 BMI 계산 후 구간을 분류한다.
 */
@Component
public class BmiAnalyzer {

    private final MessageResolver messages;

    public BmiAnalyzer(MessageResolver messages) {
        this.messages = messages;
    }

    /**
     * @param heightCm 키 (센티미터). null/0/음수면 분석 불가 → 모든 필드 null 반환
     * @param weightKg 몸무게 (킬로그램). null/0/음수면 분석 불가 → 모든 필드 null 반환
     */
    public BmiAnalysisResult analyze(Double heightCm, Double weightKg) {
        if (heightCm == null || weightKg == null
                || heightCm <= 0 || weightKg <= 0) {
            return new BmiAnalysisResult(null, null, null);
        }

        double bmi = BmiStandard.calculate(heightCm, weightKg);
        BmiStandard.Range range = BmiStandard.classify(bmi);

        return new BmiAnalysisResult(bmi, range.status, messages.get(range.code));
    }
}
