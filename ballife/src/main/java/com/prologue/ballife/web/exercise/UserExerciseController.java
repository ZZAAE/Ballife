package com.prologue.ballife.web.exercise;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.service.exercise.UserExerciseService;
import com.prologue.ballife.web.dto.exercise.UserExerciseDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 사용자 운동 기록(UserExercise) REST API 컨트롤러
// 기본 URL: /api/users/{userId}/exercises
// @Tag: Swagger UI 에서 API 그룹 이름으로 표시됨
@Tag(name = "UserExercise", description = "사용자 운동 기록 API")
// @RestController: @Controller + @ResponseBody 가 합쳐진 어노테이션
// 모든 메서드의 반환값이 JSON 으로 직렬화되어 HTTP 응답 바디에 담김
@RestController
// 이 컨트롤러의 모든 엔드포인트 URL 의 공통 접두사
@RequestMapping("/api/users/{userId}/exercises")
// final 필드를 생성자 주입으로 자동 처리 (DI)
@RequiredArgsConstructor
public class UserExerciseController {

    // 운동 기록 비즈니스 로직을 담당하는 서비스
    private final UserExerciseService userExerciseService;

    // ──────────────────────────────────────────────────
    // GET /api/users/{userId}/exercises?date=yyyy-MM-dd
    // 특정 날짜의 운동 기록 목록 조회
    // @RequestParam: 쿼리 파라미터(date)를 받아옴
    // @DateTimeFormat: 문자열 날짜를 LocalDate 로 자동 변환
    // ──────────────────────────────────────────────────
    @Operation(summary = "날짜별 운동 기록 조회", description = "특정 날짜의 운동 기록 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<UserExerciseDto.Response>> getUserExercisesByDate(
            @Parameter(description = "유저 ID") @PathVariable Long userId,
            @Parameter(description = "조회 날짜 (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // 서비스에서 조회한 결과를 200 OK 와 함께 반환
        return ResponseEntity.ok(userExerciseService.getUserExercisesByDate(userId, date));
    }

    // ──────────────────────────────────────────────────
    // POST /api/users/{userId}/exercises
    // 운동 기록 등록
    // @RequestBody: HTTP 요청 바디(JSON)를 CreateRequest DTO 로 역직렬화
    // @Valid: DTO 에 선언된 유효성 검사(@NotNull 등) 실행
    // ──────────────────────────────────────────────────
    @Operation(summary = "운동 기록 등록", description = "운동 기록을 등록합니다.")
    @PostMapping
    public ResponseEntity<UserExerciseDto.Response> createUserExercise(
            @Parameter(description = "유저 ID") @PathVariable Long userId,
            @Valid @RequestBody UserExerciseDto.CreateRequest request) {
        // 서비스에서 저장한 결과를 200 OK 와 함께 반환
        return ResponseEntity.ok(userExerciseService.createUserExercise(userId, request));
    }

    // ──────────────────────────────────────────────────
    // PUT /api/users/{userId}/exercises/{userExerciseId}
    // 운동 기록 수정
    // @PathVariable: URL 경로에서 userExerciseId 를 추출
    // @Valid: DTO 유효성 검사 실행
    // ──────────────────────────────────────────────────
    @Operation(summary = "운동 기록 수정", description = "운동 기록을 수정합니다.")
    @PutMapping("/{userExerciseId}")
    public ResponseEntity<UserExerciseDto.Response> updateUserExercise(
            @Parameter(description = "유저 ID") @PathVariable Long userId,
            @Parameter(description = "운동 기록 ID") @PathVariable Long userExerciseId,
            @Valid @RequestBody UserExerciseDto.UpdateRequest request) {
        // 서비스에서 수정한 결과를 200 OK 와 함께 반환
        return ResponseEntity.ok(userExerciseService.updateUserExercise(userExerciseId, request));
    }

    // ──────────────────────────────────────────────────
    // DELETE /api/users/{userId}/exercises/{userExerciseId}
    // 운동 기록 삭제
    // 삭제 성공 시 반환할 바디가 없으므로 204 No Content 반환
    // ──────────────────────────────────────────────────
    @Operation(summary = "운동 기록 삭제", description = "운동 기록을 삭제합니다.")
    @DeleteMapping("/{userExerciseId}")
    public ResponseEntity<Void> deleteUserExercise(
            @Parameter(description = "유저 ID") @PathVariable Long userId,
            @Parameter(description = "운동 기록 ID") @PathVariable Long userExerciseId) {
        userExerciseService.deleteUserExercise(userExerciseId);
        return ResponseEntity.noContent().build();
    }
}