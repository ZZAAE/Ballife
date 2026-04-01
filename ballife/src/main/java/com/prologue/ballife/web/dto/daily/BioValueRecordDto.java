package com.prologue.ballife.web.dto.daily;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class BioValueRecordDto {
    
    // ═══════════════════════════════════════════════════════════
    // 생체기록 생성 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        // 사용자가 입력한 값 1개만 넣어야돼서 유효성 검사 안함
        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "카테고리를 입력해주세요")
        private String category;

        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Integer weight;
        private Integer waterIntakeCup;

    }

    // ═══════════════════════════════════════════════════════════
    // 생체기록 수정 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        // 사용자가 입력한 값 1개만 넣어야돼서 유효성 검사 안함
        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "카테고리를 입력해주세요")
        private String category;

        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Integer weight;
        private Integer waterIntakeCup;
    }

}
