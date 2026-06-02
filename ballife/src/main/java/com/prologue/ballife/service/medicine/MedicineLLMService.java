package com.prologue.ballife.service.medicine;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineLLMService {
    private final WebClient webClient = WebClient.builder().build();

    public List<String> getMedicineNameList(List<String> strList){
        List<String> raw = webClient.post()
        .uri("http://localhost:8001/ocr")
        .bodyValue(strList)
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
        .block();

        log.info("OCR 응답 원본: {}", raw);
        return raw;
    }
}
