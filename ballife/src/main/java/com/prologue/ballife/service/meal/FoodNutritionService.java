package com.prologue.ballife.service.meal;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.prologue.ballife.domain.food.FoodNutrition;
import com.prologue.ballife.repository.foodMongo.FoodNutritionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 음식 영양성분 조회 서비스.
 *  1) MongoDB(food_nutrition) 캐시 조회
 *  2) 미스 시 식약처 API 호출 → Mongo upsert → 반환
 *  3) 둘 다 실패 시 Optional.empty()
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodNutritionService {

    private final FoodNutritionRepository repository;
    private final FoodSafetyKoreaClient foodSafetyClient;

    public Optional<FoodNutrition> lookup(String name) {
        if (name == null || name.isBlank()) return Optional.empty();

        // 1. 이름 정확 일치
        Optional<FoodNutrition> hit = repository.findByName(name);
        if (hit.isPresent()) return hit;

        // 2. 동의어
        hit = repository.findByAliasesContaining(name);
        if (hit.isPresent()) return hit;

        // 3. 식약처 API
        Optional<FoodNutrition> fresh = foodSafetyClient.searchByName(name);
        if (fresh.isPresent()) {
            try {
                FoodNutrition saved = repository.save(fresh.get());
                log.info("[FoodNutritionService] '{}' 식약처에서 신규 캐싱", name);
                return Optional.of(saved);
            } catch (Exception e) {
                log.warn("[FoodNutritionService] '{}' 캐싱 실패: {}", name, e.getMessage());
                return fresh; // 저장 실패해도 결과는 반환
            }
        }
        return Optional.empty();
    }

    /**
     * 음식명 자동완성: 식약처 부분일치 후보를 넉넉히(40건) 받아
     *  1) 관련도 정렬 (정확일치 > 검색어로 시작 > 포함, 동점이면 영양값 있는 것·짧은 이름 우선)
     *  2) 정규화 이름 기준 중복 제거
     *  3) 상위 limit 건만 반환
     */
    public List<FoodNutrition> search(String query, int limit) {
        if (query == null || query.isBlank()) return List.of();
        String q = query.trim();
        List<FoodNutrition> raw = foodSafetyClient.searchCandidates(q, 40);
        if (raw.isEmpty()) return List.of();

        String nq = normalizeForMatch(q);
        List<FoodNutrition> sorted = new ArrayList<>(raw);
        sorted.sort(Comparator
                .comparingInt((FoodNutrition f) -> matchScore(normalizeForMatch(f.getName()), nq))
                .thenComparingInt(f -> f.getCalories() == null ? 1 : 0)        // 영양값 있는 것 우선
                .thenComparingInt(f -> f.getName() == null ? 999 : f.getName().length())); // 짧은(대표) 이름 우선

        // 정규화 이름이 같으면 중복으로 보고 1건만 (정렬 후 첫 항목 = 최선 후보)
        LinkedHashMap<String, FoodNutrition> dedup = new LinkedHashMap<>();
        for (FoodNutrition f : sorted) {
            dedup.putIfAbsent(normalizeForMatch(f.getName()), f);
        }
        return dedup.values().stream().limit(limit).toList();
    }

    /** 관련도 점수: 작을수록 우선 (0=정확일치, 1=검색어로 시작, 2=포함, 3=그 외) */
    private int matchScore(String name, String normalizedQuery) {
        if (name == null || name.isBlank()) return 4;
        if (name.equals(normalizedQuery)) return 0;
        if (name.startsWith(normalizedQuery)) return 1;
        if (name.contains(normalizedQuery)) return 2;
        return 3;
    }

    /** 매칭/중복판정용 정규화: 공백·괄호·언더스코어·쉼표·가운뎃점 제거 */
    private String normalizeForMatch(String s) {
        if (s == null) return "";
        return s.replaceAll("[\\s()_,·]", "");
    }
}
