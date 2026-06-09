package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDate;

import com.prologue.ballife.domain.medicine.Prescription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


public class PrescriptionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest{

        @NotBlank(message = "{validation.prescription.prescriptionName.required}")
        @Size(max = 30, message = "{validation.prescription.prescriptionName.size}")
        private String prescriptionName;

        private LocalDate prescriptionDate;

        private String memo;

        @NotBlank(message = "{validation.prescription.intakeIntervals.required}")
        private String intakeIntervals;

        private String dosage;


    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{

        @NotBlank(message = "{validation.prescription.prescriptionName.required}")
        @Size(max = 30, message = "{validation.prescription.prescriptionName.size}")
        private String prescriptionName;

        private LocalDate prescriptionDate;

        private Long supplementId;

        private String memo;

        @NotBlank(message = "{validation.prescription.intakeIntervals.required}")
        private String intakeIntervals;

        private String dosage;


    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionResponse{
        private long prescriptionId;
        private String prescriptionName;
        private LocalDate prescriptionDate;
        private String memo;
        private String intakeIntervals;
        private String dosage;

        public static PrescriptionResponse from(Prescription pr){
            return PrescriptionResponse.builder()
                                    .prescriptionId(pr.getPrescriptionId())
                                    .prescriptionName(pr.getPrescriptionName())
                                    .prescriptionDate(pr.getPrescriptionDate())
                                    .memo(pr.getMemo())
                                    .intakeIntervals(pr.getIntakeIntervals())
                                    .dosage(pr.getDosage())
                                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionMemoResponse {

        private Long prescriptionId;
        private String memo;

        public static PrescriptionMemoResponse from(Prescription pr){
            return PrescriptionMemoResponse.builder()
            .prescriptionId(pr.getPrescriptionId())
                    .memo(pr.getMemo())
                    .build();
        }
    }
}
