package com.prologue.ballife.repository.foodMongo;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.food.FoodNutrition;

@Repository
public interface FoodNutritionRepository extends MongoRepository<FoodNutrition, String> {

    // 정확 일치
    Optional<FoodNutrition> findByName(String name);

    // 동의어 검색 (Vision LLM이 "bibimbap" 같은 영문명을 줄 때 대비)
    Optional<FoodNutrition> findByAliasesContaining(String alias);
}
