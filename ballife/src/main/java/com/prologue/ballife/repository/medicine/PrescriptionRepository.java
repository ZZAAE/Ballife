package com.prologue.ballife.repository.medicine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long>{
    
}
