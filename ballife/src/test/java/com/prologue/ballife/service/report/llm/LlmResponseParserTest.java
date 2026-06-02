package com.prologue.ballife.service.report.llm;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * LlmResponseParser 단위 테스트.
 *
 * 시나리오:
 *   - 정상 JSON                            → questions 리스트
 *   - 외부 JSON 깨짐                       → 빈 리스트
 *   - content 안의 questions 필드 누락     → 빈 리스트
 */
class LlmResponseParserTest {

    LlmResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new LlmResponseParser(new ObjectMapper());
    }

    @Nested
    @DisplayName("정상 JSON (Normal)")
    class Normal {

        @Test
        @DisplayName("choices[0].message.content 안의 questions 배열 → 리스트로 추출")
        void normalJson_returnsQuestionList() {
            String raw =
                    "{\"choices\":[{\"message\":{\"content\":\"" +
                    "{\\\"questions\\\":[\\\"수축기 평균 128에 대해 상담해 보세요.\\\"," +
                    "\\\"식후혈당 관리법을 문의해 보세요.\\\"]}" +
                    "\"}}]}";

            List<String> questions = parser.parseQuestions(raw);

            assertThat(questions).containsExactly(
                    "수축기 평균 128에 대해 상담해 보세요.",
                    "식후혈당 관리법을 문의해 보세요."
            );
        }
    }

    @Nested
    @DisplayName("외부 JSON 깨짐 (BrokenJson)")
    class BrokenJson {

        @Test
        @DisplayName("외부 JSON 파싱 실패 → 빈 리스트 (예외 X)")
        void brokenOuterJson_returnsEmpty() {
            assertThat(parser.parseQuestions("{ not valid json")).isEmpty();
            assertThat(parser.parseQuestions("")).isEmpty();
            assertThat(parser.parseQuestions(null)).isEmpty();
        }
    }

    @Nested
    @DisplayName("questions 필드 누락 (FieldMissing)")
    class FieldMissing {

        @Test
        @DisplayName("content 내부 JSON 에 questions 필드 없음 → 빈 리스트")
        void questionsFieldMissing_returnsEmpty() {
            String raw =
                    "{\"choices\":[{\"message\":{\"content\":\"{\\\"other\\\":[\\\"q1\\\"]}\"}}]}";

            assertThat(parser.parseQuestions(raw)).isEmpty();
        }
    }
}