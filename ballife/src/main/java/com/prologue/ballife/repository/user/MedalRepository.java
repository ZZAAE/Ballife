package com.prologue.ballife.repository.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.user.Medal;

@Repository
public interface MedalRepository extends JpaRepository<Medal, Long> {

    // 메달 이름으로 존재 여부 확인
    boolean existsByMedalName(String medalName);

    // 전체 메달 목록 (가격순 정렬)
    List<Medal> findAllByOrderByMedalPriceAsc();
}
