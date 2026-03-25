package com.prologue.ballife.web.DTO.user;

import java.time.LocalDate;

import com.prologue.ballife.domain.user.UserRda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserRdaDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private LocalDate date;
        private Long userId;
        private Integer recommendedCalorie;
        private Double recommendedCarbohydrate;
        private Double recommendedProtein;
        private Double recommendedFat;
        private Double recommendedSugar;
        private Double recommendedSodium;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private LocalDate date;
        private Long userId;
        private Integer recommendedCalorie;
        private Double recommendedCarbohydrate;
        private Double recommendedProtein;
        private Double recommendedFat;
        private Double recommendedSugar;
        private Double recommendedSodium;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RdaResponse {
        private LocalDate date;
        private Integer recommendedCalorie;
        private Double recommendedCarbohydrate;
        private Double recommendedProtein;
        private Double recommendedFat;
        private Double recommendedSugar;
        private Double recommendedSodium;

        public static RdaResponse from(UserRda rda) {
            return RdaResponse.builder()
                    .date(rda.getDate())
                    .recommendedCalorie(rda.getRecommendedCalorie())
                    .recommendedCarbohydrate(rda.getRecommendedCarbohydrate())
                    .recommendedProtein(rda.getRecommendedProtein())
                    .recommendedSugar(rda.getRecommendedSugar())
                    .recommendedSodium(rda.getRecommendedSodium())
                    .build();
        }
    }

}
