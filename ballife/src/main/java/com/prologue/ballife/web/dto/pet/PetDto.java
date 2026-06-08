package com.prologue.ballife.web.dto.pet;

import com.prologue.ballife.domain.pet.Pet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PetDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Long hat;
        private Long house;
        private Long backGround;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetResponse {
        private Long hat;
        private Long house;
        private Long backGround;

        public static PetResponse from(Pet pet) {
            return PetResponse.builder()
                    .hat(pet.getHat())
                    .house(pet.getHouse())
                    .backGround(pet.getBackground())
                    .build();
        }
    }
}
