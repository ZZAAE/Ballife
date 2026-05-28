package com.prologue.ballife.domain.board;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.prologue.ballife.domain.user.User;

@Entity
@Table(name = "POST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POST_ID")
    private Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORY", nullable = false)
    @Builder.Default
    private CATEGORY category = CATEGORY.GENERAL;

    @Column(name = "TITLE", unique = false, nullable = false, length = 50)
    private String title;

    // 본문에 base64 인라인 이미지가 들어올 수 있어 LONGTEXT 로 저장
    @Column(name = "CONTENT", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    // 썸네일/대표 이미지도 base64 가 들어올 수 있어 LONGTEXT 로 저장
    @Column(name = "IMAGE_URL", nullable = true, columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = true)
    private LocalDateTime updatedAt;

    @Column(name = "VIEW_COUNT")
    @Builder.Default
    private Integer viewCount = 0;

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

    // 편의 메서드 : 의도 파악을 명확하게 하기 위함
    // post.setViewCount => viewCount++ 명확하지 않다
    public void increaseViewCount() {
        this.viewCount++;
    }

    // 논리 삭제(자기 데이터를 스스로 책임)
    public void softDelete() {
        this.isDeleted = true;
    }

    public enum CATEGORY {
        GENERAL("자유"),
        QNA("질문"),
        DIABETES("당뇨"),
        HYPERTENSION("고혈압"),
        HYPERLIPIDEMIA("고지혈증"),
        GOUT("통풍"),
        OSTEOPOROSIS("골다공증"),
        OBESITY("비만");

        private final String displayName;

        CATEGORY(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public void increaseUpVote() {
        this.upVote++;
    }

    // 추천 취소 시 감소 (0 미만으로 내려가지 않도록 보호)
    public void decreaseUpVote() {
        if (this.upVote != null && this.upVote > 0) {
            this.upVote--;
        }
    }
}
