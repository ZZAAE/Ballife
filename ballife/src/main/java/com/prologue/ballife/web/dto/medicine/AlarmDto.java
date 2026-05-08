package com.prologue.ballife.web.dto.medicine;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.prologue.ballife.domain.medicine.Alarm;
import com.prologue.ballife.domain.medicine.Alarm.AlarmCategory;
import com.prologue.ballife.domain.medicine.Prescription;

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
        private LocalTime time;

        @NotBlank (message = "알람 요일을 선택하여 주세요")
        private String alarmDay;

        @NotNull(message = "처방그룹을 선택해주세요")
        private Long prescriptionId;

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
        private LocalTime time;

        @NotBlank (message = "알람 요일을 선택하여 주세요")
        private String alarmDay;

        @NotNull(message = "처방그룹을 선택해주세요")
        private Long prescriptionId;

        private Long supplementId;  // 약품 카테고리가 '영양제'

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlarmResponse {
        private Long medicationAlarmId;
        private Long prescriptionId;
        private Long supplementId;
        private AlarmCategory alarmCategory;
        private LocalTime time;
        private String alarmDay;

        public static AlarmResponse from (Alarm alarm){
            return AlarmResponse.builder()
                .medicationAlarmId(alarm.getMedicationAlarmId())
                .prescriptionId(alarm.getPrescription().getPrescriptionId())
                .supplementId(alarm.getSupplementId())
                .alarmCategory(alarm.getAlarmCategory())
                .time(alarm.getTime())
                .alarmDay(alarm.getAlarmDay())
                .build();
        }
    }
    
}
