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

        @NotNull(message = "처방그룹을 선택해주세요")
        private Long prescriptionId;

        @Max(value = 15, message = "KD코드는 13자 입니다")
        private String kdCode;

        private Long supplementId;

        
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "처방그룹을 선택해주세요")
        private Long prescriptionId;

        @Max(value = 15, message = "KD코드는 13자 입니다")
        private String kdCode;

        private Long supplementId;

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineResponse {

        private Long userMedicationId;
        private Long prescriptionId;
        private String kdCode;
        private Long supplementId;
        


        public static UserMedicineResponse from(UserMedicine usermedicine) {
            return UserMedicineResponse.builder()
                    .prescriptionId(usermedicine.getPrescription().getPrescriptionId())
                    .userMedicationId(usermedicine.getUserMedicineId())
                    .kdCode(usermedicine.getKdCode())
                    .supplementId(usermedicine.getSupplementId())
                    .build();
        }
    }

    
}