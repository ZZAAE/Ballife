package com.prologue.ballife.repository.exercise;

import com.prologue.ballife.domain.exercise.ExerciseType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseTypeRepository extends MongoRepository<ExerciseType, String> {
}
