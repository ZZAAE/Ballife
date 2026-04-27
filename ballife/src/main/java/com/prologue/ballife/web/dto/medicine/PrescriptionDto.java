package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDate;

import com.prologue.ballife.domain.medicine.Prescription;

import jakarta.validation.constraints.NotNull;
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
        @NotNull(message = "처방그룹 이름을 입력하세요")
        @Size(max = 30, message = "처방그룹 이름은 30자 이하여야 합니다")
        private String prescriptionName;

        @NotNull(message = "처방날짜를 입력하세요")
        private LocalDate prescriptionDate;

        private String memo;
    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionResponse{
        private long id;
        private long userId;
        private String prescriptionName;
        private LocalDate prescriptionDate;
        private String memo;

        public static PrescriptionResponse from(Prescription pr){
            return PrescriptionResponse.builder()
                                    .id(pr.getPrescriptionId())
                                    .userId(pr.getUser().getUserId())
                                    .prescriptionName(pr.getPrescriptionName())
                                    .prescriptionDate(pr.getPrescriptionDate())
                                    .memo(pr.getMemo())
                                    .build();
        }
    }
}
