package com.prologue.ballife.service.report.llm;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.extern.slf4j.Slf4j;

/**
 * OpenAI Chat Completions HTTP 클라이언트 (건강 보고서 질문 생성 전용).
 *
 * 책임:
 *   - system prompt + user prompt 를 받아 OpenAI 에 POST /v1/chat/completions
 *   - response_format=json_object 로 강제
 *   - raw response JSON 문자열 반환 (파싱은 LlmResponseParser 담당)
 *   - HTTP 오류 / 타임아웃 / 그 외 모든 예외는 RuntimeException 으로 통일하여 던짐
 *
 * 설정 네임스페이스: openai.report.*  (팀원의 openai.* / openai.vision-* 와 분리)
 */
@Slf4j
@Component
public class LlmClient {

    private static final String OPENAI_BASE_URL = "https://api.openai.com/v1";
    private static final String OPENAI_CHAT_PATH = "/chat/completions";

    private final WebClient openAiClient;
    private final String model;
    private final int maxTokens;
    private final Duration timeout;

    @Autowired
    public LlmClient(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.report.model:gpt-4o-mini}") String model,
            @Value("${openai.report.max-tokens:1500}") int maxTokens,
            @Value("${openai.report.timeout-seconds:15}") int timeoutSeconds) {
        this(buildDefaultClient(apiKey), model, maxTokens, Duration.ofSeconds(timeoutSeconds));
        log.info("LlmClient 초기화: model={}, maxTokens={}, timeout={}s, apiKeyConfigured={}",
                model, maxTokens, timeoutSeconds, !"default".equals(apiKey));
    }

    /** 테스트 전용 — WebClient 직접 주입. */
    LlmClient(WebClient openAiClient, String model, int maxTokens, Duration timeout) {
        this.openAiClient = openAiClient;
        this.model = model;
        this.maxTokens = maxTokens;
        this.timeout = timeout;
    }

    private static WebClient buildDefaultClient(String apiKey) {
        return WebClient.builder()
                .baseUrl(OPENAI_BASE_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * OpenAI 호출 → 응답 JSON 문자열.
     *
     * @throws RuntimeException HTTP 오류 / 타임아웃 / 기타 모든 실패를 통일하여 wrap.
     */
    public String complete(String systemPrompt, String userPrompt) {
        // OpenAI API 사양: snake_case 필드명 ("max_tokens", "response_format")
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userPrompt)
                )
        );

        log.info("OpenAI 호출 시작: path={}, model={}, sysLen={}, userLen={}",
                OPENAI_CHAT_PATH, model, systemPrompt.length(), userPrompt.length());

        try {
            String response = openAiClient.post()
                    .uri(OPENAI_CHAT_PATH)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(timeout)
                    .block();
            log.info("OpenAI 호출 성공: responseLen={}", response == null ? 0 : response.length());
            return response;
        } catch (WebClientResponseException e) {
            // HTTP status 있는 응답 — 401/429/500 등
            log.warn("OpenAI HTTP 오류: status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("OpenAI 호출 실패 (HTTP " + e.getStatusCode() + ")", e);
        } catch (RuntimeException e) {
            // 타임아웃 / 네트워크 / 기타
            log.warn("OpenAI 호출 예외: type={}, msg={}",
                    e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("OpenAI 호출 실패", e);
        }
    }
}