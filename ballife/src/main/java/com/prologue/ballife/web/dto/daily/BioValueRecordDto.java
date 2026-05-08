package com.prologue.ballife.web.dto.daily;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.prologue.ballife.domain.daily.BioValueRecord;
<<<<<<< HEAD
import com.prologue.ballife.web.dto.daily.BioValueRecordDto.BioResponse;
=======
>>>>>>> origin/jisoo0508

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
        private LocalDate recordDate;

        @NotNull(message = "날짜를 입력해주세요")
        private LocalTime recordTime;

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
        private LocalDate recordDate;
        @NotNull(message = "시간을 입력해주세요")
        private LocalTime recordTime;

        @NotNull(message = "카테고리를 입력해주세요")
        private String category;

        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
        private Double weight;
        private Integer waterIntakeCup;
    }

<<<<<<< HEAD

=======
>>>>>>> origin/jisoo0508
    // 생체기록 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor 
    @AllArgsConstructor
    public static class BioResponse {
        private Long recordId;
<<<<<<< HEAD
        private LocalDate recordDate;
        private LocalTime recordTime;
=======
        private LocalDate date;
        private LocalTime time;
>>>>>>> origin/jisoo0508
        private String category;
        private Integer bloodSugar;
        private Integer systolicBP;
        private Integer diastolicBP;
<<<<<<< HEAD
        private Double weight;
=======
        private Integer weight;
>>>>>>> origin/jisoo0508
        private Integer waterIntakeCup;

            public static BioResponse from(BioValueRecord bio) {
                return BioResponse.builder()
                        .recordId(bio.getRecordId())
<<<<<<< HEAD
                        .recordDate(bio.getRecordDate())
                        .recordTime(bio.getRecordTime())
=======
                        .date(bio.getDate())
                        .time(bio.getTime())
>>>>>>> origin/jisoo0508
                        .category(bio.getCategory())
                        .bloodSugar(bio.getBloodSugar())
                        .systolicBP(bio.getSystolicBP())
                        .diastolicBP(bio.getDiastolicBP())
                        .weight(bio.getWeight())
                        .waterIntakeCup(bio.getWaterIntakeCup())
                        .build();
            }
    }

<<<<<<< HEAD
    // @Data
    // @Builder
    // @NoArgsConstructor 
    // @AllArgsConstructor
    // public static class BloodSugarResponse {

    // }

=======
>>>>>>> origin/jisoo0508
}
