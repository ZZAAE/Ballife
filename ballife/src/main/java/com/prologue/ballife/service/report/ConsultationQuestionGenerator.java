package com.prologue.ballife.service.report;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

/**
 * 룰 기반 진료 질문 생성기 (LLM 실패 시 fallback).
 *
 * 단독 사용 가능 — LLM 비활성화하거나 비용 절감 모드에서도 사용 가능.
 *
 * 우선순위 규칙:
 *   - 각 카테고리(혈압/혈당 공복/혈당 식후/BMI/복약) 별 최대 1개 질문
 *   - 혈압        : RISK 우선, CAUTION 차순위
 *   - 혈당 공복    : RISK 우선, CAUTION 차순위
 *   - 혈당 식후    : RISK 만
 *   - BMI         : RISK 만
 *   - 복약        : 이행률 60% 미만일 때만
 *
 * 모든 카테고리에서 매칭 없으면 기본 안내 메시지 1개 반환.
 */
@Component
public class ConsultationQuestionGenerator {

    private static final int MEDICATION_LOW_THRESHOLD = 60;

    private final MessageResolver messages;

    public ConsultationQuestionGenerator(MessageResolver messages) {
        this.messages = messages;
    }

    public List<String> generate(HealthAnalysisResponse data) {
        List<String> questions = new ArrayList<>();

        addBloodPressureQuestion(data.bloodPressure(), questions);
        addBloodSugarFastingQuestion(data.bloodSugar(), questions);
        addBloodSugarPostMealQuestion(data.bloodSugar(), questions);
        addBmiQuestion(data.bmi(), questions);
        addMedicationQuestion(data.medication(), questions);

        if (questions.isEmpty()) {
            questions.add(messages.get("report.q.default"));
        }
        return questions;
    }

    private void addBloodPressureQuestion(BloodPressureAnalysisResult bp, List<String> out) {
        if (bp == null) return;
        if ("RISK".equals(bp.status())) {
            out.add(messages.get("report.q.bp.risk"));
        } else if ("CAUTION".equals(bp.status())) {
            out.add(messages.get("report.q.bp.caution"));
        }
    }

    private void addBloodSugarFastingQuestion(BloodSugarAnalysisResult bs, List<String> out) {
        if (bs == null) return;
        if ("RISK".equals(bs.fastingStatus())) {
            out.add(messages.get("report.q.bs.fasting.risk"));
        } else if ("CAUTION".equals(bs.fastingStatus())) {
            out.add(messages.get("report.q.bs.fasting.caution"));
        }
    }

    private void addBloodSugarPostMealQuestion(BloodSugarAnalysisResult bs, List<String> out) {
        if (bs == null) return;
        if ("RISK".equals(bs.postMealStatus())) {
            out.add(messages.get("report.q.bs.postMeal.risk"));
        }
    }

    private void addBmiQuestion(BmiAnalysisResult bmi, List<String> out) {
        if (bmi == null) return;
        if ("RISK".equals(bmi.status())) {
            out.add(messages.get("report.q.bmi.risk"));
        }
    }

    private void addMedicationQuestion(MedicationAnalysisResult med, List<String> out) {
        if (med == null || med.adherenceRate() == null) return;
        if (med.adherenceRate() < MEDICATION_LOW_THRESHOLD) {
            out.add(messages.get("report.q.med.low"));
        }
    }
}