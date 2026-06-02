package com.prologue.ballife.service.report.llm;

import java.util.List;

import org.springframework.stereotype.Component;

import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

import lombok.RequiredArgsConstructor;

/**
 * LLM 기반 진료 질문 생성기 — 메인 진입점.
 *
 * 세 컴포넌트 조립:
 *   PromptBuilder      : system + user prompt 생성
 *   LlmClient          : OpenAI 호출 → raw response JSON
 *   LlmResponseParser  : raw response → questions 리스트
 *
 * 실패 정책 — 본 클래스는 fallback 결정 안 함:
 *   - LlmClient 의 RuntimeException 은 그대로 throw 됨 (ReportService 에서 catch)
 *   - LlmResponseParser 가 빈 리스트 반환하면 그대로 빈 리스트 (ReportService 에서 분기)
 *
 * 16-B 확장 시: generate(data, enrichedContext) 오버로드 추가 예정.
 */
@Component
@RequiredArgsConstructor
public class LlmQuestionGenerator {

    private final LlmClient client;
    private final PromptBuilder promptBuilder;
    private final LlmResponseParser parser;

    public List<String> generate(HealthAnalysisResponse data) {
        String systemPrompt = promptBuilder.buildSystemPrompt();
        String userPrompt   = promptBuilder.buildUserPrompt(data);
        String rawResponse  = client.complete(systemPrompt, userPrompt);
        return parser.parseQuestions(rawResponse);
    }
}