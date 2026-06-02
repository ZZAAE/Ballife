package com.prologue.ballife.service.report.llm;

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
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.DiseaseSummary;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.Period;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.RecordingStats;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.User;

/**
 * PromptBuilder 단위 테스트.
 *
 * 검증:
 *   - FullData → 핵심 측정값/질환/기록률 문자열이 user prompt 에 정확히 포함
 *   - Null 처리 → 측정 0건 그룹은 "측정 기록 없음", 질환 0개는 "신고된 질환 없음"
 */
class PromptBuilderTest {

    PromptBuilder builder;

    @BeforeEach
    void setUp() {
        builder = new PromptBuilder();
    }

    private HealthAnalysisResponse buildFull() {
        return new HealthAnalysisResponse(
                42L,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(128, 82, 1, "CAUTION", "다소 높음", 115, 142, 70, 90),
                new BloodSugarAnalysisResult(
                        108, "CAUTION", "다소 높음",
                        101, "CAUTION", "다소 높음",
                        168, "CAUTION", "다소 높음",
                        95, 125, 95, 112, 145, 215),
                new BmiAnalysisResult(25.8, "RISK", "비만"),
                new MedicationAnalysisResult(30, 21, 70, "CAUTION", "다소 부족"),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("홍길동", 30, "남", 170.0, 75.0, List.of(
                        new DiseaseSummary("고혈압", "1기"),
                        new DiseaseSummary("당뇨",   "2형"))),
                new RecordingStats(23, 28, 25, 30, 0.767, 0.933, 0.833)
        );
    }

    private HealthAnalysisResponse buildAllNull() {
        return new HealthAnalysisResponse(
                42L,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(null, null, null, null, null, null, null, null, null),
                new BloodSugarAnalysisResult(
                        null, null, null,
                        null, null, null,
                        null, null, null,
                        null, null, null, null, null, null),
                new BmiAnalysisResult(null, null, null),
                new MedicationAnalysisResult(null, null, null, null, null),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("김환자", null, null, null, null, List.of()),  // 질환 0
                new RecordingStats(0, 0, 0, 30, 0.0, 0.0, 0.0)
        );
    }

    @Nested
    @DisplayName("FullData — 핵심 데이터 포함")
    class FullData {

        @Test
        @DisplayName("user prompt 에 측정값/질환/기록률 핵심 문자열이 정확히 포함")
        void userPrompt_containsCoreFields() {
            String prompt = builder.buildUserPrompt(buildFull());

            assertThat(prompt)
                    .as("분석 기간")
                    .contains("2026-05-03", "2026-06-01", "30일")
                    .as("보유 질환")
                    .contains("고혈압(1기)", "당뇨(2형)")
                    .as("혈압")
                    .contains("수축기 평균 128", "115~142", "이완기 평균 82", "70~90")
                    .as("혈당")
                    .contains("공복 평균 108", "95~125", "식전 평균 101", "식후 평균 168", "145~215")
                    .as("BMI / 복약")
                    .contains("BMI: 25.8", "비만", "복약 이행률: 70% (21/30회)")
                    .as("측정 기록률")
                    .contains("혈압 76.7%", "혈당 93.3%", "복약 83.3%")
                    .as("마무리 지시문")
                    .contains("진료 질문 3~5개 생성");
        }
    }

    @Nested
    @DisplayName("Null 처리")
    class NullHandling {

        @Test
        @DisplayName("측정 0건 그룹은 '측정 기록 없음', 질환 0개는 '신고된 질환 없음'")
        void nullFields_renderPlaceholders() {
            String prompt = builder.buildUserPrompt(buildAllNull());

            assertThat(prompt)
                    .contains("신고된 질환 없음")
                    .contains("측정 기록 없음")  // 혈압/혈당/BMI 공통
                    .contains("예정 복약 없음")
                    .doesNotContain("null");
        }
    }
}