package com.prologue.ballife.web.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.prologue.ballife.domain.user.Medal;

public class MedalDto {

    // 메달 생성 요청 (관리자)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "{validation.medal.medalName.required}")
        @Size(max = 50, message = "{validation.medal.medalName.size}")
        private String medalName;

        @NotBlank(message = "{validation.medal.medalIcon.required}")
        @Size(max = 256, message = "{validation.medal.medalIcon.size}")
        private String medalIcon;

        @NotNull(message = "{validation.medal.medalPrice.required}")
        private Long medalPrice;
    }

    // 메달 상세 응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long medalId;
        private String medalName;
        private String medalIcon;
        private Long medalPrice;

        public static Response from(Medal medal) {
            return Response.builder()
                    .medalId(medal.getMedalId())
                    .medalName(medal.getMedalName())
                    .medalIcon(medal.getMedalIcon())
                    .medalPrice(medal.getMedalPrice())
                    .build();
        }
    }
}
