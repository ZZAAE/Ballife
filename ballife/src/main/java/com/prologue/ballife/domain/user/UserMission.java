package com.prologue.ballife.domain.user;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/**
 * 유저가 미션 보상을 수령한 이력(append-only 로그).
 * 한 미션을 여러 번 수령할 수 있으므로(일일/주간/반복) 수령 1건당 1행으로 기록한다.
 */
@Entity
@Table(name = "USER_MISSION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MISSION_ID")
    private Long userMissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "MISSION_TYPE", nullable = false, length = 40)
    private MissionType missionType;

    // 수령 시점의 보상 포인트 스냅샷
    @Column(name = "REWARD", nullable = false)
    private int reward;

    @Column(name = "CLAIMED_AT", nullable = false)
    private LocalDateTime claimedAt;
}
