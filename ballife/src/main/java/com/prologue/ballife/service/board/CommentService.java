package com.prologue.ballife.service.board;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.Post;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.board.CommentRepository;
import com.prologue.ballife.repository.board.PostRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.board.CommentDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // 댓글 작성
    @Transactional
    public CommentDto.CommentResponse createComment(Long userId, Long postId, CommentDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));

        Comment comment = Comment.builder()
                .userId(user)
                .postId(post)
                .content(request.getContent())
                .parentComment(request.getParentComment())
                .level(request.getLevel() != null ? request.getLevel() : 0)
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl() : "")
                .build();

        return CommentDto.CommentResponse.from(commentRepository.save(comment));
    }

    // 게시글별 댓글 목록 조회
    public List<CommentDto.CommentResponse> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));

        return commentRepository.findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(post).stream()
                .map(CommentDto.CommentResponse::from)
                .collect(Collectors.toList());
    }

    // 댓글 단건 조회
    public CommentDto.CommentResponse getComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글", commentId));

        return CommentDto.CommentResponse.from(comment);
    }

    // 댓글 수정
    @Transactional
    public CommentDto.CommentResponse updateComment(Long commentId, Long userId, CommentDto.UpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글", commentId));

        if (!comment.getUserId().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(request.getContent());
        comment.setParentComment(request.getParentComment());
        comment.setLevel(request.getLevel());
        if (request.getImageUrl() != null) {
            comment.setImageUrl(request.getImageUrl());
        }

        return CommentDto.CommentResponse.from(commentRepository.save(comment));
    }

    // 댓글 삭제(소프트 삭제)
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글", commentId));

        if (!comment.getUserId().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 댓글만 삭제할 수 있습니다.");
        }

        comment.softDelete();
    }

    // 댓글 추천
    @Transactional
    public CommentDto.CommentResponse upVoteComment(Long commentId) {
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("댓글", commentId));

    comment.upvoteComment();
    return CommentDto.CommentResponse.from(commentRepository.save(comment));
}
}
