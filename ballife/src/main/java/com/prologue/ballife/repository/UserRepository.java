package com.prologue.ballife.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.user.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByNickname(String nickname);
}
