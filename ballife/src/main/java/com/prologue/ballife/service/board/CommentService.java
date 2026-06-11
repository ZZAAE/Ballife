package com.prologue.ballife.service.board;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.CommentLike;
import com.prologue.ballife.domain.board.Post;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.board.CommentLikeRepository;
import com.prologue.ballife.repository.board.CommentRepository;
import com.prologue.ballife.repository.board.PostRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.service.notification.NotificationService;
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
    private final CommentLikeRepository commentLikeRepository;
    private final NotificationService notificationService;
    private final MessageResolver messages;

    // 댓글 작성
    @Transactional
    public CommentDto.CommentResponse createComment(Long userId, Long postId, CommentDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.post"), postId)));

        Comment comment = Comment.builder()
                .userId(user)
                .postId(post)
                .content(request.getContent())
                .parentComment(request.getParentComment())
                .level(request.getLevel() != null ? request.getLevel() : 0)
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl() : "")
                .build();

        Comment saved = commentRepository.save(comment);

        // 게시글 주인(일반 댓글) 또는 부모 댓글 주인(대댓글)에게 알림 — 본인 글/댓글이면 생략됨
        notificationService.notifyOnComment(saved);

        return CommentDto.CommentResponse.from(saved);
    }

    // 게시글별 댓글 목록 조회
    // currentUserId 가 있으면 각 댓글에 대한 해당 사용자의 추천 여부(liked)를 함께 내려준다.
    public List<CommentDto.CommentResponse> getCommentsByPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.post"), postId)));

        List<Comment> comments = commentRepository.findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(post);

        // 사용자가 추천한 댓글 ID 집합을 1회 쿼리로 조회 (N+1 방지)
        final Set<Long> likedIds;
        if (currentUserId != null && !comments.isEmpty()) {
            List<Long> commentIds = comments.stream()
                    .map(Comment::getCommentId)
                    .collect(Collectors.toList());
            likedIds = new HashSet<>(commentLikeRepository.findLikedCommentIds(currentUserId, commentIds));
        } else {
            likedIds = Collections.emptySet();
        }

        return comments.stream()
                .map(c -> CommentDto.CommentResponse.from(c, likedIds.contains(c.getCommentId())))
                .collect(Collectors.toList());
    }

    // 댓글 단건 조회
    public CommentDto.CommentResponse getComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.comment"), commentId)));

        return CommentDto.CommentResponse.from(comment);
    }

    // 댓글 수정
    @Transactional
    public CommentDto.CommentResponse updateComment(Long commentId, Long userId, CommentDto.UpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.comment"), commentId)));

        if (!comment.getUserId().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.comment.notOwnerUpdate"));
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
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.comment"), commentId)));

        if (!comment.getUserId().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, messages.get("business.comment.notOwnerDelete"));
        }

        comment.softDelete();
    }

    // ═══════════════════════════════════════════════════════════
    // 댓글(대댓글 포함) 추천 토글 (계정당 1개)
    //  - 아직 추천하지 않았으면: 추천 기록 추가 + upVote +1
    //  - 이미 추천했으면(같은 계정 재클릭): 추천 기록 삭제 + upVote -1
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public CommentDto.UpVoteResponse toggleUpvote(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.comment"), commentId)));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messages.get("error.notFound", messages.get("resource.user"), userId)));

        boolean alreadyLiked = commentLikeRepository.existsByComment_CommentIdAndUser_UserId(commentId, userId);
        boolean liked;
        if (alreadyLiked) {
            // 같은 계정이 다시 누르면 추천 취소
            commentLikeRepository.deleteByComment_CommentIdAndUser_UserId(commentId, userId);
            comment.decreaseUpVote();
            liked = false;
        } else {
            // 처음 누르면 추천 추가
            commentLikeRepository.save(CommentLike.builder().comment(comment).user(user).build());
            comment.upvoteComment();
            liked = true;
            // 댓글 주인에게 추천 알림 — 본인 댓글이거나 이미 알린 경우 생략됨
            notificationService.notifyOnCommentLike(comment, user);
        }

        return CommentDto.UpVoteResponse.builder()
                .liked(liked)
                .upVote(comment.getUpVote())
                .build();
    }
}
