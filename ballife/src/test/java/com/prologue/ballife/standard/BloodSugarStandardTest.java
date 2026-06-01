package com.prologue.ballife.standard;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * 혈당 기준표(BloodSugarStandard) 단위 테스트.
 *
 * 검증 포인트: 각 구간 경계값에서 의도된 enum / status / label로 정확히 분류되는지.
 *
 * 공복 기준:
 *   < 70   → LOW
 *   70-99  → NORMAL
 *   100-125 → CAUTION
 *   126+   → RISK
 *
 * 식후 기준:
 *   < 70    → LOW
 *   70-139  → NORMAL
 *   140-199 → CAUTION
 *   200+    → RISK
 */
class BloodSugarStandardTest {

    // ============================================================
    //  공복혈당 분류
    // ============================================================
    @Nested
    @DisplayName("공복혈당 분류 (classifyFasting)")
    class ClassifyFasting {

        @Test
        @DisplayName("69 → LOW (정상 하한 바로 아래)")
        void boundary_69_LOW() {
            // given
            int value = 69;
            // when
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(value);
            // then
            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.LOW);
            assertThat(result.status).isEqualTo("LOW");
            assertThat(result.label).isEqualTo("너무 낮음 (70 미만)");
        }

        @Test
        @DisplayName("70 → NORMAL (정상 하한 경계)")
        void boundary_70_NORMAL() {
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(70);

            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.NORMAL);
            assertThat(result.status).isEqualTo("NORMAL");
            assertThat(result.label).isEqualTo("정상 (70-99)");
        }

        @Test
        @DisplayName("99 → NORMAL (정상 상한 경계)")
        void boundary_99_NORMAL() {
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(99);

            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.NORMAL);
            assertThat(result.label).isEqualTo("정상 (70-99)");
        }

        @Test
        @DisplayName("100 → CAUTION (다소 높음 하한 경계)")
        void boundary_100_CAUTION() {
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(100);

            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.CAUTION);
            assertThat(result.status).isEqualTo("CAUTION");
            assertThat(result.label).isEqualTo("다소 높음 (100-125)");
        }

        @Test
        @DisplayName("125 → CAUTION (다소 높음 상한 경계)")
        void boundary_125_CAUTION() {
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(125);

            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.CAUTION);
        }

        @Test
        @DisplayName("126 → RISK (많이 높음 하한 경계)")
        void boundary_126_RISK() {
            BloodSugarStandard.Fasting result = BloodSugarStandard.classifyFasting(126);

            assertThat(result).isEqualTo(BloodSugarStandard.Fasting.RISK);
            assertThat(result.status).isEqualTo("RISK");
            assertThat(result.label).isEqualTo("많이 높음 (126 이상)");
        }

        @Test
        @DisplayName("0 → LOW (극단 저값도 LOW로 분류)")
        void extreme_0_LOW() {
            assertThat(BloodSugarStandard.classifyFasting(0))
                    .isEqualTo(BloodSugarStandard.Fasting.LOW);
        }

        @Test
        @DisplayName("300 → RISK (극단 고값도 RISK로 분류)")
        void extreme_300_RISK() {
            assertThat(BloodSugarStandard.classifyFasting(300))
                    .isEqualTo(BloodSugarStandard.Fasting.RISK);
        }
    }

    // ============================================================
    //  식후혈당 분류
    // ============================================================
    @Nested
    @DisplayName("식후혈당 분류 (classifyPostMeal)")
    class ClassifyPostMeal {

        @Test
        @DisplayName("69 → LOW (정상 하한 바로 아래)")
        void boundary_69_LOW() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(69);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.LOW);
            assertThat(result.status).isEqualTo("LOW");
            assertThat(result.label).isEqualTo("너무 낮음 (70 미만)");
        }

        @Test
        @DisplayName("70 → NORMAL (정상 하한 경계)")
        void boundary_70_NORMAL() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(70);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.NORMAL);
            assertThat(result.status).isEqualTo("NORMAL");
            assertThat(result.label).isEqualTo("정상 (70-139)");
        }

        @Test
        @DisplayName("139 → NORMAL (정상 상한 경계)")
        void boundary_139_NORMAL() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(139);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.NORMAL);
        }

        @Test
        @DisplayName("140 → CAUTION (다소 높음 하한 경계)")
        void boundary_140_CAUTION() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(140);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.CAUTION);
            assertThat(result.status).isEqualTo("CAUTION");
            assertThat(result.label).isEqualTo("다소 높음 (140-199)");
        }

        @Test
        @DisplayName("199 → CAUTION (다소 높음 상한 경계)")
        void boundary_199_CAUTION() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(199);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.CAUTION);
        }

        @Test
        @DisplayName("200 → RISK (많이 높음 하한 경계)")
        void boundary_200_RISK() {
            BloodSugarStandard.PostMeal result = BloodSugarStandard.classifyPostMeal(200);

            assertThat(result).isEqualTo(BloodSugarStandard.PostMeal.RISK);
            assertThat(result.status).isEqualTo("RISK");
            assertThat(result.label).isEqualTo("많이 높음 (200 이상)");
        }

        @Test
        @DisplayName("0 → LOW (극단 저값도 LOW로 분류)")
        void extreme_0_LOW() {
            assertThat(BloodSugarStandard.classifyPostMeal(0))
                    .isEqualTo(BloodSugarStandard.PostMeal.LOW);
        }

        @Test
        @DisplayName("400 → RISK (극단 고값도 RISK로 분류)")
        void extreme_400_RISK() {
            assertThat(BloodSugarStandard.classifyPostMeal(400))
                    .isEqualTo(BloodSugarStandard.PostMeal.RISK);
        }
    }
}