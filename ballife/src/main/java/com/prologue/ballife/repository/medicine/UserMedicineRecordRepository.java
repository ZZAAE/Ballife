package com.prologue.ballife.repository.medicine;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * 특정 유저의 특정 기간 동안 복용 기록이 존재한 distinct 날짜 수.
     *
     * 보고서 "복약 기록률" 분자로 사용한다.
     * 예) 기간 30일 중 25일에 복용 기록이 있으면 25 반환 → rate = 25/30.
     *
     * 하루에 여러 번 복용해도 1일로 카운트되는 점이
     * {@link #countByPrescription_User_UserIdAndIntakeDateBetween}과의 차이.
     */
    @Query("SELECT COUNT(DISTINCT r.intakeDate) FROM UserMedicineRecord r "
         + "WHERE r.prescription.user.userId = :userId "
         + "AND r.intakeDate BETWEEN :start AND :end")
    long countDistinctIntakeDates(@Param("userId") Long userId,
                                  @Param("start") LocalDate start,
                                  @Param("end") LocalDate end);
}