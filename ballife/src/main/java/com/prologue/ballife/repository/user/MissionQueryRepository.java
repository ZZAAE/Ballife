package com.prologue.ballife.repository.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * 미션 "실제 행동 검증"을 위한 조회 전용 쿼리 모음.
 * 여러 도메인(식단/운동/생체기록/복약/게시판/구독/가족/처방)에 걸쳐 있어
 * 공유 레포지토리들을 수정하지 않고 EntityManager(JPQL)로 한 곳에 모았다.
 * 모든 JPQL 경로는 실제 엔티티 필드명 기준으로 검증되었다.
 */
@Repository
public class MissionQueryRepository {

    @PersistenceContext
    private EntityManager em;

    /**
     * 유저가 "기록"을 남긴 모든 날짜의 합집합 (식단/운동/생체기록/복약).
     * DAILY_RECORD(오늘 기록 여부)와 STREAK_7/STREAK_30(연속 기록) 검증에 사용.
     */
    public Set<LocalDate> recordDates(Long userId) {
        Set<LocalDate> dates = new HashSet<>();
        dates.addAll(em.createQuery(
                "SELECT DISTINCT m.mealDate FROM Meal m WHERE m.user.userId = :uid",
                LocalDate.class).setParameter("uid", userId).getResultList());
        dates.addAll(em.createQuery(
                "SELECT DISTINCT e.exerciseDate FROM UserExercise e "
                        + "WHERE e.user.userId = :uid AND e.isDeleted = false",
                LocalDate.class).setParameter("uid", userId).getResultList());
        dates.addAll(em.createQuery(
                "SELECT DISTINCT b.recordDate FROM BioValueRecord b WHERE b.user.userId = :uid",
                LocalDate.class).setParameter("uid", userId).getResultList());
        dates.addAll(em.createQuery(
                "SELECT DISTINCT r.intakeDate FROM UserMedicineRecord r "
                        + "WHERE r.prescription.user.userId = :uid AND r.intakeDate IS NOT NULL",
                LocalDate.class).setParameter("uid", userId).getResultList());
        dates.remove(null);
        return dates;
    }

    /** 기준 시각 이후 작성한 게시글 수 (삭제 제외) */
    public long countPostsSince(Long userId, LocalDateTime from) {
        return em.createQuery(
                "SELECT COUNT(p) FROM Post p "
                        + "WHERE p.userId.userId = :uid AND p.isDeleted = false AND p.createdAt >= :from",
                Long.class).setParameter("uid", userId).setParameter("from", from).getSingleResult();
    }

    /** 기준 시각 이후 작성한 댓글 수 (삭제 제외) */
    public long countCommentsSince(Long userId, LocalDateTime from) {
        return em.createQuery(
                "SELECT COUNT(c) FROM Comment c "
                        + "WHERE c.userId.userId = :uid AND c.isDeleted = false AND c.createdAt >= :from",
                Long.class).setParameter("uid", userId).setParameter("from", from).getSingleResult();
    }

    /** 기준 시각 이후 누른 추천 수 (게시글 추천 + 댓글 추천 합산) */
    public long countRecommendsSince(Long userId, LocalDateTime from) {
        long postLikes = em.createQuery(
                "SELECT COUNT(pl) FROM PostLike pl WHERE pl.user.userId = :uid AND pl.createdAt >= :from",
                Long.class).setParameter("uid", userId).setParameter("from", from).getSingleResult();
        long commentLikes = em.createQuery(
                "SELECT COUNT(cl) FROM CommentLike cl WHERE cl.user.userId = :uid AND cl.createdAt >= :from",
                Long.class).setParameter("uid", userId).setParameter("from", from).getSingleResult();
        return postLikes + commentLikes;
    }

    /** 유저가 구독 이력이 있는지 (상태 무관) */
    public boolean hasSubscription(Long userId) {
        Long count = em.createQuery(
                "SELECT COUNT(s) FROM UserSubscription s WHERE s.user.userId = :uid",
                Long.class).setParameter("uid", userId).getSingleResult();
        return count > 0;
    }

    /** 유저가 가족 그룹에 속해 있는지 */
    public boolean hasFamily(Long userId) {
        Long count = em.createQuery(
                "SELECT COUNT(f) FROM FamilyMember f WHERE f.user.userId = :uid",
                Long.class).setParameter("uid", userId).getSingleResult();
        return count > 0;
    }

    /** 유저가 등록한(삭제되지 않은) 처방전 수 — EACH_REGISTER 검증용 */
    public long prescriptionCount(Long userId) {
        return em.createQuery(
                "SELECT COUNT(p) FROM Prescription p WHERE p.user.userId = :uid AND p.isDeleted = false",
                Long.class).setParameter("uid", userId).getSingleResult();
    }
}
