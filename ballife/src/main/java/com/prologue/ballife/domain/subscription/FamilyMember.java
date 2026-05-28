package com.prologue.ballife.domain.subscription;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * 가족 그룹 구성원 + 항목별 공유 동의.
 * USER_ID 유니크 제약으로 한 사용자는 최대 한 그룹에만 속한다.
 * shareMedication/shareExercise 는 미래 호환용 플래그(이번 단계 실제 데이터 미연동).
 */
@Entity
@Table(name = "FAMILY_MEMBER", uniqueConstraints = @UniqueConstraint(name = "UK_FAMILY_MEMBER_USER", columnNames = {
        "USER_ID" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FAMILY_MEMBER_ID")
    private Long familyMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FAMILY_GROUP_ID", nullable = false)
    private FamilyGroup familyGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 10)
    private FamilyRole role;

    @Column(name = "SHARE_BLOOD_SUGAR", nullable = false)
    @Builder.Default
    private Boolean shareBloodSugar = false;

    @Column(name = "SHARE_BLOOD_PRESSURE", nullable = false)
    @Builder.Default
    private Boolean shareBloodPressure = false;

    // 미래 호환용 — 이번 단계 미연동 (복약/운동은 아직 백엔드 데이터 없음)
    @Column(name = "SHARE_MEDICATION", nullable = false)
    @Builder.Default
    private Boolean shareMedication = false;

    @Column(name = "SHARE_EXERCISE", nullable = false)
    @Builder.Default
    private Boolean shareExercise = false;

    @Column(name = "JOINED_AT", nullable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
