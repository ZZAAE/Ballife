package com.prologue.ballife.repository.board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.Post;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(Post postId);

    // 게시글 하드 삭제 시 사용 — 해당 글의 모든 댓글 일괄 삭제
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.postId.postId = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}
