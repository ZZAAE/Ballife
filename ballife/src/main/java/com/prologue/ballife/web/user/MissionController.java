package com.prologue.ballife.web.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.domain.user.MissionType;
import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.user.MissionService;
import com.prologue.ballife.web.dto.user.MissionDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Mission", description = "미션 API")
@RestController
@RequestMapping("/api/users/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @Operation(summary = "내 미션 현황 조회", description = "로그인한 유저의 미션 목록, 수령 가능 여부, 보유 포인트를 조회합니다.")
    @GetMapping
    public ResponseEntity<MissionDto.Overview> getMissions(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(missionService.getOverview(principal.getUserId()));
    }

    @Operation(summary = "미션 보상 수령", description = "미션 코드에 해당하는 보상을 수령하고 포인트를 지급합니다.")
    @PostMapping("/{code}/claim")
    public ResponseEntity<MissionDto.ClaimResult> claim(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Parameter(description = "미션 코드 (예: DAILY_RECORD)") @PathVariable String code) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MissionType type;
        try {
            type = MissionType.valueOf(code);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(missionService.claim(principal.getUserId(), type));
    }
}
