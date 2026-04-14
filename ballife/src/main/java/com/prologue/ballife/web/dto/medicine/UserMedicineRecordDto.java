package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicineRecord;

import jakarta.validation.constraints.*;
import lombok.*;



public class UserMedicineRecordDto {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "약품 카테고리를 선택해주세요")
        private String medicineCategory;

        @NotNull(message = "복용 시간을 입력해주세요")
        private LocalDateTime intakeTime;

        private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
        private Long supplementId;  // 약품 카테고리가 '영양제'인 경우에만 사용
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "약품 카테고리를 선택해주세요")
        private String medicineCategory;

        @NotNull(message = "복용 시간을 입력해주세요")
        private LocalDateTime intakeTime;

        private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
        private Long supplementId;  // 약품 카테고리가 '영양제'
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineRecordResponse {
        private Long userMedicineRecordId;
        private String medicineCategory;
        private LocalDateTime intakeTime;
        private Prescription prescriptionId;
        private String supplementId;

        public static UserMedicineRecordResponse from(UserMedicineRecord usermedinerecord) {
            return UserMedicineRecordResponse.builder()
                    .userMedicineRecordId(usermedinerecord.getUserMedicineRecordId())
                    .medicineCategory(usermedinerecord.getMedicineCategory())
                    .intakeTime(usermedinerecord.getIntakeTime())
                    .prescriptionId(usermedinerecord.getPrescriptionId())
                    .build();
        }
    }
}
