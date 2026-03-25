package com.prologue.ballife.web.DTO.user;

import com.prologue.ballife.domain.user.UserDisease;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserDiseaseDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiseaseResponse{
        private String diseaseName;

        public static DiseaseResponse from(UserDisease d){
            return DiseaseResponse.builder()
                    .diseaseName(d.getDiseaseName())
                    .diseaseName(d.getDiseaseName())
                    .build();
        }
    }
}
