package com.prologue.ballife.web.user;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.service.user.UserService;
import com.prologue.ballife.web.dto.user.UserDto;

@Tag(name = "User", description = "유저 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor 
public class UserController {

    private final UserService userService;
    
    // 유저 정보 조회 
    @Operation(summary = "유저 정보 조회", description = "유저 정보를 조회합니다.")
    @GetMapping("/{userId}") 
    public ResponseEntity<UserDto.UserResponse> getMember(
        @Parameter(description = "유저 ID") @PathVariable Long userId ) {
        UserDto.UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(response);
    }

    // 유저 정보 수정 
    @Operation(summary = "유저 정보 수정", description = "유저 정보를 수정합니다.")
    @PutMapping("/{userId}") 
    public ResponseEntity<UserDto.UserResponse> updateUser(
        @Parameter(description = "유저 ID") @PathVariable Long userId,
        @Valid @RequestBody UserDto.UpdateRequest request) {
        UserDto.UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    //유저 질병 정보만 수정
    @Operation(summary = "질병 정보 수정", description = "유저 질병 정보를 수정합니다.")
    @PutMapping("disease/{userId}")
    public ResponseEntity<UserDto.UserResponse> updateUserDisease(
        @Parameter(description = "유저 ID") @PathVariable Long userId,
        @Valid @RequestBody UserDto.UpdateRequest request) {
        UserDto.UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    // 리워드 포인트 적립 (보유 포인트와 누적 포인트가 동일하게 증가)
    @Operation(summary = "리워드 포인트 적립", description = "유저에게 리워드 포인트를 적립합니다. 보유 포인트(point)와 누적 포인트(usePointCount)가 같은 양만큼 증가합니다.")
    @PostMapping("/{userId}/points")
    public ResponseEntity<UserDto.UserResponse> addPoint(
        @Parameter(description = "유저 ID") @PathVariable Long userId,
        @Parameter(description = "적립 포인트") @RequestParam int amount) {
        UserDto.UserResponse response = userService.addPoint(userId, amount);
        return ResponseEntity.ok(response);
    }

    // 리워드 포인트 감소 (보유 포인트만 차감, 누적 포인트는 변경 없음)
    @Operation(summary = "리워드 포인트 차감", description = "유저의 보유 포인트(point)를 차감합니다. 누적 포인트(usePointCount)는 변경되지 않습니다.")
    @PostMapping("/{userId}/points/deduct")
    public ResponseEntity<UserDto.UserResponse> deductPoint(
        @Parameter(description = "유저 ID") @PathVariable Long userId,
        @Parameter(description = "차감 포인트") @RequestParam int amount) {
        UserDto.UserResponse response = userService.deductPoint(userId, amount);
        return ResponseEntity.ok(response);
    }

    // 유저 삭제
    @Operation(summary = "유저 삭제", description = "회원을 삭제합니다.")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteMember( 
        @Parameter(description = "회원 ID") @PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build(); 
    }

    
}