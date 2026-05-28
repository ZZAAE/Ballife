package com.prologue.ballife.domain.board;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * 댓글(대댓글 포함) 추천 기록 — "누가 어떤 댓글을 추천했는지" 를 1행으로 저장한다.
 * (COMMENT_ID, USER_ID) 유니크 제약으로 계정당 추천 1개만 허용한다.
 * 같은 계정이 다시 추천하면 이 행을 삭제(추천 취소)한다.
 */
@Entity
@Table(name = "COMMENT_LIKE", uniqueConstraints = @UniqueConstraint(name = "UK_COMMENT_LIKE_COMMENT_USER", columnNames = {
        "COMMENT_ID", "USER_ID" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COMMENT_LIKE_ID")
    private Long commentLikeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMMENT_ID", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
