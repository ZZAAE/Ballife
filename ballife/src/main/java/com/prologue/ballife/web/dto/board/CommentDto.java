package com.prologue.ballife.web.dto.board;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.Post;

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
    public static class CreateRequest{
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
    public static class CommentResponse { //글을 클릭했을 때 주는 상세 정보
        private Long id;
        private Long userId;
        private Post postId;
        private String userNickname;
        private String imageUrl;
        private String content;
        private Long parentComment;
        private Integer level;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CommentResponse from(Comment comment){
            String userNickname = comment.getUserId().getNickname() != null
                                && !comment.getUserId().getNickname().isBlank()
                                ? comment.getUserId().getNickname()
                                : comment.getUserId().getUsername();
            return CommentResponse.builder()
                        .id(comment.getCommentId())
                        .userId(comment.getUserId().getUserId())
                        .postId(comment.getPostId())
                        .userNickname(userNickname)
                        .imageUrl(comment.getImageUrl())
                        .content(comment.getContent())
                        .parentComment(comment.getParentComment())
                        .level(comment.getLevel())
                        .createdAt(comment.getCreatedAt())
                        .updatedAt(comment.getUpdatedAt())
                        .build();
        }
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{
        @NotBlank(message = "내용은 필수입니다")
        @Size(max = 500, message = "댓글길이는 500자 이하여야 합니다.")
        private String content;

        private Long parentComment;

        private Integer level;

        private String imageUrl;
    }
}
