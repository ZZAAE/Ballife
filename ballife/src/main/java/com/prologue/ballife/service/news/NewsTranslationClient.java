package com.prologue.ballife.service.news;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;

/**
 * 카드뉴스 제목 다국어 번역 클라이언트.
 *  - ai-service(FastAPI) 의 POST /news/translate 호출
 *  - NewsService.refresh() 시점에 한국어 제목을 en/ja/zh-CN 으로 사전번역
 *  - 실패하면 원문(한국어) 그대로 반환하여 뉴스 기능 자체는 항상 동작
 */
@Slf4j
@Service
public class NewsTranslationClient {

    private final WebClient webClient;

    // ai-service(FastAPI) 주소. 운영(도커)에서는 서비스명으로 주입:
    //   AISERVICE_BASE_URL=http://ai-service:8001
    public NewsTranslationClient(
            @Value("${aiservice.base-url:http://localhost:8001}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    /**
     * titles 를 lang(en/ja/zh-CN)으로 번역.
     * 실패하거나 개수가 맞지 않으면 원문(titles) 그대로 반환.
     */
    public List<String> translateTitles(List<String> titles, String lang) {
        if (titles == null || titles.isEmpty()) {
            return titles;
        }
        try {
            Map<String, Object> body = Map.of("titles", titles, "lang", lang);
            Map<String, List<String>> res = webClient.post()
                    .uri("/news/translate")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, List<String>>>() {})
                    .block();

            List<String> out = (res != null) ? res.get("titles") : null;
            if (out != null && out.size() == titles.size()) {
                return out;
            }
            log.warn("[NewsTranslationClient] 번역 결과 개수 불일치 — 원문 유지 (lang={})", lang);
        } catch (Exception e) {
            log.warn("[NewsTranslationClient] 번역 실패 (lang={}): {}", lang, e.getMessage());
        }
        return titles;
    }
}
