package com.prologue.ballife.web.dto.medicine;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class OcrTestDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrResponse{
        private List<String> medicineList;

        public static OcrResponse from(List<String> mediList){
            return OcrResponse.builder()
                              .medicineList(mediList)
                              .build();
        }
    }

}
