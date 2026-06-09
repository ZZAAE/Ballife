package com.prologue.ballife.domain.subscription;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * 가족 그룹 — FAMILY 플랜 구독자(owner)가 소유한다.
 * 초대 코드로 다른 사용자가 합류한다. 오너가 구독을 해지하면 isActive=false 로 동결.
 */
@Entity
@Table(name = "FAMILY_GROUP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FAMILY_GROUP_ID")
    private Long familyGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OWNER_ID", nullable = false)
    private User owner;

    @Column(name = "INVITE_CODE", unique = true, nullable = false, length = 12)
    private String inviteCode;

    @Column(name = "NAME", length = 50)
    private String name;

    @Column(name = "IS_ACTIVE", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void rotateInviteCode(String newCode) {
        this.inviteCode = newCode;
    }

    public void freeze() {
        this.isActive = false;
    }

    public void reactivate() {
        this.isActive = true;
    }
}
