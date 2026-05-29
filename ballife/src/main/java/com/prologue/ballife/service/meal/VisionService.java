package com.prologue.ballife.service.meal;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * OpenAI Vision API(Chat Completions)로 음식 사진을 분석.
 *  - 입력: 이미지 dataURL(base64)
 *  - 출력: [{name, grams}] 음식 리스트
 *  - response_format=json_object 로 응답 형식 강제
 */
@Slf4j
@Service
public class VisionService {

    private final WebClient openAiClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final String detail;

    public VisionService(
            ObjectMapper objectMapper,
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model:gpt-4o-mini}") String model,
            @Value("${openai.vision-detail:low}") String detail) {
        this.objectMapper = objectMapper;
        this.model = model;
        this.detail = detail;
        this.openAiClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();
    }

    /**
     * 음식 사진 분석.
     * @param imageDataUrl "data:image/jpeg;base64,...." 형태
     * @return 식별된 음식 리스트 (없으면 빈 리스트)
     */
    public List<RecognizedFood> analyze(String imageDataUrl) {
        String userPrompt =
                "사진에 보이는 **완성된 음식(요리) 이름** 만 식별해라. 한식·양식·중식·일식·분식·간식 모두 가능. " +
                "규칙:\n" +
                "1) 재료가 아니라 '요리 이름'으로 답해라. " +
                "   - 한식 예: 두부·버섯·김치 → '김치찌개' 하나.\n" +
                "   - 샐러드 예: 양상추·토마토·드레싱 → '샐러드' 또는 '시저샐러드/그릭샐러드/닭가슴살샐러드/연어샐러드/콥샐러드/과일샐러드' 하나.\n" +
                "   - 양식 예: 빵·패티·치즈 → '햄버거', 도우·치즈·토핑 → '피자'.\n" +
                "2) 그릇·접시 단위로 하나씩. 여러 접시면 각각 별도 항목. 메인 요리의 속재료는 분리하지 마라.\n" +
                "3) 샐러드 종류를 모르면 그냥 '샐러드'.\n" +
                "4) **grams 는 무조건 100 으로 고정**. 양을 추정하지 말고 그냥 100을 쓴다. 사용자가 나중에 직접 조정한다.\n" +
                "5) 음식이 아니면 foods는 빈 배열.\n" +
                "응답은 JSON 객체만, 다른 문구 없이: {\"foods\":[{\"name\":\"시저샐러드\",\"grams\":100}]}\n" +
                "name=요리명(한국어), grams=항상 100.";

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "response_format", Map.of("type", "json_object"),
                "max_tokens", 600,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "너는 사진의 음식을 인식하는 영양사다. 한식·양식·중식·일식·샐러드·간식 모두 다룬다. " +
                                        "재료가 아니라 '요리 단위'로 식별한다 (예: 양상추+토마토+드레싱 → '샐러드'). " +
                                        "반드시 JSON 객체로만 응답한다."
                        ),
                        Map.of(
                                "role", "user",
                                "content", List.of(
                                        Map.of("type", "text", "text", userPrompt),
                                        Map.of(
                                                "type", "image_url",
                                                "image_url", Map.of(
                                                        "url", imageDataUrl,
                                                        "detail", detail
                                                )
                                        )
                                )
                        )
                )
        );

        try {
            String response = openAiClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(e -> {
                        log.warn("[VisionService] OpenAI 호출 실패: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (response == null) return List.of();

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) return List.of();

            JsonNode parsed = objectMapper.readTree(content);
            JsonNode foodsNode = parsed.path("foods");
            if (!foodsNode.isArray()) return List.of();

            List<RecognizedFood> result = new ArrayList<>();
            for (JsonNode f : foodsNode) {
                String name = f.path("name").asText("").trim();
                if (!name.isBlank()) {
                    // grams 는 항상 100 고정 (분량은 사용자가 모달에서 조정)
                    result.add(new RecognizedFood(name, 100.0));
                }
            }
            log.info("[VisionService] 인식된 음식 {}건", result.size());
            return result;
        } catch (Exception e) {
            log.warn("[VisionService] 응답 파싱 실패: {}", e.getMessage());
            return List.of();
        }
    }

    @Getter
    public static class RecognizedFood {
        private final String name;
        private final double grams;
        public RecognizedFood(String name, double grams) {
            this.name = name;
            this.grams = grams;
        }
    }
}
