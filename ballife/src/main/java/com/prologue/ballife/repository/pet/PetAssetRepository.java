package com.prologue.ballife.repository.pet;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.pet.PetAsset;
import java.util.List;
import com.prologue.ballife.domain.user.User;


public interface PetAssetRepository extends JpaRepository<PetAsset, Long> {

    List<PetAsset> findByUser(User user);

    // 같은 유저가 같은 아이템을 이미 보유했는지 — 중복 저장 방지용
    boolean existsByUser_UserIdAndItemId(Long userId, Long itemId);
}
