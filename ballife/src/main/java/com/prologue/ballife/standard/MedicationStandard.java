package com.prologue.ballife.standard;

/**
 * 복약 이행률 기준표.
 *
 * 복약 이행률 = (실제 복약 기록 수 / 예정 복약 수) * 100
 * 약물 변경/중단 판단에는 사용하지 않는다.
 *
 * 사용 예:
 *   int rate = MedicationStandard.calculateRate(10, 7);   // 70
 *   var r = MedicationStandard.classify(rate);
 *   r.status -> "CAUTION"
 *   r.label  -> "다소 부족 (60-79%)"
 */
public final class MedicationStandard {

    private MedicationStandard() {}

    /** 복약 이행률 구간 */
    public enum Adherence {
        LOW    ("RISK",    "많이 부족 (59% 이하)", "analysis.med.low"),
        MID    ("CAUTION", "다소 부족 (60-79%)",   "analysis.med.mid"),
        GOOD   ("NORMAL",  "양호 (80% 이상)",      "analysis.med.good");

        public final String status;
        public final String label;
        public final String code;
        Adherence(String status, String label, String code) {
            this.status = status;
            this.label = label;
            this.code = code;
        }
    }

    /**
     * 이행률(%) 계산. 반올림 정수 반환.
     * scheduledCount가 0 이하면 IllegalArgumentException.
     * (0/0 같은 상황은 호출하는 쪽에서 미리 걸러내고 "기록 없음"으로 처리해야 한다.)
     */
    public static int calculateRate(int scheduledCount, int takenCount) {
        if (scheduledCount <= 0) {
            throw new IllegalArgumentException("scheduledCount must be > 0");
        }
        return (int) Math.round((double) takenCount / scheduledCount * 100.0);
    }

    /** 이행률(%) 값을 구간으로 분류 */
    public static Adherence classify(int adherenceRatePercent) {
        if (adherenceRatePercent <= 59) return Adherence.LOW;
        if (adherenceRatePercent <= 79) return Adherence.MID;
        return Adherence.GOOD;
    }
}
