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

    // 게시글 목록용 — 여러 게시글의 (삭제되지 않은) 댓글 수를 한 번에 집계.
    // 결과 각 행: [postId(Long), count(Long)]. 댓글이 0개인 글은 결과에 포함되지 않으므로
    // 호출부에서 Map 조회 시 기본값 0 으로 처리한다.
    @Query("SELECT c.postId.postId, COUNT(c) FROM Comment c "
            + "WHERE c.postId.postId IN :postIds AND c.isDeleted = false "
            + "GROUP BY c.postId.postId")
    List<Object[]> countByPostIds(@Param("postIds") List<Long> postIds);

    // 게시글 하드 삭제 시 사용 — 해당 글의 모든 댓글 일괄 삭제
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.postId.postId = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}
