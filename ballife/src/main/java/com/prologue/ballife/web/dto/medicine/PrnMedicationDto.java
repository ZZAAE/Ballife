package com.prologue.ballife.web.dto.medicine;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.medicine.PrnMedicationRecord;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PrnMedicationDto {

    // 상비약 기록 생성 요청 (userId 는 JWT principal 에서 가져오므로 바디에 없음)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String drugName;   // 약 이름 (필수)
        private String dosage;     // 복용량 (선택)
        private String date;       // "YYYY-MM-DD"
        private String time;       // "HH:mm"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String drugName;
        private String dosage;
        private String date;
        private String time;
        private LocalDateTime createdAt;

        public static Response from(PrnMedicationRecord r) {
            return Response.builder()
                    .id(r.getId())
                    .drugName(r.getDrugName())
                    .dosage(r.getDosage())
                    .date(r.getDate())
                    .time(r.getTime())
                    .createdAt(r.getCreatedAt())
                    .build();
        }
    }
}
