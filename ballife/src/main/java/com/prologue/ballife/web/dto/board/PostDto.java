package com.prologue.ballife.web.dto.board;

import java.time.LocalDateTime;

import com.prologue.ballife.domain.board.Post;
import com.prologue.ballife.domain.board.Post.CATEGORY;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PostDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest { // 글 작성할 때 받는 데이터

        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 50, message = "제목은 50자 이하여야 합니다.")
        private String title;

        @NotBlank(message = "내용은 필수입니다")
        private String content;

        private Post.CATEGORY category;

        private String imageUrl;
    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostResponse { //글을 클릭했을 때 주는 상세 정보
        private Long id;
        private CATEGORY category;
        private Long userId;
        private String userNickname;
        private String imageUrl;
        private String title;
        private String content;
        private Integer viewCount;
        private Integer upVote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static PostResponse from(Post post){
            String userNickname = post.getUserId().getNickname() != null
                                && !post.getUserId().getNickname().isBlank()
                                ? post.getUserId().getNickname()
                                : post.getUserId().getUsername();
            return PostResponse.builder()
                        .id(post.getPostId())
                        .category(post.getCategory())
                        .userId(post.getUserId().getUserId())
                        .userNickname(userNickname)
                        .imageUrl(post.getImageUrl())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .viewCount(post.getViewCount())
                        .upVote(post.getUpVote())
                        .createdAt(post.getCreatedAt())
                        .updatedAt(post.getUpdatedAt())
                        .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostListResponse{ //게시판 목록 구성을 위한 글 목록 정보
        private Long id;
        private CATEGORY category;
        private Long userId;
        private String userNickname;
        private String title;
        private Integer viewCount;
        private LocalDateTime createdAt;

        public static PostResponse from(Post post){
            String userNickname = post.getUserId().getNickname() != null
                                && !post.getUserId().getNickname().isBlank()
                                ? post.getUserId().getNickname()
                                : post.getUserId().getUsername();
            return PostResponse.builder()
                        .id(post.getPostId())
                        .category(post.getCategory())
                        .userId(post.getUserId().getUserId())
                        .userNickname(userNickname)
                        .title(post.getTitle())
                        .viewCount(post.getViewCount())
                        .createdAt(post.getCreatedAt())
                        .build();
        }
    }

    //게시물 수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{
        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String title;

        @NotBlank(message = "내용은 필수입니다")
        private String content;

        private Post.CATEGORY category;

        private String imageUrl;
    }
}
