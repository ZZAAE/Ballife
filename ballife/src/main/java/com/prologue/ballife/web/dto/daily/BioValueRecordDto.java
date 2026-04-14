package com.prologue.ballife.web.dto.daily;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.prologue.ballife.domain.daily.BioValueRecord;

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
        private LocalDateTime recordTime;

        @NotNull(message = "카테고리를 입력해주세요")
        private String category;

        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Double weight;
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
        private LocalDateTime recordTime;

        @NotNull(message = "카테고리를 입력해주세요")
        private String category;

        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Double weight;
        private Integer waterIntakeCup;
    }

    // 생체기록 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor 
    @AllArgsConstructor
    public static class BioResponse {
        private Long recordId;
        private LocalDateTime recordTime;
        private String category;
        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Double weight;
        private Integer waterIntakeCup;

            public static BioResponse from(BioValueRecord bio) {
                return BioResponse.builder()
                        .recordId(bio.getRecordId())
                        .recordTime(bio.getRecordTime())
                        .category(bio.getCategory())
                        .bloodSugar(bio.getBloodSugar())
                        .systolicBP(bio.getSystolicBP())
                        .diastolicBP(bio.getDiastolicBP())
                        .weight(bio.getWeight())
                        .waterIntakeCup(bio.getWaterIntakeCup())
                        .build();
            }
    }

}
