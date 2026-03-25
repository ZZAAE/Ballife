package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.medicine.Medicine;
import com.prologue.ballife.domain.medicine.Supplement;
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
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineRecordResponse {
        private Long userSupplementId;
        private String medicineCategory;
        private LocalDateTime intakeTime;
        private Medicine kdCode;
        private Supplement supplementId;

        public static UserMedicineRecordResponse from(UserMedicineRecord usermedinerecord) {
            return UserMedicineRecordResponse.builder()
                    .userSupplementId(usermedinerecord.getUserSupplementId())
                    .medicineCategory(usermedinerecord.getMedicineCategory())
                    .intakeTime(usermedinerecord.getIntakeTime())
                    .kdCode(usermedinerecord.getKdCode())  
                    .supplementId(usermedinerecord.getSupplementId())  
                    .build();
        }
    }
}
