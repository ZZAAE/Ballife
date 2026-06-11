package com.prologue.ballife.service.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.Post;
import com.prologue.ballife.domain.notification.Notification;
import com.prologue.ballife.domain.notification.Notification.NotificationType;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.board.CommentRepository;
import com.prologue.ballife.repository.notification.NotificationRepository;
import com.prologue.ballife.web.dto.notification.NotificationDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    // 헤더 드롭다운에 보여줄 최근 알림 최대 개수
    private static final int RECENT_LIMIT = 30;
    // 스니펫(댓글 본문 미리보기) 최대 길이
    private static final int SNIPPET_MAX = 120;

    private final NotificationRepository notificationRepository;
    private final CommentRepository commentRepository;
    private final MessageResolver messages;

    // ─────────────────────────────────────────────
    // 생성 (다른 서비스의 트랜잭션 안에서 호출됨)
    // ─────────────────────────────────────────────

    /**
     * 댓글/대댓글 작성 시 알림 생성.
     *  - 대댓글(parentComment != null): 부모 댓글 주인에게 REPLY 알림
     *  - 일반 댓글: 게시글 주인에게 COMMENT 알림
     * 본인 글/댓글에 본인이 단 경우는 알리지 않는다.
     */
    @Transactional
    public void notifyOnComment(Comment comment) {
        Post post = comment.getPostId();
        User actor = comment.getUserId();
        if (post == null || actor == null) {
            return;
        }

        User recipient;
        NotificationType type;
        if (comment.getParentComment() != null) {
            // 대댓글 → 부모 댓글 주인에게
            Comment parent = commentRepository.findById(comment.getParentComment()).orElse(null);
            if (parent == null) {
                return; // 부모 댓글이 사라졌으면 알림 생략
            }
            recipient = parent.getUserId();
            type = NotificationType.REPLY;
        } else {
            // 일반 댓글 → 게시글 주인에게
            recipient = post.getUserId();
            type = NotificationType.COMMENT;
        }

        if (recipient == null || isSameUser(recipient, actor)) {
            return; // 받는 사람이 곧 나면 알리지 않음
        }

        save(recipient, actor, type, post.getPostId(), comment.getCommentId(), snippet(comment.getContent()));
    }

    /** 게시글 추천 시 게시글 주인에게 POST_LIKE 알림 (본인 추천·중복 제외). */
    @Transactional
    public void notifyOnPostLike(Post post, User actor) {
        if (post == null || actor == null) {
            return;
        }
        User recipient = post.getUserId();
        if (recipient == null || isSameUser(recipient, actor)) {
            return;
        }
        if (notificationRepository.existsLikeNotification(
                actor.getUserId(), NotificationType.POST_LIKE, post.getPostId(), null)) {
            return; // 추천 토글 반복으로 인한 중복 알림 방지
        }
        save(recipient, actor, NotificationType.POST_LIKE, post.getPostId(), null, null);
    }

    /** 댓글 추천 시 댓글 주인에게 COMMENT_LIKE 알림 (본인 추천·중복 제외). */
    @Transactional
    public void notifyOnCommentLike(Comment comment, User actor) {
        if (comment == null || actor == null) {
            return;
        }
        User recipient = comment.getUserId();
        if (recipient == null || isSameUser(recipient, actor)) {
            return;
        }
        Long postId = comment.getPostId() != null ? comment.getPostId().getPostId() : null;
        if (notificationRepository.existsLikeNotification(
                actor.getUserId(), NotificationType.COMMENT_LIKE, postId, comment.getCommentId())) {
            return;
        }
        save(recipient, actor, NotificationType.COMMENT_LIKE, postId, comment.getCommentId(), null);
    }

    private void save(User recipient, User actor, NotificationType type,
                      Long postId, Long commentId, String snippet) {
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .postId(postId)
                .commentId(commentId)
                .snippet(snippet)
                .isRead(false)
                .build());
    }

    // ─────────────────────────────────────────────
    // 조회 / 읽음 처리
    // ─────────────────────────────────────────────

    public List<NotificationDto.Response> getNotifications(Long userId) {
        Pageable pageable = PageRequest.of(0, RECENT_LIMIT);
        return notificationRepository.findByRecipient_UserIdOrderByCreatedAtDesc(userId, pageable)
                .stream()
                .map(NotificationDto.Response::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipient_UserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.notification"), notificationId)));
        if (!notification.getRecipient().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.notification.notOwner"));
        }
        notification.markRead();
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadByRecipientId(userId);
    }

    /** 게시글 하드 삭제 시 — 해당 글에 연결된 알림 정리 */
    @Transactional
    public void deleteByPostId(Long postId) {
        notificationRepository.deleteAllByPostId(postId);
    }

    // ─────────────────────────────────────────────
    // 보조
    // ─────────────────────────────────────────────

    private boolean isSameUser(User a, User b) {
        return a.getUserId() != null && a.getUserId().equals(b.getUserId());
    }

    private String snippet(String content) {
        if (content == null) {
            return null;
        }
        String trimmed = content.strip();
        return trimmed.length() > SNIPPET_MAX ? trimmed.substring(0, SNIPPET_MAX) + "…" : trimmed;
    }
}
