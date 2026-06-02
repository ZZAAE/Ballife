package com.prologue.ballife.service.report.llm;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * OpenAI Chat Completions 응답 파서.
 *
 * 입력 (raw response):
 *   {
 *     "choices": [{
 *       "message": { "content": "{\"questions\":[\"q1\",\"q2\",\"q3\"]}" }
 *     }],
 *     ...
 *   }
 *
 * 출력: 질문 문자열 리스트.
 *
 * 실패 정책 — 어떤 종류의 파싱 실패도 빈 리스트 반환 (예외 throw X):
 *   - 외부 JSON 깨짐
 *   - choices/message/content 경로 누락
 *   - content 내부 JSON 깨짐
 *   - questions 필드 누락 또는 배열 아님
 *   - 빈 문자열 / null 항목
 */
@Component
public class LlmResponseParser {

    private final ObjectMapper objectMapper;

    public LlmResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<String> parseQuestions(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return List.of();

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) return List.of();

            JsonNode contentJson = objectMapper.readTree(content);
            JsonNode questions = contentJson.path("questions");
            if (!questions.isArray()) return List.of();

            List<String> result = new ArrayList<>();
            for (JsonNode q : questions) {
                if (q.isTextual() && !q.asText().isBlank()) {
                    result.add(q.asText());
                }
            }
            return result;
        } catch (Exception e) {
            // 파싱 실패는 fallback 으로 위임 — 빈 리스트
            return List.of();
        }
    }
}