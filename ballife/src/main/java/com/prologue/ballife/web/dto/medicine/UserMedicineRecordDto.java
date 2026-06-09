package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicineRecord;
import com.prologue.ballife.domain.medicine.UserMedicineRecord.TakenCategory;

import jakarta.validation.constraints.*;
import lombok.*;



public class UserMedicineRecordDto {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "{validation.userMedicineRecord.precriptionId.required}")
        private Long precriptionId;

        @NotNull(message = "{validation.userMedicineRecord.intakeDate.required}")
        private LocalDate intakeDate;

        @NotNull(message = "{validation.userMedicineRecord.intakeTime.required}")
        private LocalTime intakeTime;

        private Long supplementId;

        private TakenCategory takenCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "{validation.userMedicineRecord.precriptionId.required}")
        private Long precriptionId;

        @NotNull(message = "{validation.userMedicineRecord.intakeDate.required}")
        private LocalDate intakeDate;

        @NotNull(message = "{validation.userMedicineRecord.intakeTime.required}")
        private LocalTime intakeTime;

        private Long supplementId;

        private TakenCategory takenCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineRecordResponse {
        private Long userMedicineRecordId;
        private Long prescriptionId;
        private LocalDate intakeDate;
        private LocalTime intakeTime;
        private Long supplementId;
        private TakenCategory takenCategory;

        public static UserMedicineRecordResponse from(UserMedicineRecord usermedinerecord) {
            return UserMedicineRecordResponse.builder()
                    .userMedicineRecordId(usermedinerecord.getUserMedicineRecordId())
                    .prescriptionId(usermedinerecord.getPrescription().getPrescriptionId())
                    .intakeDate(usermedinerecord.getIntakeDate())
                    .intakeTime(usermedinerecord.getIntakeTime())
                    .supplementId(usermedinerecord.getSupplementId())
                    .takenCategory(usermedinerecord.getTakenCategory())
                    .build();
        }
    }
}
