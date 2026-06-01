package com.prologue.ballife.analyzer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

/**
 * 혈당 분석기(BloodSugarAnalyzer) 단위 테스트.
 *
 * 검증 포인트:
 *  - 공복/식전/식후 세 그룹이 서로 섞이지 않고 독립적으로 분석되는지
 *  - 식전이 classifyFasting을 재사용하여 공복과 동일한 라벨이 나오는지 (이번 세션 회귀 방지 핵심)
 *  - 평균 계산(짝수/홀수/반올림 경계) 및 사용 안 한 그룹은 정확히 null인지
 *  - 빈 리스트/null 입력 시 모든 필드가 null인지
 */
class BloodSugarAnalyzerTest {

    private final BloodSugarAnalyzer analyzer = new BloodSugarAnalyzer();

    // ============================================================
    //  A. 빈/null 입력 처리
    // ============================================================
    @Nested
    @DisplayName("빈/null 입력 처리 (EmptyOrNull)")
    class EmptyOrNull {

        @Test
        @DisplayName("세 리스트 모두 null → 9개 필드 전부 null")
        void allNull_allFieldsNull() {
            // given - when
            BloodSugarAnalysisResult result = analyzer.analyze(null, null, null);

            // then
            assertThat(result.fastingValue()).isNull();
            assertThat(result.fastingStatus()).isNull();
            assertThat(result.fastingLabel()).isNull();
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }

        @Test
        @DisplayName("세 리스트 모두 빈 리스트 → 9개 필드 전부 null")
        void allEmpty_allFieldsNull() {
            BloodSugarAnalysisResult result = analyzer.analyze(List.of(), List.of(), List.of());

            assertThat(result.fastingValue()).isNull();
            assertThat(result.fastingStatus()).isNull();
            assertThat(result.fastingLabel()).isNull();
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }
    }

    // ============================================================
    //  B. 한 그룹만 입력 — 나머지 6개 필드가 정확히 null인지 명시 검증
    // ============================================================
    @Nested
    @DisplayName("한 그룹만 입력 (SingleGroup) — 다른 그룹 누출 방지")
    class SingleGroup {

        @Test
        @DisplayName("공복만 [90] → fasting 채워짐 / preMeal·postMeal 6필드 전부 null")
        void fastingOnly_90() {
            BloodSugarAnalysisResult result = analyzer.analyze(List.of(90), null, null);

            // fasting 채워짐
            assertThat(result.fastingValue()).isEqualTo(90);
            assertThat(result.fastingStatus()).isEqualTo("NORMAL");
            assertThat(result.fastingLabel()).isEqualTo("정상 (70-99)");

            // preMeal 3필드 null
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();

            // postMeal 3필드 null
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }

        @Test
        @DisplayName("식전만 [90] → preMeal 채워짐 / fasting·postMeal 6필드 전부 null")
        void preMealOnly_90() {
            BloodSugarAnalysisResult result = analyzer.analyze(null, List.of(90), null);

            // preMeal 채워짐 (공복 기준 재사용 → 같은 라벨)
            assertThat(result.preMealValue()).isEqualTo(90);
            assertThat(result.preMealStatus()).isEqualTo("NORMAL");
            assertThat(result.preMealLabel()).isEqualTo("정상 (70-99)");

            // fasting 3필드 null
            assertThat(result.fastingValue()).isNull();
            assertThat(result.fastingStatus()).isNull();
            assertThat(result.fastingLabel()).isNull();

            // postMeal 3필드 null
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }

        @Test
        @DisplayName("식후만 [120] → postMeal 채워짐 / fasting·preMeal 6필드 전부 null")
        void postMealOnly_120() {
            BloodSugarAnalysisResult result = analyzer.analyze(null, null, List.of(120));

            // postMeal 채워짐 (식후는 70-139가 NORMAL)
            assertThat(result.postMealValue()).isEqualTo(120);
            assertThat(result.postMealStatus()).isEqualTo("NORMAL");
            assertThat(result.postMealLabel()).isEqualTo("정상 (70-139)");

            // fasting 3필드 null
            assertThat(result.fastingValue()).isNull();
            assertThat(result.fastingStatus()).isNull();
            assertThat(result.fastingLabel()).isNull();

            // preMeal 3필드 null
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
        }
    }

    // ============================================================
    //  C. 식전이 공복 기준을 재사용하는지 (회귀 방지 핵심)
    // ============================================================
    @Nested
    @DisplayName("식전은 공복 기준 재사용 (PreMealReusesFastingStandard)")
    class PreMealReusesFastingStandard {

        @Test
        @DisplayName("값 110 → 공복·식전 단독 실행 시 status·label 동일 (CAUTION / 100-125)")
        void preMealAt110_sameAsFasting() {
            BloodSugarAnalysisResult onlyFasting = analyzer.analyze(List.of(110), null, null);
            BloodSugarAnalysisResult onlyPreMeal = analyzer.analyze(null, List.of(110), null);

            // 공복 단독 실행
            assertThat(onlyFasting.fastingStatus()).isEqualTo("CAUTION");
            assertThat(onlyFasting.fastingLabel()).isEqualTo("다소 높음 (100-125)");

            // 식전 단독 실행 — 같은 값이면 같은 status/label
            assertThat(onlyPreMeal.preMealStatus()).isEqualTo(onlyFasting.fastingStatus());
            assertThat(onlyPreMeal.preMealLabel()).isEqualTo(onlyFasting.fastingLabel());
        }

        @Test
        @DisplayName("값 140 → 공복·식전 모두 RISK / '많이 높음 (126 이상)' 동일")
        void preMealAt140_sameAsFasting() {
            BloodSugarAnalysisResult onlyFasting = analyzer.analyze(List.of(140), null, null);
            BloodSugarAnalysisResult onlyPreMeal = analyzer.analyze(null, List.of(140), null);

            assertThat(onlyFasting.fastingStatus()).isEqualTo("RISK");
            assertThat(onlyFasting.fastingLabel()).isEqualTo("많이 높음 (126 이상)");

            assertThat(onlyPreMeal.preMealStatus()).isEqualTo("RISK");
            assertThat(onlyPreMeal.preMealLabel()).isEqualTo("많이 높음 (126 이상)");
        }
    }

    // ============================================================
    //  D. 평균 계산 — 사용 안 한 그룹은 null인지도 매번 같이 검증
    // ============================================================
    @Nested
    @DisplayName("평균 계산 (AverageCalculation)")
    class AverageCalculation {

        @Test
        @DisplayName("공복 [80, 90] 짝수개 → 평균 85 / 다른 그룹 6필드 null")
        void fastingEven_80_90_avg85() {
            BloodSugarAnalysisResult result = analyzer.analyze(List.of(80, 90), null, null);

            // 평균 = 85, NORMAL
            assertThat(result.fastingValue()).isEqualTo(85);
            assertThat(result.fastingStatus()).isEqualTo("NORMAL");
            assertThat(result.fastingLabel()).isEqualTo("정상 (70-99)");

            // 사용 안 한 그룹 6필드 null
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }

        @Test
        @DisplayName("식후 [140, 150, 160] 홀수개 → 평균 150 / 다른 그룹 6필드 null")
        void postMealOdd_140_150_160_avg150() {
            BloodSugarAnalysisResult result = analyzer.analyze(null, null, List.of(140, 150, 160));

            // 평균 = 150, CAUTION (140-199)
            assertThat(result.postMealValue()).isEqualTo(150);
            assertThat(result.postMealStatus()).isEqualTo("CAUTION");
            assertThat(result.postMealLabel()).isEqualTo("다소 높음 (140-199)");

            // 사용 안 한 그룹 6필드 null
            assertThat(result.fastingValue()).isNull();
            assertThat(result.fastingStatus()).isNull();
            assertThat(result.fastingLabel()).isNull();
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
        }

        @Test
        @DisplayName("공복 [99, 100] 반올림 경계 → 평균 99.5 round→100 → CAUTION / 다른 그룹 6필드 null")
        void roundingBoundary_99_100_to_100() {
            BloodSugarAnalysisResult result = analyzer.analyze(List.of(99, 100), null, null);

            // (99+100)/2 = 99.5 → Math.round → 100 → CAUTION
            assertThat(result.fastingValue()).isEqualTo(100);
            assertThat(result.fastingStatus()).isEqualTo("CAUTION");
            assertThat(result.fastingLabel()).isEqualTo("다소 높음 (100-125)");

            // 사용 안 한 그룹 6필드 null
            assertThat(result.preMealValue()).isNull();
            assertThat(result.preMealStatus()).isNull();
            assertThat(result.preMealLabel()).isNull();
            assertThat(result.postMealValue()).isNull();
            assertThat(result.postMealStatus()).isNull();
            assertThat(result.postMealLabel()).isNull();
        }
    }

    // ============================================================
    //  E. 세 그룹 동시 입력 — 각자 다른 구간으로 분류
    // ============================================================
    @Nested
    @DisplayName("세 그룹 동시 입력 (RangeMappingByGroup)")
    class RangeMappingByGroup {

        @Test
        @DisplayName("fasting [60] LOW / preMeal [95] NORMAL / postMeal [210] RISK → 9필드 모두 의도대로")
        void allGroups_differentRanges() {
            BloodSugarAnalysisResult result = analyzer.analyze(
                    List.of(60),   // 공복 LOW (< 70)
                    List.of(95),   // 식전 NORMAL (공복 기준 70-99)
                    List.of(210)   // 식후 RISK (200+)
            );

            // 공복 LOW
            assertThat(result.fastingValue()).isEqualTo(60);
            assertThat(result.fastingStatus()).isEqualTo("LOW");
            assertThat(result.fastingLabel()).isEqualTo("너무 낮음 (70 미만)");

            // 식전 NORMAL (공복 기준 재사용)
            assertThat(result.preMealValue()).isEqualTo(95);
            assertThat(result.preMealStatus()).isEqualTo("NORMAL");
            assertThat(result.preMealLabel()).isEqualTo("정상 (70-99)");

            // 식후 RISK
            assertThat(result.postMealValue()).isEqualTo(210);
            assertThat(result.postMealStatus()).isEqualTo("RISK");
            assertThat(result.postMealLabel()).isEqualTo("많이 높음 (200 이상)");
        }
    }
}