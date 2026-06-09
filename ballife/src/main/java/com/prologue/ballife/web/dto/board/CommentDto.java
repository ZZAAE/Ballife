package com.prologue.ballife.web.dto.board;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.board.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CommentDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "내용은 필수입니다")
        @Size(max = 500, message = "댓글길이는 500자 이하여야 합니다.")
        private String content;

        private Long parentComment;

        private Integer level;

        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentResponse { // 글을 클릭했을 때 주는 상세 정보
        private Long id;
        private Long userId;
        private Long postId;
        private String userNickname;
        private String userMedalIcon;
        private String imageUrl;
        private String content;
        private Long parentComment;
        private Integer level;
        private Integer upVote;
        private boolean liked; // 현재 로그인한 사용자가 이 댓글을 추천했는지 여부
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CommentResponse from(Comment comment) {
            return from(comment, false);
        }

        public static CommentResponse from(Comment comment, boolean liked) {
            String userNickname = comment.getUserId().getNickname() != null
                    && !comment.getUserId().getNickname().isBlank()
                            ? comment.getUserId().getNickname()
                            : comment.getUserId().getUsername();
            return CommentResponse.builder()
                    .id(comment.getCommentId())
                    .userId(comment.getUserId().getUserId())
                    .postId(comment.getPostId() != null ? comment.getPostId().getPostId() : null)
                    .userNickname(userNickname)
                    .userMedalIcon(comment.getUserId().getMedal() != null ? comment.getUserId().getMedal().getMedalIcon() : null)
                    .imageUrl(comment.getImageUrl())
                    .content(comment.getContent())
                    .parentComment(comment.getParentComment())
                    .level(comment.getLevel())
                    .upVote(comment.getUpVote())
                    .liked(liked)
                    .createdAt(comment.getCreatedAt())
                    .updatedAt(comment.getUpdatedAt())
                    .build();
        }
    }

    // 추천 토글 결과 — 현재 추천 여부 + 갱신된 추천 총 개수
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpVoteResponse {
        private boolean liked;
        private Integer upVote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "내용은 필수입니다")
        @Size(max = 500, message = "댓글길이는 500자 이하여야 합니다.")
        private String content;

        private Long parentComment;

        private Integer level;

        private String imageUrl;
    }
}
