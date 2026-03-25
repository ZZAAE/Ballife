package com.prologue.ballife.web.Daily;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.Daily.DaliyBloodSugarRecord;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DaliyBloodSugarRecordDto {
    
    //혈당기록
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "혈당을 입력해주세요")
        private Integer bloodsugar;
    }

    //혈당수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

        @NotNull(message = "혈당을 입력해주세요")
        private Integer bloodsugar;
    }

    //혈당응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DaliyBloodSugarRecordResponse {

        private Long recordId;
        private LocalDate date;
        private LocalTime time;
        private Integer bloodsugar;

        public static DaliyBloodSugarRecordResponse from(DaliyBloodSugarRecord daliyBloodSugarRecord) {
            return DaliyBloodSugarRecordResponse.builder()
            .recordId(daliyBloodSugarRecord.getRecordId())
            .date(daliyBloodSugarRecord.getDate())
            .time(daliyBloodSugarRecord.getTime())
            .bloodsugar(daliyBloodSugarRecord.getBloodsugar())
            .build();
        }
    }
}
