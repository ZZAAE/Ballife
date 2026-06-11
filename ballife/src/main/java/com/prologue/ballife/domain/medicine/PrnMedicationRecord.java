package com.prologue.ballife.domain.medicine;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

/**
 * 상비약 직접 기록 (PRN = pro re nata, 필요 시 복용).
 * 복약 페이지의 "직접 기록하기"로 남기는 비처방 약 복용 기록을 MongoDB 에 영속화한다.
 * 기존에는 localStorage 에만 있어 로그아웃 시 사라졌으나, 이제 계정에 묶여 유지된다.
 */
@Document(collection = "prn_medication_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrnMedicationRecord {

    @Id
    private String id;

    // 소유자 (MySQL User PK 참조, FK 제약 없이 ID 만 저장)
    private Long userId;

    private String drugName;   // 약 이름
    private String dosage;     // 복용량 (예: "1정", "5ml") — 비어 있을 수 있음
    private String date;       // 복용 날짜 "YYYY-MM-DD"
    private String time;       // 복용 시간 "HH:mm"

    private LocalDateTime createdAt;
}
