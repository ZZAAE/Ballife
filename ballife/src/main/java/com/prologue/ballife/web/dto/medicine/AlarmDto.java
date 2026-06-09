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

        @NotBlank(message = "{validation.alarm.alarmCategory.required}")
        private String alarmCategory;

        @NotNull(message = "{validation.alarm.time.required}")
        private LocalTime time;

        @NotBlank (message = "{validation.alarm.alarmDay.required}")
        private String alarmDay;

        @NotNull(message = "{validation.alarm.prescriptionId.required}")
        private Long prescriptionId;

        private Long supplementId;  // 약품 카테고리가 '영양제'인 경우에만 사용


    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotBlank(message = "{validation.alarm.alarmCategory.required}")
        private String alarmCategory;

        @NotNull(message = "{validation.alarm.time.required}")
        private LocalTime time;

        @NotBlank (message = "{validation.alarm.alarmDay.required}")
        private String alarmDay;

        @NotNull(message = "{validation.alarm.prescriptionId.required}")
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
