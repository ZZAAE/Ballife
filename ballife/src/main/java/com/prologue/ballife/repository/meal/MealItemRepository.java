package com.prologue.ballife.repository.meal;


import com.prologue.ballife.domain.meal.MealItem;
import com.prologue.ballife.domain.meal.Meal.MealCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealItemRepository extends JpaRepository<MealItem, Long> {
    
    Optional<MealItem> findByMealItemId(Long mealItemId);
    Optional<MealItem> findByMeal_MealId(Long mealId);
    
    // mealId 목록으로 MealItem 조회
    List<MealItem> findByMeal_MealIdIn(List<Long> mealIds); 
    
    // 일일 총 칼로리 계산 
    @Query("SELECT SUM(mi.calorie) FROM MealItem mi WHERE mi.meal.mealId IN :mealIds")
    Integer sumTotalCalorieByMealIds(@Param("mealIds") List<Long> mealIds);

    // 특정 날짜와 사용자 ID로 mealId 추출
    @Query("SELECT m.mealId FROM Meal m WHERE DATE(m.mealDate) = :mealDate AND m.user.userId = :userId")
    List<Long> findMealIdsByMealDateAndUser_UserId(
        @Param("mealDate") LocalDate mealDate, 
        @Param("userId") Long userId
    );

    // 식사 시간까지 포함하여 mealId 추출
    @Query("SELECT m.mealId FROM Meal m WHERE DATE(m.mealDate) = :mealDate " +
           "AND m.user.userId = :userId AND m.mealCategory = :mealCategory")
    List<Long> findMealIdsByDateAndType(
        @Param("mealDate") LocalDate mealDate, 
        @Param("userId") Long userId,
        @Param("mealCategory") MealCategory mealCategory
    );

    // 전체 영양성분 하루 총합
    @Query("SELECT SUM(mi.calorie), SUM(mi.carbohydrate), SUM(mi.sugar), SUM(mi.sodium), SUM(mi.cholesterol), SUM(mi.saturatedFat), SUM(mi.protein) FROM MealItem mi WHERE mi.meal.mealId IN :mealIds ") 
    List<Double> sumTotalDayNutrientByMealIds(@Param("mealIds") List<Long> mealIds);

    // 한끼 전체 영상성분 
    @Query("SELECT SUM(mi.calorie), SUM(mi.carbohydrate), SUM(mi.sugar), SUM(mi.sodium), SUM(mi.cholesterol), SUM(mi.saturatedFat), SUM(mi.protein) FROM MealItem mi WHERE mi.meal.mealId  IN :mealId ")
    List<Double> sumMealNutrientByMealId(@Param("mealId") Long mealId);

}