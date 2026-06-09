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
        @NotBlank(message = "메달 이름을 입력해주세요")
        @Size(max = 50, message = "메달 이름은 50자 이하여야 합니다")
        private String medalName;

        @NotBlank(message = "메달 아이콘을 입력해주세요")
        @Size(max = 256, message = "메달 아이콘 경로는 256자 이하여야 합니다")
        private String medalIcon;

        @NotNull(message = "메달 가격을 입력해주세요")
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
