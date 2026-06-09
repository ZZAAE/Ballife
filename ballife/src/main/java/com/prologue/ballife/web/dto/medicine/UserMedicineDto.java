package com.prologue.ballife.web.dto.medicine;

import jakarta.validation.constraints.*;
import lombok.*;

import com.prologue.ballife.domain.medicine.Medicine;
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
        // 주성분명(표시용 다국어 병기). 약품 캐시(Medicine)에서 조회해 채운다. 미조회 시 null.
        private String ingredientKo;   // 주성분 (한글)
        private String ingredientEng;  // 주성분 (영문 INN)


        public static UserMedicineResponse from(UserMedicine usermedicine) {
            return from(usermedicine, null);
        }

        // medicine = 약품 캐시 조회 결과(없으면 null). 있으면 주성분 한/영을 병기 필드로 채운다.
        public static UserMedicineResponse from(UserMedicine usermedicine, Medicine medicine) {
            return UserMedicineResponse.builder()
                    .prescriptionId(usermedicine.getPrescription().getPrescriptionId())
                    .userMedicationId(usermedicine.getUserMedicineId())
                    .medicineName(usermedicine.getMedicineName())
                    .supplementId(usermedicine.getSupplementId())
                    .ingredientKo(medicine != null ? medicine.getMainItemIngr() : null)
                    .ingredientEng(medicine != null ? medicine.getMainIngrEng() : null)
                    .build();
        }
    }

    
}