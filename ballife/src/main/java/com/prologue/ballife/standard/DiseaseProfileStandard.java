package com.prologue.ballife.standard;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 사용자 보유 질환 프로파일 기준표.
 *
 * 회원가입/마이페이지에서 사용자가 직접 선택한 보유 질환 정보의 마스터 데이터다.
 * - AI가 질환을 새로 진단하지 않는다.
 * - 챗봇/보고서 문맥 참고용으로만 사용한다.
 *
 * DB의 diseaseIndex 문자열 형식:
 *   "hypertension:type2,diabetes:type1,gout:CHRONIC"
 *   - 항목 구분자: ','
 *   - 키-값 구분자: ':'
 *   - 'NONE' 값은 문자열에 포함되지 않음
 *
 * 사용 예:
 *   List<DiseaseProfile> profiles =
 *       DiseaseProfileStandard.parse("hypertension:type2,diabetes:type1");
 */
public final class DiseaseProfileStandard {

    private DiseaseProfileStandard() {}

    /** 질환 특성 — 측정값이 같이 들어오는지 여부 */
    public enum Characteristic {
        /** 신고만 받음 (측정값 없음): 고지혈증, 골다공증, 통풍 */
        SELF_REPORTED_ONLY,
        /** 신고 + 측정 둘 다: 고혈압, 당뇨 */
        SELF_REPORTED_AND_MEASURED
    }

    /** 5개 질환 마스터 정의 */
    public enum Disease {
        HYPERLIPIDEMIA(
                "hyperlipidemia", "고지혈증",
                Characteristic.SELF_REPORTED_ONLY, null,
                Map.of(
                        "type1", "고콜레스테롤혈증",
                        "type2", "고LDL콜레스테롤혈증",
                        "type3", "고중성지방혈증",
                        "type4", "저HDL콜레스테롤혈증"),
                "고지혈증 관리가 필요한 사용자는 포화지방·트랜스지방 섭취와 식단 구성을 함께 확인하는 것이 좋습니다."
        ),
        HYPERTENSION(
                "hypertension", "고혈압",
                Characteristic.SELF_REPORTED_AND_MEASURED, "bloodPressure",
                Map.of(
                        "type1", "고혈압 전단계",
                        "type2", "1기",
                        "type3", "2기"),
                "고혈압 관리가 필요한 사용자는 나트륨 섭취와 혈압 기록을 함께 확인하는 것이 좋습니다."
        ),
        OSTEOPOROSIS(
                "osteoporosis", "골다공증",
                Characteristic.SELF_REPORTED_ONLY, null,
                Map.of(
                        "osteopenia",  "골감소증",
                        "osteoporosis", "골다공증"),
                "골다공증/골감소증 관리가 필요한 사용자는 칼슘·비타민D 섭취와 체중부하 운동을 함께 확인하는 것이 좋습니다."
        ),
        DIABETES(
                "diabetes", "당뇨",
                Characteristic.SELF_REPORTED_AND_MEASURED, "bloodSugar",
                Map.of(
                        "type1", "1형",
                        "type2", "2형",
                        "GESTATIONAL", "임신성"),
                "당뇨병 관리가 필요한 사용자는 당류 섭취와 혈당 기록을 함께 확인하는 것이 좋습니다."
        ),
        GOUT(
                "gout", "통풍",
                Characteristic.SELF_REPORTED_ONLY, null,
                Map.of(
                        "ASYMPTOMATIC", "고요산혈증",
                        "ACUTE",        "급성",
                        "INTERMITTENT", "간헐기",
                        "CHRONIC",      "만성"),
                "통풍 관리가 필요한 사용자는 식단 구성과 수분 섭취를 꾸준히 확인하는 것이 좋습니다."
        );

        public final String key;
        public final String label;
        public final Characteristic characteristic;
        public final String linkedMeasurement;   // null 가능 (selfReportedOnly)
        public final Map<String, String> subtypes;  // subtypeCode -> 한글 라벨
        public final String chatbotMessage;

        Disease(String key, String label, Characteristic characteristic,
                String linkedMeasurement, Map<String, String> subtypes,
                String chatbotMessage) {
            this.key = key;
            this.label = label;
            this.characteristic = characteristic;
            this.linkedMeasurement = linkedMeasurement;
            this.subtypes = Collections.unmodifiableMap(new LinkedHashMap<>(subtypes));
            this.chatbotMessage = chatbotMessage;
        }

        public static Disease byKey(String key) {
            for (Disease d : values()) if (d.key.equals(key)) return d;
            return null;   // 알 수 없는 키는 null (호출자가 무시 처리)
        }

        public String subtypeLabel(String subtypeCode) {
            return subtypes.get(subtypeCode);
        }
    }

    /**
     * 파싱된 보유 질환 한 건.
     * (불변 record. Java 16+ 필요. 만약 프로젝트가 Java 11 이하라면 일반 클래스로 변환해서 쓰면 됨.)
     */
    public record DiseaseProfile(
            String diseaseKey,
            String diseaseLabel,
            String subtypeCode,
            String subtypeLabel,
            Characteristic characteristic,
            String linkedMeasurement,
            String chatbotMessage
    ) {}

    /**
     * DB의 diseaseIndex 문자열을 파싱하여 보유 질환 목록 반환.
     * null/blank/공백/모르는 키/모르는 subtype은 안전하게 무시한다.
     */
    public static List<DiseaseProfile> parse(String diseaseIndex) {
        List<DiseaseProfile> out = new ArrayList<>();
        if (diseaseIndex == null || diseaseIndex.isBlank()) return out;

        for (String entry : diseaseIndex.split(",")) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;

            String[] kv = trimmed.split(":");
            if (kv.length != 2) continue;

            String key = kv[0].trim();
            String sub = kv[1].trim();
            if ("NONE".equalsIgnoreCase(sub) || sub.isEmpty()) continue;

            Disease d = Disease.byKey(key);
            if (d == null) continue;   // 모르는 질환 키 무시

            String subLabel = d.subtypeLabel(sub);
            // subLabel이 null이어도(모르는 subtype) 일단 코드값은 보존해서 넘긴다.

            out.add(new DiseaseProfile(
                    d.key, d.label, sub, subLabel,
                    d.characteristic, d.linkedMeasurement, d.chatbotMessage));
        }
        return out;
    }
}
