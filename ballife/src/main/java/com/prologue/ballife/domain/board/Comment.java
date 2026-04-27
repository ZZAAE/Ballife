package com.prologue.ballife.domain.board;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

@Entity
@Table(name = "COMMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COMMENT_ID")
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post postId;

    @Column(name = "CONTENT", unique = false, nullable = false, length = 500)
    private String content;  

    @Column(name = "PARENT_COMMENT")
    private Long parentComment;

    @Column(name = "LEVEL", nullable = false)
    private Integer level;

    @Column(name = "IMAGE_URL", unique = false, length = 300)
    private String imageUrl;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = true)
    private LocalDateTime updatedAt;

    @Column(name = "UP_VOTE")
    @Builder.Default
    private Integer upVote = 0;

    @Column(name = "IS_DELETED")
    @Builder.Default
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    //논리 삭제(자기 데이터를 스스로 책임)
    public void softDelete(){
        this.isDeleted = true;
    }

    public void upvoteComment() {
    this.upVote++;
    }
}
