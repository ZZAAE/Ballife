package com.prologue.ballife.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.service.meal.MealService;
import com.prologue.ballife.web.dto.meal.MealDto;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Meal", description = "식사 API")
@RestController // @Controller + @ResponseBody(JSON)
@RequestMapping("/api/meal") // React page 요청(프론트앤드에서 요청하는 요구 사항) 
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @Operation(summary = "식사 작성", description = "Meal 작성.")
    @PostMapping
    public ResponseEntity<MealDto.MealResponse> createMeal(
        @RequestParam Long userId,
        @Valid @RequestBody MealDto.MealSaveRequest request){
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealService.createMeal(userId, request));
        }

    @Operation(summary = "식사 수정", description = "Meal 수정.")
    @PutMapping("/{id}")
    public ResponseEntity<MealDto.MealResponse> updateMeal(
        @RequestParam Long userId,
        @PathVariable Long id,
        @Valid @RequestBody MealDto.MealUpdateRequest request){
            return ResponseEntity.ok(mealService.updateMeal(id, userId, request));
        }

    @Operation(summary = "식사 삭제", description = "Meal 삭제.")
    @DeleteMapping("/{id}")
    public ResponseEntity<MealDto.MealResponse> deleteMeal(
        @RequestParam Long userId,
        @PathVariable Long id){
            mealService.deleteMeal(id, userId);
            return ResponseEntity.noContent().build();
        }

    @Operation(summary = "식사 조회 (1개)", description = "MealId로 데이터 조회.")
    @GetMapping("/{id}")
    public ResponseEntity<MealDto.MealResponse> getMeal(
        @RequestParam Long userId,
        @PathVariable Long id){
        MealDto.MealResponse response = mealService.getMeal(id, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "식사 조회 (전체)", description = "유저의 전체 Meal 데이터 조회.")
    @GetMapping
    public ResponseEntity<List<MealDto.MealResponse>> getMeals(@RequestParam Long userId){
        List<MealDto.MealResponse> response = mealService.getAllMeal(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "식사 조회 (하루)", description = "유저의 하루 Meal 데이터 조회.")
    @GetMapping("/today")
    public ResponseEntity<List<MealDto.MealResponse>> getTodayMeal(
        @RequestParam Long userId,
        @RequestParam LocalDate date){
        List<MealDto.MealResponse> response = mealService.getMealOfToday(date, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "식사 데이터 유무 조회", description = "캘린더용, 날짜의 데이터가 존재하는지 조회.")
    @GetMapping("/calender")
    public boolean getMealForCalender(
        @RequestParam Long userId,
        @RequestParam LocalDate date){
        boolean response = mealService.getMealForCalender(date, userId);
        return response;
    }
    
}
