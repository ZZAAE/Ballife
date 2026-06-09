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

    //회원가입
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {

        // USER 테이블에서 키, 몸무게, 질병번호 제외
        @NotBlank(message = "{validation.user.loginId.required}")
        @Size(min = 3, max = 50, message = "{validation.user.loginId.size}")
        private String loginId;

        @NotBlank(message = "{validation.user.username.required}")
        @Size(min = 2, max = 50, message = "{validation.user.username.size}")
        private String username;

        @NotBlank(message = "{validation.user.password.required}")
        @Size(min = 6, message = "{validation.user.password.size}")
        private String password;

        @Size(max = 20, message = "{validation.user.nickname.size}")
        private String nickname;

        @NotBlank(message = "{validation.user.email.required}")
        @Size(max = 30, message = "{validation.user.email.size}")
        private String email;

        @NotNull(message = "{validation.user.birthDate.required}")
        private LocalDate birthDate;

        @NotBlank(message = "{validation.user.gender.required}")
        private String gender;

        @NotNull(message = "{validation.user.weight.required}")
        @DecimalMin(value = "0.1", message = "{validation.user.weight.min}")
        private Double weight;

        @NotNull(message = "{validation.user.height.required}")
        @DecimalMin(value = "0.1", message = "{validation.user.height.min}")
        private Double height;

        private String diseaseIndex;
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
        @NotBlank(message = "{validation.user.loginId.required}")
        private String loginId;

        @NotBlank(message = "{validation.user.password.required}")
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
        private User.UserCategory category;
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
        private Long point;
        private Long usePointCount;
        private String diseaseIndex;
        private User.UserCategory category;

        // 메달 정보 (미착용 시 null)
        private Long medalId;
        private String medalName;
        private String medalIcon;

        // 엔티티 → DTO 변환 메서드
        public static UserResponse from(User user) {
            UserResponse.UserResponseBuilder builder = UserResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .nickname(user.getNickname())
                    .birthDate(user.getBirthDate())
                    .gender(user.getGender())
                    .weight(user.getWeight())
                    .height(user.getHeight())
                    .point(user.getPoint())
                    .usePointCount(user.getUsePointCount())
                    .diseaseIndex(user.getDiseaseIndex())
                    .email(user.getEmail())
                    .category(user.getUserCategory());

            if (user.getMedal() != null) {
                builder.medalId(user.getMedal().getMedalId())
                       .medalName(user.getMedal().getMedalName())
                       .medalIcon(user.getMedal().getMedalIcon());
            }

            return builder.build();
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

        @Size(max = 20, message = "{validation.user.username.size.update}")
        private String username;

        @Size(max = 20, message = "{validation.user.nickname.size}")
        private String nickname;

        private LocalDate birthDate;

        @DecimalMin(value = "0.1", message = "{validation.user.weight.min}")
        private Double weight;

        @DecimalMin(value = "0.1", message = "{validation.user.height.min}")
        private Double height;

        private String gender;

        private String diseaseIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePasswordRequest {
        @NotBlank(message = "{validation.user.password.required}")
        @Size(min = 6, message = "{validation.user.password.size}")
        private String password;
    }
}