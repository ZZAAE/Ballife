package com.prologue.ballife.service.ocr;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NaverOcrService {

    private final WebClient webClient;

    private String baseUrl;
    private String secretKey;

    
}
