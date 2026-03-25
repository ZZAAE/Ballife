package com.prologue.ballife.web.Daily;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.Daily.DaliyBPRecord;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DaliyBPRecordDto {
    //혈압기록
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "수축기 혈압을 입력해주세요")
        private int systolicBP;

        @NotNull(message = "이완기 혈압을 입력해주세요")
        private int diastolicBP;
    }

    //혈압수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "수축기 혈압을 입력해주세요")
        private int systolicBP;

        @NotNull(message = "이완기 혈압을 입력해주세요")
        private int diastolicBP;
    }

    //혈압응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DaliyBPRecordResponse {

        private Long recordId;
        private LocalDate date;
        private LocalTime time;
        private int systolicBP;
        private int diastolicBP;

        public static DaliyBPRecordResponse from(DaliyBPRecord daliyBPRecord) {
            return DaliyBPRecordResponse.builder()
            .recordId(daliyBPRecord.getRecordId())
            .date(daliyBPRecord.getDate())
            .time(daliyBPRecord.getTime())
            .systolicBP(daliyBPRecord.getSystolicBP())
            .diastolicBP(daliyBPRecord.getDiastolicBP())
            .build();
        }
    }
}
