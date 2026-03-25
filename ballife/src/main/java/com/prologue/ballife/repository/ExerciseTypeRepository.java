package com.prologue.ballife.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.Exercise.ExerciseType;

public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, Long>{

    Optional<ExerciseType> findByExerciseName(String exerciseName);

    
ExerciseTypeRepository {
    
}
}