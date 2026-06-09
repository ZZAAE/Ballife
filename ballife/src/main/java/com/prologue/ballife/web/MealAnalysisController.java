package com.prologue.ballife.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.prologue.ballife.domain.food.FoodNutrition;
import com.prologue.ballife.service.meal.FoodNutritionService;
import com.prologue.ballife.service.meal.MealAnalysisService;
import com.prologue.ballife.web.dto.meal.MealAnalysisDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "MealAnalysis", description = "음식 사진 AI 분석 API (Vision LLM)")
@RestController
@RequestMapping("/api/meal")
@RequiredArgsConstructor
public class MealAnalysisController {

    private final MealAnalysisService mealAnalysisService;
    private final FoodNutritionService foodNutritionService;

    @Operation(summary = "음식 사진 분석",
            description = "사진 1장을 받아 OpenAI Vision으로 음식 식별 + 식약처 영양정보 매칭 + 합산하여 반환")
    @PostMapping("/analyze")
    public ResponseEntity<MealAnalysisDto.Response> analyze(
            @RequestPart("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(mealAnalysisService.analyze(file));
        } catch (IllegalArgumentException e) {
            log.warn("[MealAnalysisController] 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("[MealAnalysisController] 분석 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "음식명 검색(자동완성)",
            description = "식약처 식품영양성분DB에서 음식명 부분 일치 후보를 조회한다. 영양값은 100g 기준 정규화.")
    @GetMapping("/foods/search")
    public ResponseEntity<List<MealAnalysisDto.FoodSearchItem>> searchFoods(
            @RequestParam("query") String query) {
        List<FoodNutrition> found = foodNutritionService.search(query, 10);
        List<MealAnalysisDto.FoodSearchItem> result = found.stream()
                .map(MealAnalysisDto.FoodSearchItem::from)
                .toList();
        return ResponseEntity.ok(result);
    }
}
