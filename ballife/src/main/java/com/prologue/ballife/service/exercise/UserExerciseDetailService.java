package com.prologue.ballife.service.exercise;

import org.springframework.stereotype.Service;

import com.prologue.ballife.domain.exercise.UserExerciseDetail;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.exerciseMongo.UserExerciseDetailRepository;
import com.prologue.ballife.web.dto.exercise.UserExerciseDetailDto;

import lombok.RequiredArgsConstructor;

// MongoDB user_exercise_detail 컬렉션 전담 서비스
// UserExercise(MySQL) PK 를 외래키처럼 사용해 1:1 로 관리한다.
@Service
@RequiredArgsConstructor
public class UserExerciseDetailService {

    private final UserExerciseDetailRepository userExerciseDetailRepository;

    // 운동 기록 생성 시 함께 호출되어 상세 정보를 MongoDB 에 저장
    public UserExerciseDetail create(Long userExerciseId, UserExerciseDetailDto.CreateRequest request) {
        UserExerciseDetail detail = UserExerciseDetail.builder()
                .userExerciseId(userExerciseId)
                .exerciseMin(request.getExerciseMin())
                .exerciseSet(request.getExerciseSet())
                .exerciseReps(request.getExerciseReps())
                .exerciseWeight(request.getExerciseWeight())
                .exerciseHard(request.getExerciseHard())
                .build();
        return userExerciseDetailRepository.save(detail);
    }

    public UserExerciseDetailDto.Response findByUserExerciseId(Long userExerciseId) {
        UserExerciseDetail detail = userExerciseDetailRepository.findFirstByUserExerciseId(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("운동 상세 기록", userExerciseId));
        return UserExerciseDetailDto.Response.from(detail);
    }

    // null 이 아닌 필드만 부분 갱신 (PATCH 의미)
    public UserExerciseDetailDto.Response update(Long userExerciseId, UserExerciseDetailDto.UpdateRequest request) {
        UserExerciseDetail detail = userExerciseDetailRepository.findFirstByUserExerciseId(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("운동 상세 기록", userExerciseId));

        if (request.getExerciseMin() != null) {
            detail.setExerciseMin(request.getExerciseMin());
        }
        if (request.getExerciseSet() != null) {
            detail.setExerciseSet(request.getExerciseSet());
        }
        if (request.getExerciseReps() != null) {
            detail.setExerciseReps(request.getExerciseReps());
        }
        if (request.getExerciseWeight() != null) {
            detail.setExerciseWeight(request.getExerciseWeight());
        }
        if (request.getExerciseHard() != null) {
            detail.setExerciseHard(request.getExerciseHard());
        }

        return UserExerciseDetailDto.Response.from(userExerciseDetailRepository.save(detail));
    }

    public void deleteByUserExerciseId(Long userExerciseId) {
        userExerciseDetailRepository.deleteByUserExerciseId(userExerciseId);
    }
}
