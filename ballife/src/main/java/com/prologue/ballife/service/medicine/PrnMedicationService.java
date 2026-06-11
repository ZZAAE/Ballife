package com.prologue.ballife.service.medicine;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.medicine.PrnMedicationRecord;
import com.prologue.ballife.repository.medicineMongo.PrnMedicationRecordRepository;
import com.prologue.ballife.web.dto.medicine.PrnMedicationDto;

import lombok.RequiredArgsConstructor;

/**
 * 상비약 직접 기록(PRN) 서비스 — MongoDB 영속.
 * (단일 노드 Mongo 는 트랜잭션을 보장하지 않으므로 @Transactional 을 두지 않는다)
 */
@Service
@RequiredArgsConstructor
public class PrnMedicationService {

    private final PrnMedicationRecordRepository repository;

    // 로그인 사용자의 상비약 기록 목록 (최신순)
    public List<PrnMedicationDto.Response> getByUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(PrnMedicationDto.Response::from)
                .collect(Collectors.toList());
    }

    // 상비약 기록 추가
    public PrnMedicationDto.Response create(Long userId, PrnMedicationDto.CreateRequest req) {
        String drugName = req.getDrugName() != null ? req.getDrugName().strip() : "";
        if (drugName.isEmpty()) {
            // 프론트에서 막지만 서버 백스톱
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "drugName is required");
        }
        PrnMedicationRecord saved = repository.save(PrnMedicationRecord.builder()
                .userId(userId)
                .drugName(drugName)
                .dosage(req.getDosage() != null ? req.getDosage().strip() : "")
                .date(req.getDate())
                .time(req.getTime())
                .createdAt(LocalDateTime.now())
                .build());
        return PrnMedicationDto.Response.from(saved);
    }

    // 본인 기록만 삭제 — 없거나 타인 것이면 조용히 무시(멱등)
    public void delete(Long userId, String id) {
        repository.findByIdAndUserId(id, userId).ifPresent(repository::delete);
    }
}
