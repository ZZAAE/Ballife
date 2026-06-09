package com.prologue.ballife.service.meal;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prologue.ballife.domain.food.FoodNutrition;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * 식약처 식품영양성분DB v2 (data.go.kr) 호출.
 *   Base: https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02
 *   Operation: getFoodNtrItdntList1 (default)
 *
 * 표준 data.go.kr 파라미터:
 *   - serviceKey (필수, 디코딩 키 권장)
 *   - pageNo, numOfRows
 *   - type=json
 *   - 검색 키워드 파라미터(FOOD_NM_KR 또는 desc_kor 등) — 첫 호출 응답을 보고 결정
 *
 * 응답 필드명도 API별로 차이가 있어 처음엔 raw 로그를 찍어 확인 후 매핑을 맞춥니다.
 */
@Slf4j
@Component
public class FoodSafetyKoreaClient {

    private final WebClient client;
    private final ObjectMapper objectMapper;
    private final String serviceKey;
    private final String operation;
    private final String baseUrl;

    public FoodSafetyKoreaClient(
            ObjectMapper objectMapper,
            @Value("${foodsafety.api.base-url:https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02}") String baseUrl,
            @Value("${foodsafety.api.operation:getFoodNtrItdntList1}") String operation,
            @Value("${foodsafety.api.service-key:}") String serviceKey) {
        this.objectMapper = objectMapper;
        this.serviceKey = serviceKey;
        this.operation = operation;
        this.baseUrl = baseUrl;
        this.client = WebClient.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();
    }

    /** 음식명으로 영양성분 1건 검색 (첫 결과 사용) */
    public Optional<FoodNutrition> searchByName(String foodName) {
        if (foodName == null || foodName.isBlank()) return Optional.empty();
        String body = fetchRaw(foodName, 5);
        if (body == null || body.isBlank()) return Optional.empty();
        try {
            JsonNode row = pickFirstRow(objectMapper.readTree(body));
            if (row == null || row.isMissingNode() || row.isNull()) {
                log.info("[FoodSafetyKoreaClient] '{}' 검색 결과 0건", foodName);
                return Optional.empty();
            }
            return Optional.of(toFoodNutrition(foodName, row));
        } catch (Exception e) {
            log.warn("[FoodSafetyKoreaClient] 파싱 실패 ({}): {}", foodName, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 음식명(부분 일치)으로 후보 여러 건 검색 — 자동완성용.
     * 각 후보의 name 은 응답의 실제 식품명(FOOD_NM_KR)을 사용한다.
     */
    public List<FoodNutrition> searchCandidates(String query, int limit) {
        if (query == null || query.isBlank()) return List.of();
        int rows = Math.max(1, Math.min(limit, 50));
        String body = fetchRaw(query, rows);
        if (body == null || body.isBlank()) return List.of();
        try {
            List<JsonNode> rowNodes = pickAllRows(objectMapper.readTree(body));
            List<FoodNutrition> out = new ArrayList<>();
            for (JsonNode row : rowNodes) {
                String name = firstString(row, "FOOD_NM_KR", "DESC_KOR", "식품명");
                if (name == null || name.isBlank()) name = query;
                out.add(toFoodNutrition(cleanName(name), row));
                if (out.size() >= rows) break;
            }
            return out;
        } catch (Exception e) {
            log.warn("[FoodSafetyKoreaClient] 후보 파싱 실패 ({}): {}", query, e.getMessage());
            return List.of();
        }
    }

    /**
     * 식약처 식품명을 사용자용으로 정리.
     *  - "김치찌개_돼지고기" → "김치찌개 (돼지고기)" (첫 구간=대표명, 나머지=부가설명)
     *  - foodName 컬럼이 varchar(20) 이라 20자로 제한 (길면 대표명만)
     */
    private String cleanName(String raw) {
        if (raw == null || raw.isBlank()) return raw;
        String s = raw.trim();
        String display;
        if (s.contains("_")) {
            String[] parts = s.split("_");
            String head = parts[0].trim();
            StringBuilder tail = new StringBuilder();
            for (int i = 1; i < parts.length; i++) {
                String p = parts[i].trim();
                if (p.isEmpty()) continue;
                if (tail.length() > 0) tail.append(" ");
                tail.append(p);
            }
            display = tail.length() > 0 ? head + " (" + tail + ")" : head;
        } else {
            display = s;
        }
        if (display.length() > 20) {
            String head = s.contains("_") ? s.split("_")[0].trim() : s;
            display = head.length() <= 20 ? head : head.substring(0, 20);
        }
        return display;
    }

    /** 식약처 API 호출 후 원문(JSON) 반환. 키 미설정/실패 시 빈 문자열. */
    private String fetchRaw(String keyword, int numOfRows) {
        if (serviceKey == null || serviceKey.isBlank()) {
            log.warn("[FoodSafetyKoreaClient] FOOD_SAFETY_KEY 미설정 — 외부 호출 생략");
            return "";
        }
        // 모든 파라미터를 직접 URL 인코딩한 raw URI를 만든다.
        // (WebClient.queryParam 은 `+` 같은 문자를 자동 인코딩하지 않을 수 있어 키 불일치 발생)
        String url = baseUrl + "/" + operation
                + "?serviceKey=" + URLEncoder.encode(serviceKey, StandardCharsets.UTF_8)
                + "&type=json"
                + "&pageNo=1"
                + "&numOfRows=" + numOfRows
                + "&FOOD_NM_KR=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8);
        URI rawUri = URI.create(url);

        String body = client.get()
                .uri(rawUri)
                .exchangeToMono(resp -> resp.bodyToMono(String.class)
                        .defaultIfEmpty("")
                        .map(b -> {
                            if (!resp.statusCode().is2xxSuccessful()) {
                                log.warn("[FoodSafetyKoreaClient] {} 응답: {}",
                                        resp.statusCode(),
                                        b.length() > 1200 ? b.substring(0, 1200) + "..." : b);
                                return "";
                            }
                            return b;
                        }))
                .onErrorResume(e -> {
                    log.warn("[FoodSafetyKoreaClient] 호출 실패 ({}): {}", keyword, e.getMessage());
                    return Mono.empty();
                })
                .block();

        if (body != null && !body.isBlank()) {
            log.info("[FoodSafetyKoreaClient][RAW] keyword='{}' response={}", keyword,
                    body.length() > 1200 ? body.substring(0, 1200) + "..." : body);
        }
        return body == null ? "" : body;
    }

    /**
     * 응답 구조 후보들을 폭넓게 처리:
     *   - { body: { items: { item: [...] } } }   (data.go.kr 전형)
     *   - { response: { body: { items: [...] } } }
     *   - { I2790: { row: [...] } }               (구 식품안전나라)
     *   - { data: [...] }                         (odcloud 표준)
     */
    private JsonNode pickFirstRow(JsonNode root) {
        JsonNode[] candidates = new JsonNode[] {
                root.at("/body/items/item"),
                root.at("/response/body/items/item"),
                root.at("/body/items"),
                root.at("/response/body/items"),
                root.at("/I2790/row"),
                root.at("/data"),
        };
        for (JsonNode n : candidates) {
            if (n == null || n.isMissingNode() || n.isNull()) continue;
            if (n.isArray() && !n.isEmpty()) return n.get(0);
            if (n.isObject()) return n;
        }
        return null;
    }

    /** pickFirstRow 와 동일한 후보 구조에서 모든 row 를 리스트로 반환 (자동완성용). */
    private List<JsonNode> pickAllRows(JsonNode root) {
        JsonNode[] candidates = new JsonNode[] {
                root.at("/body/items/item"),
                root.at("/response/body/items/item"),
                root.at("/body/items"),
                root.at("/response/body/items"),
                root.at("/I2790/row"),
                root.at("/data"),
        };
        for (JsonNode n : candidates) {
            if (n == null || n.isMissingNode() || n.isNull()) continue;
            List<JsonNode> out = new ArrayList<>();
            if (n.isArray()) {
                n.forEach(out::add);
                if (!out.isEmpty()) return out;
            } else if (n.isObject()) {
                out.add(n);
                return out;
            }
        }
        return List.of();
    }

    /**
     * 응답 row → FoodNutrition 정규화.
     * 식약처 식품영양성분DB v02 (FoodNtrCpntDbInfo02) 공식 AMT_NUM 매핑:
     *   1=에너지(kcal) / 2=수분(g) / 3=단백질(g) / 4=지방(g) / 5=회분(g)
     *   6=탄수화물(g) / 7=당류(g) / 8=식이섬유(g) / 9=칼슘(mg) / 10=철(mg)
     *   11=인(mg) / 12=칼륨(mg) / 13=나트륨(mg) / ... / 23=콜레스테롤(mg)
     *   24=포화지방산(g) / 25=트랜스지방산(g)
     * SERVING_SIZE 는 "100g" 같이 단위 포함 문자열이라 숫자만 추출.
     */
    private FoodNutrition toFoodNutrition(String queryName, JsonNode row) {
        return FoodNutrition.builder()
                .name(queryName)
                .servingSize(parseServingSize(row))
                .calories(firstNumber(row, "AMT_NUM1", "에너지(kcal)"))
                .carbs(firstNumber(row, "AMT_NUM6", "탄수화물(g)"))
                .protein(firstNumber(row, "AMT_NUM3", "단백질(g)"))
                .fat(firstNumber(row, "AMT_NUM4", "지방(g)"))
                .fiber(firstNumber(row, "AMT_NUM8", "식이섬유(g)"))
                .sodium(firstNumber(row, "AMT_NUM13", "나트륨(mg)"))
                .cholesterol(firstNumber(row, "AMT_NUM23", "콜레스테롤(mg)"))
                .saturatedFat(firstNumber(row, "AMT_NUM24", "포화지방산(g)"))
                .sugar(firstNumber(row, "AMT_NUM7", "당류(g)"))
                .source("식약처")
                .sourceId(firstString(row, "FOOD_CD", "food_cd", "식품코드"))
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /** SERVING_SIZE: "100g", "1인분(250g)" 등에서 숫자만 추출 */
    private Double parseServingSize(JsonNode row) {
        String raw = firstString(row, "SERVING_SIZE", "serving_size", "영양성분함량기준량");
        if (raw == null || raw.isBlank()) return 100.0;
        // 첫 숫자(소수 포함) 추출
        StringBuilder sb = new StringBuilder();
        boolean dotSeen = false;
        for (char c : raw.toCharArray()) {
            if (Character.isDigit(c)) {
                sb.append(c);
            } else if (c == '.' && !dotSeen) {
                sb.append(c);
                dotSeen = true;
            } else if (sb.length() > 0) {
                break; // 숫자 끝
            }
        }
        try {
            return sb.length() > 0 ? Double.parseDouble(sb.toString()) : 100.0;
        } catch (NumberFormatException e) {
            return 100.0;
        }
    }

    private Double firstNumber(JsonNode row, String... keys) {
        for (String k : keys) {
            String s = row.path(k).asText("");
            if (s.isBlank()) continue;
            try {
                return Double.parseDouble(s.replace(",", "").trim());
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    private String firstString(JsonNode row, String... keys) {
        for (String k : keys) {
            String s = row.path(k).asText("");
            if (!s.isBlank()) return s;
        }
        return null;
    }
}
