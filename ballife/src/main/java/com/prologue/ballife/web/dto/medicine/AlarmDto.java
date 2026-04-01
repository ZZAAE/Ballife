package com.prologue.ballife.web.dto.medicine;

import lombok.Data;

import java.time.LocalDateTime;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

public class AlarmDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "알람 종류를 선택해주세요")
        private String alarmCategory;

        @NotNull(message = "알람 시간을 선택")
        private LocalDateTime time;

        @NotBlank (message = "알람 요일을 선택하여 주세요")
        private String alarmDay;

        private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
        private Long supplementId;  // 약품 카테고리가 '영양제'인 경우에만 사용


    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotBlank(message = "알람 종류를 선택해주세요")
        private String alarmCategory;

        @NotNull(message = "알람 시간을 선택")
        private LocalDateTime time;

        @NotBlank (message = "알람 요일을 선택하여 주세요")
        private String alarmDay;

        private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
        private Long supplementId;  // 약품 카테고리가 '영양제'

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlarmResponse {
        private Long medicationAlarmId; 
        private String kdCode;
        private Long supplementId;
        private String alarmCategory;
        private LocalDateTime time;
        private String alarmDay;

        public static AlarmResponse from (AlarmResponse alarmresponse){
            return AlarmResponse.builder()
                .medicationAlarmId(alarmresponse.getMedicationAlarmId())
                .kdCode(alarmresponse.getKdCode())
                .supplementId(alarmresponse.getSupplementId())
                .alarmCategory(alarmresponse.getAlarmCategory())
                .time(alarmresponse.getTime())
                .alarmDay(alarmresponse.getAlarmDay())
                .build();
        }
    }
    
}
