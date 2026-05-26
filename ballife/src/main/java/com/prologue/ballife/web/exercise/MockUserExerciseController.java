package com.prologue.ballife.web.exercise;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.web.dto.exercise.UserExerciseDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "MockUserExercise", description = "DB 없이 운동 기록 요청/응답을 확인하는 임시 API")
@RestController
@RequestMapping("/api/mock/users/{userId}/exercises")
public class MockUserExerciseController {

    private final AtomicLong sequence = new AtomicLong(1L);
    private final Map<Long, List<MemoryExerciseRecord>> store = new ConcurrentHashMap<>();

    @Operation(summary = "날짜별 운동 기록 조회(Mock)")
    @GetMapping
    public ResponseEntity<List<UserExerciseDto.Response>> getUserExercisesByDate(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<UserExerciseDto.Response> responses = store
                .getOrDefault(userId, List.of())
                .stream()
                .filter(record -> record.exerciseDate().equals(date))
                .sorted(Comparator.comparing(MemoryExerciseRecord::exerciseTime,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "운동 기록 등록(Mock)")
    @PostMapping
    public ResponseEntity<UserExerciseDto.Response> createUserExercise(
            @PathVariable Long userId,
            @Valid @RequestBody UserExerciseDto.CreateRequest request) {

        MemoryExerciseRecord saved = new MemoryExerciseRecord(
                sequence.getAndIncrement(),
                userId,
                request.getExerciseTypeId(),
                request.getExerciseDate(),
                request.getExerciseTime(),
                calculateMockCalorie(request));

        store.computeIfAbsent(userId, ignored -> new ArrayList<>()).add(saved);
        return ResponseEntity.ok(toResponse(saved));
    }

    @Operation(summary = "운동 기록 수정(Mock)")
    @PutMapping("/{userExerciseId}")
    public ResponseEntity<UserExerciseDto.Response> updateUserExercise(
            @PathVariable Long userId,
            @PathVariable Long userExerciseId,
            @Valid @RequestBody UserExerciseDto.UpdateRequest request) {

        List<MemoryExerciseRecord> userRecords = store.getOrDefault(userId, List.of());
        for (int index = 0; index < userRecords.size(); index++) {
            MemoryExerciseRecord current = userRecords.get(index);
            if (!current.userExerciseId().equals(userExerciseId)) {
                continue;
            }

            MemoryExerciseRecord updated = new MemoryExerciseRecord(
                    current.userExerciseId(),
                    current.userId(),
                    request.getExerciseTypeId(),
                    request.getExerciseDate(),
                    current.exerciseTime(),
                    request.getBurnedCalorie());

            userRecords.set(index, updated);
            return ResponseEntity.ok(toResponse(updated));
        }

        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "운동 기록 삭제(Mock)")
    @DeleteMapping("/{userExerciseId}")
    public ResponseEntity<Void> deleteUserExercise(
            @PathVariable Long userId,
            @PathVariable Long userExerciseId) {

        List<MemoryExerciseRecord> userRecords = store.get(userId);
        if (userRecords == null) {
            return ResponseEntity.notFound().build();
        }

        boolean removed = userRecords.removeIf(record -> record.userExerciseId().equals(userExerciseId));
        if (!removed) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    private UserExerciseDto.Response toResponse(MemoryExerciseRecord record) {
        return UserExerciseDto.Response.builder()
                .userExerciseId(record.userExerciseId())
                .exerciseTypeId(record.exerciseTypeId())
                .exerciseDate(record.exerciseDate())
                .exerciseTime(record.exerciseTime())
                .burnedCalorie(record.burnedCalorie())
                .build();
    }

    private int calculateMockCalorie(UserExerciseDto.CreateRequest request) {
        if (request.getExerciseMin() != null) {
            return request.getExerciseMin() * 8;
        }

        int setCount = request.getExerciseSet() != null ? request.getExerciseSet() : 0;
        int reps = request.getExerciseReps() != null ? request.getExerciseReps() : 0;
        return setCount * reps;
    }

    private record MemoryExerciseRecord(
            Long userExerciseId,
            Long userId,
            String exerciseTypeId,
            LocalDate exerciseDate,
            LocalTime exerciseTime,
            Integer burnedCalorie) {
    }
}