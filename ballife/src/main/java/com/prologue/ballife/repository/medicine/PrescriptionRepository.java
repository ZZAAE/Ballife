package com.prologue.ballife.repository.medicine;

import java.util.List;
import java.util.Optional;


import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByUser_UserIdAndIsDeletedFalse(Long userId); //user가 가지고 있는 모든 처방전

    Optional<Prescription> findByPrescriptionIdAndUser_UserId(Long prescriptionId, Long userId); // 처방전 하나 조회

    Page<Prescription> findByUser_UserIdAndIsDeletedFalse(Long userId, Pageable pageable); //메모 가져오려고

    
}
