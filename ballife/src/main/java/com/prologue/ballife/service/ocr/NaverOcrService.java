package com.prologue.ballife.service.ocr;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NaverOcrService {

    private final WebClient webClient;

    private String baseUrl;
    private String secretKey;

    Map<String, Object> requestBody = null;

    // public void sendOcrRequest(String contentType, String img){
    //     return webClient.post()
    //                     .uri(baseUrl)
    //                     .header("Content-Type", "application/json")
    //                     .header("X-OCR-SECRET", secretKey)
    //                     .bodyValue(requestBody)
    //                     .retrieve()
    //                     .bodyToMono(null)
    //                     .block();
    // }
    
}
