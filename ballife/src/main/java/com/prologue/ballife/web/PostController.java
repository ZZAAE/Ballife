package com.prologue.ballife.web;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.board.PostService;
import com.prologue.ballife.web.dto.board.PostDto;
import com.prologue.ballife.domain.board.Post;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Post", description = "게시글 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 게시글 작성 로그인 정보 JWT할건데지금할줄모름나중에함 임시떔빵
    @Operation(summary = "게시글 작성")
    @PostMapping
    public ResponseEntity<PostDto.PostResponse> createPost(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody PostDto.CreateRequest request) {
                String token = authHeader.replace("Bearer ", "");
                Long userId = Long.parseLong(token.replace("temp-token-", ""));
                 return ResponseEntity.status(HttpStatus.CREATED)
            .body(postService.createPost(userId, request));
    }
    
    // 게시글 상세 조회
    @Operation(summary = "게시글 상세")
    @GetMapping("/{postId}")
    public ResponseEntity<PostDto.PostResponse> getPost(
            @PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPost(postId));
    }

    // 조회수 증가
    @Operation(summary = "조회수 증가")
    @PostMapping("/{postId}/view")
    public ResponseEntity<Void> recordView(
            @PathVariable Long postId) {
        postService.recordView(postId);
        return ResponseEntity.noContent().build();
    }

    // 게시글 목록 조회 (카테고리, 정렬, 검색 통합)
    @Operation(summary = "전체 게시글 목록 조회")
    @GetMapping
    public ResponseEntity<Page<PostDto.PostListResponse>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) Post.CATEGORY category,
            @RequestParam(required = false) String searchKeyword
        ) {
        if(category != null && searchKeyword != null) {
            return ResponseEntity.ok(postService.getPostsByCategoryWithKeyword(page, size, category, sort, searchKeyword));
        } else if(category != null) {
            return ResponseEntity.ok(postService.getPostsByCategory(page, size, category, sort));
        } else if(searchKeyword != null) {
            return ResponseEntity.ok(postService.getPostsBySearch(page, size, sort, searchKeyword));
        }
        return ResponseEntity.ok(postService.getPosts(page, size, sort));
    }

    // 게시글 수정
    @Operation(summary = "게시글 수정")
    @PutMapping("/{postId}")
    public ResponseEntity<PostDto.PostResponse> updatePost(
            @PathVariable Long postId,
            @RequestParam Long userId,
            @Valid @RequestBody PostDto.UpdateRequest request) {
        return ResponseEntity.ok(postService.updatePost(postId, userId, request));
    }

    // 게시글 삭제 - 소프트 )
    @Operation(summary = "게시글 삭제(소프트)")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @RequestParam Long userId) {
        postService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    // 게시글 추천
    @Operation(summary = "게시글 추천")
    @PostMapping("/{postId}/upvote")
    public ResponseEntity<Void> upVotePost(
            @PathVariable Long postId) {
        postService.upvotePost(postId);
        return ResponseEntity.noContent().build();
    }
}
