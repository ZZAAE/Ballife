package com.prologue.ballife.repository.board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.board.CommentLike;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    // 특정 사용자가 특정 댓글을 이미 추천했는지 여부
    boolean existsByComment_CommentIdAndUser_UserId(Long commentId, Long userId);

    // 추천 취소 — 특정 사용자의 특정 댓글 추천 기록 삭제
    void deleteByComment_CommentIdAndUser_UserId(Long commentId, Long userId);

    // 목록 조회용 — 주어진 댓글들 중 해당 사용자가 추천한 댓글 ID 목록 (N+1 방지)
    @Query("select cl.comment.commentId from CommentLike cl "
            + "where cl.user.userId = :userId and cl.comment.commentId in :commentIds")
    List<Long> findLikedCommentIds(@Param("userId") Long userId, @Param("commentIds") List<Long> commentIds);
}
