package com.prologue.ballife.standard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * BMI 기준표(BmiStandard) 단위 테스트.
 *
 * 구간:
 *   < 18.5       → UNDERWEIGHT (LOW)
 *   18.5 - 22.9  → NORMAL
 *   23.0 - 24.9  → OVERWEIGHT (CAUTION)
 *   25.0 - 29.9  → OBESE (RISK)
 *   30.0 - 34.9  → SEVERELY_OBESE (RISK)
 *   35.0+        → MORBIDLY_OBESE (RISK)
 */
class BmiStandardTest {

    // ============================================================
    //  BMI 계산
    // ============================================================
    @Nested
    @DisplayName("BMI 계산 (calculate)")
    class Calculate {

        @Test
        @DisplayName("162cm / 58kg → 22.1 (Standard 주석 예시)")
        void example_162_58() {
            // given
            double heightCm = 162;
            double weightKg = 58;
            // when
            double bmi = BmiStandard.calculate(heightCm, weightKg);
            // then
            assertThat(bmi).isEqualTo(22.1);
        }

        @Test
        @DisplayName("170cm / 65kg → 22.5 (소수점 1자리 반올림)")
        void example_170_65() {
            assertThat(BmiStandard.calculate(170, 65)).isEqualTo(22.5);
        }

        @Test
        @DisplayName("heightCm = 0 → IllegalArgumentException")
        void zero_height_throws() {
            assertThatThrownBy(() -> BmiStandard.calculate(0, 60))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("heightCm must be > 0");
        }

        @Test
        @DisplayName("heightCm = -1 → IllegalArgumentException")
        void negative_height_throws() {
            assertThatThrownBy(() -> BmiStandard.calculate(-1, 60))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ============================================================
    //  BMI 구간 분류
    // ============================================================
    @Nested
    @DisplayName("BMI 구간 분류 (classify)")
    class Classify {

        @Test
        @DisplayName("18.4 → UNDERWEIGHT (저체중 상한 바로 아래)")
        void boundary_18_4_UNDERWEIGHT() {
            BmiStandard.Range r = BmiStandard.classify(18.4);

            assertThat(r).isEqualTo(BmiStandard.Range.UNDERWEIGHT);
            assertThat(r.status).isEqualTo("LOW");
            assertThat(r.label).isEqualTo("저체중 (18.5 미만)");
        }

        @Test
        @DisplayName("18.5 → NORMAL (정상 하한 경계)")
        void boundary_18_5_NORMAL() {
            BmiStandard.Range r = BmiStandard.classify(18.5);

            assertThat(r).isEqualTo(BmiStandard.Range.NORMAL);
            assertThat(r.status).isEqualTo("NORMAL");
            assertThat(r.label).isEqualTo("정상 (18.5-22.9)");
        }

        @Test
        @DisplayName("22.9 → NORMAL (정상 상한 경계)")
        void boundary_22_9_NORMAL() {
            assertThat(BmiStandard.classify(22.9))
                    .isEqualTo(BmiStandard.Range.NORMAL);
        }

        @Test
        @DisplayName("23.0 → OVERWEIGHT (과체중 하한 경계)")
        void boundary_23_0_OVERWEIGHT() {
            BmiStandard.Range r = BmiStandard.classify(23.0);

            assertThat(r).isEqualTo(BmiStandard.Range.OVERWEIGHT);
            assertThat(r.status).isEqualTo("CAUTION");
            assertThat(r.label).isEqualTo("과체중 (23.0-24.9)");
        }

        @Test
        @DisplayName("24.9 → OVERWEIGHT (과체중 상한 경계)")
        void boundary_24_9_OVERWEIGHT() {
            assertThat(BmiStandard.classify(24.9))
                    .isEqualTo(BmiStandard.Range.OVERWEIGHT);
        }

        @Test
        @DisplayName("25.0 → OBESE (비만 하한 경계)")
        void boundary_25_0_OBESE() {
            BmiStandard.Range r = BmiStandard.classify(25.0);

            assertThat(r).isEqualTo(BmiStandard.Range.OBESE);
            assertThat(r.status).isEqualTo("RISK");
            assertThat(r.label).isEqualTo("비만 (25.0-29.9)");
        }

        @Test
        @DisplayName("29.9 → OBESE (비만 상한 경계)")
        void boundary_29_9_OBESE() {
            assertThat(BmiStandard.classify(29.9))
                    .isEqualTo(BmiStandard.Range.OBESE);
        }

        @Test
        @DisplayName("30.0 → SEVERELY_OBESE (고도 비만 하한 경계)")
        void boundary_30_0_SEVERELY_OBESE() {
            BmiStandard.Range r = BmiStandard.classify(30.0);

            assertThat(r).isEqualTo(BmiStandard.Range.SEVERELY_OBESE);
            assertThat(r.status).isEqualTo("RISK");
            assertThat(r.label).isEqualTo("고도 비만 (30.0-34.9)");
        }

        @Test
        @DisplayName("34.9 → SEVERELY_OBESE (고도 비만 상한 경계)")
        void boundary_34_9_SEVERELY_OBESE() {
            assertThat(BmiStandard.classify(34.9))
                    .isEqualTo(BmiStandard.Range.SEVERELY_OBESE);
        }

        @Test
        @DisplayName("35.0 → MORBIDLY_OBESE (초고도 비만 하한 경계)")
        void boundary_35_0_MORBIDLY_OBESE() {
            BmiStandard.Range r = BmiStandard.classify(35.0);

            assertThat(r).isEqualTo(BmiStandard.Range.MORBIDLY_OBESE);
            assertThat(r.status).isEqualTo("RISK");
            assertThat(r.label).isEqualTo("초고도 비만 (35.0 이상)");
        }

        @Test
        @DisplayName("0.0 → UNDERWEIGHT (극단 저값)")
        void extreme_0_UNDERWEIGHT() {
            assertThat(BmiStandard.classify(0.0))
                    .isEqualTo(BmiStandard.Range.UNDERWEIGHT);
        }

        @Test
        @DisplayName("100.0 → MORBIDLY_OBESE (극단 고값)")
        void extreme_100_MORBIDLY_OBESE() {
            assertThat(BmiStandard.classify(100.0))
                    .isEqualTo(BmiStandard.Range.MORBIDLY_OBESE);
        }
    }

    // ============================================================
    //  편의 메서드: classifyFrom (계산 + 분류 동시)
    // ============================================================
    @Nested
    @DisplayName("classifyFrom (계산 + 분류)")
    class ClassifyFrom {

        @Test
        @DisplayName("162cm / 58kg → BMI 22.1 → NORMAL")
        void example_normal() {
            assertThat(BmiStandard.classifyFrom(162, 58))
                    .isEqualTo(BmiStandard.Range.NORMAL);
        }

        @Test
        @DisplayName("170cm / 90kg → BMI 31.1 → SEVERELY_OBESE")
        void example_severely_obese() {
            assertThat(BmiStandard.classifyFrom(170, 90))
                    .isEqualTo(BmiStandard.Range.SEVERELY_OBESE);
        }
    }
}