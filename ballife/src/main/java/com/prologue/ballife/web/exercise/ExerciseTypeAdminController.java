package com.prologue.ballife.web.exercise;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.exercise.ExerciseTypeService;
import com.prologue.ballife.web.dto.exercise.ExerciseTypeDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 운동 종류(exercise_type) 관리자 CRUD API
// SecurityConfig 에서 /api/admin/** → ADMIN 권한으로 제한됨
@Tag(name = "ExerciseTypeAdmin", description = "운동 종류 관리자 API")
@RestController
@RequestMapping("/api/admin/exercise-types")
@RequiredArgsConstructor
public class ExerciseTypeAdminController {

    private final ExerciseTypeService exerciseTypeService;

    @Operation(summary = "운동 종류 목록 조회")
    @GetMapping
    public ResponseEntity<List<ExerciseTypeDto.Response>> findAll() {
        return ResponseEntity.ok(exerciseTypeService.findAll());
    }

    @Operation(summary = "운동 종류 단건 조회")
    @GetMapping("/{exerciseTypeId}")
    public ResponseEntity<ExerciseTypeDto.Response> findById(
            @Parameter(description = "운동 종류 ID (MongoDB ObjectId)") @PathVariable String exerciseTypeId) {
        return ResponseEntity.ok(exerciseTypeService.findById(exerciseTypeId));
    }

    @Operation(summary = "운동 종류 등록")
    @PostMapping
    public ResponseEntity<ExerciseTypeDto.Response> create(
            @Valid @RequestBody ExerciseTypeDto.CreateRequest request) {
        return ResponseEntity.ok(exerciseTypeService.create(request));
    }

    @Operation(summary = "운동 종류 수정")
    @PutMapping("/{exerciseTypeId}")
    public ResponseEntity<ExerciseTypeDto.Response> update(
            @Parameter(description = "운동 종류 ID") @PathVariable String exerciseTypeId,
            @Valid @RequestBody ExerciseTypeDto.UpdateRequest request) {
        return ResponseEntity.ok(exerciseTypeService.update(exerciseTypeId, request));
    }

    @Operation(summary = "운동 종류 삭제")
    @DeleteMapping("/{exerciseTypeId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "운동 종류 ID") @PathVariable String exerciseTypeId) {
        exerciseTypeService.delete(exerciseTypeId);
        return ResponseEntity.noContent().build();
    }
}
