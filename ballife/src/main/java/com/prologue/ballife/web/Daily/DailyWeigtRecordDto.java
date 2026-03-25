package com.prologue.ballife.web.Daily;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.Daily.DailyWeigtRecord;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DailyWeigtRecordDto {
    //몸무게기록
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "몸무게를 입력해주세요")
        private Integer weight;

    }

    //몸무게수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "몸무게를 입력해주세요")
        private Integer weight;
        
    }

    //혈압응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyWeigtRecordResponse {
        
        private Long recordId;
        private LocalDate date;
        private LocalTime time;
        private Integer weight;

        public static DailyWeigtRecordResponse from(DailyWeigtRecord dailyWeigtRecord) {
            return DailyWeigtRecordResponse.builder()
            .recordId(dailyWeigtRecord.getRecordId())
            .date(dailyWeigtRecord.getDate())
            .time(dailyWeigtRecord.getTime())
            .weight(dailyWeigtRecord.getWeight())
            .build();
        }
    }
}
