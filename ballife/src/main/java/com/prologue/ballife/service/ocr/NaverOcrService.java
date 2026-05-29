package com.prologue.ballife.service.ocr;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.prologue.ballife.exception.OcrResponseNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@Service
@RequiredArgsConstructor
public class NaverOcrService {

    private final WebClient webClient = WebClient.builder().build();

    private String baseUrl;
    private String secretKey;

    public List<String> getOcrStringList(String type, String name, String data){
        JsonNode json = sendOcrRequest(type, name, data).orElseThrow(() -> new OcrResponseNotFoundException());
        return parsingJsonToString(json);
    }

    public Optional<JsonNode> sendOcrRequest(String type, String name, String data){
        Map<String, Object> requestBody = setRequestBody(type, name, data);

        try{
            JsonNode response = webClient.post()
                        .uri(baseUrl)
                        .header("Content-Type", "application/json")
                        .header("X-OCR-SECRET", secretKey)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();
             return Optional.ofNullable(response);
        } catch (WebClientResponseException e) {
            // 4xx/5xx 응답이 왔을 때
            log.error("OCR API 응답 오류: status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return Optional.empty();

        } catch (WebClientRequestException e) {
            // 연결 실패/타임아웃 (네트워크 단계)
            log.error("OCR API 연결 실패: {}", e.getMessage());
            return Optional.empty();

        } catch (Exception e) {
            // 그 외 (JSON 파싱 오류 등)
            log.error("OCR 처리 중 알 수 없는 오류", e);
            return Optional.empty();
        }        
    }

    private Map<String, Object> setRequestBody(String type, String name, String data){
        Map<String, Object> requestBody = new HashMap<String, Object>();
        requestBody.put("version", "V2");
        requestBody.put("requestId", UUID.randomUUID().toString());
        requestBody.put("timestamp", System.currentTimeMillis());
        requestBody.put("image", setImageBody(type, name, data));

        return requestBody;
    }
    
    private Map<String, Object> setImageBody(String type, String name, String data){
        Map<String, Object> imgBody = new HashMap<String, Object>();
        imgBody.put("format", type);
        imgBody.put("name", name);
        imgBody.put("data", data);
        return imgBody;
    }

    public List<String> parsingJsonToString(JsonNode root) {
    List<String> texts = new ArrayList<>();
    for (JsonNode image : root.path("images")) {
        for (JsonNode field : image.path("fields")) {
            texts.add(field.path("inferText").asText());
        }
    }
    return texts;
}
}
