package com.prologue.ballife.web.dto.medicine;

import jakarta.validation.constraints.*;
import lombok.*;

import com.prologue.ballife.domain.medicine.UserMedicine;

public class UserMedicineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "{validation.userMedicine.prescriptionId.required}")
        private Long prescriptionId;

        private String medicineName;

        private Long supplementId;


    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "{validation.userMedicine.prescriptionId.required}")
        private Long prescriptionId;

        private String medicineName;

        private Long supplementId;

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineResponse {

        private Long userMedicationId;
        private Long prescriptionId;
        private String medicineName;
        private Long supplementId;
        


        public static UserMedicineResponse from(UserMedicine usermedicine) {
            return UserMedicineResponse.builder()
                    .prescriptionId(usermedicine.getPrescription().getPrescriptionId())
                    .userMedicationId(usermedicine.getUserMedicineId())
                    .medicineName(usermedicine.getMedicineName())
                    .supplementId(usermedicine.getSupplementId())
                    .build();
        }
    }

    
}