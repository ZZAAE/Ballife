package com.prologue.ballife.standard;

/**
 * 혈당(공복/식후) 기준표.
 *
 * - status : NORMAL / LOW / CAUTION / RISK (코드 분기용 코드값)
 * - label  : 사용자에게 보여줄 친화적 표현 (예: "다소 높음 (100-125)")
 *
 * 사용 예:
 *   var r = BloodSugarStandard.classifyFasting(110);
 *   r.status -> "CAUTION"
 *   r.label  -> "다소 높음 (100-125)"
 */
public final class BloodSugarStandard {

    private BloodSugarStandard() {}

    /** 공복혈당 구간 (8시간 이상 공복 후 측정 기준) */
    public enum Fasting {
        LOW    ("LOW",     "너무 낮음 (70 미만)"),
        NORMAL ("NORMAL",  "정상 (70-99)"),
        CAUTION("CAUTION", "다소 높음 (100-125)"),
        RISK   ("RISK",    "많이 높음 (126 이상)");

        public final String status;
        public final String label;
        Fasting(String status, String label) {
            this.status = status;
            this.label = label;
        }
    }

    /** 식후혈당 구간 (식후 2시간 경과 시점 측정 기준) */
    public enum PostMeal {
        LOW    ("LOW",     "너무 낮음 (70 미만)"),
        NORMAL ("NORMAL",  "정상 (70-139)"),
        CAUTION("CAUTION", "다소 높음 (140-199)"),
        RISK   ("RISK",    "많이 높음 (200 이상)");

        public final String status;
        public final String label;
        PostMeal(String status, String label) {
            this.status = status;
            this.label = label;
        }
    }

    /** 공복혈당 값을 구간으로 분류 */
    public static Fasting classifyFasting(int mgPerDl) {
        if (mgPerDl < 70)   return Fasting.LOW;
        if (mgPerDl <= 99)  return Fasting.NORMAL;
        if (mgPerDl <= 125) return Fasting.CAUTION;
        return Fasting.RISK;
    }

    /** 식후혈당 값을 구간으로 분류 (식후 2시간 기준) */
    public static PostMeal classifyPostMeal(int mgPerDl) {
        if (mgPerDl < 70)   return PostMeal.LOW;
        if (mgPerDl <= 139) return PostMeal.NORMAL;
        if (mgPerDl <= 199) return PostMeal.CAUTION;
        return PostMeal.RISK;
    }
}
