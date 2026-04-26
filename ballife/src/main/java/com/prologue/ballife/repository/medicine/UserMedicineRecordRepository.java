package com.prologue.ballife.repository.medicine;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.UserMedicineRecord;

@Repository
public interface UserMedicineRecordRepository extends JpaRepository<UserMedicineRecord, Long>{
    
    Optional<UserMedicineRecord> findById(Long userMedicineRecordId);
}
