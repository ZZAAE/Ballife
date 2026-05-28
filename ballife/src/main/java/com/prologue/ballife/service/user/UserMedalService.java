package com.prologue.ballife.service.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 보유한 메달입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));
        Medal medal = medalRepository.findById(request.getMedalId())
                .orElseThrow(() -> new ResourceNotFoundException("메달", request.getMedalId()));

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
            throw new ResourceNotFoundException("보유 메달", medalId);
        }
        userMedalRepository.deleteById(id);
    }
}
