package com.prologue.ballife.web.dto.medicine;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicine;

public class UserMedicineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "처방그룹을 선택해주세요")
        private Prescription prescriptionId;

        @NotBlank(message = "복용량을 입력해주세요")
        @Max(value = 15, message = "KD코드는 13자 입니다")
        private String kdCode;

        @NotBlank(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private String intakeIntervals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotNull(message = "처방그룹을 선택해주세요")
        private Prescription prescriptionId;


        @NotBlank(message = "복용량을 입력해주세요")
        @Max(value = 15, message = "KD코드는 13자 입니다")
        private String kdCode;

        @NotBlank(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private List<String> intakeIntervals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineResponse {

        private Long userMedicationId;
        private Prescription prescriptionId;
        private String kdCode;
        private String intakeIntervals;


        public static UserMedicineResponse from(UserMedicine usermedicine) {
            return UserMedicineResponse.builder()
                    .prescriptionId(usermedicine.getPrescriptionId())
                    .userMedicationId(usermedicine.getUserMedicineId())
                    .kdCode(usermedicine.getKdCode())
                    .intakeIntervals(usermedicine.getIntakeIntervals())
                    .build();
        }
    }
}