package com.prologue.ballife.repository.medicineMongo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.PrnMedicationRecord;

@Repository
public interface PrnMedicationRecordRepository extends MongoRepository<PrnMedicationRecord, String> {

    // 로그인 사용자의 상비약 기록 (최신순)
    List<PrnMedicationRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 본인 소유 확인용 — 삭제 시 ownership 검증
    Optional<PrnMedicationRecord> findByIdAndUserId(String id, Long userId);
}
