package com.prologue.ballife.service.report.llm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

/**
 * LlmClient 단위 테스트.
 *
 * WebClient 는 ExchangeFunction 으로 가짜 HTTP 응답 주입 (별도 의존성 불필요).
 * 실제 OpenAI 호출은 절대 발생 X.
 *
 * 시나리오:
 *   - 정상 200 응답   → raw JSON 그대로 반환
 *   - HTTP 401 오류  → RuntimeException 으로 wrap
 *   - 타임아웃       → RuntimeException 으로 wrap
 */
class LlmClientTest {

    private LlmClient buildClientWith(ExchangeFunction exchangeFunction, Duration timeout) {
        WebClient webClient = WebClient.builder()
                .exchangeFunction(exchangeFunction)
                .build();
        return new LlmClient(webClient, "gpt-4o-mini", 1500, timeout);
    }

    @Nested
    @DisplayName("정상 200 응답 (NormalResponse)")
    class NormalResponse {

        @Test
        @DisplayName("OpenAI 200 + JSON body → raw response 그대로 반환")
        void returnsRawJson() {
            String stubBody =
                    "{\"choices\":[{\"message\":{\"content\":\"{\\\"questions\\\":[\\\"q1\\\"]}\"}}]}";

            ExchangeFunction ef = req -> Mono.just(
                    ClientResponse.create(HttpStatus.OK)
                            .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                            .body(stubBody)
                            .build());

            LlmClient client = buildClientWith(ef, Duration.ofSeconds(5));
            String response = client.complete("sys", "user");

            assertThat(response).contains("\"choices\"").contains("questions");
        }
    }

    @Nested
    @DisplayName("HTTP 오류 (HttpError)")
    class HttpError {

        @Test
        @DisplayName("OpenAI 401 → RuntimeException 으로 wrap")
        void unauthorized_wrapsToRuntimeException() {
            ExchangeFunction ef = req -> Mono.just(
                    ClientResponse.create(HttpStatus.UNAUTHORIZED)
                            .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                            .body("{\"error\":{\"message\":\"invalid api key\"}}")
                            .build());

            LlmClient client = buildClientWith(ef, Duration.ofSeconds(5));

            assertThatThrownBy(() -> client.complete("sys", "user"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("OpenAI 호출 실패");
        }
    }

    @Nested
    @DisplayName("타임아웃 (Timeout)")
    class Timeout {

        @Test
        @DisplayName("응답 지연 → 타임아웃 → RuntimeException 으로 wrap")
        void slowResponse_timesOut() {
            // Mono.never() — 절대 완료되지 않음 → 짧은 timeout 으로 강제 실패
            ExchangeFunction ef = req -> Mono.never();

            LlmClient client = buildClientWith(ef, Duration.ofMillis(100));

            assertThatThrownBy(() -> client.complete("sys", "user"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("OpenAI 호출 실패");
        }
    }
}