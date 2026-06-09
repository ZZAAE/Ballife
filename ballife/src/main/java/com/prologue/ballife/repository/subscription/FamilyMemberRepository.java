package com.prologue.ballife.repository.subscription;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.subscription.FamilyMember;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    // 한 사용자는 최대 한 그룹에만 속함 (USER_ID 유니크)
    Optional<FamilyMember> findByUser_UserId(Long userId);

    boolean existsByUser_UserId(Long userId);

    // 그룹의 전체 구성원 (가입 순)
    List<FamilyMember> findByFamilyGroup_FamilyGroupIdOrderByJoinedAtAsc(Long familyGroupId);

    boolean existsByFamilyGroup_FamilyGroupIdAndUser_UserId(Long familyGroupId, Long userId);
}
