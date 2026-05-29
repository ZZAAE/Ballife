package com.prologue.ballife.standard;

/**
 * BMI(체질량지수) 기준표 — 대한비만학회 아시아인 기준.
 *
 * 비만은 사용자 신고로 받지 않고 키/몸무게로 계산한 BMI 값으로만 판단한다.
 *
 * 사용 예:
 *   double bmi = BmiStandard.calculate(162, 58.0);   // 22.1
 *   var r = BmiStandard.classify(bmi);
 *   r.status -> "NORMAL"
 *   r.label  -> "정상 (18.5-22.9)"
 */
public final class BmiStandard {

    private BmiStandard() {}

    /** BMI 구간 */
    public enum Range {
        UNDERWEIGHT       ("LOW",     "저체중 (18.5 미만)"),
        NORMAL            ("NORMAL",  "정상 (18.5-22.9)"),
        OVERWEIGHT        ("CAUTION", "과체중 (23.0-24.9)"),
        OBESE             ("RISK",    "비만 (25.0-29.9)"),
        SEVERELY_OBESE    ("RISK",    "고도 비만 (30.0-34.9)"),
        MORBIDLY_OBESE    ("RISK",    "초고도 비만 (35.0 이상)");

        public final String status;
        public final String label;
        Range(String status, String label) {
            this.status = status;
            this.label = label;
        }
    }

    /**
     * BMI 계산. heightCm는 센티미터 단위 입력.
     * 소수점 둘째 자리에서 반올림하여 첫째 자리까지 반환.
     */
    public static double calculate(double heightCm, double weightKg) {
        if (heightCm <= 0) throw new IllegalArgumentException("heightCm must be > 0");
        double heightM = heightCm / 100.0;
        double raw = weightKg / (heightM * heightM);
        return Math.round(raw * 10.0) / 10.0;
    }

    /** BMI 값을 구간으로 분류 */
    public static Range classify(double bmi) {
        if (bmi < 18.5) return Range.UNDERWEIGHT;
        if (bmi < 23.0) return Range.NORMAL;
        if (bmi < 25.0) return Range.OVERWEIGHT;
        if (bmi < 30.0) return Range.OBESE;
        if (bmi < 35.0) return Range.SEVERELY_OBESE;
        return Range.MORBIDLY_OBESE;
    }

    /** 키/몸무게에서 한 번에 분류 (편의 메서드) */
    public static Range classifyFrom(double heightCm, double weightKg) {
        return classify(calculate(heightCm, weightKg));
    }
}
