package com.prologue.ballife.web.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.user.UserMedalService;
import com.prologue.ballife.web.dto.user.UserMedalDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "UserMedal", description = "유저 보유 메달 API")
@RestController
@RequestMapping("/api/users/medals")
@RequiredArgsConstructor
public class UserMedalController {

    private final UserMedalService userMedalService;

    @Operation(summary = "내 보유 메달 조회", description = "로그인한 유저의 보유 메달 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<UserMedalDto.Response>> getMyMedals(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userMedalService.getUserMedals(principal.getUserId()));
    }

    @Operation(summary = "메달 획득", description = "로그인한 유저가 메달을 획득합니다.")
    @PostMapping
    public ResponseEntity<UserMedalDto.Response> acquireMedal(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UserMedalDto.AcquireRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userMedalService.acquireMedal(principal.getUserId(), request));
    }

    @Operation(summary = "보유 메달 삭제", description = "로그인한 유저의 보유 메달을 삭제합니다.")
    @DeleteMapping("/{medalId}")
    public ResponseEntity<Void> removeUserMedal(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Parameter(description = "메달 ID") @PathVariable Long medalId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userMedalService.removeUserMedal(principal.getUserId(), medalId);
        return ResponseEntity.noContent().build();
    }
}
