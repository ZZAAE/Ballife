package com.prologue.ballife.web.subscription;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.subscription.FamilyService;
import com.prologue.ballife.web.dto.subscription.FamilyDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Family", description = "가족 그룹 API")
@RestController
@RequestMapping("/api/family")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @Operation(summary = "내 가족 상태 조회")
    @GetMapping("/me")
    public ResponseEntity<FamilyDto.MyFamilyResponse> getMyFamily(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.getMyFamily(principal.getUserId()));
    }

    @Operation(summary = "가족 그룹 생성/조회 (FAMILY 오너)")
    @PostMapping("/group")
    public ResponseEntity<FamilyDto.MyFamilyResponse> createGroup(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.createGroup(principal.getUserId()));
    }

    @Operation(summary = "초대 코드 재발급 (오너)")
    @PostMapping("/group/invite-code/rotate")
    public ResponseEntity<FamilyDto.InviteCodeResponse> rotateInviteCode(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String code = familyService.rotateInviteCode(principal.getUserId());
        return ResponseEntity.ok(FamilyDto.InviteCodeResponse.builder().inviteCode(code).build());
    }

    @Operation(summary = "초대 코드로 가족 합류")
    @PostMapping("/join")
    public ResponseEntity<FamilyDto.MyFamilyResponse> join(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody FamilyDto.JoinRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.join(principal.getUserId(), request.getInviteCode()));
    }

    @Operation(summary = "가족 구성원 목록 (동의 기반 공유 데이터 포함)")
    @GetMapping("/members")
    public ResponseEntity<List<FamilyDto.MemberCardResponse>> getMembers(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.getMembers(principal.getUserId()));
    }

    @Operation(summary = "특정 가족 구성원 건강 상세")
    @GetMapping("/members/{targetUserId}/health")
    public ResponseEntity<FamilyDto.MemberHealthResponse> getMemberHealth(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long targetUserId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.getMemberHealth(principal.getUserId(), targetUserId));
    }

    @Operation(summary = "내 공유 동의 갱신")
    @PutMapping("/me/consent")
    public ResponseEntity<FamilyDto.MyFamilyResponse> updateConsent(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody FamilyDto.ConsentUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(familyService.updateConsent(principal.getUserId(), request));
    }

    @Operation(summary = "가족 그룹 나가기 (구성원)")
    @DeleteMapping("/me")
    public ResponseEntity<Void> leave(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        familyService.leave(principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "가족 구성원 추방 (오너)")
    @DeleteMapping("/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long targetUserId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        familyService.removeMember(principal.getUserId(), targetUserId);
        return ResponseEntity.noContent().build();
    }
}
