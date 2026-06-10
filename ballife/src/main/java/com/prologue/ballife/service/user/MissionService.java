package com.prologue.ballife.service.user;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.user.MissionType;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.domain.user.UserMission;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.user.UserMissionRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.user.MissionDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MissionService {

    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;
    private final MissionVerifier missionVerifier;
    private final MessageResolver messages;

    // 미션 현황 + 보유 포인트 조회
    public MissionDto.Overview getOverview(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));

        List<UserMission> claims = userMissionRepository.findByUser_UserId(userId);
        LocalDate today = LocalDate.now();

        List<MissionDto.Status> statuses = new ArrayList<>();
        for (MissionType type : MissionType.values()) {
            statuses.add(buildStatus(type, userId, claims, today));
        }

        return MissionDto.Overview.builder()
                .point(user.getPoint() != null ? user.getPoint() : 0L)
                .missions(statuses)
                .build();
    }

    // 보상 수령 + 포인트 지급
    @Transactional
    public MissionDto.ClaimResult claim(Long userId, MissionType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));

        List<UserMission> claimsOfType = userMissionRepository.findByUser_UserId(userId).stream()
                .filter(m -> m.getMissionType() == type)
                .collect(java.util.stream.Collectors.toList());

        LocalDate today = LocalDate.now();

        // 1) 주기 제한: 이미 받았거나 한도를 초과했는지
        if (!isClaimable(type, claimsOfType, today)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, messages.get("business.mission.alreadyClaimedOrLimitExceeded"));
        }
        // 2) 실제 행동 달성: 정말로 그 행동을 수행했는지
        if (!missionVerifier.isAchieved(userId, type, today, claimsOfType.size())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, messages.get("business.mission.conditionNotMet"));
        }

        UserMission claim = UserMission.builder()
                .user(user)
                .missionType(type)
                .reward(type.getReward())
                .claimedAt(LocalDateTime.now())
                .build();
        userMissionRepository.save(claim);

        long reward = type.getReward();
        long newPoint = (user.getPoint() != null ? user.getPoint() : 0L) + reward;
        long newCount = (user.getUsePointCount() != null ? user.getUsePointCount() : 0L) + reward;
        // 보유 포인트와 누적 포인트를 동일 양만큼 증가 (UserService.addPoint 와 동일 규칙)
        user.setPoint(newPoint);
        user.setUsePointCount(newCount);
        userRepository.save(user);

        claimsOfType.add(claim);

        return MissionDto.ClaimResult.builder()
                .point(newPoint)
                .reward(type.getReward())
                .mission(buildStatus(type, userId, claimsOfType, today))
                .build();
    }

    // 특정 미션의 현황 DTO 생성 (claims 는 전체/특정타입 어느 쪽이 와도 내부에서 타입 필터링)
    private MissionDto.Status buildStatus(MissionType type, Long userId, List<UserMission> claims, LocalDate today) {
        List<UserMission> ofType = claims.stream()
                .filter(m -> m.getMissionType() == type)
                .collect(java.util.stream.Collectors.toList());

        LocalDateTime lastAt = ofType.stream()
                .map(UserMission::getClaimedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);

        boolean periodOk = isClaimable(type, ofType, today);
        boolean achieved = missionVerifier.isAchieved(userId, type, today, ofType.size());

        return MissionDto.Status.builder()
                .code(type.name())
                .title(type.getTitle())
                .reward(type.getReward())
                .period(type.getPeriod().name())
                .claimable(periodOk && achieved)
                .achieved(achieved)
                .claimedCount(ofType.size())
                .maxClaims(type.getMaxClaims())
                .lastClaimedAt(lastAt)
                .build();
    }

    // 주기 기준으로 지금 수령 가능한지 검증
    private boolean isClaimable(MissionType type, List<UserMission> claimsOfType, LocalDate today) {
        return switch (type.getPeriod()) {
            case ONCE -> claimsOfType.isEmpty();
            case REPEATABLE -> claimsOfType.size() < type.getMaxClaims();
            case DAILY -> claimsOfType.stream()
                    .noneMatch(m -> m.getClaimedAt().toLocalDate().isEqual(today));
            case WEEKLY -> {
                LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                yield claimsOfType.stream()
                        .noneMatch(m -> !m.getClaimedAt().toLocalDate().isBefore(weekStart));
            }
            case MONTHLY -> claimsOfType.stream()
                    .noneMatch(m -> m.getClaimedAt().getYear() == today.getYear()
                            && m.getClaimedAt().getMonthValue() == today.getMonthValue());
        };
    }
}
