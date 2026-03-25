package com.prologue.ballife.web.DTO.user;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.prologue.ballife.domain.user.User;

public class UserDto {

    //회원가입
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {

        @NotBlank(message = "아이디를 입력해주세요")
        @Size(min = 3, max = 50, message = "아이디는 3~50자여야 합니다")
        private String loginId;

        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 6, message = "비밀번호는 6자 이상이여야 합니다")
        private String password;

        @Size(max = 50, message = "닉네임은 20자 이하여야 합니다")
        private String nickname;

        @NotNull(message = "생년월일을 입력하세요")
        private LocalDate birthDate;

        @NotBlank(message = "성별을 입력해주세요")
        private String gender;

        @NotNull(message = "몸무게를 입력해주세요")
        @DecimalMin(value = "0.1", message = "몸무게는 0보다 커야 합니다")
        private Double weight;

        @NotNull(message = "키를 입력해주세요")
        @DecimalMin(value = "0.1", message = "키는 0보다 커야 합니다")
        private Double height; 
        
        private String diseaseIndex;
    }

    //로그인 요청
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "아이디를 입력해주세요")
        private String loginId;

        @NotBlank(message = "비밀번호를 입력해주세요")
        private String password;
    }

    // ═══════════════════════════════════════════════════════════
    // 로그인 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private long userId;      
        private String nickname;
        private LocalDate birthDate;
        private String gender;
        private Double weight;
        private Double height;
        private String diseaseIndex;

        public static LoginResponse from(User user) {
            return LoginResponse.builder()
                    .userId(user.getUserId())
                    .nickname(user.getNickname())
                    .birthDate(user.getBirthDate())
                    .gender(user.getGender())
                    .weight(user.getWeight())
                    .height(user.getHeight())
                    .diseaseIndex(user.getDiseaseIndex())
                    .build();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 회원 정보 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private String nickname;
        private LocalDate birthDate;
        private String gender;
        private Double weight;
        private Double height;
        private String diseaseIndex;

        // 엔티티 → DTO 변환 메서드
        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .nickname(user.getNickname())
                    .birthDate(user.getBirthDate())
                    .gender(user.getGender())
                    .weight(user.getWeight())
                    .height(user.getHeight())
                    .diseaseIndex(user.getDiseaseIndex())
                    .build();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 회원 정보 수정 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 20, message = "닉네임은 20자 이하여야 합니다")
        private String nickname;

        @DecimalMin(value = "0.1", message = "몸무게는 0보다 커야 합니다")
        private Double weight;

        @DecimalMin(value = "0.1", message = "키는 0보다 커야 합니다")
        private Double height;

        private String diseaseIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePasswordRequest {
        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 6, message = "비밀번호는 6자 이상이여야 합니다")
        private String password;
    }
}