package com.prologue.ballife.service.meal;

import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * 자체 학습 YOLO 음식 분류 모델 호출 (Python ai-service 의 POST /predict-food).
 *  - 입력: 업로드된 음식 이미지(MultipartFile)
 *  - 출력: known=true 일 때만 음식명/신뢰도를 담아 반환, 그 외에는 empty
 *  - ai-service 다운/타임아웃/모름(known=false) 등 어떤 경우든 empty → 호출측이 OpenAI로 폴백
 */
@Slf4j
@Service
public class FoodModelClient {

    private final WebClient client;
    private final ObjectMapper objectMapper;

    public FoodModelClient(
            ObjectMapper objectMapper,
            @Value("${aiservice.base-url:http://localhost:8001}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.client = WebClient.builder()
                .baseUrl(baseUrl)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();
    }

    /**
     * YOLO 모델로 음식 분류.
     * @return 모델이 확신한 경우(known=true)에만 결과, 아니면 Optional.empty()
     */
    public Optional<Result> classify(MultipartFile file) {
        try {
            MultipartBodyBuilder mb = new MultipartBodyBuilder();
            final String filename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename() : "image.jpg";
            mb.part("file", new ByteArrayResource(file.getBytes()) {
                        @Override
                        public String getFilename() {
                            return filename;
                        }
                    })
                    .contentType(MediaType.parseMediaType(
                            file.getContentType() != null ? file.getContentType() : "image/jpeg"));

            String response = client.post()
                    .uri("/predict-food")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(mb.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .onErrorResume(e -> {
                        log.warn("[FoodModelClient] ai-service 호출 실패: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (response == null) return Optional.empty();

            JsonNode root = objectMapper.readTree(response);
            boolean known = root.path("known").asBoolean(false);
            String food = root.path("food").asText("").trim();
            double confidence = root.path("confidence").asDouble(0.0);

            if (!known || food.isBlank()) {
                log.info("[FoodModelClient] 모델 미확신 (known={}, conf={}) → OpenAI 폴백",
                        known, Math.round(confidence * 100) / 100.0);
                return Optional.empty();
            }

            log.info("[FoodModelClient] YOLO 인식: '{}' (신뢰도 {}%)",
                    food, Math.round(confidence * 100));
            return Optional.of(new Result(food, confidence));
        } catch (Exception e) {
            log.warn("[FoodModelClient] 분류 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Getter
    public static class Result {
        private final String food;
        private final double confidence;

        public Result(String food, double confidence) {
            this.food = food;
            this.confidence = confidence;
        }
    }
}
