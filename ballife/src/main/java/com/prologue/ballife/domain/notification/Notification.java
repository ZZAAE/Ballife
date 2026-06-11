package com.prologue.ballife.domain.notification;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

/**
 * 사용자에게 보여줄 알림 한 건.
 *  - recipient : 알림을 받는 사람(내 글/내 댓글의 주인)
 *  - actor     : 알림을 발생시킨 사람(댓글을 달거나 추천을 누른 상대방)
 *  - type      : 어떤 사건인지 (댓글/답글/글추천/댓글추천)
 *  - postId/commentId 는 클릭 시 이동할 대상. FK 가 아닌 단순 값으로 저장해
 *    게시글 하드 삭제와 강하게 엮이지 않게 한다.
 *  - snippet   : 댓글 본문 일부 스냅샷(추천 알림은 null). 원본이 수정/삭제돼도 유지.
 */
@Entity
@Table(name = "NOTIFICATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID")
    private Long notificationId;

    // 알림을 받는 사람
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECIPIENT_ID", nullable = false)
    private User recipient;

    // 알림을 발생시킨 상대방
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ACTOR_ID", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 30)
    private NotificationType type;

    // 이동 대상(게시글). 단순 값으로 저장(FK 아님).
    @Column(name = "POST_ID")
    private Long postId;

    // 댓글/대댓글 알림이면 해당 댓글 ID. 글 추천 알림이면 null.
    @Column(name = "COMMENT_ID")
    private Long commentId;

    // 댓글 본문 스냅샷(추천 알림은 null)
    @Column(name = "SNIPPET", length = 200)
    private String snippet;

    @Column(name = "IS_READ", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
    }

    public void markRead() {
        this.isRead = true;
    }

    public enum NotificationType {
        COMMENT,        // 내 게시글에 댓글이 달림
        REPLY,          // 내 댓글에 답글이 달림
        POST_LIKE,      // 내 게시글이 추천됨
        COMMENT_LIKE    // 내 댓글이 추천됨
    }
}
