package com.prologue.ballife.web.exercise;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.exercise.ExerciseTypeService;
import com.prologue.ballife.web.dto.exercise.ExerciseTypeDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// 공개 운동 종류 조회 API (인증 불필요)
@Tag(name = "ExerciseType", description = "운동 종류 조회 API")
@RestController
@RequestMapping("/api/exercise-types")
@RequiredArgsConstructor
public class ExerciseTypeController {

    private final ExerciseTypeService exerciseTypeService;

    @Operation(summary = "모든 운동 종류 조회", description = "MET 값을 포함한 모든 운동 종류를 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ExerciseTypeDto.Response>> findAll() {
        return ResponseEntity.ok(exerciseTypeService.findAll());
    }
}
