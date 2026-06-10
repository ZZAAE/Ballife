package com.prologue.ballife.service.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.user.Medal;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.domain.user.UserMedal;
import com.prologue.ballife.domain.user.UserMedal.UserMedalId;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.user.MedalRepository;
import com.prologue.ballife.repository.user.UserMedalRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.user.UserMedalDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMedalService {

    private final UserMedalRepository userMedalRepository;
    private final UserRepository userRepository;
    private final MedalRepository medalRepository;
    private final MessageResolver messages;

    // 유저 보유 메달 전체 조회
    public List<UserMedalDto.Response> getUserMedals(Long userId) {
        return userMedalRepository.findByUser_UserId(userId).stream()
                .map(UserMedalDto.Response::from)
                .collect(Collectors.toList());
    }

    // 메달 획득
    @Transactional
    public UserMedalDto.Response acquireMedal(Long userId, UserMedalDto.AcquireRequest request) {
        if (userMedalRepository.existsByUser_UserIdAndMedal_MedalId(userId, request.getMedalId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, messages.get("business.userMedal.alreadyOwned"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));
        Medal medal = medalRepository.findById(request.getMedalId())
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.medal"), request.getMedalId())));

        UserMedal userMedal = UserMedal.builder()
                .id(new UserMedalId(userId, medal.getMedalId()))
                .user(user)
                .medal(medal)
                .medalAt(LocalDateTime.now())
                .build();

        return UserMedalDto.Response.from(userMedalRepository.save(userMedal));
    }

    // 메달 삭제 (보유 해제)
    @Transactional
    public void removeUserMedal(Long userId, Long medalId) {
        UserMedalId id = new UserMedalId(userId, medalId);
        if (!userMedalRepository.existsById(id)) {
            throw new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.userMedal"), medalId));
        }
        userMedalRepository.deleteById(id);
    }

    /**
     * 누적 포인트 기준으로 달성 조건(medalPrice)을 충족한 메달을 자동 지급합니다.
     * 포인트 증가 로직이 구현된 후 해당 시점에 호출하거나,
     * POST /api/users/medals/check 엔드포인트로 수동 트리거할 수 있습니다.
     *
     * @return 새로 획득된 메달 목록 (이미 보유 중인 메달은 제외)
     */
    @Transactional
    public List<UserMedalDto.Response> checkAndGrantMedals(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));

        long currentPoint = user.getPoint() != null ? user.getPoint() : 0L;

        List<Medal> allMedals = medalRepository.findAllByOrderByMedalPriceAsc();
        List<UserMedalDto.Response> granted = new ArrayList<>();

        for (Medal medal : allMedals) {
            long required = medal.getMedalPrice() != null ? medal.getMedalPrice() : Long.MAX_VALUE;
            if (currentPoint >= required
                    && !userMedalRepository.existsByUser_UserIdAndMedal_MedalId(userId, medal.getMedalId())) {
                UserMedal userMedal = UserMedal.builder()
                        .id(new UserMedalId(userId, medal.getMedalId()))
                        .user(user)
                        .medal(medal)
                        .medalAt(LocalDateTime.now())
                        .build();
                granted.add(UserMedalDto.Response.from(userMedalRepository.save(userMedal)));
            }
        }

        return granted;
    }

    // 메달 장착 (유저 대표 메달 설정)
    @Transactional
    public void equipMedal(Long userId, Long medalId) {
        if (!userMedalRepository.existsByUser_UserIdAndMedal_MedalId(userId, medalId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.userMedal.notOwned"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));
        Medal medal = medalRepository.findById(medalId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.medal"), medalId)));
        user.setMedal(medal);
        userRepository.save(user);
    }
}
