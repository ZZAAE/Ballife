package com.prologue.ballife.domain.subscription;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * 사용자 구독 — 모의 결제로 활성화된다.
 * "사용자당 ACTIVE 1개" 는 서비스에서 보장(활성화 시 기존 ACTIVE 를 비활성 처리).
 */
@Entity
@Table(name = "USER_SUBSCRIPTION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUBSCRIPTION_ID")
    private Long subscriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "PLAN", nullable = false, length = 20)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "STARTED_AT", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "CANCELED_AT")
    private LocalDateTime canceledAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 현재 유효한 구독인지: 상태 ACTIVE 이고 만료 전 */
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE
                && expiresAt != null
                && expiresAt.isAfter(LocalDateTime.now());
    }

    public void cancel() {
        this.status = SubscriptionStatus.CANCELED;
        this.canceledAt = LocalDateTime.now();
    }

    public void deactivate(SubscriptionStatus newStatus) {
        this.status = newStatus;
    }
}
