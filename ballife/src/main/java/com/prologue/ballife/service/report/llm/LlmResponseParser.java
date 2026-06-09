package com.prologue.ballife.service.report.llm;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * OpenAI Chat Completions 응답 파서.
 *
 * 실패 정책 — 어떤 종류의 파싱 실패도 빈 리스트 반환 (예외 throw X):
 *   - 외부 JSON 깨짐 / null / blank
 *   - choices/message/content 경로 누락
 *   - content 내부 JSON 깨짐
 *   - questions 필드 누락 또는 배열 아님
 *   - 빈 문자열 / null 항목
 *
 * 각 실패 분기에 WARN 로그를 박아 디버깅 시 어느 단계에서 빠졌는지 추적 가능.
 */
@Slf4j
@Component
public class LlmResponseParser {

    private final ObjectMapper objectMapper;

    public LlmResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<String> parseQuestions(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            log.warn("LLM 응답 파싱 실패: rawResponse null/blank");
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                log.warn("LLM 응답 파싱 실패: choices[0].message.content 비어있음. rawLen={}",
                        rawResponse.length());
                return List.of();
            }

            JsonNode contentJson;
            try {
                contentJson = objectMapper.readTree(content);
            } catch (Exception e) {
                log.warn("LLM 응답 파싱 실패: content 내부 JSON 깨짐. content={}", truncate(content));
                return List.of();
            }

            JsonNode questions = contentJson.path("questions");
            if (!questions.isArray()) {
                log.warn("LLM 응답 파싱 실패: questions 필드 없거나 배열 아님. content={}",
                        truncate(content));
                return List.of();
            }

            List<String> result = new ArrayList<>();
            for (JsonNode q : questions) {
                if (q.isTextual() && !q.asText().isBlank()) {
                    result.add(q.asText());
                }
            }
            log.info("LLM 응답 파싱 완료: {} 개 질문 추출", result.size());
            return result;
        } catch (Exception e) {
            log.warn("LLM 응답 파싱 실패 (외부 JSON): type={}, msg={}",
                    e.getClass().getSimpleName(), e.getMessage());
            return List.of();
        }
    }

    private String truncate(String s) {
        if (s == null) return "null";
        return s.length() > 200 ? s.substring(0, 200) + "..." : s;
    }
}