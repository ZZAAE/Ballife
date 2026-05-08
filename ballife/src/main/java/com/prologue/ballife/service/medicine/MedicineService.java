package com.prologue.ballife.service.medicine;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicine;
import com.prologue.ballife.repository.medicine.PrescriptionRepository;
import com.prologue.ballife.repository.medicine.UserMedicineRepository;
import com.prologue.ballife.web.dto.medicine.PrescriptionAndMedicineDto;
import com.prologue.ballife.web.dto.medicine.PrescriptionDto;
import com.prologue.ballife.web.dto.medicine.UserMedicineDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicineService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserMedicineRepository userMedicineRepository;

    // 처방전+약 등록
    @Transactional
    public PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse postMedicine(
            PrescriptionAndMedicineDto.CreateRequest request) {

        Prescription prescription = Prescription.builder()
                .prescriptionName(request.getPrescriptionName())
                .prescriptionDate(request.getPrescriptionDate())
                .memo(request.getMemo())
                .intakeIntervals(request.getIntakeIntervals())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<UserMedicine> savedList = new ArrayList<>();

        for (UserMedicineDto.CreateRequest u : request.getMedicines()) {

            UserMedicine userMedicine = UserMedicine.builder()
                    .prescription(savedPrescription) // FK 연결
                    .kdCode(u.getKdCode())
                    .supplementId(u.getSupplementId())
                    .build();

            savedList.add(userMedicineRepository.save(userMedicine));
        }

        return PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse.from(savedPrescription, savedList);

    }

    // 처방전 조회 //임시로 받음 userId
    public List<PrescriptionDto.PrescriptionResponse> getPrescription(Long userId) {

        List<Prescription> list = prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId);

        return list.stream()
                .map(PrescriptionDto.PrescriptionResponse::from)
                .toList();
    }

    // 처방전에 따른 약 목록 조회
    public List<UserMedicineDto.UserMedicineResponse> getUserMedicine(Long prescriptionId) {

        List<UserMedicine> list = userMedicineRepository.findByPrescription_PrescriptionId(prescriptionId);

        return list.stream()
                .map(UserMedicineDto.UserMedicineResponse::from)
                .toList();
    }

    // 처방전 수정 //임시로 받음 userId
    @Transactional
    public PrescriptionDto.PrescriptionResponse putPrescription(Long userId, Long prescriptionId,
            PrescriptionDto.UpdateRequest request) {

        Prescription res = prescriptionRepository.findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new RuntimeException("처방전 없음"));

        res.setPrescriptionName(request.getPrescriptionName());
        res.setPrescriptionDate(request.getPrescriptionDate());
        res.setMemo(request.getMemo());
        res.setIntakeIntervals(request.getIntakeIntervals());

        return PrescriptionDto.PrescriptionResponse.from(res);
    }

    // 약 목록 수정
    @Transactional
    public UserMedicineDto.UserMedicineResponse putMedicine(Long userMedicineId, Long prescriptionId,
            UserMedicineDto.UpdateRequest request) {

        UserMedicine res = userMedicineRepository
                .findByUserMedicineIdAndPrescription_PrescriptionId(userMedicineId, prescriptionId)
                .orElseThrow(() -> new RuntimeException("약 없음"));

        Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                .orElseThrow(() -> new RuntimeException("처방전 없음"));

        res.setPrescription(prescription);
        res.setKdCode(request.getKdCode());
        res.setSupplementId(request.getSupplementId());

        return UserMedicineDto.UserMedicineResponse.from(res);
    }

    // 처방전 삭제 //임시로 받음 userId (소프트 삭제 구현)
    @Transactional
    public void deletePrescription(Long userId, Long prescriptionId) {
        // 1. 처방전 조회 (권한 체크)
        Prescription res = prescriptionRepository
                .findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new RuntimeException("처방전 없음"));

        // 2. 약 목록 물리 삭제
        userMedicineRepository.deleteByPrescription_PrescriptionId(prescriptionId);

        // 3. 처방전 소프트 삭제
        if (res.isDeleted()) {
            throw new RuntimeException("이미 삭제된 처방전");
        }

        res.setDeleted(true);
        res.setDeletedAt(LocalDateTime.now());

    }

    // 약 목록 삭제 (소프트 삭제 구현)
    @Transactional
    public void deleteUserMedicine(Long userMedicineId, Long prescriptionId) {
        UserMedicine res = userMedicineRepository
                .findByUserMedicineIdAndPrescription_PrescriptionId(userMedicineId, prescriptionId)
                .orElseThrow(() -> new RuntimeException("약 없음"));

        userMedicineRepository.delete(res);

    }

    // 메모 조회
    public Page<PrescriptionDto.PrescriptionMemoResponse> getMemo(Long userId, Pageable pageable) {

        Page<PrescriptionDto.PrescriptionMemoResponse> res =
        prescriptionRepository
            .findByUser_UserIdAndIsDeletedFalse(userId, pageable)
            .map(PrescriptionDto.PrescriptionMemoResponse::from);
        
        return res;
    }

   

}
