package com.prologue.ballife.repository.exercise;

import com.prologue.ballife.domain.Exercise.UserExerciseDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserExerciseDetailRepository extends MongoRepository<UserExerciseDetail, String> {

    // MySQL UserExercise PK 로 상세 기록 목록 조회
    List<UserExerciseDetail> findByUserExerciseId(Long userExerciseId);
}
