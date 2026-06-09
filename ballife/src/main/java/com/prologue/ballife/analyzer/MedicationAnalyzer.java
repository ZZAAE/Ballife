package com.prologue.ballife.analyzer;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.standard.MedicationStandard;
import org.springframework.stereotype.Component;

/**
 * 복약 이행률 분석기.
 */
@Component
public class MedicationAnalyzer {

    private final MessageResolver messages;

    public MedicationAnalyzer(MessageResolver messages) {
        this.messages = messages;
    }

    /**
     * @param scheduledCount 예정 복약 수. 0 이하면 분석 불가 → 모든 필드 null
     * @param takenCount     실제 복약 수
     */
    public MedicationAnalysisResult analyze(int scheduledCount, int takenCount) {
        if (scheduledCount <= 0) {
            return new MedicationAnalysisResult(scheduledCount, takenCount,
                    null, null, null);
        }

        int rate = MedicationStandard.calculateRate(scheduledCount, takenCount);
        MedicationStandard.Adherence ad = MedicationStandard.classify(rate);

        return new MedicationAnalysisResult(
                scheduledCount, takenCount, rate, ad.status, messages.get(ad.code));
    }
}
