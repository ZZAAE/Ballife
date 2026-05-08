package com.prologue.ballife.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.prologue.ballife.domain.board.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>{

}
