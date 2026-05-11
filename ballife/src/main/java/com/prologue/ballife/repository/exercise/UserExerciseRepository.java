package com.prologue.ballife.repository.exercise;

import com.prologue.ballife.domain.exercise.UserExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserExerciseRepository extends JpaRepository<UserExercise, Long> {

        // 유저 조회 (삭제되지 않은 것만)
        List<UserExercise> findByUser_UserIdAndIsDeletedFalse(Long userId);

        // 특정 날짜 조회 (삭제되지 않은 것만)
        List<UserExercise> findByUser_UserIdAndExerciseDateAndIsDeletedFalse(Long userId, LocalDate exerciseDate);

        // 날짜 범위 조회 (삭제되지 않은 것만)
        List<UserExercise> findByUser_UserIdAndExerciseDateBetweenAndIsDeletedFalse(
                        Long userId, LocalDate start, LocalDate end);

        // 운동 종류 조회 (삭제되지 않은 것만)
        List<UserExercise> findByUser_UserIdAndExerciseTypeIdAndIsDeletedFalse(Long userId, String exerciseTypeId);

        // 날짜 내림차순 조회 (삭제되지 않은 것만)
        @Query("SELECT u FROM UserExercise u WHERE u.user.userId = :userId AND u.isDeleted = false ORDER BY u.exerciseDate DESC")
        List<UserExercise> findAllByUserIdOrderByDateDesc(@Param("userId") Long userId);

        // 날짜별 소모칼로리 합산
        @Query("SELECT SUM(u.burnedCalorie) FROM UserExercise u " +
                        "WHERE u.user.userId = :userId " +
                        "AND u.exerciseDate BETWEEN :start AND :end")
        Integer sumBurnedCalorieByUserIdAndDate(
                        @Param("userId") Long userId,
                        @Param("start") LocalDate start,
                        @Param("end") LocalDate end);
}