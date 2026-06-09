package com.prologue.ballife.service.medicine;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MedicineLLMService {
    private final WebClient webClient;

    // ai-service(FastAPI) 주소. 운영(도커)에서는 서비스명으로 주입:
    //   AISERVICE_BASE_URL=http://ai-service:8001
    public MedicineLLMService(
            @Value("${aiservice.base-url:http://localhost:8001}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public List<String> getMedicineNameList(List<String> strList){
        List<String> raw = webClient.post()
        .uri("/ocr")
        .bodyValue(strList)
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
        .block();

        log.info("OCR 응답 원본: {}", raw);
        return raw;
    }
}
