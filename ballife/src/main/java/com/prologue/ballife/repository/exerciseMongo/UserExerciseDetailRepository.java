package com.prologue.ballife.repository.exerciseMongo;

import com.prologue.ballife.domain.exercise.UserExerciseDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// MongoDB user_exercise_detail 컬렉션 리포지토리
// 외래키는 MySQL UserExercise 의 PK(Long userExerciseId)를 그대로 참조한다.
@Repository
public interface UserExerciseDetailRepository extends MongoRepository<UserExerciseDetail, String> {

    // MySQL UserExercise PK 로 상세 기록 단건 조회 (1:1 가정)
    Optional<UserExerciseDetail> findFirstByUserExerciseId(Long userExerciseId);

    // 운동 기록 1건당 상세가 여러 개 들어오는 케이스 대비 (현재는 미사용이나 안전망)
    List<UserExerciseDetail> findByUserExerciseId(Long userExerciseId);

    // 여러 운동 기록 ID 에 대한 상세를 한 번에 조회 (목록 페이지 N+1 방지)
    List<UserExerciseDetail> findByUserExerciseIdIn(List<Long> userExerciseIds);

    void deleteByUserExerciseId(Long userExerciseId);
}
