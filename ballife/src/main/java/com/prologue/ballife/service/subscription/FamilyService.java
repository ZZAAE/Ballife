package com.prologue.ballife.service.subscription;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.exercise.UserExercise;
import com.prologue.ballife.domain.subscription.FamilyGroup;
import com.prologue.ballife.domain.subscription.FamilyMember;
import com.prologue.ballife.domain.subscription.FamilyRole;
import com.prologue.ballife.domain.subscription.SubscriptionPlan;
import com.prologue.ballife.domain.subscription.SubscriptionStatus;
import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.daily.BioValueRecordRepository;
import com.prologue.ballife.repository.exercise.UserExerciseRepository;
import com.prologue.ballife.repository.exerciseMongo.ExerciseTypeRepository;
import com.prologue.ballife.repository.subscription.FamilyGroupRepository;
import com.prologue.ballife.repository.subscription.FamilyMemberRepository;
import com.prologue.ballife.repository.subscription.UserSubscriptionRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.subscription.FamilyDto;

import lombok.RequiredArgsConstructor;

/**
 * 가족 그룹 생성/합류/탈퇴, 항목별 동의, 그리고 동의 기반 가족 건강 데이터 조회.
 * 혈당/혈압/운동은 실제 연동(BioValueRecord, UserExercise), 복약은 플래그만 보관(미연동).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FamilyService {

    private final FamilyGroupRepository familyGroupRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;
    private final BioValueRecordRepository bioValueRecordRepository;
    private final UserExerciseRepository userExerciseRepository;
    private final ExerciseTypeRepository exerciseTypeRepository;
    private final MessageResolver messages;

    // 혼동되는 문자(0,O,1,I) 제외한 base32 유사 알파벳
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();

    // ─────────────────────────────────────────────────────────
    // 그룹 생성 / 오너 보장 (SubscriptionService.activate 에서 호출)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public FamilyGroup ensureGroupForOwner(User owner) {
        Long ownerId = owner.getUserId();
        var existing = familyGroupRepository.findByOwner_UserId(ownerId);
        if (existing.isPresent()) {
            FamilyGroup group = existing.get();
            group.reactivate(); // 해지로 동결됐던 그룹 재활성화
            if (!familyMemberRepository.existsByUser_UserId(ownerId)) {
                familyMemberRepository.save(FamilyMember.builder()
                        .familyGroup(group).user(owner).role(FamilyRole.OWNER).build());
            }
            return group;
        }
        // 오너가 이미 다른 그룹의 구성원이면 막는다
        if (familyMemberRepository.existsByUser_UserId(ownerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    messages.get("business.family.alreadyInOtherGroup"));
        }
        FamilyGroup group = familyGroupRepository.save(FamilyGroup.builder()
                .owner(owner)
                .inviteCode(generateUniqueInviteCode())
                .name(owner.getNickname() + "님의 가족")
                .isActive(true)
                .build());
        familyMemberRepository.save(FamilyMember.builder()
                .familyGroup(group).user(owner).role(FamilyRole.OWNER).build());
        return group;
    }

    @Transactional
    public void freezeOwnerGroup(Long ownerId) {
        familyGroupRepository.findByOwner_UserId(ownerId).ifPresent(FamilyGroup::freeze);
    }

    @Transactional
    public FamilyDto.MyFamilyResponse createGroup(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.user"), userId)));
        requireOwnerFamilySubscription(userId);
        ensureGroupForOwner(user);
        return getMyFamily(userId);
    }

    @Transactional
    public String rotateInviteCode(Long userId) {
        FamilyGroup group = familyGroupRepository.findByOwner_UserId(userId)
                .orElseThrow(() -> forbidden(messages.get("business.family.notOwner")));
        group.rotateInviteCode(generateUniqueInviteCode());
        return group.getInviteCode();
    }

    // ─────────────────────────────────────────────────────────
    // 합류 / 탈퇴 / 추방
    // ─────────────────────────────────────────────────────────
    @Transactional
    public FamilyDto.MyFamilyResponse join(Long userId, String rawCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.user"), userId)));
        if (familyMemberRepository.existsByUser_UserId(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, messages.get("business.family.alreadyInGroup"));
        }
        String code = rawCode == null ? "" : rawCode.trim().toUpperCase();
        FamilyGroup group = familyGroupRepository.findByInviteCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, messages.get("business.family.invalidInviteCode")));
        if (!Boolean.TRUE.equals(group.getIsActive()) || !isOwnerSubscriptionActive(group)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.family.groupUnavailable"));
        }
        familyMemberRepository.save(FamilyMember.builder()
                .familyGroup(group).user(user).role(FamilyRole.MEMBER).build());
        return getMyFamily(userId);
    }

    @Transactional
    public void leave(Long userId) {
        FamilyMember me = familyMemberRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, messages.get("business.family.notInGroup")));
        if (me.getRole() == FamilyRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.family.ownerCannotLeave"));
        }
        familyMemberRepository.delete(me);
    }

    @Transactional
    public void removeMember(Long ownerUserId, Long targetUserId) {
        FamilyGroup group = familyGroupRepository.findByOwner_UserId(ownerUserId)
                .orElseThrow(() -> forbidden(messages.get("business.family.notOwner")));
        if (ownerUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, messages.get("business.family.cannotRemoveOwner"));
        }
        FamilyMember target = familyMemberRepository.findByUser_UserId(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.familyMember"), targetUserId)));
        if (!target.getFamilyGroup().getFamilyGroupId().equals(group.getFamilyGroupId())) {
            throw forbidden(messages.get("business.family.notGroupMember"));
        }
        familyMemberRepository.delete(target);
    }

    // ─────────────────────────────────────────────────────────
    // 동의 갱신
    // ─────────────────────────────────────────────────────────
    @Transactional
    public FamilyDto.MyFamilyResponse updateConsent(Long userId, FamilyDto.ConsentUpdateRequest req) {
        FamilyMember me = familyMemberRepository.findByUser_UserId(userId)
                .orElseThrow(() -> forbidden(messages.get("business.family.notInGroup")));
        if (req.getShareBloodSugar() != null) me.setShareBloodSugar(req.getShareBloodSugar());
        if (req.getShareBloodPressure() != null) me.setShareBloodPressure(req.getShareBloodPressure());
        if (req.getShareMedication() != null) me.setShareMedication(req.getShareMedication());
        if (req.getShareExercise() != null) me.setShareExercise(req.getShareExercise());
        return getMyFamily(userId);
    }

    // ─────────────────────────────────────────────────────────
    // 조회
    // ─────────────────────────────────────────────────────────
    public FamilyDto.MyFamilyResponse getMyFamily(Long userId) {
        var opt = familyMemberRepository.findByUser_UserId(userId);
        if (opt.isEmpty()) {
            return FamilyDto.MyFamilyResponse.builder().inGroup(false).build();
        }
        FamilyMember me = opt.get();
        FamilyGroup group = me.getFamilyGroup();
        boolean isOwner = me.getRole() == FamilyRole.OWNER;
        boolean groupActive = Boolean.TRUE.equals(group.getIsActive()) && isOwnerSubscriptionActive(group);

        return FamilyDto.MyFamilyResponse.builder()
                .inGroup(true)
                .role(me.getRole())
                .groupId(group.getFamilyGroupId())
                .groupName(group.getName())
                .inviteCode(isOwner ? group.getInviteCode() : null)
                .ownerNickname(group.getOwner().getNickname())
                .groupActive(groupActive)
                .myConsent(FamilyDto.ConsentResponse.from(me))
                .members(buildMemberCards(userId, group, groupActive))
                .build();
    }

    public List<FamilyDto.MemberCardResponse> getMembers(Long userId) {
        FamilyMember viewer = requireViewableGroup(userId);
        return buildMemberCards(userId, viewer.getFamilyGroup(), true);
    }

    public FamilyDto.MemberHealthResponse getMemberHealth(Long userId, Long targetUserId) {
        FamilyMember viewer = requireViewableGroup(userId);
        FamilyMember target = familyMemberRepository.findByUser_UserId(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.familyMember"), targetUserId)));
        if (!target.getFamilyGroup().getFamilyGroupId().equals(viewer.getFamilyGroup().getFamilyGroupId())) {
            throw forbidden(messages.get("business.family.notSameGroup"));
        }
        boolean isSelf = targetUserId.equals(userId);
        FamilyDto.LatestBloodSugar bs =
                (isSelf || Boolean.TRUE.equals(target.getShareBloodSugar()))
                        ? latestBloodSugar(target.getUser()) : null;
        FamilyDto.LatestBloodPressure bp =
                (isSelf || Boolean.TRUE.equals(target.getShareBloodPressure()))
                        ? latestBloodPressure(target.getUser()) : null;
        return FamilyDto.MemberHealthResponse.builder()
                .userId(targetUserId)
                .nickname(target.getUser().getNickname())
                .bloodSugar(bs)
                .bloodPressure(bp)
                .build();
    }

    // 미구독자 게이팅 용 — active 그룹의 구성원인지
    public boolean isInActiveGroup(Long userId) {
        return familyMemberRepository.findByUser_UserId(userId)
                .map(m -> Boolean.TRUE.equals(m.getFamilyGroup().getIsActive())
                        && isOwnerSubscriptionActive(m.getFamilyGroup()))
                .orElse(false);
    }

    // ─────────────────────────────────────────────────────────
    // 내부 헬퍼
    // ─────────────────────────────────────────────────────────
    private List<FamilyDto.MemberCardResponse> buildMemberCards(Long viewerId, FamilyGroup group, boolean groupActive) {
        List<FamilyMember> members =
                familyMemberRepository.findByFamilyGroup_FamilyGroupIdOrderByJoinedAtAsc(group.getFamilyGroupId());
        List<FamilyDto.MemberCardResponse> cards = new ArrayList<>();
        for (FamilyMember m : members) {
            Long memberUserId = m.getUser().getUserId();
            boolean isSelf = memberUserId.equals(viewerId);

            FamilyDto.LatestBloodSugar bs = null;
            FamilyDto.LatestBloodPressure bp = null;
            FamilyDto.LatestExercise ex = null;
            // 본인 데이터는 항상, 타인 데이터는 그룹 활성 + 동의 시에만
            if (groupActive || isSelf) {
                if (isSelf || Boolean.TRUE.equals(m.getShareBloodSugar())) {
                    bs = latestBloodSugar(m.getUser());
                }
                if (isSelf || Boolean.TRUE.equals(m.getShareBloodPressure())) {
                    bp = latestBloodPressure(m.getUser());
                }
                if (isSelf || Boolean.TRUE.equals(m.getShareExercise())) {
                    ex = latestExercise(memberUserId);
                }
            }

            cards.add(FamilyDto.MemberCardResponse.builder()
                    .userId(memberUserId)
                    .nickname(m.getUser().getNickname())
                    .role(m.getRole())
                    .me(isSelf)
                    .consent(FamilyDto.ConsentResponse.from(m))
                    .bloodSugar(bs)
                    .bloodPressure(bp)
                    .exercise(ex)
                    .build());
        }
        return cards;
    }

    private FamilyDto.LatestBloodSugar latestBloodSugar(User u) {
        return bioValueRecordRepository.findLastBloodSugarRecordByUser(u)
                .map(r -> FamilyDto.LatestBloodSugar.builder()
                        .value(r.getBloodSugar())
                        .recordDate(r.getRecordDate())
                        .build())
                .orElse(null);
    }

    private FamilyDto.LatestBloodPressure latestBloodPressure(User u) {
        return bioValueRecordRepository.findLastSystolicBPRecordByUser(u)
                .map(r -> FamilyDto.LatestBloodPressure.builder()
                        .systolic(r.getSystolicBP())
                        .diastolic(r.getDiastolicBP())
                        .recordDate(r.getRecordDate())
                        .build())
                .orElse(null);
    }

    private FamilyDto.LatestExercise latestExercise(Long userId) {
        return userExerciseRepository
                .findFirstByUser_UserIdAndIsDeletedFalseOrderByExerciseDateDescExerciseTimeDesc(userId)
                .map(this::toLatestExercise)
                .orElse(null);
    }

    private FamilyDto.LatestExercise toLatestExercise(UserExercise e) {
        String name = e.getExerciseTypeId() == null ? null
                : exerciseTypeRepository.findById(e.getExerciseTypeId())
                        .map(t -> t.getExerciseName())
                        .orElse(null);
        return FamilyDto.LatestExercise.builder()
                .exerciseName(name)
                .burnedCalorie(e.getBurnedCalorie())
                .recordDate(e.getExerciseDate())
                .build();
    }

    // 조회자가 활성 그룹에 속해 있어야 함 (오너 구독 만료 시 차단)
    private FamilyMember requireViewableGroup(Long userId) {
        FamilyMember viewer = familyMemberRepository.findByUser_UserId(userId)
                .orElseThrow(() -> forbidden(messages.get("business.family.notInGroup")));
        FamilyGroup group = viewer.getFamilyGroup();
        if (!Boolean.TRUE.equals(group.getIsActive()) || !isOwnerSubscriptionActive(group)) {
            throw forbidden(messages.get("business.family.planExpired"));
        }
        return viewer;
    }

    private void requireOwnerFamilySubscription(Long userId) {
        boolean ok = userSubscriptionRepository
                .findFirstByUser_UserIdAndStatusOrderByStartedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .map(s -> s.isActive() && s.getPlan() == SubscriptionPlan.FAMILY)
                .orElse(false);
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.family.subscriptionRequired"));
        }
    }

    private boolean isOwnerSubscriptionActive(FamilyGroup group) {
        Long ownerId = group.getOwner().getUserId();
        return userSubscriptionRepository
                .findFirstByUser_UserIdAndStatusOrderByStartedAtDesc(ownerId, SubscriptionStatus.ACTIVE)
                .map(s -> s.isActive() && s.getPlan() == SubscriptionPlan.FAMILY)
                .orElse(false);
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (!familyGroupRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, messages.get("business.family.inviteCodeGenerationFailed"));
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
