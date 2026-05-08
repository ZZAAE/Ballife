package com.prologue.ballife.web.dto.medicine;

// import com.prologue.ballife.domain.medicine.Supplement;
import lombok.*;

public class SupplementDto {
    // ═══════════════════════════════════════════════════════════
    // 영양제 데이터 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplementResponse{

        private Long supplementId;
        private String supplementName;
        private String manufacturer;
        private String ingredientText;
        private String usageText;
        private String sideEffectText;
        private String imageUrl;

        public static SupplementResponse from(Supplement supplement) {
            return SupplementResponse.builder()
                    .supplementId(supplement.getSupplementId())
                    .supplementName(supplement.getSupplementName())
                    .manufacturer(supplement.getManufacturer())
                    .ingredientText(supplement.getIngredientText())
                    .usageText(supplement.getUsageText())
                    .sideEffectText(supplement.getSideEffectText())
                    .imageUrl(supplement.getImageUrl())
                    .build();
        }

    }
    
}
