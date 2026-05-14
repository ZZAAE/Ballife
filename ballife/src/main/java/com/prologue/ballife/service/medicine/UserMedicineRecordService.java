package com.prologue.ballife.service.medicine;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.medicine.UserMedicineRecord;
import com.prologue.ballife.repository.medicine.UserMedicineRecordRepository;
import com.prologue.ballife.web.dto.medicine.UserMedicineRecordDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMedicineRecordService {
    
    private final UserMedicineRecordRepository userMedicineRecordRepository;

    //기록 생성
    @Transactional
    public UserMedicineRecordDto.UserMedicineRecordResponse postRecord(UserMedicineRecordDto.CreateRequest request){

        UserMedicineRecord userMedicineRecord = UserMedicineRecord.builder()
        //.prescription(request.getPrecriptionId())
        .intakeDate(request.getIntakeDate())
        .intakeTime(request.getIntakeTime())
        .supplementId(request.getSupplementId())
        .takenCategory(request.getTakenCategory())
        .build();

        UserMedicineRecord saveUserMedicineRecord = userMedicineRecordRepository.save(userMedicineRecord);
        return UserMedicineRecordDto.UserMedicineRecordResponse.from(saveUserMedicineRecord);
    }

    //기록 수정
    @Transactional
    public UserMedicineRecordDto.UserMedicineRecordResponse putRecord(Long userMedicineRecordId, UserMedicineRecordDto.UpdateRequest req){

        UserMedicineRecord res = userMedicineRecordRepository
            .findById(userMedicineRecordId)
            .orElseThrow(() -> new RuntimeException("기록 없음"));

        res.setSupplementId(req.getSupplementId());
        res.setIntakeDate(req.getIntakeDate());
        res.setIntakeTime(req.getIntakeTime());

        return UserMedicineRecordDto.UserMedicineRecordResponse.from(res);
    }

    //기록 삭제
    @Transactional
    public void deleteRecord(Long userMedicineRecordId){
        UserMedicineRecord record = userMedicineRecordRepository
            .findById(userMedicineRecordId)
            .orElseThrow(() -> new RuntimeException("기록 없음"));
        
        userMedicineRecordRepository.delete(record);
    }

    // 일주일 단위 아점저 약 복용 (이행률 계산)

}
