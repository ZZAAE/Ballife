package com.prologue.ballife.service.subscription;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.subscription.SubscriptionPlan;
import com.prologue.ballife.domain.subscription.SubscriptionStatus;
import com.prologue.ballife.domain.subscription.UserSubscription;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.subscription.UserSubscriptionRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.subscription.SubscriptionDto;

import lombok.RequiredArgsConstructor;

/**
 * 구독 상태 조회 / 모의 결제 활성화 / 해지.
 * activate(...) 가 실제 PG 로 교체될 진입점(현재는 결제 없이 즉시 활성화).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;
    private final FamilyService familyService;

    public SubscriptionDto.StatusResponse getStatus(Long userId) {
        boolean familyMemberAccess = familyService.isInActiveGroup(userId);

        UserSubscription active = userSubscriptionRepository
                .findFirstByUser_UserIdAndStatusOrderByStartedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .filter(UserSubscription::isActive)
                .orElse(null);

        if (active == null) {
            return SubscriptionDto.StatusResponse.builder()
                    .plan(SubscriptionPlan.NONE)
                    .planName(SubscriptionPlan.NONE.getDisplayName())
                    .monthlyPrice(0)
                    .status(null)
                    .active(false)
                    .reportAccess(false)
                    .familyAccess(familyMemberAccess)
                    .build();
        }

        SubscriptionPlan plan = active.getPlan();
        return SubscriptionDto.StatusResponse.builder()
                .plan(plan)
                .planName(plan.getDisplayName())
                .monthlyPrice(plan.getMonthlyPrice())
                .status(active.getStatus())
                .startedAt(active.getStartedAt())
                .expiresAt(active.getExpiresAt())
                .active(true)
                .reportAccess(plan.grantsReport())
                .familyAccess(plan.grantsFamily() || familyMemberAccess)
                .build();
    }

    /**
     * 모의 결제 → 즉시 활성화. 기존 ACTIVE 구독은 비활성 처리해 사용자당 ACTIVE 1개 유지.
     * FAMILY 면 가족 그룹을 보장(없으면 생성, 동결돼 있으면 재활성화).
     */
    @Transactional
    public SubscriptionDto.StatusResponse activate(Long userId, SubscriptionPlan plan) {
        if (plan == null || plan == SubscriptionPlan.NONE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효한 플랜을 선택해주세요.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        List<UserSubscription> currentActives =
                userSubscriptionRepository.findByUser_UserIdAndStatus(userId, SubscriptionStatus.ACTIVE);
        for (UserSubscription s : currentActives) {
            s.deactivate(SubscriptionStatus.CANCELED);
        }

        LocalDateTime now = LocalDateTime.now();
        userSubscriptionRepository.save(UserSubscription.builder()
                .user(user)
                .plan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(now)
                .expiresAt(now.plusMonths(1)) // 모의: 1개월
                .build());

        if (plan == SubscriptionPlan.FAMILY) {
            familyService.ensureGroupForOwner(user);
        } else {
            // 개인 플랜 등 비-가족 플랜으로 전환 시 소유 그룹을 동결한다.
            // → groupActive=false 가 되어 가족 건강 정보가 모두 비공개로 가려진다.
            //   (소유 그룹이 없으면 무시된다.)
            familyService.freezeOwnerGroup(userId);
        }

        return getStatus(userId);
    }

    /** 구독 해지. FAMILY 였으면 소유 그룹을 동결한다. */
    @Transactional
    public SubscriptionDto.StatusResponse cancel(Long userId) {
        UserSubscription active = userSubscriptionRepository
                .findFirstByUser_UserIdAndStatusOrderByStartedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .filter(UserSubscription::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "활성 구독이 없습니다."));

        boolean wasFamily = active.getPlan() == SubscriptionPlan.FAMILY;
        active.cancel();
        if (wasFamily) {
            familyService.freezeOwnerGroup(userId);
        }
        return getStatus(userId);
    }
}
