package com.prologue.ballife.service.meal;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.prologue.ballife.domain.meal.Meal;
import com.prologue.ballife.domain.meal.MealItem;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.meal.MealItemRepository;
import com.prologue.ballife.repository.meal.MealRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.meal.MealDto;
import com.prologue.ballife.web.dto.meal.MealItemDto;

@Service
@RequiredArgsConstructor // 의존성 주입 DI ->멤버변수를 생성자 자동 주입
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class MealItemService {

    private final MealRepository mealRepository;
    private final UserRepository userRepository;
    private final MealItemRepository mealItemRepository;

    // 식단 작성 (피그마 상 식사 등록 버튼 누르자마자 생성 이후 생성된 식사 테이블에 저장)
    @Transactional
    public MealItemDto.MealItemResponse createMealItem(Long USER_ID, Long mealId , MealItemDto.MealItemSaveRequest request){
        User user = userRepository.findById(USER_ID)
            .orElseThrow(() -> new ResourceNotFoundException("회원", USER_ID));

        Meal meal = mealRepository.findById(mealId)
            .orElseThrow(() -> new ResourceNotFoundException("식사", USER_ID));

        MealItem mealItem = MealItem.builder()
            .meal(meal)
            .foodName(request.getFoodName())
            .calorie(request.getCalorie())
            .carbohydrate(request.getCarbohydrate())
            .sugar(request.getSugar())
            .sodium(request.getSodium())
            .cholesterol(request.getCholesterol())
            .saturatedFat(request.getSaturatedFat())
            .protein(request.getProtein())
            .build();

            return MealItemDto.MealItemResponse.from(mealItemRepository.save(mealItem));
    }

    // 식단 수정
    @Transactional
    public MealItemDto.MealItemResponse MealItemUpdateRequest(Long USER_ID, Long mealItemId , MealItemDto.MealItemUpdateRequest request){
        User user = userRepository.findById(USER_ID)
            .orElseThrow(() -> new ResourceNotFoundException("회원", USER_ID));

        MealItem mealItem = mealItemRepository.findById(mealItemId)
            .orElseThrow(() -> new ResourceNotFoundException("식단", USER_ID));

        mealItem.setFoodName(request.getFoodName()!=null ? request.getFoodName() : mealItem.getFoodName());
        mealItem.setCalorie(request.getCalorie()!=null ? request.getCalorie() : mealItem.getCalorie());
        mealItem.setCarbohydrate(request.getCarbohydrate()!=null ? request.getCarbohydrate() : mealItem.getCarbohydrate());
        mealItem.setSugar(request.getSugar()!=null ? request.getSugar() : mealItem.getSugar());
        mealItem.setSodium(request.getSodium()!=null ? request.getSodium() : mealItem.getSodium());
        mealItem.setCholesterol(request.getCholesterol()!=null ? request.getCholesterol() : mealItem.getCholesterol());
        mealItem.setSaturatedFat(request.getSaturatedFat()!=null ? request.getSaturatedFat() : mealItem.getSaturatedFat()); 
        mealItem.setProtein(request.getProtein()!=null ? request.getProtein() : mealItem.getProtein());

        return MealItemDto.MealItemResponse.from(mealItem);
    }

    // 식단 삭제
    @Transactional
    public void deleteMealItem(Long mealItemId, Long userId){
        MealItem mealItem = mealItemRepository.findById(mealItemId)
            .orElseThrow(() -> new ResourceNotFoundException("식단", mealItemId));

        mealItemRepository.delete(mealItem);
    }

    // 한끼 식단 검색
    public MealItemDto.MealItemResponse getMealItemInMeal(Long mealId){
        MealItem mealItem = mealItemRepository.findById(mealId)
            .orElseThrow(() -> new ResourceNotFoundException("식사", mealId));

        return MealItemDto.MealItemResponse.from(mealItem);
    }

    // 식단 검색(하나, 식단 수정 제공용)
    public MealItemDto.MealItemResponse getMealItem(Long mealItemId){
        MealItem mealItem = mealItemRepository.findById(mealItemId)
            .orElseThrow(() -> new ResourceNotFoundException("식단", mealItemId));

        return MealItemDto.MealItemResponse.from(mealItem);
    }

    // 하루치 영양소
    public List<Double> getMealTotalNut(Long userId, LocalDate date){
        List<Long> mealIds = mealItemRepository.findMealIdsByMealDateAndUser_UserId(date, userId);
        List<Double> totalNut = mealItemRepository.sumTotalDayNutrientByMealIds(mealIds);

        return totalNut;
    }

    // 한끼 영양소
    public List<Double> getMealTotalNutInItem(Long mealId){
        List<Double> totalNut = mealItemRepository.sumMealNutrientByMealId(mealId);

        return totalNut;
    }
    
}
