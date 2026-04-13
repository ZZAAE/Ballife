package com.prologue.ballife.service.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.DuplicateResourceException;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.user.UserDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 의존성 주입 DI ->멤버변수를 생성자 자동 주입
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 12345 ->

    // ====================
    // 회원가입
    // ====================
    @Transactional
    @NonNull
    public UserDto.UserResponse signup(@NonNull UserDto.SignUpRequest request) {

        // 1.중복체크
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateResourceException("아이디", request.getLoginId());
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new DuplicateResourceException("닉네임", request.getNickname());
        }

        // 2.회원 생성(비밀번호 암호화도 진행)
        User user = User.builder()
                .loginId(request.getLoginId())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .email(request.getEmail())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .weight(request.getWeight())
                .height(request.getHeight())
                .build();

        // 3.저장
        // 오라클에 INSERT INTO
        User savedUser = userRepository.save(user);
        // Entity-> DTO에 넣기 위해서 변환 후 반환
        return UserDto.UserResponse.from(savedUser);

    }

    // ======================
    // 로그인
    // ======================
    public User login(UserDto.LoginRequest request) {
        // 1.사용저 조회(loginid 으로 회원 조회)
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 2.비밀번호 검증(amtches -> 입력한 평문,DB에 암호화된 비밀번호와 비교)
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return user;
    }

    // ======================
    // 회원 조회(ID)
    // ======================
    @NonNull
    public UserDto.UserResponse getUserById(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));
        return UserDto.UserResponse.from(user);
    }

    @NonNull
    public UserDto.UserResponse getUser(@NonNull Long id) {
        return getUserById(id);
    }

    // ======================
    // 회원 조회(사용자명으로)
    // ======================
    public UserDto.UserResponse getUserByLoginId(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다" + loginId));
        return UserDto.UserResponse.from(user);
    }

    // ======================
    // 전체 회원 목록 조회
    // ======================
    public List<UserDto.UserResponse> getAllUser() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserDto.UserResponse::from)
                .collect(Collectors.toList());
    }

    // ======================
    // 회원 정보 수정
    // ======================
    @Transactional
    @NonNull
    public UserDto.UserResponse updateUser(@NonNull Long id, UserDto.UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("회원", id));

        // 이름 변경
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }

        // 닉네임 변경
        if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new DuplicateResourceException("닉네임", request.getNickname());
            }
            user.setNickname(request.getNickname());
        }

        if (request.getBirthDate() != null) {
            user.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getWeight() != null) {
            user.setWeight(request.getWeight());
        }
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        if (request.getDiseaseIndex() != null) {
            user.setDiseaseIndex(request.getDiseaseIndex());
        }

        return UserDto.UserResponse.from(user);

    }

    // ═══════════════════════════════════════════════════════════
    // 회원 삭제
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public void deleteUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("회원", id));
        userRepository.delete(user);
    }

    // ═══════════════════════════════════════════════════════════
    // 사용자명 중복 체크 (회원가입 폼에서 사용)
    // ═══════════════════════════════════════════════════════════

    public boolean isLoginIdAvailable(String loginId) {
        return !userRepository.existsByLoginId(loginId);
    }

    public boolean isNickname(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

}
