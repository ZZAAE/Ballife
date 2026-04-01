package com.prologue.ballife.repository;

import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.sql.Date;
import java.util.Optional;

// Repository - DB접근 전용
// JpaRepository를 상속 받겠다는 의미(이미 DB 작업에 필요한 기능들이 있음)
// extends - JpaRepository에 있는 기능을 UserRepository 가 그대로 물려받게 하는것
public interface UserRepository extends JpaRepository<User, Long> {
   
    // userRepository - DB를 조회하는는 저장소 객체(User(엔티티) 테이블에 접근해서 데이터를 찾음)
    // Optional<User> - User 테이블에 해당 user가 있으면 반환   
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByUsername(String username);
    Optional<User> findByNickname(String nickname);
    Optional<User> findByBirthdate(Date birthdate);
    Optional<User> findByDiseaseindex(String diseaseindex);

    // existsBy - 값이 DB에 있는지 검사 하는 메서드
    boolean existsByEmail(String email);
    boolean existsByLoginId(String loginId);
    boolean existsByNickname(String nickname);

}

