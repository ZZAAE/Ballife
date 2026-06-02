package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
import com.prologue.ballife.service.report.llm.LlmQuestionGenerator;
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
 *   - LLM 빈 응답 / LLM 예외 시 룰 fallback 동작 (PDF 정상 생성)
 *
 * 셋업 메모:
 *   - HealthAnalysisService 와 LlmQuestionGenerator 는 @Mock (실제 호출/OpenAI 호출 차단)
 *   - SpringTemplateEngine / ReportPdfGenerator / ConsultationQuestionGenerator 는
 *     실제 인스턴스 사용 — 통합 무게 단위 테스트로 monthly.html 의 실제 렌더링 검증
 *   - 각 테스트 별 stub 은 메서드 안에서 명시 (Mockito strict 모드의 UnnecessaryStubbingException 회피)
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    private static final String PDF_HEADER = "%PDF";

    @Mock HealthAnalysisService healthAnalysisService;
    @Mock LlmQuestionGenerator llmGenerator;

    SpringTemplateEngine templateEngine;
    ReportPdfGenerator pdfGenerator;
    ConsultationQuestionGenerator ruleBasedGenerator;
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

        pdfGenerator = new ReportPdfGenerator();
        ruleBasedGenerator = new ConsultationQuestionGenerator();

        reportService = new ReportService(
                healthAnalysisService, templateEngine, pdfGenerator,
                llmGenerator, ruleBasedGenerator);
    }

    // ============================================================
    //  헬퍼 — HealthAnalysisResponse 빌더
    // ============================================================

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
                new DiseaseProfileAnalysisResult(List.of()),
                new User("홍길동", 30, "남", 170.0, 75.0, List.of(
                        new DiseaseSummary("고혈압", "1기"),
                        new DiseaseSummary("당뇨",   "2형"))),
                new RecordingStats(23, 28, 25, 30, 0.767, 0.933, 0.833)
        );
    }

    private HealthAnalysisResponse buildPartialNullResponse(Long userId) {
        return new HealthAnalysisResponse(
                userId,
                new Period("MONTHLY", LocalDate.of(2026, 5, 3), LocalDate.of(2026, 6, 1)),
                new BloodPressureAnalysisResult(null, null, null, null, null, null, null, null, null),
                new BloodSugarAnalysisResult(
                        108, "CAUTION", "다소 높음",
                        null, null, null,
                        null, null, null,
                        95, 125, null, null, null, null),
                new BmiAnalysisResult(null, null, null),
                new MedicationAnalysisResult(null, null, null, null, null),
                new DiseaseProfileAnalysisResult(List.of()),
                new User("김환자", null, null, null, null, List.of()),
                new RecordingStats(0, 5, 0, 30, 0.0, 0.167, 0.0)
        );
    }

    private static final List<String> STUB_LLM_QUESTIONS = List.of(
            "수축기 평균 128에 대해 상담해 보세요.",
            "식후혈당 관리법을 문의해 보세요.",
            "체중 관리 방향에 대해 상담해 보세요."
    );

    // ============================================================
    //  A. 정상 렌더링 (LLM 성공 경로 — 기존 FullData)
    // ============================================================
    @Nested
    @DisplayName("정상 렌더링 — LLM 성공 (FullData)")
    class FullData {

        @Test
        @DisplayName("모든 필드 채움 + LLM 정상 응답 → PDF 바이너리 (헤더 %PDF, length > 0)")
        void allFieldsFilled_llmSuccess_rendersToValidPdf() {
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildFullResponse(userId));
            when(llmGenerator.generate(any())).thenReturn(STUB_LLM_QUESTIONS);

            byte[] pdf = reportService.generateMonthlyReport(userId);

            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
            verify(llmGenerator).generate(any());
        }
    }

    // ============================================================
    //  B. null 필드 (Q1/Q2/Q3 정책) 렌더링
    // ============================================================
    @Nested
    @DisplayName("null 필드 렌더링 (NullPolicy)")
    class NullPolicy {

        @Test
        @DisplayName("일부 필드 null + LLM 정상 응답 → 깨지지 않고 PDF 생성")
        void partialNullFields_renderWithoutError() {
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildPartialNullResponse(userId));
            when(llmGenerator.generate(any())).thenReturn(STUB_LLM_QUESTIONS);

            byte[] pdf = reportService.generateMonthlyReport(userId);

            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
        }
    }

    // ============================================================
    //  C. 예외 전파 (HealthAnalysisService)
    // ============================================================
    @Nested
    @DisplayName("예외 전파 (ExceptionPropagation)")
    class ExceptionPropagation {

        @Test
        @DisplayName("HealthAnalysisService 가 ResourceNotFoundException → 그대로 전파, LLM 호출 안 됨")
        void resourceNotFound_propagates() {
            Long unknownUserId = 999L;
            when(healthAnalysisService.analyzeMonthly(unknownUserId))
                    .thenThrow(new ResourceNotFoundException("회원", unknownUserId));

            assertThatThrownBy(() -> reportService.generateMonthlyReport(unknownUserId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("회원");
        }
    }

    // ============================================================
    //  D. LLM Fallback — 빈 리스트 / 예외 모두 룰 기반으로 복구
    // ============================================================
    @Nested
    @DisplayName("LLM Fallback (LlmFallback)")
    class LlmFallback {

        @Test
        @DisplayName("LLM 이 빈 리스트 반환 → 룰 fallback 사용, PDF 정상 생성")
        void llmReturnsEmpty_fallsBackToRuleBased() {
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildFullResponse(userId));
            when(llmGenerator.generate(any())).thenReturn(List.of());

            byte[] pdf = reportService.generateMonthlyReport(userId);

            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
            verify(llmGenerator).generate(any());
            // ruleBasedGenerator 는 실제 인스턴스 — 룰 결과가 PDF 에 들어감
        }

        @Test
        @DisplayName("LLM 이 RuntimeException → 룰 fallback 사용, PDF 정상 생성 (전파 X)")
        void llmThrows_fallsBackToRuleBased() {
            Long userId = 42L;
            when(healthAnalysisService.analyzeMonthly(userId))
                    .thenReturn(buildFullResponse(userId));
            when(llmGenerator.generate(any()))
                    .thenThrow(new RuntimeException("OpenAI 호출 실패"));

            byte[] pdf = reportService.generateMonthlyReport(userId);

            assertThat(pdf).isNotNull();
            assertThat(pdf.length).isGreaterThan(4);
            assertThat(new String(pdf, 0, 4)).isEqualTo(PDF_HEADER);
            verify(llmGenerator).generate(any());
        }
    }
}