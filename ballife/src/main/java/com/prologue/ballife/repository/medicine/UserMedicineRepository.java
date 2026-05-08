package com.prologue.ballife.repository.medicine;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.UserMedicine;

@Repository
public interface UserMedicineRepository extends JpaRepository<UserMedicine, Long>{

    List<UserMedicine> findByPrescription_PrescriptionId(Long prescriptionId);

    Optional<UserMedicine> findByUserMedicineIdAndPrescription_PrescriptionId(Long userMedicineId, Long prescriptionId);

    void deleteByPrescription_PrescriptionId(Long prescriptionId);
    
}
