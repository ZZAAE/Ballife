package com.prologue.ballife.standard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * 혈압 기준표(BloodPressureStandard) 단위 테스트.
 *
 * 수축기 등급:
 *   < 120        → 0 (NORMAL)
 *   120 - 129    → 1 (CAUTION, 약간 높음)
 *   130 - 139    → 2 (CAUTION, 다소 높음)
 *   140 - 159    → 3 (RISK, 높음)
 *   160+         → 4 (RISK, 많이 높음)
 *
 * 이완기 등급 (1이 의도적으로 빠져 있음 — 수축기 단독 "약간 높음"에 대응 없음):
 *   < 80         → 0
 *   80 - 89      → 2
 *   90 - 99      → 3
 *   100+         → 4
 *
 * 최종 등급 = MAX(수축기, 이완기) → 더 위험한 쪽 우선
 */
class BloodPressureStandardTest {

    // ============================================================
    //  수축기 등급 (systolicGrade)
    // ============================================================
    @Nested
    @DisplayName("수축기 등급 (systolicGrade)")
    class SystolicGrade {

        @Test
        @DisplayName("119 → 0 (정상 상한 바로 아래)")
        void boundary_119_0() {
            assertThat(BloodPressureStandard.systolicGrade(119)).isEqualTo(0);
        }

        @Test
        @DisplayName("120 → 1 (약간 높음 하한 경계)")
        void boundary_120_1() {
            assertThat(BloodPressureStandard.systolicGrade(120)).isEqualTo(1);
        }

        @Test
        @DisplayName("129 → 1 (약간 높음 상한 경계)")
        void boundary_129_1() {
            assertThat(BloodPressureStandard.systolicGrade(129)).isEqualTo(1);
        }

        @Test
        @DisplayName("130 → 2 (다소 높음 하한 경계)")
        void boundary_130_2() {
            assertThat(BloodPressureStandard.systolicGrade(130)).isEqualTo(2);
        }

        @Test
        @DisplayName("139 → 2 (다소 높음 상한 경계)")
        void boundary_139_2() {
            assertThat(BloodPressureStandard.systolicGrade(139)).isEqualTo(2);
        }

        @Test
        @DisplayName("140 → 3 (높음 하한 경계)")
        void boundary_140_3() {
            assertThat(BloodPressureStandard.systolicGrade(140)).isEqualTo(3);
        }

        @Test
        @DisplayName("159 → 3 (높음 상한 경계)")
        void boundary_159_3() {
            assertThat(BloodPressureStandard.systolicGrade(159)).isEqualTo(3);
        }

        @Test
        @DisplayName("160 → 4 (많이 높음 하한 경계)")
        void boundary_160_4() {
            assertThat(BloodPressureStandard.systolicGrade(160)).isEqualTo(4);
        }
    }

    // ============================================================
    //  이완기 등급 (diastolicGrade)
    // ============================================================
    @Nested
    @DisplayName("이완기 등급 (diastolicGrade)")
    class DiastolicGrade {

        @Test
        @DisplayName("79 → 0 (정상 상한 바로 아래)")
        void boundary_79_0() {
            assertThat(BloodPressureStandard.diastolicGrade(79)).isEqualTo(0);
        }

        @Test
        @DisplayName("80 → 2 (이완기는 1을 건너뛰고 바로 2)")
        void boundary_80_2_skipping_1() {
            assertThat(BloodPressureStandard.diastolicGrade(80)).isEqualTo(2);
        }

        @Test
        @DisplayName("89 → 2 (다소 높음 상한 경계)")
        void boundary_89_2() {
            assertThat(BloodPressureStandard.diastolicGrade(89)).isEqualTo(2);
        }

        @Test
        @DisplayName("90 → 3 (높음 하한 경계)")
        void boundary_90_3() {
            assertThat(BloodPressureStandard.diastolicGrade(90)).isEqualTo(3);
        }

        @Test
        @DisplayName("99 → 3 (높음 상한 경계)")
        void boundary_99_3() {
            assertThat(BloodPressureStandard.diastolicGrade(99)).isEqualTo(3);
        }

        @Test
        @DisplayName("100 → 4 (많이 높음 하한 경계)")
        void boundary_100_4() {
            assertThat(BloodPressureStandard.diastolicGrade(100)).isEqualTo(4);
        }

        @Test
        @DisplayName("어떤 이완기 값에서도 1은 절대 나오지 않는다")
        void grade_1_never_returned() {
            for (int d = 0; d <= 200; d++) {
                assertThat(BloodPressureStandard.diastolicGrade(d))
                        .as("diastolic=%d", d)
                        .isNotEqualTo(1);
            }
        }
    }

    // ============================================================
    //  최종 분류 (classify)
    // ============================================================
    @Nested
    @DisplayName("최종 분류 (classify)")
    class Classify {

        @Test
        @DisplayName("115/75 → G0 NORMAL (둘 다 정상)")
        void normal() {
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(115, 75);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G0);
            assertThat(g.status).isEqualTo("NORMAL");
            assertThat(g.label).isEqualTo("정상 (120/80 미만)");
        }

        @Test
        @DisplayName("125/75 → G1 CAUTION (수축기만 약간 높음, 이완기 정상)")
        void systolic_only_grade1() {
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(125, 75);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G1);
            assertThat(g.status).isEqualTo("CAUTION");
            assertThat(g.label).isEqualTo("약간 높음 (120-129 / 80 미만)");
        }

        @Test
        @DisplayName("135/85 → G2 CAUTION (둘 다 다소 높음)")
        void both_grade2() {
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(135, 85);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G2);
            assertThat(g.status).isEqualTo("CAUTION");
            assertThat(g.label).isEqualTo("다소 높음 (130-139 또는 80-89)");
        }

        @Test
        @DisplayName("145/85 → G3 RISK (수축기 단독 고혈압, 이완기 80-89)")
        void systolic_dominant_grade3() {
            // GRADE_MAX(systolic=3, diastolic=2) → 3
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(145, 85);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G3);
            assertThat(g.status).isEqualTo("RISK");
        }

        @Test
        @DisplayName("115/95 → G3 RISK (이완기 단독 고혈압, 수축기 정상)")
        void diastolic_only_grade3() {
            // GRADE_MAX(systolic=0, diastolic=3) → 3
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(115, 95);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G3);
        }

        @Test
        @DisplayName("165/85 → G4 RISK (수축기 매우 높음, 이완기 다소 높음)")
        void systolic_dominant_grade4() {
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(165, 85);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G4);
            assertThat(g.label).isEqualTo("많이 높음 (160 이상 또는 100 이상)");
        }

        @Test
        @DisplayName("115/105 → G4 RISK (이완기 매우 높음, 수축기 정상)")
        void diastolic_only_grade4() {
            BloodPressureStandard.Grade g = BloodPressureStandard.classify(115, 105);

            assertThat(g).isEqualTo(BloodPressureStandard.Grade.G4);
        }
    }

    // ============================================================
    //  Grade.of
    // ============================================================
    @Nested
    @DisplayName("Grade.of (int → Grade 변환)")
    class GradeOf {

        @Test
        @DisplayName("0~4는 각각 G0~G4")
        void valid_grades() {
            assertThat(BloodPressureStandard.Grade.of(0)).isEqualTo(BloodPressureStandard.Grade.G0);
            assertThat(BloodPressureStandard.Grade.of(1)).isEqualTo(BloodPressureStandard.Grade.G1);
            assertThat(BloodPressureStandard.Grade.of(2)).isEqualTo(BloodPressureStandard.Grade.G2);
            assertThat(BloodPressureStandard.Grade.of(3)).isEqualTo(BloodPressureStandard.Grade.G3);
            assertThat(BloodPressureStandard.Grade.of(4)).isEqualTo(BloodPressureStandard.Grade.G4);
        }

        @Test
        @DisplayName("범위 밖 값(5) → IllegalArgumentException")
        void unknown_grade_throws() {
            assertThatThrownBy(() -> BloodPressureStandard.Grade.of(5))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("unknown grade");
        }
    }
}