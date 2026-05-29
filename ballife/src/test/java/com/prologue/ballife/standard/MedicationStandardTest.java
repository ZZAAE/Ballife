package com.prologue.ballife.standard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * 복약 이행률 기준표(MedicationStandard) 단위 테스트.
 *
 * 이행률 구간:
 *   ≤ 59%   → LOW   (RISK,    "많이 부족")
 *   60-79%  → MID   (CAUTION, "다소 부족")
 *   ≥ 80%   → GOOD  (NORMAL,  "양호")
 */
class MedicationStandardTest {

    // ============================================================
    //  이행률 계산
    // ============================================================
    @Nested
    @DisplayName("이행률 계산 (calculateRate)")
    class CalculateRate {

        @Test
        @DisplayName("scheduled=10, taken=7 → 70%")
        void simple_70() {
            assertThat(MedicationStandard.calculateRate(10, 7)).isEqualTo(70);
        }

        @Test
        @DisplayName("scheduled=14, taken=14 → 100%")
        void full_100() {
            assertThat(MedicationStandard.calculateRate(14, 14)).isEqualTo(100);
        }

        @Test
        @DisplayName("scheduled=10, taken=0 → 0%")
        void none_taken_0() {
            assertThat(MedicationStandard.calculateRate(10, 0)).isEqualTo(0);
        }

        @Test
        @DisplayName("scheduled=3, taken=1 → 33% (반올림)")
        void rounding_33() {
            // 1/3 = 0.3333... → 33.33% → 반올림 33
            assertThat(MedicationStandard.calculateRate(3, 1)).isEqualTo(33);
        }

        @Test
        @DisplayName("scheduled=3, taken=2 → 67% (반올림)")
        void rounding_67() {
            // 2/3 = 0.6666... → 66.66% → 반올림 67
            assertThat(MedicationStandard.calculateRate(3, 2)).isEqualTo(67);
        }

        @Test
        @DisplayName("scheduled=0 → IllegalArgumentException (0으로 나눌 수 없음)")
        void zero_scheduled_throws() {
            assertThatThrownBy(() -> MedicationStandard.calculateRate(0, 0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("scheduledCount must be > 0");
        }

        @Test
        @DisplayName("scheduled=-1 → IllegalArgumentException")
        void negative_scheduled_throws() {
            assertThatThrownBy(() -> MedicationStandard.calculateRate(-1, 0))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ============================================================
    //  이행률 분류
    // ============================================================
    @Nested
    @DisplayName("이행률 분류 (classify)")
    class Classify {

        @Test
        @DisplayName("0% → LOW (RISK, 많이 부족)")
        void zero_LOW() {
            MedicationStandard.Adherence a = MedicationStandard.classify(0);

            assertThat(a).isEqualTo(MedicationStandard.Adherence.LOW);
            assertThat(a.status).isEqualTo("RISK");
            assertThat(a.label).isEqualTo("많이 부족 (59% 이하)");
        }

        @Test
        @DisplayName("59% → LOW (LOW 상한 경계)")
        void boundary_59_LOW() {
            assertThat(MedicationStandard.classify(59))
                    .isEqualTo(MedicationStandard.Adherence.LOW);
        }

        @Test
        @DisplayName("60% → MID (MID 하한 경계)")
        void boundary_60_MID() {
            MedicationStandard.Adherence a = MedicationStandard.classify(60);

            assertThat(a).isEqualTo(MedicationStandard.Adherence.MID);
            assertThat(a.status).isEqualTo("CAUTION");
            assertThat(a.label).isEqualTo("다소 부족 (60-79%)");
        }

        @Test
        @DisplayName("79% → MID (MID 상한 경계)")
        void boundary_79_MID() {
            assertThat(MedicationStandard.classify(79))
                    .isEqualTo(MedicationStandard.Adherence.MID);
        }

        @Test
        @DisplayName("80% → GOOD (GOOD 하한 경계)")
        void boundary_80_GOOD() {
            MedicationStandard.Adherence a = MedicationStandard.classify(80);

            assertThat(a).isEqualTo(MedicationStandard.Adherence.GOOD);
            assertThat(a.status).isEqualTo("NORMAL");
            assertThat(a.label).isEqualTo("양호 (80% 이상)");
        }

        @Test
        @DisplayName("100% → GOOD")
        void full_GOOD() {
            assertThat(MedicationStandard.classify(100))
                    .isEqualTo(MedicationStandard.Adherence.GOOD);
        }
    }
}