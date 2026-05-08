package com.prologue.ballife.service.exercise;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.exercise.ExerciseType;
import com.prologue.ballife.domain.exercise.UserExercise;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.exercise.ExerciseTypeRepository;
import com.prologue.ballife.repository.exercise.UserExerciseRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.exercise.UserExerciseDto;

import lombok.RequiredArgsConstructor;

// 사용자 운동 기록(UserExercise)에 대한 비즈니스 로직을 처리하는 서비스 클래스
// MySQL(JPA) + MongoDB 를 함께 사용하는 하이브리드 구조
// 클래스 레벨에 @Transactional(readOnly = true) 를 걸어두고,
// 데이터를 변경하는 메서드에만 @Transactional 을 별도로 붙임
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserExerciseService {

    // 사용자 운동 기록 레포지토리 (MySQL / JPA)
    private final UserExerciseRepository userExerciseRepository;
    // 사용자 레포지토리 (MySQL / JPA)
    private final UserRepository userRepository;
    // 운동 종류 레포지토리 (MongoDB)
    private final ExerciseTypeRepository exerciseTypeRepository;

    // ──────────────────────────────────────────────────
    // 날짜별 운동 기록 조회
    // 흐름: userId + date 로 해당 날짜에 등록된 운동 기록 전체를 조회 → DTO 리스트로 변환해 반환
    // ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<UserExerciseDto.Response> getUserExercisesByDate(Long userId, LocalDate date) {
        return userExerciseRepository
                // userId 와 exerciseDate 가 일치하고 삭제되지 않은 레코드 조회
                .findByUser_UserIdAndExerciseDateAndIsDeletedFalse(userId, date)
                .stream()
                // 각 엔티티를 Response DTO 로 변환
                .map(UserExerciseDto.Response::from)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────
    // 운동 기록 등록
    // 흐름: 유저 조회 → 운동 종류 조회 → 칼로리 계산 → 엔티티 생성 → MySQL 저장
    // ──────────────────────────────────────────────────
    @Transactional
    public UserExerciseDto.Response createUserExercise(Long userId, UserExerciseDto.CreateRequest request) {

        // 유저 조회 (없으면 ResourceNotFoundException 발생)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("유저", userId));

        // 운동 종류 조회 (ExerciseType 은 MongoDB 에 저장되어 있음)
        ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("운동 종류", request.getExerciseTypeId()));

        // 칼로리 계산 (유산소: 분 × 단위칼로리 / 무산소: 세트 × 반복 × 단위칼로리)
        int burnedCalorie = calculateCalorie(exerciseType, request);

        // UserExercise 엔티티 생성
        // exerciseTypeId 는 MongoDB ObjectId 를 String 으로 변환해 MySQL 에 저장 (FK 제약 없음)
        UserExercise userExercise = UserExercise.builder()
                .user(user)
                .exerciseTypeId(exerciseType.getExerciseTypeId())
                .exerciseDate(request.getExerciseDate())
                .exerciseTime(request.getExerciseTime())
                .burnedCalorie(burnedCalorie)
                .build();

        // MySQL 에 저장 후 저장된 엔티티를 Response DTO 로 변환해 반환
        return UserExerciseDto.Response.from(userExerciseRepository.save(userExercise));
    }

    // ──────────────────────────────────────────────────
    // 운동 기록 수정
    // 흐름: 기존 기록 조회 → 운동 종류 재조회 → 칼로리 재계산 → 필드 업데이트 → 저장
    // UpdateRequest 에는 exerciseTypeId, exerciseDate, burnedCalorie 가 포함됨
    // ──────────────────────────────────────────────────
    @Transactional
    public UserExerciseDto.Response updateUserExercise(Long userExerciseId, UserExerciseDto.UpdateRequest request) {

        // 수정 대상 운동 기록 조회 (없으면 ResourceNotFoundException 발생)
        UserExercise userExercise = userExerciseRepository.findById(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("운동 기록", userExerciseId));

        // 변경할 운동 종류 조회 (MongoDB)
        ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("운동 종류", request.getExerciseTypeId()));

        // UpdateRequest 에 burnedCalorie 가 직접 입력된 경우 그 값을 사용하고,
        // 없으면 exerciseType 의 단위칼로리 기준으로 재계산 (분당 단위는 기존 exerciseTime 기준)
        int burnedCalorie = request.getBurnedCalorie() != null
                ? request.getBurnedCalorie()
                : (exerciseType.getCaloriePerUnit() != null ? exerciseType.getCaloriePerUnit() : 0);

        // 엔티티 필드 업데이트 (JPA 더티 체킹으로 트랜잭션 종료 시 자동 UPDATE 쿼리 실행)
        userExercise.setExerciseTypeId(exerciseType.getExerciseTypeId());
        userExercise.setExerciseDate(request.getExerciseDate());
        userExercise.setBurnedCalorie(burnedCalorie);

        // 변경된 엔티티를 Response DTO 로 변환해 반환
        return UserExerciseDto.Response.from(userExercise);
    }

    // ──────────────────────────────────────────────────
    // 운동 기록 삭제
    // 흐름: 존재 여부 확인 → 없으면 예외 → 있으면 삭제
    // ──────────────────────────────────────────────────
    @Transactional
    public void deleteUserExercise(Long userExerciseId) {

        // 삭제 대상 운동 기록 조회 (없으면 ResourceNotFoundException 발생)
        UserExercise userExercise = userExerciseRepository.findById(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("운동 기록", userExerciseId));

        // 소프트 삭제 (실제 DB 에서 싹제지 않고 isDeleted = true 로 변경)
        userExercise.softDelete();
    }

    // 도움 받음
    // ──────────────────────────────────────────────────
    // 칼로리 계산 (private 헬퍼 메서드)
    // 유산소(분당): exerciseMin × caloriePerUnit
    // 무산소(회당): exerciseSet × exerciseReps × caloriePerUnit
    // exerciseType.getCalorieUnit() 값으로 유산소/무산소 구분
    // ──────────────────────────────────────────────────
    private int calculateCalorie(ExerciseType exerciseType, UserExerciseDto.CreateRequest request) {
        // 단위 칼로리 (null 이면 0 으로 처리)
        int perUnit = exerciseType.getCaloriePerUnit() != null ? exerciseType.getCaloriePerUnit() : 0;

        if ("분당".equals(exerciseType.getCalorieUnit())) {
            // 유산소: 운동 시간(분) × 분당 칼로리
            int min = request.getExerciseMin() != null ? request.getExerciseMin() : 0;
            return min * perUnit;
        } else {
            // 무산소: 세트 수 × 반복 수 × 회당 칼로리
            int set = request.getExerciseSet() != null ? request.getExerciseSet() : 0;
            int reps = request.getExerciseReps() != null ? request.getExerciseReps() : 0;
            return set * reps * perUnit;
        }
    }
}