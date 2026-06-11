package com.prologue.ballife.repository.notification;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.notification.Notification;
import com.prologue.ballife.domain.notification.Notification.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 특정 사용자의 알림 목록 (최신순). Pageable 로 최근 N개만 조회.
    List<Notification> findByRecipient_UserIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    // 안 읽은 알림 개수 — 헤더 배지에 사용
    long countByRecipient_UserIdAndIsReadFalse(Long recipientId);

    // 추천 알림 중복 방지 — 같은 상대가 같은 대상(글 또는 댓글)을 이미 추천한 알림이 있는지 확인.
    // 글 추천은 commentId 가 null 이므로 = 비교로는 NULL 매칭이 안 돼 IS NULL 분기를 따로 둔다.
    @Query("SELECT COUNT(n) > 0 FROM Notification n "
            + "WHERE n.actor.userId = :actorId AND n.type = :type AND n.postId = :postId "
            + "AND ((:commentId IS NULL AND n.commentId IS NULL) OR n.commentId = :commentId)")
    boolean existsLikeNotification(@Param("actorId") Long actorId,
                                   @Param("type") NotificationType type,
                                   @Param("postId") Long postId,
                                   @Param("commentId") Long commentId);

    // 특정 사용자의 안 읽은 알림을 모두 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true "
            + "WHERE n.recipient.userId = :recipientId AND n.isRead = false")
    int markAllReadByRecipientId(@Param("recipientId") Long recipientId);

    // 게시글 하드 삭제 시 — 해당 글에 연결된 알림 일괄 삭제
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.postId = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}
