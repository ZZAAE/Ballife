package com.prologue.ballife.service.exercise;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.exercise.ExerciseType;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.exerciseMongo.ExerciseTypeRepository;
import com.prologue.ballife.web.dto.exercise.ExerciseTypeDto;

import lombok.RequiredArgsConstructor;

// MongoDB exercise_type 컬렉션 CRUD 서비스 (관리자용)
@Service
@RequiredArgsConstructor
public class ExerciseTypeService {

    private final ExerciseTypeRepository exerciseTypeRepository;
    private final MessageResolver messages;

    public List<ExerciseTypeDto.Response> findAll() {
        return exerciseTypeRepository.findAll().stream()
                .map(ExerciseTypeDto.Response::from)
                .collect(Collectors.toList());
    }

    public ExerciseTypeDto.Response findById(String exerciseTypeId) {
        ExerciseType found = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeId)));
        return ExerciseTypeDto.Response.from(found);
    }

    public ExerciseTypeDto.Response create(ExerciseTypeDto.CreateRequest request) {
        exerciseTypeRepository.findByExerciseName(request.getExerciseName())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            messages.get("business.exerciseType.duplicateExerciseName", request.getExerciseName()));
                });

        ExerciseType saved = exerciseTypeRepository.save(ExerciseType.builder()
                .exerciseName(request.getExerciseName())
                .exerciseCategory(request.getExerciseCategory())
                .calorieUnit(request.getCalorieUnit())
                .caloriePerUnit(request.getCaloriePerUnit())
                .met(request.getMet())
                .build());

        return ExerciseTypeDto.Response.from(saved);
    }

    public ExerciseTypeDto.Response update(String exerciseTypeId, ExerciseTypeDto.UpdateRequest request) {
        ExerciseType found = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeId)));

        if (request.getExerciseName() != null) {
            found.setExerciseName(request.getExerciseName());
        }
        if (request.getExerciseCategory() != null) {
            found.setExerciseCategory(request.getExerciseCategory());
        }
        if (request.getCalorieUnit() != null) {
            found.setCalorieUnit(request.getCalorieUnit());
        }
        if (request.getCaloriePerUnit() != null) {
            found.setCaloriePerUnit(request.getCaloriePerUnit());
        }
        if (request.getMet() != null) {
            found.setMet(request.getMet());
        }

        return ExerciseTypeDto.Response.from(exerciseTypeRepository.save(found));
    }

    public void delete(String exerciseTypeId) {
        if (!exerciseTypeRepository.existsById(exerciseTypeId)) {
            throw new ResourceNotFoundException(
                    messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeId));
        }
        exerciseTypeRepository.deleteById(exerciseTypeId);
    }
}
