package com.prologue.ballife.standard;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.prologue.ballife.standard.DiseaseProfileStandard.Characteristic;
import com.prologue.ballife.standard.DiseaseProfileStandard.Disease;
import com.prologue.ballife.standard.DiseaseProfileStandard.DiseaseProfile;

/**
 * 보유 질환 프로파일 기준표(DiseaseProfileStandard) 단위 테스트.
 *
 * DB의 diseaseIndex 문자열 형식:
 *   "hypertension:type2,diabetes:type1,gout:CHRONIC"
 *
 * 안전 처리(무시):
 *   - null / blank
 *   - 모르는 질환 키
 *   - kv 형식 깨짐
 *   - "NONE" 값 (대소문자 무관)
 *   - 빈 값
 */
class DiseaseProfileStandardTest {

    // ============================================================
    //  diseaseIndex 파싱 — 정상 케이스
    // ============================================================
    @Nested
    @DisplayName("정상 파싱 (parse)")
    class ParseNormal {

        @Test
        @DisplayName("\"hypertension:type2\" → 고혈압 1건")
        void single_hypertension() {
            // given
            String input = "hypertension:type2";
            // when
            List<DiseaseProfile> result = DiseaseProfileStandard.parse(input);
            // then
            assertThat(result).hasSize(1);

            DiseaseProfile p = result.get(0);
            assertThat(p.diseaseKey()).isEqualTo("hypertension");
            assertThat(p.diseaseLabel()).isEqualTo("고혈압");
            assertThat(p.subtypeCode()).isEqualTo("type2");
            assertThat(p.subtypeLabel()).isEqualTo("1기");
            assertThat(p.characteristic()).isEqualTo(Characteristic.SELF_REPORTED_AND_MEASURED);
            assertThat(p.linkedMeasurement()).isEqualTo("bloodPressure");
            assertThat(p.chatbotMessage()).contains("고혈압");
        }

        @Test
        @DisplayName("\"hypertension:type2,diabetes:type1\" → 2건 (순서 보존)")
        void multiple_preserves_order() {
            List<DiseaseProfile> result =
                    DiseaseProfileStandard.parse("hypertension:type2,diabetes:type1");

            assertThat(result).hasSize(2);
            assertThat(result.get(0).diseaseKey()).isEqualTo("hypertension");
            assertThat(result.get(1).diseaseKey()).isEqualTo("diabetes");
            assertThat(result.get(1).subtypeLabel()).isEqualTo("1형");
        }

        @Test
        @DisplayName("\"gout:CHRONIC\" → 통풍 만성 (SELF_REPORTED_ONLY, linkedMeasurement=null)")
        void self_reported_only_has_null_linkedMeasurement() {
            List<DiseaseProfile> result = DiseaseProfileStandard.parse("gout:CHRONIC");

            assertThat(result).hasSize(1);
            DiseaseProfile p = result.get(0);
            assertThat(p.diseaseKey()).isEqualTo("gout");
            assertThat(p.subtypeLabel()).isEqualTo("만성");
            assertThat(p.characteristic()).isEqualTo(Characteristic.SELF_REPORTED_ONLY);
            assertThat(p.linkedMeasurement()).isNull();
        }

        @Test
        @DisplayName("5개 질환 모두 동시 등록 → 5건")
        void all_five_diseases() {
            String input = "hyperlipidemia:type1,hypertension:type3,osteoporosis:osteoporosis,"
                         + "diabetes:GESTATIONAL,gout:ACUTE";
            List<DiseaseProfile> result = DiseaseProfileStandard.parse(input);

            assertThat(result).hasSize(5);
            assertThat(result).extracting(DiseaseProfile::diseaseKey)
                    .containsExactly("hyperlipidemia", "hypertension", "osteoporosis",
                                     "diabetes", "gout");
        }
    }

    // ============================================================
    //  diseaseIndex 파싱 — 빈 결과
    // ============================================================
    @Nested
    @DisplayName("빈 결과를 돌려주는 입력 (parse)")
    class ParseEmpty {

        @Test
        @DisplayName("null → 빈 리스트")
        void null_returns_empty() {
            assertThat(DiseaseProfileStandard.parse(null)).isEmpty();
        }

        @Test
        @DisplayName("\"\" → 빈 리스트")
        void blank_empty_string() {
            assertThat(DiseaseProfileStandard.parse("")).isEmpty();
        }

        @Test
        @DisplayName("\"   \" → 빈 리스트")
        void whitespace_only() {
            assertThat(DiseaseProfileStandard.parse("   ")).isEmpty();
        }
    }

    // ============================================================
    //  diseaseIndex 파싱 — 잘못된 토큰 무시
    // ============================================================
    @Nested
    @DisplayName("잘못된 토큰 무시 (parse)")
    class ParseIgnoring {

        @Test
        @DisplayName("모르는 질환 키는 무시되고 나머지만 반환")
        void unknown_disease_key_ignored() {
            List<DiseaseProfile> result =
                    DiseaseProfileStandard.parse("foo:bar,hypertension:type2");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).diseaseKey()).isEqualTo("hypertension");
        }

        @Test
        @DisplayName("\":\"가 없는 토큰(\"hypertension\")은 무시")
        void no_colon_token_ignored() {
            List<DiseaseProfile> result = DiseaseProfileStandard.parse("hypertension");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("\"hypertension:NONE\" 은 무시")
        void NONE_value_ignored() {
            List<DiseaseProfile> result = DiseaseProfileStandard.parse("hypertension:NONE");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("\"hypertension:none\" 도 대소문자 무관하게 무시")
        void none_lowercase_ignored() {
            List<DiseaseProfile> result = DiseaseProfileStandard.parse("hypertension:none");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("값이 빈 \"hypertension:\" 은 무시")
        void empty_subtype_ignored() {
            List<DiseaseProfile> result = DiseaseProfileStandard.parse("hypertension:");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("연속 콤마/공백은 안전하게 처리")
        void empty_entries_skipped() {
            List<DiseaseProfile> result =
                    DiseaseProfileStandard.parse(",hypertension:type2,,diabetes:type1,");

            assertThat(result).hasSize(2);
            assertThat(result).extracting(DiseaseProfile::diseaseKey)
                    .containsExactly("hypertension", "diabetes");
        }

        @Test
        @DisplayName("모르는 subtype 은 코드값 보존, subtypeLabel은 null")
        void unknown_subtype_preserves_code_with_null_label() {
            List<DiseaseProfile> result =
                    DiseaseProfileStandard.parse("hypertension:typeXX");

            assertThat(result).hasSize(1);
            DiseaseProfile p = result.get(0);
            assertThat(p.diseaseKey()).isEqualTo("hypertension");
            assertThat(p.subtypeCode()).isEqualTo("typeXX");
            assertThat(p.subtypeLabel()).isNull();
        }
    }

    // ============================================================
    //  Disease 유틸 메서드
    // ============================================================
    @Nested
    @DisplayName("Disease enum 유틸")
    class DiseaseEnum {

        @Test
        @DisplayName("byKey(\"hypertension\") → HYPERTENSION")
        void byKey_known() {
            assertThat(Disease.byKey("hypertension")).isEqualTo(Disease.HYPERTENSION);
        }

        @Test
        @DisplayName("byKey(\"unknown\") → null")
        void byKey_unknown_returns_null() {
            assertThat(Disease.byKey("unknown")).isNull();
        }

        @Test
        @DisplayName("byKey(null) → null")
        void byKey_null_returns_null() {
            assertThat(Disease.byKey(null)).isNull();
        }

        @Test
        @DisplayName("subtypeLabel: 정상 코드 → 한글 라벨")
        void subtypeLabel_known() {
            assertThat(Disease.DIABETES.subtypeLabel("type2")).isEqualTo("2형");
        }

        @Test
        @DisplayName("subtypeLabel: 모르는 코드 → null")
        void subtypeLabel_unknown_returns_null() {
            assertThat(Disease.DIABETES.subtypeLabel("typeXX")).isNull();
        }
    }
}