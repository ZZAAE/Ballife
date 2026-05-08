package com.prologue.ballife.repository.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.user.UserConfig;

public interface UserConfigRepository extends JpaRepository<UserConfig, Long>{
    Optional<UserConfig> findByUser_UserId(Long userId);
    
}
