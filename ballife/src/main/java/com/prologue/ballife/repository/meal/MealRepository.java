package com.prologue.ballife.repository.meal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prologue.ballife.domain.meal.Meal;

public interface MealRepository extends JpaRepository<Meal, Long> {

    Optional<Meal> findByIdAndUserId(Long mealId, Long userId);

    // 전체 식사 데이터 조회
    List<Meal> findByUser_UserId(Long userId);

    // 특정 날짜의 식사 데이터를 조회하는 메서드 (섭취 식단 확인)
    List<Meal> findByMealDateAndUser_UserId(LocalDate mealDate, Long userId);

    // 특정 날짜의 모든 MealId를 리스트로 반환(MealItem 서비스 제공용)
    @Query("select m.mealId from Meal m where m.mealDate = :mealDate and m.user.userId = :userId")
    List<Long> findMealIdsByMealDateAndUser_UserId(LocalDate mealDate, Long userId);

    // 혹시몰라서만든 카테고리(아점저간식)로 검색하는 메서드
    List<Meal> findByMealDateAndMealCategoryAndUser_UserId(LocalDate mealDate, Meal.MealCategory mealCategory, Long userId);
    List<Meal> findByMealCategoryAndUser_UserId(Meal.MealCategory mealCategory, Long userId);

    // 특정 날짜에 식사 데이터가 존재하는지 확인(캘린더용)
    boolean existsByMealDateAndUser_UserId(LocalDate mealDate, Long userId);

    // 특정 월의 식사 기록이 있는 날짜 목록 반환 (캘린더용)
    @Query("select distinct m.mealDate from Meal m where m.user.userId = :userId and year(m.mealDate) = :year and month(m.mealDate) = :month")
    List<LocalDate> findExistingDatesByYearMonthAndUser_UserId(@Param("year") int year, @Param("month") int month, @Param("userId") Long userId);
    
}
