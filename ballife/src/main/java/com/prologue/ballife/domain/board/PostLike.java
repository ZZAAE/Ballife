package com.prologue.ballife.domain.board;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * 게시글 추천 기록 — "누가 어떤 글을 추천했는지" 를 1행으로 저장한다.
 * (POST_ID, USER_ID) 유니크 제약으로 계정당 추천 1개만 허용한다.
 * 같은 계정이 다시 추천하면 이 행을 삭제(추천 취소)한다.
 */
@Entity
@Table(name = "POST_LIKE", uniqueConstraints = @UniqueConstraint(name = "UK_POST_LIKE_POST_USER", columnNames = {
        "POST_ID", "USER_ID" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POST_LIKE_ID")
    private Long postLikeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;

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
