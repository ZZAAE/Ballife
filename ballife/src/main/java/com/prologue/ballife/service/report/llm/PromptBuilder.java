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
 */
@Component
public class PromptBuilder {

    static final String SYSTEM_PROMPT =
            "당신은 의료 보고서 작성 보조입니다. 환자의 30일간 측정 데이터를 보고\n" +
            "다음 진료 시 의사에게 물어볼 만한 질문 3~5개를 생성하세요.\n" +
            "\n" +
            "[규칙]\n" +
            "- 진단/처방/치료/약 이름 단어 사용 금지\n" +
            "- 자연스러운 한국어 작성\n" +
            "- 끝은 \"~에 대해 상담해 보세요\" 또는 \"~를 문의해 보세요\" 형태\n" +
            "- 측정값 수치를 구체적으로 인용 (예: \"수축기 평균 128\")\n" +
            "- 보유 질환을 고려한 질문\n" +
            "\n" +
            "[응답 형식]\n" +
            "JSON 객체만 출력. 다른 텍스트 금지.\n" +
            "{\"questions\": [\"질문1\", \"질문2\", \"질문3\"]}";

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

        sb.append("\n위 데이터로 진료 질문 3~5개 생성해 주세요.");
        return sb.toString();
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
        sb.append("  수축기 평균 ").append(bp.avgSystolic())
          .append(", 범위 ").append(bp.minSystolic()).append("~").append(bp.maxSystolic())
          .append(", 상태: ").append(bp.label()).append("\n");
        sb.append("  이완기 평균 ").append(bp.avgDiastolic())
          .append(", 범위 ").append(bp.minDiastolic()).append("~").append(bp.maxDiastolic())
          .append(", 상태: ").append(bp.label()).append("\n");
    }

    private void appendBloodSugar(StringBuilder sb, BloodSugarAnalysisResult bs) {
        sb.append("혈당 (mg/dL):\n");
        if (bs == null) {
            sb.append("  측정 기록 없음\n");
            return;
        }
        appendBloodSugarGroup(sb, "공복", bs.fastingValue(),  bs.fastingMin(),  bs.fastingMax(),  bs.fastingLabel());
        appendBloodSugarGroup(sb, "식전", bs.preMealValue(),  bs.preMealMin(),  bs.preMealMax(),  bs.preMealLabel());
        appendBloodSugarGroup(sb, "식후", bs.postMealValue(), bs.postMealMin(), bs.postMealMax(), bs.postMealLabel());
    }

    private void appendBloodSugarGroup(
            StringBuilder sb, String label,
            Integer avg, Integer min, Integer max, String statusLabel) {
        sb.append("  ").append(label).append(" ");
        if (avg == null) {
            sb.append("측정 기록 없음\n");
            return;
        }
        sb.append("평균 ").append(avg)
          .append(", 범위 ").append(min).append("~").append(max)
          .append(", 상태: ").append(statusLabel).append("\n");
    }

    private void appendBmi(StringBuilder sb, BmiAnalysisResult bmi) {
        if (bmi == null || bmi.value() == null) {
            sb.append("BMI: 측정 기록 없음\n");
            return;
        }
        sb.append("BMI: ").append(bmi.value())
          .append(", 상태: ").append(bmi.label()).append("\n");
    }

    private void appendMedication(StringBuilder sb, MedicationAnalysisResult med) {
        if (med == null || med.scheduledCount() == null) {
            sb.append("복약 이행률: 예정 복약 없음\n");
            return;
        }
        sb.append("복약 이행률: ").append(med.adherenceRate()).append("% (")
          .append(med.takenCount()).append("/").append(med.scheduledCount()).append("회)\n");
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