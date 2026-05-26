package com.prologue.ballife.repository.exerciseMongo;

import com.prologue.ballife.domain.exercise.ExerciseType;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseTypeRepository extends MongoRepository<ExerciseType, String> {
    Optional<ExerciseType> findByExerciseName(String exerciseName);
}
