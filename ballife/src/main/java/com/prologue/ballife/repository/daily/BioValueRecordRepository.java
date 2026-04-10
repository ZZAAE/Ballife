package com.prologue.ballife.repository.daily;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.daily.BioValueRecord;

public interface BioValueRecordRepository extends JpaRepository<BioValueRecord, Long> {

    Optional<BioValueRecord> findByRecordId(Long recordId);
    Optional<BioValueRecord> findByUserId(Long userId);

    boolean existsByRecordId(Long recordId);
    boolean existsByUserId(Long userId);
    
}
