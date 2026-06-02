package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.DiseaseProfileAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.service.HealthAnalysisService;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.DiseaseSummary;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.Period;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.RecordingStats;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse.User;

/**
 * ReportService 단위 테스트.
 *
 * 검증 포인트:
 *   - HealthAnalysisService 의 응답을 Thymeleaf context 로 정확히 매핑
 *   - monthly.html 렌더링이 실제 데이터(채워진 / 일부 null)에서 깨지지 않음
 *   - HealthAnalysisService 의 예외는 그대로 전파
 *
 * 셋업 메모:
 *   HealthAnalysisService 만 mock. SpringTemplateEngine / ReportPdfGenerator 는 실제 인스턴스
 *   사용 — monthly.html 의 Thymeleaf 표현식이 처음으로 실제 데이터로 렌더링되는 시점이라
 *   런타임 오류(표현식 / 변수 매핑) 를 여기서 잡는 게 목적.
 *
 *   SpringTemplateEngine 수동 셋업:
 *     - ClassLoaderTemplateResolver prefix "templates/" + suffix ".html" + mode HTML
 *     - #temporals.createNow() 는 thymeleaf-spring6 3.1+ core 통합이라 별도 dialect 추가 불필요.
 *     - Spring Boot 의 자동 빈 구성과 달라도 무방 — 단위 테스트는 명시적 셋업.
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    private static final String PDF_HEADER = "%PDF";

    @Mock HealthAnalysisService healthAnalysisService;

    SpringTemplateEngine templateEngine;
    ReportPdfGenerator pdfGenerator;
    ReportService reportService;

    @BeforeEach
    void setUp() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);
        // #temporals utility 는 thymeleaf-spring6 3.1+ 부터 core 통합 — Java8TimeDialect 추가 불필요.

        pdfGenerator = new ReportPdfGenerator();
        reportService = new ReportService(healthAnalysisService, templateEngine, pdfGenerator);
    }

    // ============================================================
    //  헬퍼 — HealthAnalysisResponse 빌더
    // ============================================================

    /** 모든 필드가 채워진 정상 응답 (혈압/혈당/BMI/복약 모두 측정 있음). */
    private HealthAnalysisResponse buildFullResponse(Long userId) {
        return new HealthAnalysisResponse(
                userId,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(
                        128, 82, 1, "CAUTION", "다소 높음",
                        115, 142, 70, 90),
                new BloodSugarAnalysisResult(
                        108, "CAUTION", "다소 높음",
                        101, "CAUTION", "다소 높음",
                        168, "CAUTION", "다소 높음",
                        95, 125, 95, 112, 145, 215),
                new BmiAnalysisResult(25.8, "RISK", "비만"),
                new MedicationAnalysisResult(30, 21, 70, "CAUTION", "다소 부족"),
                new DiseaseProfileAnalysisResult(List.of()), // 챗봇용 풀스펙 — 보고서에선 user.diseases 사용
                new User("홍길동", 30, "남", 170.0, 75.0, List.of(
                        new DiseaseSummary("고혈압", "1기"),
                        new DiseaseSummary("당뇨",   "2형"))),
                new RecordingStats(23, 28, 25, 30, 0.767, 0.933, 0.833)
        );
    }

    /**
     * 일부 필드 null 응답 — Q1/Q2/Q3 null 정책이 작동하는지 검증용.
     *   - 혈압 측정 0건: BloodPressureAnalysisResult 모든 필드 null
     *   - 혈당 공복만 측정, 식전/식후 null (Q1)
     *   - 키/몸무게 없음: BMI 모든 필드 null
     *   - 처방 없음: Medication 모든 필드 null
     *   - 보유 질환 0개 (Q2)
     *   - 측정 0건 게이지 (Q3)
     */
    private HealthAnalysisResponse buildPartialNullResponse(Long userId) {
        return new HealthAnalysisResponse(
                userId,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(null, null, null, null, null, null, null, null, null),
                new BloodSugarAnalysisResult(
                        108, "CAUTION", "다소 높음",   // 공복만 측정
                        null, null, null,
                        null, null, null,
                        95, 125, null, null, null, null),
                new BmiAnalysisResult(null, null, null),
                new MedicationAnalysisResult(null, null, null, null, null),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("김환자", null, null, null, null, List.of()), // 신고 질환 0
                new RecordingStats(0, 5, 0, 30, 0.0, 0.167, 0.0)
        );
    }

    // ============================================================
    //  A. 정상 렌더링
    // ============================================================
    @Nested
    @DisplayName("정상 렌더링 (FullData)")
    class FullData {

        @Test
        @DisplayName("모든 필드 채워진 응답 → PDF 바이너리 (헤더 %PDF, length > 0)")
        void allFieldsFilled_rendersToValidPdf() {
            // given
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildFullResponse(userId));

            // when
            byte[] pdf = reportService.generateMonthlyReport(userId);

            // then
            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
        }
    }

    // ============================================================
    //  B. null 필드 (Q1/Q2/Q3 정책) 렌더링
    // ============================================================
    @Nested
    @DisplayName("null 필드 렌더링 (NullPolicy)")
    class NullPolicy {

        @Test
        @DisplayName("혈압 0건 / 혈당 일부만 / BMI null / 복약 null / 질환 0개 / 게이지 0% — 깨지지 않고 PDF 생성")
        void partialNullFields_renderWithoutError() {
            // given
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildPartialNullResponse(userId));

            // when
            byte[] pdf = reportService.generateMonthlyReport(userId);

            // then
            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
        }
    }

    // ============================================================
    //  C. 예외 전파
    // ============================================================
    @Nested
    @DisplayName("예외 전파 (ExceptionPropagation)")
    class ExceptionPropagation {

        @Test
        @DisplayName("HealthAnalysisService 가 ResourceNotFoundException 던지면 그대로 전파")
        void resourceNotFound_propagates() {
            // given
            Long unknownUserId = 999L;
            when(healthAnalysisService.analyzeMonthly(unknownUserId))
                    .thenThrow(new ResourceNotFoundException("회원", unknownUserId));

            // when / then
            assertThatThrownBy(() -> reportService.generateMonthlyReport(unknownUserId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("회원");
        }
    }
}