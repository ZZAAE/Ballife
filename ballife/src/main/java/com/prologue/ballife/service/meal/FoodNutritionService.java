package com.prologue.ballife.service.meal;

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
}
