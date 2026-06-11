package com.prologue.ballife.service.medicine;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicineRecord;
import com.prologue.ballife.domain.medicine.UserMedicineRecord.TakenCategory;
import com.prologue.ballife.repository.medicine.PrescriptionRepository;
import com.prologue.ballife.repository.medicine.UserMedicineRecordRepository;
import com.prologue.ballife.web.dto.medicine.UserMedicineRecordDto;

import lombok.RequiredArgsConstructor;

/**
 * 복약 체크(복용 기록) — 처방전 × 날짜 × 시간대(아침/점심/저녁/취침전) 단위.
 * 프론트의 "복용 일정 체크"가 이 기록으로 DB에 영속화된다(로그아웃해도 유지).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMedicineRecordService {

    private final UserMedicineRecordRepository userMedicineRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    /** 특정 유저가 특정 날짜에 체크한 복용 기록 목록 */
    public List<UserMedicineRecordDto.UserMedicineRecordResponse> getByUserAndDate(Long userId, LocalDate date) {
        return userMedicineRecordRepository
                .findByPrescription_User_UserIdAndIntakeDate(userId, date)
                .stream()
                .map(UserMedicineRecordDto.UserMedicineRecordResponse::from)
                .toList();
    }

    /**
     * 복용 체크 ON — (처방전, 날짜, 시간대) 기록을 생성한다.
     * 본인 처방전인지 검증하고, 같은 체크가 이미 있으면 중복 저장하지 않는다(멱등).
     */
    @Transactional
    public UserMedicineRecordDto.UserMedicineRecordResponse markTaken(
            Long userId, Long prescriptionId, LocalDate intakeDate,
            LocalTime intakeTime, TakenCategory category) {

        Prescription prescription = prescriptionRepository
                .findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("처방전을 찾을 수 없습니다: " + prescriptionId));

        boolean exists = userMedicineRecordRepository
                .existsByPrescription_PrescriptionIdAndIntakeDateAndTakenCategory(prescriptionId, intakeDate, category);
        if (exists) {
            // 이미 체크돼 있으면 기존 기록을 그대로 반환 (중복 row 생성 방지)
            return userMedicineRecordRepository
                    .findByPrescription_User_UserIdAndIntakeDate(userId, intakeDate).stream()
                    .filter(r -> r.getPrescription().getPrescriptionId().equals(prescriptionId)
                            && r.getTakenCategory() == category)
                    .findFirst()
                    .map(UserMedicineRecordDto.UserMedicineRecordResponse::from)
                    .orElse(null);
        }

        UserMedicineRecord record = UserMedicineRecord.builder()
                .prescription(prescription)
                .intakeDate(intakeDate)
                .intakeTime(intakeTime)
                .takenCategory(category)
                .build();

        return UserMedicineRecordDto.UserMedicineRecordResponse.from(
                userMedicineRecordRepository.save(record));
    }

    /**
     * 복용 체크 OFF — (처방전, 날짜, 시간대) 기록을 삭제한다. 본인 처방전인지 검증.
     */
    @Transactional
    public void unmarkTaken(Long userId, Long prescriptionId, LocalDate intakeDate, TakenCategory category) {
        prescriptionRepository
                .findByPrescriptionIdAndUser_UserId(prescriptionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("처방전을 찾을 수 없습니다: " + prescriptionId));

        userMedicineRecordRepository
                .deleteByPrescription_PrescriptionIdAndIntakeDateAndTakenCategory(prescriptionId, intakeDate, category);
    }
}
