package com.prologue.ballife.web.board;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 게시글의 댓글 목록 조회
    @Operation(summary = "댓글 목록 조회")
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto.CommentResponse>> getCommentByPost(
            @Parameter(description = "게시글 ID") @PathVariable Long postId) {
        List<CommentDto.CommentResponse> response = commentService.getCommentsByPost(postId);
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

    // 댓글 추천
    @Operation(summary = "댓글 추천")
    @PostMapping("/{commentId}/upvote")
    public ResponseEntity<CommentDto.CommentResponse> upVoteComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId) {
        CommentDto.CommentResponse response = commentService.upVoteComment(commentId);
        return ResponseEntity.ok(response);
    }
}
