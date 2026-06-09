package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodPressureDaily;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.DailyValue;
import com.prologue.ballife.support.TestMessages;

/**
 * ReportChartRenderer 단위 테스트 — DB 불필요, 순수 렌더링 검증.
 *
 *  - 측정 없음 → "" (템플릿이 차트 숨김)
 *  - 측정 있음 → "data:image/png;base64,..." 이고 디코딩하면 PNG 시그니처로 시작
 */
class ReportChartRendererTest {

    private static final LocalDate START = LocalDate.of(2026, 5, 3);
    private static final LocalDate END   = LocalDate.of(2026, 6, 1);

    private final ReportChartRenderer renderer = new ReportChartRenderer(TestMessages.resolver());

    @Test
    @DisplayName("혈압: null/빈 데이터면 빈 문자열")
    void bloodPressure_noData_returnsEmpty() {
        assertThat(renderer.bloodPressureChart(null, START, END)).isEmpty();

        BloodPressureAnalysisResult empty = new BloodPressureAnalysisResult(
                null, null, null, null, null, null, null, null, null, List.of());
        assertThat(renderer.bloodPressureChart(empty, START, END)).isEmpty();
    }

    @Test
    @DisplayName("혈압: 측정 있으면 PNG data URI 반환")
    void bloodPressure_withData_returnsPngDataUri() {
        BloodPressureAnalysisResult bp = new BloodPressureAnalysisResult(
                120, 78, 1, "NORMAL", "정상",
                110, 130, 70, 85,
                List.of(
                        new BloodPressureDaily(LocalDate.of(2026, 5, 20), 121.0, 79.0),
                        new BloodPressureDaily(LocalDate.of(2026, 5, 25), 118.0, 76.0),
                        new BloodPressureDaily(LocalDate.of(2026, 5, 30), 124.0, 81.0)));

        String uri = renderer.bloodPressureChart(bp, START, END);

        assertThat(uri).startsWith("data:image/png;base64,");
        assertThat(isPng(uri)).isTrue();
    }

    @Test
    @DisplayName("혈당: 모든 그룹 비면 빈 문자열, 하나라도 있으면 PNG")
    void bloodSugar_emptyAndWithData() {
        BloodSugarAnalysisResult empty = bloodSugar(List.of(), List.of(), List.of());
        assertThat(renderer.bloodSugarChart(empty, START, END)).isEmpty();

        BloodSugarAnalysisResult bs = bloodSugar(
                List.of(new DailyValue(LocalDate.of(2026, 5, 22), 98.0),
                        new DailyValue(LocalDate.of(2026, 5, 28), 105.0)),
                List.of(),
                List.of(new DailyValue(LocalDate.of(2026, 5, 29), 150.0)));

        String uri = renderer.bloodSugarChart(bs, START, END);
        assertThat(uri).startsWith("data:image/png;base64,");
        assertThat(isPng(uri)).isTrue();
    }

    /** dailyFasting/preMeal/postMeal 외 통계 필드는 차트와 무관하므로 null. */
    private BloodSugarAnalysisResult bloodSugar(
            List<DailyValue> fasting, List<DailyValue> preMeal, List<DailyValue> postMeal) {
        return new BloodSugarAnalysisResult(
                null, null, null,
                null, null, null,
                null, null, null,
                null, null, null, null, null, null,
                fasting, preMeal, postMeal);
    }

    private boolean isPng(String dataUri) {
        byte[] bytes = Base64.getDecoder().decode(dataUri.substring(dataUri.indexOf(',') + 1));
        // PNG 시그니처: 89 50 4E 47 ("\x89PNG")
        return bytes.length > 4
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G';
    }
}
