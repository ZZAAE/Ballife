package com.prologue.ballife.service.medicine;

import java.util.ArrayList;
import java.util.List;

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

    //처방전 조회 //userId 일단 지움 JWT
    public List<PrescriptionDto.PrescriptionResponse> getPrescription(){
        //레포 조회
        return 
    }

    //처방전에 따른 약 목록 조회
    public List<UserMedicineDto.UserMedicineResponse> getUserMedicine(Long prescriptionId){
        //유저 처방전 조회
        //처방전 처방전 식별자 조인
        return 
    }

    //처방전 수정 //userId 일단 지움 JWT
    public PrescriptionDto.PrescriptionResponse putPrescription(Long prescriptionId, PrescriptionDto.UpdateRequest request){
        //레포
        return PrescriptionDto.PrescriptionResponse.from(null);
    }

    //약 목록 수정
    public UserMedicineDto.UserMedicineResponse putMedicine(Long UserMedicineId, Long prescriptionId, UserMedicineDto.UpdateRequest request){
        //레포
        return UserMedicineDto.UserMedicineResponse.from(null);
    }

    //처방전 삭제 //userId 일단 지움 JWT
    public void deletePrescription(Long prescriptionId){

    }

    //약 목록 삭제
    public void deleteUserMedicine(Long UserMedicineId, Long prescriptionId){

    }

    //복용 이행률 계산
    public Long DosageSituation(){
        //멀 가져와야?
    }

    //메모 조회
    


}
