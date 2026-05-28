package com.prologue.ballife.web.dto.user;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.prologue.ballife.domain.user.UserMedal;

public class UserMedalDto {

    // 유저 메달 획득 요청
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcquireRequest {
        @NotNull(message = "메달 ID를 입력해주세요")
        private Long medalId;
    }

    // 유저 보유 메달 응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long userId;
        private Long medalId;
        private String medalName;
        private String medalIcon;
        private LocalDateTime medalAt;

        public static Response from(UserMedal userMedal) {
            return Response.builder()
                    .userId(userMedal.getUser().getUserId())
                    .medalId(userMedal.getMedal().getMedalId())
                    .medalName(userMedal.getMedal().getMedalName())
                    .medalIcon(userMedal.getMedal().getMedalIcon())
                    .medalAt(userMedal.getMedalAt())
                    .build();
        }
    }
}
