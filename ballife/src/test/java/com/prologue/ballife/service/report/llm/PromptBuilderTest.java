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
 *   - FullData            : 핵심 측정값/질환/기록률 문자열이 user prompt 에 포함
 *   - NullHandling        : 측정 0건 → "측정 기록 없음", 질환 0개 → "신고된 질환 없음"
 *   - StatusBadgeAbnormal : CAUTION/RISK/LOW 항목에 status 코드 + "질문 대상" 마커
 *   - StatusBadgeNormal   : NORMAL 항목에 status 코드 + "정상이므로 질문 제외" 마커
 *   - SystemPromptFewShot : 시스템 프롬프트에 few-shot + anti-example + 핵심 원칙 포함
 */
class PromptBuilderTest {

    PromptBuilder builder;

    @BeforeEach
    void setUp() {
        builder = new PromptBuilder();
    }

    // ============================================================
    //  헬퍼 — 시나리오 별 빌더
    // ============================================================

    private HealthAnalysisResponse buildFull() {
        return new HealthAnalysisResponse(
                42L,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(128, 82, 1, "CAUTION", "다소 높음", 115, 142, 70, 90,
                        List.of()),
                new BloodSugarAnalysisResult(
                        108, "CAUTION", "다소 높음",
                        101, "CAUTION", "다소 높음",
                        168, "CAUTION", "다소 높음",
                        95, 125, 95, 112, 145, 215,
                        List.of(), List.of(), List.of()),
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
                new BloodPressureAnalysisResult(null, null, null, null, null, null, null, null, null,
                        List.of()),
                new BloodSugarAnalysisResult(
                        null, null, null,
                        null, null, null,
                        null, null, null,
                        null, null, null, null, null, null,
                        List.of(), List.of(), List.of()),
                new BmiAnalysisResult(null, null, null),
                new MedicationAnalysisResult(null, null, null, null, null),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("김환자", null, null, null, null, List.of()),
                new RecordingStats(0, 0, 0, 30, 0.0, 0.0, 0.0)
        );
    }

    /** 모든 status 가 NORMAL — LLM 이 질문 0개 생성하도록 유도되어야 함. */
    private HealthAnalysisResponse buildAllNormal() {
        return new HealthAnalysisResponse(
                42L,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(114, 75, 0, "NORMAL", "정상", 110, 118, 70, 80,
                        List.of()),
                new BloodSugarAnalysisResult(
                        90, "NORMAL", "정상",
                        92, "NORMAL", "정상",
                        130, "NORMAL", "정상",
                        85, 95, 88, 96, 120, 138,
                        List.of(), List.of(), List.of()),
                new BmiAnalysisResult(22.0, "NORMAL", "정상"),
                new MedicationAnalysisResult(30, 28, 93, "NORMAL", "양호"),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("이건강", 35, "여", 165.0, 60.0, List.of()),
                new RecordingStats(25, 30, 28, 30, 0.833, 1.000, 0.933)
        );
    }

    // ============================================================

    @Nested
    @DisplayName("FullData — 핵심 데이터 포함")
    class FullData {

        @Test
        @DisplayName("user prompt 에 측정값/질환/기록률 핵심 문자열이 정확히 포함")
        void userPrompt_containsCoreFields() {
            String prompt = builder.buildUserPrompt(buildFull());

            assertThat(prompt)
                    .as("분석 기간").contains("2026-05-03", "2026-06-01", "30일")
                    .as("보유 질환").contains("고혈압(1기)", "당뇨(2형)")
                    .as("혈압").contains("수축기 평균 128", "115~142", "이완기 평균 82", "70~90")
                    .as("혈당").contains("공복 평균 108", "95~125", "식전 평균 101", "식후 평균 168", "145~215")
                    .as("BMI / 복약").contains("BMI: 25.8", "비만", "복약 이행률: 70% (21/30회)")
                    .as("측정 기록률").contains("혈압 76.7%", "혈당 93.3%", "복약 83.3%")
                    .as("마무리 지시문").contains("진료 질문", "NORMAL", "제외");
        }
    }

    @Nested
    @DisplayName("NullHandling — 측정 0건 / 질환 0개")
    class NullHandling {

        @Test
        @DisplayName("측정 0건 그룹은 '측정 기록 없음', 질환 0개는 '신고된 질환 없음'")
        void nullFields_renderPlaceholders() {
            String prompt = builder.buildUserPrompt(buildAllNull());

            assertThat(prompt)
                    .contains("신고된 질환 없음")
                    .contains("측정 기록 없음")
                    .contains("예정 복약 없음")
                    .doesNotContain("null")
                    .doesNotContain("[NORMAL]")
                    .doesNotContain("[CAUTION]")
                    .doesNotContain("[RISK]");
        }
    }

    @Nested
    @DisplayName("StatusBadge — 비정상 항목 (CAUTION/RISK)")
    class StatusBadgeAbnormal {

        @Test
        @DisplayName("CAUTION/RISK 항목 옆에 status 코드 + '질문 대상' 마커 표시")
        void abnormalStatuses_haveTargetMarker() {
            String prompt = builder.buildUserPrompt(buildFull());

            assertThat(prompt)
                    .as("CAUTION 표시").contains("[CAUTION]")
                    .as("RISK 표시").contains("[RISK]")
                    .as("질문 대상 마커").contains("← 질문 대상")
                    .as("정상 마커 없음").doesNotContain("← 정상이므로 질문 제외");
        }
    }

    @Nested
    @DisplayName("StatusBadge — 정상 항목 (NORMAL)")
    class StatusBadgeNormal {

        @Test
        @DisplayName("모든 항목이 NORMAL 일 때 status 코드 + '정상이므로 질문 제외' 마커 표시")
        void allNormalStatuses_haveSkipMarker() {
            String prompt = builder.buildUserPrompt(buildAllNormal());

            assertThat(prompt)
                    .as("NORMAL 표시").contains("[NORMAL]")
                    .as("질문 제외 마커").contains("← 정상이므로 질문 제외")
                    .as("질문 대상 마커 없음").doesNotContain("← 질문 대상")
                    .as("CAUTION/RISK 없음").doesNotContain("[CAUTION]").doesNotContain("[RISK]");
        }
    }

    @Nested
    @DisplayName("System Prompt — few-shot + anti-example + 핵심 원칙")
    class SystemPromptFewShot {

        @Test
        @DisplayName("시스템 프롬프트에 핵심 원칙, 좋은 예시, 나쁜 예시가 모두 포함")
        void systemPrompt_containsFewShotAndAntiExample() {
            String sys = builder.buildSystemPrompt();

            assertThat(sys)
                    .as("핵심 원칙 — NORMAL 제외 강조")
                    .contains("정상(NORMAL)인 항목은 질문 생성 금지")
                    .as("좋은 예시 헤더").contains("[좋은 예시]")
                    .as("좋은 예시 — BMI/혈당/혈압 중 적어도 하나의 수치 포함")
                    .containsAnyOf("35.8 (비만)", "125mg/dL", "142mmHg")
                    .as("나쁜 예시 헤더").contains("[나쁜 예시")
                    .as("나쁜 예시 — 정상 수치 억지 질문 금지")
                    .contains("정상 수치에 대한 억지 질문 X")
                    .as("응답 형식 JSON only").contains("JSON 객체만 출력");
        }
    }
}