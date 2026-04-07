package com.prologue.ballife.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.service.user.UserService;
import com.prologue.ballife.web.dto.user.UserDto;

import java.util.Map;


@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;

    // 회원가입 
    @Operation(summary = "회원가입", description = "새로운 유저을 등록합니다.")
    @PostMapping("/signup")
    public ResponseEntity<UserDto.UserResponse> signUp(
            @Valid @RequestBody UserDto.SignUpRequest request) { // 1 삭제
        UserDto.UserResponse response = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 로그인 
    @Operation(summary = "로그인", description = "로그인하여 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<UserDto.LoginResponse> login(
            @Valid @RequestBody UserDto.LoginRequest request) {
            User user = userService.login(request);

            // 임시 토큰 
        UserDto.LoginResponse response = UserDto.LoginResponse.builder()
                .token("temp-token-" + user.getUserId())
                .userId(user.getUserId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .birthDate(user.getBirthDate())
                .gender(user.getGender())
                .weight(user.getWeight())
                .height(user.getHeight())
                .build();
            
            return ResponseEntity.ok(response);
    }
    
    // 로그인 아이디 중복 체크 
    @Operation(summary = "아이디 중복 체크", description = "로그인 아이디의 중복 여부를 확인합니다.")
    @GetMapping("/check-loginid")
    public ResponseEntity<Map<String, Boolean>> checkLoginId(
        @RequestParam String userId){
            boolean available = userService.isLoginIdAvailable(userId);
            return ResponseEntity.ok(Map.of("available", available));
    }

    // 닉네임 중복 체크
    @Operation(summary = "닉네임 중복 체크", description = "닉네임 사용 가능 여부를 확인합니다.")
    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNickname(
            @RequestParam String nickname) {
        boolean available = userService.isNickname(nickname);
        return ResponseEntity.ok(Map.of("available", available));
    }
    
}
