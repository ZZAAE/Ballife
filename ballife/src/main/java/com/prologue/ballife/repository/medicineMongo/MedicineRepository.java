package com.prologue.ballife.repository.medicineMongo;

import com.prologue.ballife.domain.medicine.Medicine;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface MedicineRepository extends MongoRepository<Medicine, String> {
    Optional<Medicine> findByItemName(String name);
    Optional<Medicine> findByItemSeq(String seq);
}
