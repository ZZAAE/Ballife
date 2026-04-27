package com.prologue.ballife.repository.board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.board.Comment;
import com.prologue.ballife.domain.board.Post;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(Post postId);
}
