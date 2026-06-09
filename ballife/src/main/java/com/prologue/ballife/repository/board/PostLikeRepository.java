package com.prologue.ballife.repository.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.board.PostLike;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // 특정 사용자가 특정 글을 이미 추천했는지 여부
    boolean existsByPost_PostIdAndUser_UserId(Long postId, Long userId);

    // 추천 취소 — 특정 사용자의 특정 글 추천 기록 삭제
    void deleteByPost_PostIdAndUser_UserId(Long postId, Long userId);

    // 게시글 하드 삭제 시 사용 — 해당 글에 달린 모든 추천 일괄 삭제
    @Modifying
    @Query("DELETE FROM PostLike pl WHERE pl.post.postId = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}
