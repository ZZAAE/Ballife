package com.prologue.ballife.service.report;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
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

    static final String Q_BP_RISK =
            "혈압이 위험 수준입니다. 약물 조정 필요성에 대해 상담해 보세요.";
    static final String Q_BP_CAUTION =
            "혈압이 다소 높게 측정되었습니다. 생활습관 관리에 대해 상담해 보세요.";
    static final String Q_BS_FASTING_RISK =
            "공복혈당이 위험 수준입니다. 추가 검사 필요성을 문의해 보세요.";
    static final String Q_BS_FASTING_CAUTION =
            "공복혈당이 다소 높습니다. 식이 조절 방법을 문의해 보세요.";
    static final String Q_BS_POSTMEAL_RISK =
            "식후혈당이 위험 수준입니다. 식사 후 혈당 관리법을 상담해 보세요.";
    static final String Q_BMI_RISK =
            "체중 관리가 필요한 상태입니다. 안전한 감량 방법을 상담해 보세요.";
    static final String Q_MED_LOW =
            "복약 이행률이 낮습니다. 복용을 어렵게 만드는 요인이 있는지 상담해 보세요.";
    static final String Q_DEFAULT =
            "정기 진료 시 평소 궁금했던 점을 자유롭게 상담해 보세요.";

    public List<String> generate(HealthAnalysisResponse data) {
        List<String> questions = new ArrayList<>();

        addBloodPressureQuestion(data.bloodPressure(), questions);
        addBloodSugarFastingQuestion(data.bloodSugar(), questions);
        addBloodSugarPostMealQuestion(data.bloodSugar(), questions);
        addBmiQuestion(data.bmi(), questions);
        addMedicationQuestion(data.medication(), questions);

        if (questions.isEmpty()) {
            questions.add(Q_DEFAULT);
        }
        return questions;
    }

    private void addBloodPressureQuestion(BloodPressureAnalysisResult bp, List<String> out) {
        if (bp == null) return;
        if ("RISK".equals(bp.status())) {
            out.add(Q_BP_RISK);
        } else if ("CAUTION".equals(bp.status())) {
            out.add(Q_BP_CAUTION);
        }
    }

    private void addBloodSugarFastingQuestion(BloodSugarAnalysisResult bs, List<String> out) {
        if (bs == null) return;
        if ("RISK".equals(bs.fastingStatus())) {
            out.add(Q_BS_FASTING_RISK);
        } else if ("CAUTION".equals(bs.fastingStatus())) {
            out.add(Q_BS_FASTING_CAUTION);
        }
    }

    private void addBloodSugarPostMealQuestion(BloodSugarAnalysisResult bs, List<String> out) {
        if (bs == null) return;
        if ("RISK".equals(bs.postMealStatus())) {
            out.add(Q_BS_POSTMEAL_RISK);
        }
    }

    private void addBmiQuestion(BmiAnalysisResult bmi, List<String> out) {
        if (bmi == null) return;
        if ("RISK".equals(bmi.status())) {
            out.add(Q_BMI_RISK);
        }
    }

    private void addMedicationQuestion(MedicationAnalysisResult med, List<String> out) {
        if (med == null || med.adherenceRate() == null) return;
        if (med.adherenceRate() < MEDICATION_LOW_THRESHOLD) {
            out.add(Q_MED_LOW);
        }
    }
}