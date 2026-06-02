package com.prologue.ballife.web.dto.medicine;

import com.prologue.ballife.domain.medicine.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MedicineItemDto {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineItemResponse{
        private String medicineName;

        public static MedicineItemResponse from(Medicine medicine) {
            return MedicineItemResponse.builder()
                   .medicineName(medicine.getItemName())
                   .build();
        }
    }
}
