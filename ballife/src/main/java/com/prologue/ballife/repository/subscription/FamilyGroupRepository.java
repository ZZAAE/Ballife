package com.prologue.ballife.repository.subscription;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.subscription.FamilyGroup;

@Repository
public interface FamilyGroupRepository extends JpaRepository<FamilyGroup, Long> {

    Optional<FamilyGroup> findByOwner_UserId(Long ownerId);

    Optional<FamilyGroup> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
