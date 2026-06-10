package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.DiseaseProfileAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.support.TestMessages;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.Period;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.RecordingStats;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.User;

/**
 * ConsultationQuestionGenerator(룰 fallback) 단위 테스트.
 *
 * 검증 시나리오:
 *   - 혈압 RISK   : 혈압 RISK 질문 포함
 *   - 모두 정상   : 기본 안내 메시지 1개
 *   - 복합 케이스 : 여러 카테고리 동시 → 여러 질문
 */
class ConsultationQuestionGeneratorTest {

    ConsultationQuestionGenerator generator;
    MessageResolver messages;

    @BeforeEach
    void setUp() {
        messages = TestMessages.resolver();
        generator = new ConsultationQuestionGenerator(messages);
    }

    // ============================================================
    //  헬퍼 — 빌더 형태로 시나리오 별 응답 조립
    // ============================================================

    private HealthAnalysisResponse build(
            BloodPressureAnalysisResult bp,
            BloodSugarAnalysisResult bs,
            BmiAnalysisResult bmi,
            MedicationAnalysisResult med) {
        return new HealthAnalysisResponse(
                42L,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                bp, bs, bmi, med,
                new DiseaseProfileAnalysisResult(List.of()),
                new User("홍길동", 30, "남", 170.0, 75.0, List.of()),
                new RecordingStats(0, 0, 0, 30, 0.0, 0.0, 0.0)
        );
    }

    private BloodPressureAnalysisResult bpWith(String status) {
        return new BloodPressureAnalysisResult(
                128, 82, 1, status, "label",
                115, 142, 70, 90,
                List.of());
    }

    private BloodSugarAnalysisResult bsAllNull() {
        return new BloodSugarAnalysisResult(
                null, null, null,
                null, null, null,
                null, null, null,
                null, null, null, null, null, null,
                List.of(), List.of(), List.of());
    }

    private BloodSugarAnalysisResult bsWith(String fastingStatus, String postMealStatus) {
        return new BloodSugarAnalysisResult(
                100, fastingStatus, "label",
                100, "NORMAL",     "label",
                150, postMealStatus, "label",
                90, 110, 90, 110, 130, 170,
                List.of(), List.of(), List.of());
    }

    private BmiAnalysisResult bmiWith(String status) {
        return new BmiAnalysisResult(25.0, status, "label");
    }

    private MedicationAnalysisResult medWith(Integer adherenceRate) {
        return new MedicationAnalysisResult(30, 25, adherenceRate, "NORMAL", "label");
    }

    // ============================================================
    //  A. 혈압 RISK 단일
    // ============================================================
    @Nested
    @DisplayName("혈압 RISK 단일")
    class BloodPressureRisk {

        @Test
        @DisplayName("혈압 RISK + 다른 카테고리 모두 정상 → 혈압 RISK 질문 1개")
        void onlyBloodPressureRisk() {
            HealthAnalysisResponse data = build(
                    bpWith("RISK"),
                    bsAllNull(),
                    bmiWith("NORMAL"),
                    medWith(95));

            List<String> questions = generator.generate(data);

            assertThat(questions)
                    .containsExactly(messages.get("report.q.bp.risk"));
        }
    }

    // ============================================================
    //  B. 모두 정상 → 기본 안내
    // ============================================================
    @Nested
    @DisplayName("모두 정상")
    class AllNormal {

        @Test
        @DisplayName("어떤 카테고리도 매칭 안 됨 → 기본 안내 메시지 1개")
        void allNormal_returnsDefaultMessage() {
            HealthAnalysisResponse data = build(
                    bpWith("NORMAL"),
                    bsWith("NORMAL", "NORMAL"),
                    bmiWith("NORMAL"),
                    medWith(95));

            List<String> questions = generator.generate(data);

            assertThat(questions)
                    .containsExactly(messages.get("report.q.default"));
        }
    }

    // ============================================================
    //  C. 복합 케이스 — 혈압 CAUTION + 식후 RISK + 복약 부족
    // ============================================================
    @Nested
    @DisplayName("복합 케이스")
    class Combined {

        @Test
        @DisplayName("혈압 CAUTION + 혈당 식후 RISK + 복약 50% → 3개 질문 (순서대로)")
        void multipleCategories() {
            HealthAnalysisResponse data = build(
                    bpWith("CAUTION"),
                    bsWith("NORMAL", "RISK"),     // 공복 정상, 식후 RISK
                    bmiWith("NORMAL"),
                    medWith(50));                 // 60 미만

            List<String> questions = generator.generate(data);

            assertThat(questions).containsExactly(
                    messages.get("report.q.bp.caution"),
                    messages.get("report.q.bs.postMeal.risk"),
                    messages.get("report.q.med.low")
            );
        }
    }
}