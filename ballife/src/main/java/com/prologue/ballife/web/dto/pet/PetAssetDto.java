package com.prologue.ballife.web.dto.pet;

import com.prologue.ballife.domain.pet.PetAsset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PetAssetDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long itemId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetAssetResponse {
        private Long itemId;

        public static PetAssetResponse from(PetAsset asset) {
            return PetAssetResponse.builder()
                    .itemId(asset.getItemId())
                    .build();
        }
    }
}
