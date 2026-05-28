package com.prologue.ballife.repository.subscription;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.subscription.SubscriptionStatus;
import com.prologue.ballife.domain.subscription.UserSubscription;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    // 사용자의 가장 최근 특정 상태 구독 1건 (보통 ACTIVE 조회)
    Optional<UserSubscription> findFirstByUser_UserIdAndStatusOrderByStartedAtDesc(Long userId,
            SubscriptionStatus status);

    // 사용자의 특정 상태 구독 전부 (활성화 시 기존 ACTIVE 비활성 처리에 사용)
    List<UserSubscription> findByUser_UserIdAndStatus(Long userId, SubscriptionStatus status);
}
