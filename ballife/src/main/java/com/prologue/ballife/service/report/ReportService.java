package com.prologue.ballife.service.report;

import java.util.List;

import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.prologue.ballife.service.HealthAnalysisService;
import com.prologue.ballife.service.report.llm.LlmQuestionGenerator;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 건강 분석 보고서 PDF 생성 서비스.
 *
 * 흐름:
 *   userId
 *     → HealthAnalysisService 로 분석 결과(HealthAnalysisResponse) 조회
 *     → LLM 으로 "다음 진료 시 질문" 3~5개 생성 (실패 시 룰 fallback)
 *     → Thymeleaf Context 에 8개 변수 바인딩 (monthly.html 과 이름 일치, questions 포함)
 *     → SpringTemplateEngine.process("report/monthly", ctx) → HTML 문자열
 *     → ReportPdfGenerator.generate(html) → PDF 바이너리
 *
 * 빈 객체 디폴트 채우기 정책:
 *   HealthAnalysisService 와 모든 Analyzer 가 항상 non-null 객체를 반환하며,
 *   필드만 null 인 형태로 측정 0건 케이스를 표현한다.
 *   monthly.html 은 필드 null 가드를 박아 두었으므로 ReportService 에서 추가 디폴트 채우기 불필요.
 *
 * 질문 생성 정책 (3단계 fallback):
 *   1) LlmQuestionGenerator 정상 응답           → 그대로 사용
 *   2) LlmQuestionGenerator 가 빈 리스트 반환   → ConsultationQuestionGenerator 룰 fallback
 *   3) LlmQuestionGenerator 가 예외 throw      → ConsultationQuestionGenerator 룰 fallback
 *   사용자 보고서 다운로드 자체를 LLM 실패가 막아선 안 됨.
 *
 * 예외 정책:
 *   HealthAnalysisService 가 던지는 예외(ResourceNotFoundException, ResponseStatusException 400 등)는
 *   그대로 전파한다. Controller 단의 Spring 기본 예외 처리에 위임.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    /** 월간 보고서 템플릿 (classpath: templates/report/monthly.html) */
    private static final String TEMPLATE_MONTHLY = "report/monthly";

    private final HealthAnalysisService healthAnalysisService;
    private final SpringTemplateEngine templateEngine;
    private final ReportPdfGenerator pdfGenerator;
    private final LlmQuestionGenerator llmGenerator;
    private final ConsultationQuestionGenerator ruleBasedGenerator;

    /**
     * 월간(최근 30일) 건강 보고서 PDF 생성.
     *
     * @param userId 분석 대상 사용자 ID (Controller 에서 SecurityContext 의 본인 ID 주입)
     * @return PDF 바이너리 (선두 4바이트 "%PDF")
     */
    public byte[] generateMonthlyReport(Long userId) {
        HealthAnalysisResponse response = healthAnalysisService.analyzeMonthly(userId);
        List<String> questions = generateQuestions(response, userId);

        Context context = new Context();
        context.setVariable("period",         response.period());
        context.setVariable("user",           response.user());
        context.setVariable("bloodPressure",  response.bloodPressure());
        context.setVariable("bloodSugar",     response.bloodSugar());
        context.setVariable("bmi",            response.bmi());
        context.setVariable("medication",     response.medication());
        context.setVariable("recordingStats", response.recordingStats());
        context.setVariable("questions",      questions);

        String html = templateEngine.process(TEMPLATE_MONTHLY, context);
        return pdfGenerator.generate(html);
    }

    /**
     * 진료 질문 생성 — LLM 우선, 실패 시 룰 fallback.
     */
    private List<String> generateQuestions(HealthAnalysisResponse response, Long userId) {
        try {
            List<String> questions = llmGenerator.generate(response);
            if (questions == null || questions.isEmpty()) {
                log.info("LLM 이 빈 응답 반환, 룰 fallback 사용 userId={}", userId);
                return ruleBasedGenerator.generate(response);
            }
            return questions;
        } catch (Exception e) {
            log.warn("LLM 호출 실패, 룰 fallback 사용 userId={}", userId, e);
            return ruleBasedGenerator.generate(response);
        }
    }
}