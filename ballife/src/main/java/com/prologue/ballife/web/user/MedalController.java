package com.prologue.ballife.web.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.user.MedalService;
import com.prologue.ballife.web.dto.user.MedalDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Medal", description = "메달 API")
@RestController
@RequestMapping("/api/medals")
@RequiredArgsConstructor
public class MedalController {

    private final MedalService medalService;

    @Operation(summary = "메달 전체 조회", description = "등록된 메달 목록을 가격순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<List<MedalDto.Response>> getAllMedals() {
        return ResponseEntity.ok(medalService.getAllMedals());
    }

    @Operation(summary = "메달 단건 조회", description = "메달 ID로 메달 정보를 조회합니다.")
    @GetMapping("/{medalId}")
    public ResponseEntity<MedalDto.Response> getMedal(
            @Parameter(description = "메달 ID") @PathVariable Long medalId) {
        return ResponseEntity.ok(medalService.getMedal(medalId));
    }

    @Operation(summary = "메달 생성 (관리자)", description = "새 메달을 등록합니다.")
    @PostMapping
    public ResponseEntity<MedalDto.Response> createMedal(
            @Valid @RequestBody MedalDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medalService.createMedal(request));
    }

    @Operation(summary = "메달 삭제 (관리자)", description = "메달을 삭제합니다.")
    @DeleteMapping("/{medalId}")
    public ResponseEntity<Void> deleteMedal(
            @Parameter(description = "메달 ID") @PathVariable Long medalId) {
        medalService.deleteMedal(medalId);
        return ResponseEntity.noContent().build();
    }
}
