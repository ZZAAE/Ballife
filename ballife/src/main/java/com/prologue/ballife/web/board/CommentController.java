package com.prologue.ballife.web.board;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.board.CommentService;
import com.prologue.ballife.web.dto.board.CommentDto;

import java.util.List;

@Tag(name = "Comment", description = "댓글 API")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // 댓글 작성 (대댓글)
    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<CommentDto.CommentResponse> createComment(
            @RequestParam Long userId,
            @RequestParam Long postId,
            @Valid @RequestBody CommentDto.CreateRequest request) {
        CommentDto.CommentResponse response = commentService.createComment(userId, postId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 게시글의 댓글 목록 조회 — 로그인 사용자의 추천 여부(liked)를 함께 내려줌
    @Operation(summary = "댓글 목록 조회")
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto.CommentResponse>> getCommentByPost(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        List<CommentDto.CommentResponse> response = commentService.getCommentsByPost(postId, userId);
        return ResponseEntity.ok(response);
    }

    // 댓글 수정
    @Operation(summary = "댓글 수정")
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto.CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            @Valid @RequestBody CommentDto.UpdateRequest request) {
        return ResponseEntity.ok(commentService.updateComment(commentId, userId, request));
    }

    // 댓글 삭제 - 소프트
    @Operation(summary = "댓글 삭제(소프트)")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    // 댓글 추천 토글 — JWT 로 인증된 사용자 기준, 계정당 1개. 다시 누르면 취소.
    @Operation(summary = "댓글 추천 토글")
    @PostMapping("/{commentId}/upvote")
    public ResponseEntity<CommentDto.UpVoteResponse> upVoteComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(commentService.toggleUpvote(commentId, principal.getUserId()));
    }
}
