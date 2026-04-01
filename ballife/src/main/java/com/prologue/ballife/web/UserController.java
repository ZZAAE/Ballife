package com.prologue.ballife.web;


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

    // 유저 삭제 
    @Operation(summary = "유저 삭제", description = "회원을 삭제합니다.")
    @DeleteMapping("/{userId}") 
    public ResponseEntity<Void> deleteMember( 
        @Parameter(description = "회원 ID") @PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build(); 
    }
}