package com.prologue.ballife.service.report.llm;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.DiseaseSummary;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.RecordingStats;

/**
 * OpenAI Chat Completions 용 시스템/사용자 프롬프트 생성기.
 *
 * 16-A 버전 — HealthAnalysisResponse 의 측정 데이터만 사용.
 * 16-B 에서 외부 의학 컨텍스트(보유 질환별 가이드라인 등) 보강 시
 * PromptBuilder 를 인터페이스로 추출하거나 본 클래스에 메서드 오버로드 추가 예정.
 *
 * 프롬프트 정책:
 *   - LLM 이 NORMAL 측정값에 대해 억지 질문을 만들지 않도록 강한 제약.
 *   - 각 측정 항목에 status 코드(NORMAL/CAUTION/RISK/LOW) 명시 + 질문 대상 여부 마커.
 *   - few-shot 좋은 예시 3건 + anti-example 3건 시스템 프롬프트에 박음.
 *   - 0~5개 응답 허용 (정상 항목만 있는 경우 0개 가능).
 */
@Component
public class PromptBuilder {

    private static final String STATUS_NORMAL  = "NORMAL";
    private static final String MARK_SKIP      = " ← 정상이므로 질문 제외";
    private static final String MARK_TARGET    = " ← 질문 대상";

    static final String SYSTEM_PROMPT =
            "당신은 의료 보고서 작성 보조입니다. 환자의 30일간 측정 데이터를 보고\n" +
            "다음 진료 시 의사에게 물어볼 만한 질문을 0~5개 생성하세요.\n" +
            "\n" +
            "[핵심 원칙]\n" +
            "- 비정상 측정값(상태가 CAUTION / RISK / LOW)에 대해서만 질문 생성.\n" +
            "- 측정값이 정상(NORMAL)인 항목은 질문 생성 금지. 억지로 만들지 마라.\n" +
            "- 보유 질환과 비정상 측정값의 조합에 집중하라 (예: 고혈압 환자의 수축기 142).\n" +
            "- 각 질문에 구체적 수치(평균/최저/최고)와 단위를 반드시 포함하라.\n" +
            "- 측정값이 모두 정상이면 빈 배열을 반환해도 된다.\n" +
            "\n" +
            "[작성 규칙]\n" +
            "- 진단/처방/치료/약 이름 단어 사용 금지\n" +
            "- 자연스러운 한국어 작성\n" +
            "- 끝은 \"~에 대해 상담해 보세요\" 또는 \"~를 문의해 보세요\" 형태\n" +
            "\n" +
            "[좋은 예시]\n" +
            "- \"BMI가 35.8 (비만)으로 측정되었습니다. 체중 관리를 위한 운동 계획과 식단 조절 방법에 대해 상담해 보세요.\"\n" +
            "- \"공복혈당이 평균 125mg/dL로 정상 범위(70~99)를 벗어났습니다. 현재 약물 효과나 식이 관리법에 대해 의료진과 상담해 보세요.\"\n" +
            "- \"보유한 고혈압을 고려할 때 수축기 혈압이 142mmHg까지 측정된 점이 우려됩니다. 약물 조정 필요성에 대해 문의해 보세요.\"\n" +
            "\n" +
            "[나쁜 예시 — 생성하지 말 것]\n" +
            "- \"혈압 평균 114는 정상이지만 유지 방법 상담해 보세요\"\n" +
            "  → 정상 수치에 대한 억지 질문 X\n" +
            "- \"건강 관리 방법에 대해 상담해 보세요\"\n" +
            "  → 너무 일반적 X\n" +
            "- \"약물 복용을 잘 하세요\"\n" +
            "  → 의료진에게 묻는 질문이 아님 X\n" +
            "\n" +
            "[응답 형식]\n" +
            "JSON 객체만 출력. 다른 텍스트 금지.\n" +
            "{\"questions\": [\"질문1\", \"질문2\"]}";

    public String buildSystemPrompt() {
        return SYSTEM_PROMPT;
    }

    public String buildUserPrompt(HealthAnalysisResponse data) {
        StringBuilder sb = new StringBuilder();

        // 기간
        sb.append("분석 기간: ")
          .append(data.period().startDate()).append(" ~ ").append(data.period().endDate())
          .append(" (").append(data.recordingStats().periodDays()).append("일)\n");

        // 보유 질환
        sb.append("보유 질환: ")
          .append(formatDiseases(data.user().diseases()))
          .append("\n\n");

        // 측정 결과
        sb.append("[측정 결과]\n");
        appendBloodPressure(sb, data.bloodPressure());
        sb.append("\n");
        appendBloodSugar(sb, data.bloodSugar());
        sb.append("\n");
        appendBmi(sb, data.bmi());
        appendMedication(sb, data.medication());

        // 측정 기록률
        sb.append("\n[측정 기록률]\n");
        appendRecordingStats(sb, data.recordingStats());

        sb.append("\n위 데이터로 진료 질문을 생성해 주세요. ")
          .append("NORMAL 상태인 항목은 제외하고, 비정상 항목(CAUTION/RISK/LOW)만 다루세요.");
        return sb.toString();
    }

    /** 상태 라벨 + status 코드 + 질문 대상 여부 마커.
     *  예) " 상태: 다소 높음 [CAUTION] ← 질문 대상"
     *      " 상태: 정상 [NORMAL] ← 정상이므로 질문 제외"
     *  status 가 null 이면 빈 문자열 (측정 0건 별도 표시). */
    private String statusBadge(String statusLabel, String statusCode) {
        if (statusCode == null) return "";
        String marker = STATUS_NORMAL.equals(statusCode) ? MARK_SKIP : MARK_TARGET;
        return ", 상태: " + statusLabel + " [" + statusCode + "]" + marker;
    }

    private String formatDiseases(List<DiseaseSummary> diseases) {
        if (diseases == null || diseases.isEmpty()) {
            return "신고된 질환 없음";
        }
        return diseases.stream()
                .map(d -> d.subtypeLabel() != null
                        ? d.label() + "(" + d.subtypeLabel() + ")"
                        : d.label())
                .collect(Collectors.joining(", "));
    }

    private void appendBloodPressure(StringBuilder sb, BloodPressureAnalysisResult bp) {
        sb.append("혈압 (mmHg):\n");
        if (bp == null || bp.avgSystolic() == null) {
            sb.append("  측정 기록 없음\n");
            return;
        }
        String badge = statusBadge(bp.label(), bp.status());
        sb.append("  수축기 평균 ").append(bp.avgSystolic())
          .append(", 범위 ").append(bp.minSystolic()).append("~").append(bp.maxSystolic())
          .append(badge).append("\n");
        sb.append("  이완기 평균 ").append(bp.avgDiastolic())
          .append(", 범위 ").append(bp.minDiastolic()).append("~").append(bp.maxDiastolic())
          .append(badge).append("\n");
    }

    private void appendBloodSugar(StringBuilder sb, BloodSugarAnalysisResult bs) {
        sb.append("혈당 (mg/dL):\n");
        if (bs == null) {
            sb.append("  측정 기록 없음\n");
            return;
        }
        appendBloodSugarGroup(sb, "공복", bs.fastingValue(),  bs.fastingMin(),  bs.fastingMax(),
                bs.fastingLabel(),  bs.fastingStatus());
        appendBloodSugarGroup(sb, "식전", bs.preMealValue(),  bs.preMealMin(),  bs.preMealMax(),
                bs.preMealLabel(),  bs.preMealStatus());
        appendBloodSugarGroup(sb, "식후", bs.postMealValue(), bs.postMealMin(), bs.postMealMax(),
                bs.postMealLabel(), bs.postMealStatus());
    }

    private void appendBloodSugarGroup(
            StringBuilder sb, String label,
            Integer avg, Integer min, Integer max,
            String statusLabel, String statusCode) {
        sb.append("  ").append(label).append(" ");
        if (avg == null) {
            sb.append("측정 기록 없음\n");
            return;
        }
        sb.append("평균 ").append(avg)
          .append(", 범위 ").append(min).append("~").append(max)
          .append(statusBadge(statusLabel, statusCode)).append("\n");
    }

    private void appendBmi(StringBuilder sb, BmiAnalysisResult bmi) {
        if (bmi == null || bmi.value() == null) {
            sb.append("BMI: 측정 기록 없음\n");
            return;
        }
        sb.append("BMI: ").append(bmi.value())
          .append(statusBadge(bmi.label(), bmi.status())).append("\n");
    }

    private void appendMedication(StringBuilder sb, MedicationAnalysisResult med) {
        if (med == null || med.scheduledCount() == null) {
            sb.append("복약 이행률: 예정 복약 없음\n");
            return;
        }
        sb.append("복약 이행률: ").append(med.adherenceRate()).append("% (")
          .append(med.takenCount()).append("/").append(med.scheduledCount()).append("회)")
          .append(statusBadge(med.label(), med.status())).append("\n");
    }

    private void appendRecordingStats(StringBuilder sb, RecordingStats stats) {
        sb.append("혈압 ").append(percent(stats.bloodPressureRate())).append(", ")
          .append("혈당 ").append(percent(stats.bloodSugarRate())).append(", ")
          .append("복약 ").append(percent(stats.medicationRate())).append("\n");
    }

    private String percent(Double rate) {
        if (rate == null) return "0.0%";
        return String.format("%.1f%%", rate * 100);
    }
}