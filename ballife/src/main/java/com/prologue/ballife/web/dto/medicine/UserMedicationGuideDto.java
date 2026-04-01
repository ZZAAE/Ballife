package com.prologue.ballife.web.dto.medicine;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicationGuide;

public class UserMedicationGuideDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "복용량을 입력해주세요")
        @Min(value = 1, message = "복용량은 최소 1 이상이어야 합니다.")
        private Integer dosage;

        @NotNull(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private List<String> intakeIntervals;

        @NotNull(message = "복용 시작 날짜는 필수입니다.")
        private LocalDate startDate;

        @NotNull(message = "투약 일수는 필수입니다.")
        @Min(value = 1, message = "투약 일수는 최소 1일 이상이어야 합니다.")
        private Integer day;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "복용량을 입력해주세요")
        @Min(value = 1, message = "복용량은 최소 1개 이상이어야 합니다.")
        private Integer dosage;

        @NotNull(message = "복용 간격은 비워둘 수 없습니다.")
        private List<String> intakeIntervals;

        private LocalDate startDate;

        @Min(value = 1, message = "투약 일수는 최소 1일 이상이어야 합니다.")
        private Integer day;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicationGuideResponse {

        private Long userMedicationId;
        private String kdCode;
        private Integer dosage;
        private String intakeInterval;
        private LocalDate startDate;
        private Integer day;
        private String memo;
        private Prescription prescriptionId;


        public static UserMedicationGuideResponse from(UserMedicationGuide usermedicationguide) {
            return UserMedicationGuideResponse.builder()
                    .userMedicationId(usermedicationguide.getUserMedicationId())
                    .kdCode(usermedicationguide.getKdCode())
                    .dosage(usermedicationguide.getDosage())
                    .intakeInterval(usermedicationguide.getIntakeInterval())
                    .startDate(usermedicationguide.getStartDate())
                    .day(usermedicationguide.getDay())
                    .memo(usermedicationguide.getMemo())
                    .prescriptionId(usermedicationguide.getPrescriptionId())
                    .build();
        }
    }
}