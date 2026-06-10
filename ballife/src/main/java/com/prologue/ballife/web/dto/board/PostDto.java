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

        @NotBlank(message = "{validation.post.title.required}")
        @Size(max = 50, message = "{validation.post.title.size}")
        private String title;

        @NotBlank(message = "{validation.post.content.required}")
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
        private String userMedalIcon;
        private String imageUrl;
        private String title;
        private String content;
        private Integer viewCount;
        private Integer upVote;
        private boolean liked; // 현재 로그인한 사용자가 이 글을 추천했는지 여부
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static PostResponse from(Post post){
            return from(post, false);
        }

        public static PostResponse from(Post post, boolean liked){
            String userNickname = post.getUserId().getNickname() != null
                                && !post.getUserId().getNickname().isBlank()
                                ? post.getUserId().getNickname()
                                : post.getUserId().getUsername();
            return PostResponse.builder()
                        .id(post.getPostId())
                        .category(post.getCategory())
                        .userId(post.getUserId().getUserId())
                        .userNickname(userNickname)
                        .userMedalIcon(post.getUserId().getMedal() != null ? post.getUserId().getMedal().getMedalIcon() : null)
                        .imageUrl(post.getImageUrl())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .viewCount(post.getViewCount())
                        .upVote(post.getUpVote())
                        .liked(liked)
                        .createdAt(post.getCreatedAt())
                        .updatedAt(post.getUpdatedAt())
                        .build();
        }
    };

    // 추천 토글 결과 — 현재 추천 여부 + 갱신된 추천 총 개수
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpVoteResponse {
        private boolean liked;
        private Integer upVote;
    };

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostListResponse{ //게시판 목록 구성을 위한 글 목록 정보
        private Long id;
        private CATEGORY category;
        private Long userId;
        private String userNickname;
        private String userMedalIcon;
        private String title;
        private Integer upVote;
        private Integer viewCount;
        private LocalDateTime createdAt;

        public static PostListResponse from(Post post){
            String userNickname = post.getUserId().getNickname() != null
                                && !post.getUserId().getNickname().isBlank()
                                ? post.getUserId().getNickname()
                                : post.getUserId().getUsername();
            return PostListResponse.builder()
                        .id(post.getPostId())
                        .category(post.getCategory())
                        .userId(post.getUserId().getUserId())
                        .userNickname(userNickname)
                        .userMedalIcon(post.getUserId().getMedal() != null ? post.getUserId().getMedal().getMedalIcon() : null)
                        .upVote(post.getUpVote())
                        .title(post.getTitle())
                        .viewCount(post.getViewCount())
                        .createdAt(post.getCreatedAt())
                        .build();
        }
    };

    //게시물 수정
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest{
        @NotBlank(message = "{validation.post.title.required}")
        @Size(max = 50, message = "{validation.post.title.size}")
        private String title;

        @NotBlank(message = "{validation.post.content.required}")
        private String content;

        private Post.CATEGORY category;

        private String imageUrl;
    }
};
