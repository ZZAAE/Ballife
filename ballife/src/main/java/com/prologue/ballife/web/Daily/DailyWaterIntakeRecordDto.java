package com.prologue.ballife.web.Daily;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.Daily.DailyWaterIntakeRecord;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DailyWaterIntakeRecordDto {
    //물기록
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "수분 섭취량을 입력해주세요")
        private Integer waterIntakeCup;

    }

    //물수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "수분 섭취량을 입력해주세요")
        private Integer waterIntakeCup;

    }

    //물응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyWaterIntakeRecordResponse {

        private Long recordId;
        private LocalDate date;
        private LocalTime time;
        private Integer waterIntakeCup;

        public static DailyWaterIntakeRecordResponse from(DailyWaterIntakeRecord dailyWaterIntakeRecord) {
            return DailyWaterIntakeRecordResponse.builder()
            .recordId(dailyWaterIntakeRecord.getRecordId())
            .date(dailyWaterIntakeRecord.getDate())
            .time(dailyWaterIntakeRecord.getTime())
            .waterIntakeCup(dailyWaterIntakeRecord.getWaterIntakeCup())
            .build();
        }
    }
}
