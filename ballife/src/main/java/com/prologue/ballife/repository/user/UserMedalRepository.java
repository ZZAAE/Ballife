package com.prologue.ballife.repository.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.user.UserMedal;
import com.prologue.ballife.domain.user.UserMedal.UserMedalId;

@Repository
public interface UserMedalRepository extends JpaRepository<UserMedal, UserMedalId> {

    // 특정 유저의 보유 메달 전체 조회
    List<UserMedal> findByUser_UserId(Long userId);

    // 특정 유저가 특정 메달을 보유 중인지 확인
    boolean existsByUser_UserIdAndMedal_MedalId(Long userId, Long medalId);
}
