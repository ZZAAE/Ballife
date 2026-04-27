package com.prologue.ballife.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.service.meal.MealItemService;
import com.prologue.ballife.web.dto.meal.MealDto;
import com.prologue.ballife.web.dto.meal.MealItemDto;

import java.util.List;

@Tag(name = "Member", description = "회원 API")
@RestController // @Controller + @ResponseBody(JSON)
@RequestMapping("/api/mealItem") // React page 요청(프론트앤드에서 요청하는 요구 사항) 
@RequiredArgsConstructor
public class MealItemController {

    private final MealItemService mealItemService;

    // 식단 작성
    @Operation(summary = "식단 작성", description = "userId, MealId로 식단을 작성합니다.")
    @PostMapping
    public ResponseEntity<MealItemDto.MealItemResponse> createMealItem(
        @RequestParam Long userId,
        @RequestParam Long mealId,
        @Valid @RequestBody MealItemDto.MealItemSaveRequest request
    ){
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mealItemService.createMealItem(userId, mealId, request));
    }

    @Operation(summary = "식단 수정", description = "MealItem 수정.")
    @PutMapping("/{id}")
    public ResponseEntity<MealItemDto.MealItemResponse> updateMealItem(
        @RequestParam Long userId,
        @PathVariable Long id,
        @Valid @RequestBody MealItemDto.MealItemUpdateRequest request){
            return ResponseEntity.ok(mealItemService.MealItemUpdateRequest(userId, id, request));
        }

    @Operation(summary = "식사 삭제", description = "MealItem 삭제.")
    @DeleteMapping("/{id}")
    public ResponseEntity<MealItemDto.MealItemResponse> deleteMeal(
        @RequestParam Long userId,
        @PathVariable Long id){
            mealItemService.deleteMealItem(id, userId);
            return ResponseEntity.noContent().build();
        }
    
    @Operation(summary = "식단 하나 조회", description = "MealItemId로 식단 조회.")
    @GetMapping("/{id}")
    public ResponseEntity<MealItemDto.MealItemResponse> getMealItem(
        @PathVariable Long id
    ){
        MealItemDto.MealItemResponse response = mealItemService.getMealItem(id);
        return ResponseEntity.ok(response);
    }

    

}
