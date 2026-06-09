package com.prologue.ballife.service.medicine;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.Prescription.Pcategory;
import com.prologue.ballife.domain.medicine.UserMedicine;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.repository.medicine.PrescriptionRepository;
import com.prologue.ballife.repository.medicine.UserMedicineRepository;
import com.prologue.ballife.repository.user.UserRepository;
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
    private final UserRepository userRepository;
    private final MessageResolver messages;

    // 처방전+약 등록
    @Transactional
    public PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse postMedicine(
            Long userId,
            PrescriptionAndMedicineDto.CreateRequest request) {
        
        User user = userRepository.getReferenceById(userId);
        Prescription prescription = Prescription.builder()
                .user(user)
                .prescriptionName(request.getPrescriptionName())
                .prescriptionDate(
                    request.getPrescriptionDate() != null ? request.getPrescriptionDate() : LocalDate.now()
                ) //임시로 현재 날짜 등록
                .pCategory(Pcategory.MEDICINE)
                .memo(request.getMemo())
                .intakeIntervals(request.getIntakeIntervals())
                .dosage(request.getDosage())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<UserMedicine> savedList = new ArrayList<>();

        for (UserMedicineDto.CreateRequest u : request.getMedicines()) {

            UserMedicine userMedicine = UserMedicine.builder()
                    .prescription(savedPrescription) // FK 연결
                    .medicineName(u.getMedicineName())
                    .supplementId(u.getSupplementId())
                    .build();

            savedList.add(userMedicineRepository.save(userMedicine));
        }

        return PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse.from(savedPrescription, savedList);

    }

    // 처방전+약 전체 수정 (처방전 정보 갱신 + 약 목록 통째로 교체)
    @Transactional
    public PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse updateMedicine(
            Long userId,
            Long prescriptionId,
            PrescriptionAndMedicineDto.CreateRequest request) {

        Prescription prescription = prescriptionRepository
                .findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.prescriptionNotFound")));

        // 1. 처방전 정보 갱신
        prescription.setPrescriptionName(request.getPrescriptionName());
        if (request.getPrescriptionDate() != null) {
            prescription.setPrescriptionDate(request.getPrescriptionDate());
        }
        prescription.setMemo(request.getMemo());
        prescription.setIntakeIntervals(request.getIntakeIntervals());
        prescription.setDosage(request.getDosage());

        // 2. 기존 약 목록 제거 후 새 목록으로 교체
        userMedicineRepository.deleteByPrescription_PrescriptionId(prescriptionId);

        List<UserMedicine> savedList = new ArrayList<>();
        if (request.getMedicines() != null) {
            for (UserMedicineDto.CreateRequest u : request.getMedicines()) {
                UserMedicine userMedicine = UserMedicine.builder()
                        .prescription(prescription) // FK 연결
                        .medicineName(u.getMedicineName())
                        .supplementId(u.getSupplementId())
                        .build();
                savedList.add(userMedicineRepository.save(userMedicine));
            }
        }

        return PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse.from(prescription, savedList);
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
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.prescriptionNotFound")));

        res.setPrescriptionName(request.getPrescriptionName());
        res.setPrescriptionDate(request.getPrescriptionDate());
        res.setMemo(request.getMemo());
        res.setIntakeIntervals(request.getIntakeIntervals());
        res.setDosage(request.getDosage());

        return PrescriptionDto.PrescriptionResponse.from(res);
    }

    // 약 목록 수정
    @Transactional
    public UserMedicineDto.UserMedicineResponse putMedicine(Long userMedicineId, Long prescriptionId,
            UserMedicineDto.UpdateRequest request) {

        UserMedicine res = userMedicineRepository
                .findByUserMedicineIdAndPrescription_PrescriptionId(userMedicineId, prescriptionId)
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.medicineNotFound")));

        Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.prescriptionNotFound")));

        res.setPrescription(prescription);
        res.setMedicineName(request.getMedicineName());
        res.setSupplementId(request.getSupplementId());

        return UserMedicineDto.UserMedicineResponse.from(res);
    }

    // 처방전 삭제 //임시로 받음 userId (소프트 삭제 구현)
    @Transactional
    public void deletePrescription(Long userId, Long prescriptionId) {
        // 1. 처방전 조회 (권한 체크)
        Prescription res = prescriptionRepository
                .findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.prescriptionNotFound")));

        // 2. 약 목록 물리 삭제
        userMedicineRepository.deleteByPrescription_PrescriptionId(prescriptionId);

        // 3. 처방전 소프트 삭제
        if (res.isDeleted()) {
            throw new RuntimeException(messages.get("business.medicine.alreadyDeleted"));
        }

        res.setDeleted(true);
        res.setDeletedAt(LocalDateTime.now());

    }

    // 약 목록 삭제 (소프트 삭제 구현)
    @Transactional
    public void deleteUserMedicine(Long userMedicineId, Long prescriptionId) {
        UserMedicine res = userMedicineRepository
                .findByUserMedicineIdAndPrescription_PrescriptionId(userMedicineId, prescriptionId)
                .orElseThrow(() -> new RuntimeException(messages.get("business.medicine.medicineNotFound")));

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
