package com.prologue.ballife.repository.medicine;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.medicine.UserMedicineRecord;

@Repository
public interface UserMedicineRecordRepository extends JpaRepository<UserMedicineRecord, Long>{

    Optional<UserMedicineRecord> findById(Long userMedicineRecordId);

    /**
     * 특정 유저의 특정 기간(시작~끝, 양 끝 포함) 동안 실제 복용 기록 수.
     * UserMedicineRecord.prescription.user.userId 를 따라가서 매칭한다.
     *
     * Spring Data JPA의 메서드명 규칙으로 자동 쿼리가 생성된다.
     * 예) 2026-05-23 ~ 2026-05-29 사이에 복용된 모든 row 수.
     */
    long countByPrescription_User_UserIdAndIntakeDateBetween(
            Long userId, LocalDate start, LocalDate end);
}