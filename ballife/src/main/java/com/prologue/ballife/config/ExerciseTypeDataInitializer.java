package com.prologue.ballife.config;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.prologue.ballife.domain.exercise.ExerciseType;
import com.prologue.ballife.repository.exerciseMongo.ExerciseTypeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ExerciseTypeDataInitializer implements ApplicationRunner {

    private final ExerciseTypeRepository exerciseTypeRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (exerciseTypeRepository.count() > 0) {
            return;
        }

        // 유산소/무산소 모두 MET × 체중(kg) × 운동시간(h) 공식으로 통일
        // (caloriePerUnit 은 더 이상 칼로리 계산에 사용되지 않지만 메타로 유지)
        List<ExerciseType> seeds = List.of(
                ExerciseType.builder().exerciseName("사이클").exerciseCategory("유산소").calorieUnit("분당")
                        .caloriePerUnit(0).met(6.8).build(),
                ExerciseType.builder().exerciseName("러닝").exerciseCategory("유산소").calorieUnit("분당")
                        .caloriePerUnit(0).met(9.8).build(),
                ExerciseType.builder().exerciseName("줄넘기").exerciseCategory("유산소").calorieUnit("분당")
                        .caloriePerUnit(0).met(12.3).build(),
                ExerciseType.builder().exerciseName("걷기").exerciseCategory("유산소").calorieUnit("분당")
                        .caloriePerUnit(0).met(3.5).build(),
                ExerciseType.builder().exerciseName("천국의 계단").exerciseCategory("유산소").calorieUnit("분당")
                        .caloriePerUnit(0).met(8.8).build(),
                ExerciseType.builder().exerciseName("벤치프레스").exerciseCategory("무산소").calorieUnit("회당")
                        .caloriePerUnit(0).met(6.0).build(),
                ExerciseType.builder().exerciseName("스쿼트").exerciseCategory("무산소").calorieUnit("회당")
                        .caloriePerUnit(0).met(6.0).build(),
                ExerciseType.builder().exerciseName("데드리프트").exerciseCategory("무산소").calorieUnit("회당")
                        .caloriePerUnit(0).met(6.0).build(),
                ExerciseType.builder().exerciseName("숄더프레스").exerciseCategory("무산소").calorieUnit("회당")
                        .caloriePerUnit(0).met(6.0).build(),
                ExerciseType.builder().exerciseName("바벨로우").exerciseCategory("무산소").calorieUnit("회당")
                        .caloriePerUnit(0).met(6.0).build());

        exerciseTypeRepository.saveAll(seeds);
    }
}
