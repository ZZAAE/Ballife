package com.prologue.ballife.web.dto.medicine;



import com.prologue.ballife.domain.medicine.Medicine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MedicineDto {
    
    // ═══════════════════════════════════════════════════════════
    // 의약품 데이터 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineResponse{

        private String kdCode;
        private String medicineName;
        private String relatedDisease;
        private String efficacyText;
        private String cautionText;
        private String sideEffectText;
        private String imageUrl;

        public static MedicineResponse from(Medicine medicine) {
            return MedicineResponse.builder()
                    .kdCode(medicine.getKdCode())
                    .medicineName(medicine.getMedicineName())
                    .relatedDisease(medicine.getRelatedDisease())
                    .efficacyText(medicine.getEfficacyText())
                    .cautionText(medicine.getCautionText())
                    .sideEffectText(medicine.getSideEffectText())
                    .imageUrl(medicine.getImageUrl())
                    .build();
        }

    }
}
