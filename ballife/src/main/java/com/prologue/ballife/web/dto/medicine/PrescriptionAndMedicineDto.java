package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDate;
import java.util.List;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicine;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PrescriptionAndMedicineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "처방그룹 이름을 입력하세요")
        @Size(max = 30, message = "처방그룹 이름은 30자 이하여야 합니다")
        private String prescriptionName;

        private LocalDate prescriptionDate;

        private String memo;

        @NotBlank(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private String intakeIntervals;

        private List<UserMedicineDto.CreateRequest> medicines;

    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionAndMedicineResponse {

        private Long prescriptionId;
        private String prescriptionName;
        private LocalDate prescriptionDate;
        private String memo;
        private String intakeIntervals;
        private List<UserMedicineDto.UserMedicineResponse> medicines;

        public static PrescriptionAndMedicineResponse from(Prescription prescription,
                List<UserMedicine> userMedicines) {
            return PrescriptionAndMedicineResponse.builder()
                    .prescriptionId(prescription.getPrescriptionId())
                    .prescriptionName(prescription.getPrescriptionName())
                    .prescriptionDate(prescription.getPrescriptionDate())
                    .memo(prescription.getMemo())
                    .intakeIntervals(prescription.getIntakeIntervals())
                    .medicines(
                            userMedicines == null ? List.of()
                                    : userMedicines.stream()
                                            .map(UserMedicineDto.UserMedicineResponse::from)
                                            .toList())
                    .build();
        }

    }

}