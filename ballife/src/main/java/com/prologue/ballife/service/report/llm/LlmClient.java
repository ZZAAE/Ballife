package com.prologue.ballife.service.report.llm;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

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
 *   - openai.api-key                   : 공유 (Vision 과 동일 키 사용)
 *   - openai.report.model              : 보고서 질문 생성용 모델
 *   - openai.report.max-tokens         : 응답 최대 토큰
 *   - openai.report.timeout-seconds    : 호출 타임아웃 (초)
 *
 * WebClient 사용 (기존 VisionService 패턴 동일).
 * 동기 호출 — Mono.block() 으로 처리.
 *
 * 생성자 2개:
 *   - public  (운영) : Spring 의 @Autowired + @Value 기반 의존성 주입
 *   - package-private (테스트) : WebClient 직접 주입 → ExchangeFunction 으로 모킹
 *   다중 생성자라서 Spring 은 @Autowired 가 명시된 생성자를 선택.
 */
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

        try {
            return openAiClient.post()
                    .uri(OPENAI_CHAT_PATH)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(timeout)
                    .block();
        } catch (RuntimeException e) {
            throw new RuntimeException("OpenAI 호출 실패", e);
        }
    }
}