package com.prologue.ballife.web.dto.notification;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.notification.Notification;
import com.prologue.ballife.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class NotificationDto {

    // 알림 단건 응답 — 표시 문구는 프론트(i18n)에서 type + actorNickname 으로 조립한다.
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String type;           // COMMENT / REPLY / POST_LIKE / COMMENT_LIKE
        private Long actorId;
        private String actorNickname;  // "OOO님이 ..." 표기용
        private Long postId;           // 클릭 시 이동 대상 게시글
        private Long commentId;
        private String snippet;        // 댓글 본문 일부(추천 알림은 null)
        private boolean read;
        private LocalDateTime createdAt;

        public static Response from(Notification n) {
            User actor = n.getActor();
            String nickname = actor.getNickname() != null && !actor.getNickname().isBlank()
                    ? actor.getNickname()
                    : actor.getUsername();
            return Response.builder()
                    .id(n.getNotificationId())
                    .type(n.getType().name())
                    .actorId(actor.getUserId())
                    .actorNickname(nickname)
                    .postId(n.getPostId())
                    .commentId(n.getCommentId())
                    .snippet(n.getSnippet())
                    .read(Boolean.TRUE.equals(n.getIsRead()))
                    .createdAt(n.getCreatedAt())
                    .build();
        }
    }

    // 안 읽은 알림 개수 — 헤더 배지 폴링용
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnreadCountResponse {
        private long count;
    }
}
