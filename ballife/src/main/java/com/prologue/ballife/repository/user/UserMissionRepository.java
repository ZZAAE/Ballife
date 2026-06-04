package com.prologue.ballife.repository.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.user.UserMission;

public interface UserMissionRepository extends JpaRepository<UserMission, Long> {

    // 유저의 모든 미션 수령 이력 (현황 계산 및 주기 검증에 사용)
    List<UserMission> findByUser_UserId(Long userId);
}
