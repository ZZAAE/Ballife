package com.prologue.ballife.repository.daily;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prologue.ballife.domain.daily.BioValueRecord;
import com.prologue.ballife.domain.user.User;

public interface BioValueRecordRepository extends JpaRepository<BioValueRecord, Long> {


    Optional<BioValueRecord> findByRecordId(Long recordId);
    Optional<BioValueRecord> findByUser(User user);

    
    Optional<BioValueRecord> findByUserWithBloodsugar(User user);

    boolean existsByRecordId(Long recordId);
    boolean existsByUser(User user);

    //특정 유저의 특정 카테코리의 특정 날짜의 존재하는 기록정보가 있는지 반환
    boolean existsByUserAndCategoryAndRecordDate(User user, String category, LocalDate date);
    
    //특정 유저의 특정 카테고리의 특정 날짜에 존재하는 기록정보를 모두 불러옴
    List<BioValueRecord> findByUserAndCategoryAndRecordDate(User user, String category, LocalDate date);
    //특정 유저의 특정 카테고리의  특정 기간에 존재하는 기록정보를 모두 불러옴
    List<BioValueRecord> findByUserAndCategoryAndRecordDateBetween(User user, String category, LocalDate recordDateStart, LocalDate recordDateEnd);
    //특정 유저의 정보를 모두 불러옴
    List<BioValueRecord> findAllByUser(User user);

    //최신 혈당 정보를 단건으로 불러옴
    @Query("SELECT b FROM BioValueRecord b WHERE b.user = :user "
           + "AND b.bloodSugar IS NOT NULL "
           + "ORDER BY b.recordDate DESC, b.recordTime DESC LIMIT 1")
    Optional<BioValueRecord> findLastBloodSugarRecordByUser(@Param("user") User user);

    //최신 혈압 정보를 단건으로 불러옴
    @Query("SELECT b FROM BioValueRecord b WHERE b.user = :user "
           + "AND b.systolicBP IS NOT NULL "
           + "ORDER BY b.recordDate DESC, b.recordTime DESC LIMIT 1")
    Optional<BioValueRecord> findLastSystolicBPRecordByUser(@Param("user") User user);

    //최신 몸무게 정보를 단건으로 불러옴
    @Query("SELECT b FROM BioValueRecord b WHERE b.user = :user "
           + "AND b.weight IS NOT NULL "
           + "ORDER BY b.recordDate DESC, b.recordTime DESC LIMIT 1")
    Optional<BioValueRecord> findLastWeightRecordByUser(@Param("user") User user);

    //최신 수분섭취량 정보를 단건으로 불러옴
    @Query("SELECT b FROM BioValueRecord b WHERE b.user = :user "
           + "AND b.waterIntakeCup IS NOT NULL "
           + "ORDER BY b.recordDate DESC, b.recordTime DESC LIMIT 1")
    Optional<BioValueRecord> findLastWaterIntakeCupRecordByUser(@Param("user") User user);

    //카테고리별로 Page로 불러옴
    Page<BioValueRecord> findByUserAndCategory(User user, String category, Pageable pageable);
}
