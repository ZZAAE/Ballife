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

        @NotBlank(message = "처방그룹 이름을 입력하세요")
        @Size(max = 30, message = "처방그룹 이름은 30자 이하여야 합니다")
        private String prescriptionName;

        private LocalDate prescriptionDate;

        private String memo;

        @NotBlank(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private String intakeIntervals;

        
    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{

        @NotBlank(message = "처방그룹 이름을 입력하세요")
        @Size(max = 30, message = "처방그룹 이름은 30자 이하여야 합니다")
        private String prescriptionName;

        private LocalDate prescriptionDate;

        private Long supplementId;

        private String memo;

        @NotBlank(message = "복용 간격을 최소 하나 이상 선택해주세요")
        private String intakeIntervals;

        
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

        public static PrescriptionResponse from(Prescription pr){
            return PrescriptionResponse.builder()
                                    .prescriptionId(pr.getPrescriptionId())
                                    .prescriptionName(pr.getPrescriptionName())
                                    .prescriptionDate(pr.getPrescriptionDate())
                                    .memo(pr.getMemo())
                                    .intakeIntervals(pr.getIntakeIntervals())
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
