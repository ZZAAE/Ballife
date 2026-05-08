package com.prologue.ballife.service.meal;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.prologue.ballife.domain.meal.Meal;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.meal.MealRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.meal.MealDto;

@Service
@RequiredArgsConstructor // 의존성 주입 DI ->멤버변수를 생성자 자동 주입
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class MealService {

    private final MealRepository mealRepository;
    private final UserRepository userRepository;

    // 식사 작성 (피그마 상 식사 등록 버튼 누르자마자 생성 이후 식단 등록에서 취소 누르면 바로 삭제)
    @Transactional
    public MealDto.MealResponse createMeal(Long USER_ID, MealDto.MealSaveRequest request){
        User user = userRepository.findById(USER_ID)
            .orElseThrow(() -> new ResourceNotFoundException("회원", USER_ID));

        Meal meal = Meal.builder()
            .user(user)
            .mealDate(request.getMealDate())
            .mealTime(request.getMealTime())
            .mealCategory(request.getMealCategory())
            .mealPhoto(request.getMealPhoto())
            .build();

            return MealDto.MealResponse.from(mealRepository.save(meal));
    }

    // 식사 수정
    @Transactional
    public MealDto.MealResponse updateMeal(Long mealId, long userId, MealDto.MealUpdateRequest request){
        Meal meal = mealRepository.findById(mealId)
            .orElseThrow(() -> new ResourceNotFoundException("식사", mealId));

        if(!meal.getUser().getUserId().equals(userId)){
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "본인 식사만 수정할 수 있습니다.");
        }

        meal.setMealDate(request.getMealDate());
        meal.setMealTime(request.getMealTime());
        meal.setMealCategory(request.getMealCategory());
        meal.setMealPhoto(request.getMealPhoto());

        return MealDto.MealResponse.from(meal);
    }

    // 식사 삭제
    @Transactional
    public void deleteMeal(Long mealId, Long userId){
        Meal meal = mealRepository.findById(mealId)
            .orElseThrow(() -> new ResourceNotFoundException("식사", mealId));

        if(!meal.getUser().getUserId().equals(userId)){
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "본인 식사만 삭제할 수 있습니다.");
        }

        mealRepository.delete(meal);
    }

    // 식사 검색(하나)
    public MealDto.MealResponse getMeal(Long mealId, Long userId){
        Meal meal = mealRepository.findByIdAndUserId(mealId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("식사", mealId));

        return MealDto.MealResponse.from(meal);
    }

    // 식사 검색(전체)
    public List<MealDto.MealResponse> getAllMeal(Long userId){
        List<Meal> meal = mealRepository.findByUser_UserId(userId);

        return meal.stream()
            .map(MealDto.MealResponse::from)
            .collect(Collectors.toList());
    }

    // 식사 검색(오늘)
    public List<MealDto.MealResponse> getMealOfToday(LocalDate mealdate, Long userId){
        List<Meal> meal = mealRepository.findByMealDateAndUser_UserId(mealdate, userId);

        return meal.stream()
            .map(MealDto.MealResponse::from)
            .collect(Collectors.toList());
    }

    // 캘린더용 (날짜 리스트로 반환)
    // public List<LocalDate> getMealForCalander(int year, int month, Long userId){
    //     List<LocalDate> meal = mealRepository.findExistingDatesByYearMonthAndUser_UserId(year, month, userId);

    //     return meal;
    // }

    // 캘린더용 (TRUE, FALSE)
    public boolean getMealForCalender(LocalDate mealDate, Long userId){
        boolean cal = mealRepository.existsByMealDateAndUser_UserId(mealDate, userId);

        return cal;
    }
    
}
