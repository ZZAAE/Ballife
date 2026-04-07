package com.prologue.ballife.web.dto.user;

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

    //회원가입1
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {

        // USER 테이블에서 키, 몸무게, 질병번호 제외
        @NotBlank(message = "아이디를 입력해주세요")
        @Size(min = 3, max = 50, message = "아이디는 3~50자여야 합니다")
        private String loginId;

        @NotBlank(message = "이름을 입력해주세요")
        @Size(min = 2, max = 50, message = "이름은 50자 이하이어야 합니다")
        private String username;

        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 6, message = "비밀번호는 6자 이상이여야 합니다")
        private String password;

        @NotBlank(message = "닉네임을 입력해주세요")
        @Size(max = 20, message = "닉네임은 20자 이하여야 합니다")
        private String nickname;

        @NotBlank(message = "이메일을 입력해주세요")
        @Size(max = 30, message = "이메일은 30자 이하여야 합니다")
        private String email;

        @NotNull(message = "생년월일을 입력하세요")
        private LocalDate birthDate;

        @NotBlank(message = "성별을 입력해주세요")
        private String gender;

        // 선택사항으로 변경
        @DecimalMin(value = "0.1", message = "몸무게는 0보다 커야 합니다")
        private Double weight;

        @DecimalMin(value = "0.1", message = "키는 0보다 커야 합니다")
        private Double height; 
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiseaseInfoRequest {
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

        // 다음 화면에 표시할 내용을 정의, 
        private String token;
        private long userId;      
        private String username;
        private String nickname;
        private LocalDate birthDate; // 메인페이지에서 나이 계산 필요
        private String email;
        private String gender;
        private Double weight;
        private Double height;
        private User.Role role;
        //private String diseaseIndex; 26.03.31 기준 메인페이지에 질병은 안나와있음 메인에 질병 표시할거면 주석제거

    //     public static LoginResponse from(User user) { 필요없음
    //         return LoginResponse.builder()
    //                 .userId(user.getUserId())
    //                 .nickname(user.getNickname()) 닉네임은 메인페이지에서 안씀
    //                 .birthDate(user.getBirthDate())
    //                 .gender(user.getGender())
    //                 .weight(user.getWeight())
    //                 .height(user.getHeight())
    //                 .diseaseIndex(user.getDiseaseIndex())
    //                 .build();
    //     }
    }

    // ═══════════════════════════════════════════════════════════
    // 회원 정보 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private long userId;
        private String username;
        private String nickname;
        private LocalDate birthDate;
        private String email;
        private String gender;
        private Double weight;
        private Double height;
        private String diseaseIndex;
        private User.Role role;

        // 엔티티 → DTO 변환 메서드
        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .nickname(user.getNickname())
                    .birthDate(user.getBirthDate())
                    .gender(user.getGender())
                    .weight(user.getWeight())
                    .height(user.getHeight())
                    .diseaseIndex(user.getDiseaseIndex())
                    .email(user.getEmail())
                    .role(user.getRole())
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

        @Size(max = 20, message = "이름은 20자 이하여야 합니다")
        private String username;

        @Size(max = 20, message = "닉네임은 20자 이하여야 합니다")
        private String nickname;

        private LocalDate birthDate;

        @DecimalMin(value = "0.1", message = "몸무게는 0보다 커야 합니다")
        private Double weight;

        @DecimalMin(value = "0.1", message = "키는 0보다 커야 합니다")
        private Double height;

        private String gender;

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