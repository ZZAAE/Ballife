package com.prologue.ballife.standard;

/**
 * 혈압 기준표 — 대한고혈압학회(KSH) 경계값.
 *
 * 판정 방식: GRADE_MAX
 *   1) 수축기(systolic)를 0~4 등급으로 분류
 *   2) 이완기(diastolic)를 0~4 등급으로 분류
 *   3) 두 등급 중 더 높은(=더 위험한) 등급을 최종 등급으로 선택
 *
 * 이 방식은 수축기 단독 고혈압, 이완기 단독 고혈압을 별도 분기 없이 자연스럽게 처리한다.
 *
 * 사용 예:
 *   var r = BloodPressureStandard.classify(140, 85);
 *   r.status -> "RISK"
 *   r.label  -> "높음 (140-159 또는 90-99)"
 */
public final class BloodPressureStandard {

    private BloodPressureStandard() {}

    /** 혈압 최종 등급 */
    public enum Grade {
        G0(0, "NORMAL",  "정상 (120/80 미만)"),
        G1(1, "CAUTION", "약간 높음 (120-129 / 80 미만)"),
        G2(2, "CAUTION", "다소 높음 (130-139 또는 80-89)"),
        G3(3, "RISK",    "높음 (140-159 또는 90-99)"),
        G4(4, "RISK",    "많이 높음 (160 이상 또는 100 이상)");

        public final int grade;
        public final String status;
        public final String label;
        Grade(int grade, String status, String label) {
            this.grade = grade;
            this.status = status;
            this.label = label;
        }

        public static Grade of(int grade) {
            for (Grade g : values()) if (g.grade == grade) return g;
            throw new IllegalArgumentException("unknown grade: " + grade);
        }
    }

    /** 수축기 혈압 등급 (0~4) */
    public static int systolicGrade(int systolic) {
        if (systolic < 120) return 0;
        if (systolic <= 129) return 1;
        if (systolic <= 139) return 2;
        if (systolic <= 159) return 3;
        return 4;
    }

    /**
     * 이완기 혈압 등급 (0, 2, 3, 4).
     * 이완기에는 수축기 120-129(grade 1, "약간 높음")에 대응하는 단독 구간이 없으므로
     * 80 미만은 0, 80-89는 바로 2로 올린다. 1은 의도적으로 나오지 않는다.
     */
    public static int diastolicGrade(int diastolic) {
        if (diastolic < 80) return 0;
        if (diastolic <= 89) return 2;
        if (diastolic <= 99) return 3;
        return 4;
    }

    /** 수축기/이완기 값을 받아 최종 등급으로 분류 */
    public static Grade classify(int systolic, int diastolic) {
        int finalGrade = Math.max(systolicGrade(systolic), diastolicGrade(diastolic));
        return Grade.of(finalGrade);
    }
}
